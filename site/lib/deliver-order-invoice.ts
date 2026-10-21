/**
 * lib/deliver-order-invoice.ts
 * Facture envoyée au client À LA LIVRAISON de sa course, quel que soit son parcours :
 *  - payé à la commande par carte (particulier, ou pro « payer maintenant ») → facture ACQUITTÉE ;
 *  - pro « fin de mois » par carte ou RIB → facture envoyée, prélevée automatiquement à l'échéance
 *    par le cron deferred-payments (qui reprend la même facture) ;
 *  - pro « fin de mois » par virement → déjà facturé à la commande (IBAN), rien de plus à envoyer.
 * Les pros avec compte (sans mode de paiement enregistré) passent par lib/issue-invoice.ts (30 jours).
 * Idempotent : orders.invoice_sent_at est « réservé » avant tout envoi.
 */
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { vatRateId } from '@/lib/stripe-vat';
import { invoiceFooter, invoiceCustomFields, upsertStripeCustomer, type InvoiceParty } from '@/lib/invoice-info';
import { sendInvoiceEmail } from '@/lib/invoice-email';

const DELIVERED = ['delivered', 'livree'];
const fr = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Paris' });

export type DeliverResult = { order: string; ok: boolean; skipped?: boolean; detail?: string };

type OrderRow = {
  id: string; tracking_code: string | null; status: string; client_type: string | null; user_id: string | null;
  contact_name: string | null; contact_email: string | null; raison_sociale: string | null;
  adresse_facturation: string | null; siret: string | null; tva_number: string | null;
  pickup_address: string; dropoff_address: string; price_estimate: number | null; amount_due: number | null;
  payment_mode: string | null; billing_status: string | null; payment_due_date: string | null;
  stripe_customer_id: string | null; stripe_payment_method_id: string | null; stripe_invoice_id: string | null;
  delivered_at: string | null; invoice_sent_at: string | null;
};

/** Coordonnées du client pour la facture : saisies à la commande, complétées par sa fiche client. */
export async function partyForOrder(supabase: SupabaseClient, o: OrderRow): Promise<InvoiceParty> {
  const pro = o.client_type === 'entreprise';
  let name = (pro ? o.raison_sociale || o.contact_name : o.contact_name) || '';
  let email = o.contact_email || '';
  let address = o.adresse_facturation;
  let postalCode: string | null = null;
  let city: string | null = null;
  let vat = o.tva_number;
  let siret = o.siret;

  if (o.user_id) {
    const { data: c } = await supabase
      .from('clients')
      .select('company_name, contact_name, contact_email, siret, tax_id, billing_address, billing_postal_code, billing_city')
      .eq('id', o.user_id)
      .maybeSingle();
    if (c) {
      name = name || c.company_name || c.contact_name || '';
      email = email || c.contact_email || '';
      if (!address && c.billing_address && c.billing_address !== 'À remplir') {
        address = c.billing_address; postalCode = c.billing_postal_code || null; city = c.billing_city || null;
      }
      vat = vat || c.tax_id; siret = siret || c.siret;
    }
    if (!email) {
      const { data } = await supabase.auth.admin.getUserById(o.user_id);
      email = data.user?.email ?? '';
    }
  }
  return { name, email, address, postalCode, city, vat, siret };
}

export async function deliverOrderInvoice(supabase: SupabaseClient, stripe: Stripe, orderId: string): Promise<DeliverResult> {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  const o = data as OrderRow | null;
  if (!o) return { order: orderId, ok: true, skipped: true, detail: 'course introuvable' };
  const ref = o.tracking_code || o.id;
  const skip = (detail: string): DeliverResult => ({ order: ref, ok: true, skipped: true, detail });

  if (!DELIVERED.includes(o.status)) return skip('course pas encore livrée');
  if (o.invoice_sent_at) return skip('facture déjà envoyée');
  if (o.client_type === 'entreprise' && o.user_id && !o.payment_mode) {
    // Pro avec fiche client : la course part sur la facture du mois (lib/issue-invoice).
    const { data: client } = await supabase.from('clients').select('id').eq('id', o.user_id).maybeSingle();
    if (client) return skip('pro avec compte : facture à 30 jours (autre circuit)');
  }
  if (o.payment_mode === 'fin_de_mois' && o.billing_status === 'virement_attendu') return skip('virement : facture déjà envoyée à la commande');
  if (o.billing_status === 'annule') return skip('commande annulée');

  // Réservation anti double envoi.
  const { data: claimed } = await supabase
    .from('orders').update({ invoice_sent_at: new Date().toISOString() }).eq('id', o.id).is('invoice_sent_at', null).select('id').maybeSingle();
  if (!claimed) return skip('facture déjà en cours d\'envoi');
  const release = () => supabase.from('orders').update({ invoice_sent_at: null }).eq('id', o.id);

  try {
    const party = await partyForOrder(supabase, o);
    if (!party.email) throw new Error('Aucune adresse e-mail pour ce client');

    // 1) Facture déjà créée (par Checkout au paiement, ou par le cron) ?
    let invoice: Stripe.Invoice | null = null;
    if (o.stripe_invoice_id) {
      invoice = await stripe.invoices.retrieve(o.stripe_invoice_id);
    } else if (o.payment_mode === 'carte' && o.tracking_code) {
      const found = await stripe.invoices.search({ query: `metadata['tracking_code']:'${o.tracking_code}'`, limit: 1 });
      invoice = found.data[0] ?? null;
      if (invoice) await supabase.from('orders').update({ stripe_invoice_id: invoice.id }).eq('id', o.id);
    }

    // 2) Sinon on la crée maintenant.
    if (!invoice) {
      const customerId = await upsertStripeCustomer(stripe, party, o.stripe_customer_id, `cust-order-${o.id}`);
      if (customerId !== o.stripe_customer_id) await supabase.from('orders').update({ stripe_customer_id: customerId }).eq('id', o.id);
      const deferred = o.payment_mode === 'fin_de_mois';
      // Course livrée sans paiement (carte abandonnée, refusée…) : facture à régler sous 30 jours.
      const unpaid = !o.payment_mode;
      const amount = Number(deferred ? o.amount_due : o.amount_due ?? o.price_estimate);
      if (!amount) throw new Error('Montant de la course manquant');
      // Prix TTC pour tous (pros et particuliers) : la TVA 20 % est « dont ».
      const taxRate = await vatRateId(stripe);
      const delivered = o.delivered_at ? fr(new Date(o.delivered_at)) : fr(new Date());

      // Facture à régler : le client choisit sur la page de la facture, carte ou virement (IBAN dédié).
      const payBy: Stripe.InvoiceCreateParams['payment_settings'] = unpaid ? {
        payment_method_types: ['card', 'customer_balance'],
        payment_method_options: {
          customer_balance: { funding_type: 'bank_transfer', bank_transfer: { type: 'eu_bank_transfer', eu_bank_transfer: { country: 'FR' } } },
        },
      } : undefined;
      const createDraft = (paymentSettings: typeof payBy, key: string) => stripe.invoices.create(
        {
          ...(paymentSettings ? { payment_settings: paymentSettings } : {}),
          customer: customerId,
          // Facture déjà payée : prélèvement automatique « hors Stripe », donc aucune date d'échéance.
          // Non payée : facture envoyée, à régler sous 30 jours (carte ou virement depuis la page Stripe).
          ...(unpaid ? { collection_method: 'send_invoice' as const, days_until_due: 30 } : { collection_method: 'charge_automatically' as const }),
          ...(deferred ? { default_payment_method: o.stripe_payment_method_id ?? undefined } : {}),
          auto_advance: false,
          // Date d'émission imprimée sur la facture : le jour de la livraison, même si la facture part plus tard.
          ...(o.delivered_at ? { effective_at: Math.floor(new Date(o.delivered_at).getTime() / 1000) } : {}),
          pending_invoice_items_behavior: 'exclude',
          currency: 'eur',
          default_tax_rates: [taxRate],
          description: `Course ${ref} du ${delivered}`,
          custom_fields: invoiceCustomFields(ref, party),
          footer: invoiceFooter(!deferred && !unpaid),
          metadata: { order_id: o.id, tracking_code: ref },
        },
        { idempotencyKey: key }
      );
      let draft: Stripe.Invoice;
      try {
        draft = await createDraft(payBy, payBy ? `deliver-invoice-bt-${o.id}` : `deliver-invoice-${o.id}`);
      } catch (err: any) {
        // Virement bancaire non activé dans Stripe : la facture reste payable par carte.
        if (!payBy || !String(err?.message).includes('customer_balance')) throw err;
        draft = await createDraft({ payment_method_types: ['card'] }, `deliver-invoice-card-${o.id}`);
      }
      await stripe.invoiceItems.create(
        {
          customer: customerId, invoice: draft.id, currency: 'eur', amount: Math.round(amount * 100),
          description: `Course ${ref} - ${o.pickup_address} → ${o.dropoff_address} - livrée le ${delivered}`,
        },
        { idempotencyKey: `deliver-item-${o.id}` }
      );
      invoice = await stripe.invoices.finalizeInvoice(draft.id!, { auto_advance: false });
      if (!deferred && !unpaid && invoice.status === 'open') {
        // Déjà encaissée à la commande (Stripe Checkout) : facture acquittée, sans nouveau débit.
        invoice = await stripe.invoices.pay(invoice.id!, { paid_out_of_band: true });
      }
      await supabase.from('orders')
        .update(unpaid ? { stripe_invoice_id: invoice.id, billing_status: 'a_regler', amount_due: amount } : { stripe_invoice_id: invoice.id })
        .eq('id', o.id);
    } else if (invoice.status === 'draft') {
      invoice = await stripe.invoices.finalizeInvoice(invoice.id!, { auto_advance: false });
    }

    // 3) Quel message envoyer ?
    let state: 'paid' | 'due' | 'auto';
    if (invoice.status === 'paid') state = 'paid';
    else if (invoice.status === 'open' && invoice.collection_method === 'charge_automatically') state = 'auto';
    else if (invoice.status === 'open') state = 'due';
    else throw new Error(`Facture Stripe au statut ${invoice.status}`);

    const dueDate = o.payment_due_date ? new Date(o.payment_due_date) : invoice.due_date ? new Date(invoice.due_date * 1000) : null;
    const sent = await sendInvoiceEmail({
      to: party.email, name: party.name, number: invoice.number ?? ref, trackingCode: ref,
      totalCents: invoice.total, state, dueDate, pdfUrl: invoice.invoice_pdf, hostedUrl: invoice.hosted_invoice_url,
    });
    if (!sent) throw new Error('E-mail non envoyé (Resend)');
    return { order: ref, ok: true, detail: `facture ${invoice.number} envoyée (${state})` };
  } catch (err: any) {
    console.error('Deliver order invoice error', ref, err);
    await release();
    return { order: ref, ok: false, detail: err.message };
  }
}
