import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { vatRateId } from '@/lib/stripe-vat';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const CANCELLED = ['annulee', 'cancelled'];

// Appelée chaque jour : prélève le moyen de paiement enregistré (carte ou RIB/SEPA) des pros
// « fin de mois » dont la commande a 30 jours. Une facture Stripe (TVA 20 %) est émise et payée.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const today = new Date().toISOString().slice(0, 10);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, tracking_code, status, pickup_address, dropoff_address, amount_due, stripe_customer_id, stripe_payment_method_id, stripe_invoice_id')
    .eq('billing_status', 'a_debiter')
    .lte('payment_due_date', today);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const taxRate = (orders ?? []).length ? await vatRateId(stripe) : null;
  const results: { order: string; ok: boolean; detail?: string }[] = [];

  // Virements : la facture est partie à la commande, échéance J+30. On annule la facture si la
  // course a été annulée, et on signale 'en_retard' si rien n'est arrivé à l'échéance.
  const { data: transfers, error: transferError } = await supabase
    .from('orders')
    .select('id, tracking_code, status, payment_due_date, stripe_invoice_id')
    .eq('billing_status', 'virement_attendu');
  if (transferError) return Response.json({ error: transferError.message }, { status: 500 });

  for (const order of transfers ?? []) {
    const ref = order.tracking_code || order.id;
    const cancelled = CANCELLED.includes(order.status);
    if (!cancelled && order.payment_due_date > today) continue;
    try {
      const invoice = await stripe.invoices.retrieve(order.stripe_invoice_id);
      if (invoice.status === 'paid') {
        await supabase.from('orders').update({ billing_status: 'paye', paid_at: new Date().toISOString() }).eq('id', order.id);
        results.push({ order: ref, ok: true, detail: 'virement reçu' });
      } else if (cancelled) {
        if (invoice.status === 'open') await stripe.invoices.voidInvoice(invoice.id!);
        await supabase.from('orders').update({ billing_status: 'annule' }).eq('id', order.id);
        results.push({ order: ref, ok: true, detail: 'annulée, facture annulée' });
      } else {
        await supabase.from('orders').update({ billing_status: 'en_retard' }).eq('id', order.id);
        results.push({ order: ref, ok: false, detail: 'virement non reçu à J+30' });
      }
    } catch (err: any) {
      console.error('Transfer check error', ref, err);
      results.push({ order: ref, ok: false, detail: err.message });
    }
  }

  for (const order of orders ?? []) {
    const ref = order.tracking_code || order.id;
    try {
      // Course annulée entre-temps : rien à débiter.
      if (CANCELLED.includes(order.status)) {
        await supabase.from('orders').update({ billing_status: 'annule' }).eq('id', order.id);
        results.push({ order: ref, ok: true, detail: 'annulée, non débitée' });
        continue;
      }
      if (!order.stripe_customer_id || !order.stripe_payment_method_id || !order.amount_due) {
        throw new Error('Carte, client Stripe ou montant manquant');
      }

      // Facture déjà créée lors d'un passage précédent (ex. échec réseau après création) : on la reprend.
      let invoiceId = order.stripe_invoice_id as string | null;
      if (!invoiceId) {
        const draft = await stripe.invoices.create(
          {
            customer: order.stripe_customer_id,
            collection_method: 'charge_automatically',
            default_payment_method: order.stripe_payment_method_id,
            auto_advance: false,
            pending_invoice_items_behavior: 'exclude',
            currency: 'eur',
            default_tax_rates: taxRate ? [taxRate] : undefined,
            description: `Course ${ref}`,
            custom_fields: [{ name: 'Réf.', value: ref }],
            metadata: { order_id: order.id, tracking_code: ref },
          },
          { idempotencyKey: `deferred-invoice-${order.id}` }
        );
        await stripe.invoiceItems.create(
          {
            customer: order.stripe_customer_id,
            invoice: draft.id,
            currency: 'eur',
            amount: Math.round(Number(order.amount_due) * 100),
            description: `Course ${ref} — ${order.pickup_address} → ${order.dropoff_address}`,
          },
          { idempotencyKey: `deferred-item-${order.id}` }
        );
        invoiceId = draft.id;
        await supabase.from('orders').update({ stripe_invoice_id: invoiceId }).eq('id', order.id);
      }

      let invoice = await stripe.invoices.retrieve(invoiceId);
      if (invoice.status === 'draft') invoice = await stripe.invoices.finalizeInvoice(invoiceId);
      if (invoice.status === 'open') invoice = await stripe.invoices.pay(invoiceId);

      if (invoice.status === 'paid') {
        await supabase
          .from('orders')
          .update({ billing_status: 'paye', paid_at: new Date().toISOString() })
          .eq('id', order.id);
        results.push({ order: ref, ok: true });
      } else if (invoice.status === 'open') {
        // Prélèvement SEPA (RIB) : il met plusieurs jours à aboutir. Le webhook invoice.paid /
        // invoice.payment_failed passera la commande en 'paye' ou 'echec'.
        await supabase.from('orders').update({ billing_status: 'prelevement_en_cours' }).eq('id', order.id);
        results.push({ order: ref, ok: true, detail: 'prélèvement SEPA en cours' });
      } else {
        throw new Error(`Facture Stripe au statut ${invoice.status}`);
      }
    } catch (err: any) {
      // Carte refusée/expirée ou données manquantes : on arrête, l'admin relance le client.
      // Autre erreur (Stripe ou réseau indisponible) : on laisse 'a_debiter' pour réessayer demain.
      console.error('Deferred payment error', ref, err);
      if (err?.type === 'StripeCardError' || !(err instanceof Stripe.errors.StripeError)) {
        await supabase.from('orders').update({ billing_status: 'echec' }).eq('id', order.id);
      }
      results.push({ order: ref, ok: false, detail: err.message });
    }
  }

  return Response.json({ processed: results.length, results });
}
