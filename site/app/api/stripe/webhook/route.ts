import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { notifyPaidOrder, notifyFailedPayment } from '@/lib/telegram-dashboard';
import { settlePayAll } from '@/lib/pay-all';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;


export async function POST(req: Request) {
  try {
    // Note: We use the service role key to bypass RLS for the webhook
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else if (process.env.NODE_ENV !== 'production') {
      // Pour les tests sans webhook secret (jamais en production : n'importe qui pourrait marquer une facture payée)
      event = JSON.parse(body);
    } else {
      throw new Error('STRIPE_WEBHOOK_SECRET manquant');
    }

    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      const stripeInvoice = event.data.object as Stripe.Invoice;
      const paid = event.type === 'invoice.paid';
      const invoiceUpdate = paid
        ? { status: 'payee', payment_date: new Date().toISOString().slice(0, 10) }
        : { status: 'echec' };
      await supabase
        .from('invoices')
        .update(invoiceUpdate)
        .eq('stripe_invoice_id', stripeInvoice.id);

      // Facture mensuelle regroupant plusieurs mois : les autres factures internes réglées
      // par cette même facture Stripe (voir cron monthly-invoices).
      const groupedIds = stripeInvoice.metadata?.invoice_ids?.split(',').filter(Boolean) ?? [];
      if (groupedIds.length) {
        await supabase.from('invoices').update(invoiceUpdate).in('id', groupedIds);
      }

      // Commande pro fin de mois : débit carte/RIB (cron deferred-payments) ou virement reçu
      if (stripeInvoice.metadata?.order_id) {
        await supabase
          .from('orders')
          .update(paid
            ? { billing_status: 'paye', paid_at: new Date().toISOString() }
            : { billing_status: 'echec' })
          .eq('stripe_invoice_id', stripeInvoice.id);
      }
    }

    // Paiement par carte refusé, ou page de paiement abandonnée : la commande reste dans le
    // dashboard avec le badge « Paiement non réussi » (billing_status = 'echec'), sans jamais
    // écraser une commande déjà payée.
    if (
      event.type === 'payment_intent.payment_failed' ||
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const obj = event.data.object as Stripe.PaymentIntent | Stripe.Checkout.Session;
      const orderId = obj.metadata?.orderId;
      const isPaymentSession = event.type === 'payment_intent.payment_failed' || (obj as Stripe.Checkout.Session).mode === 'payment';

      if (orderId && isPaymentSession) {
        const reason = event.type === 'checkout.session.expired'
          ? 'abandon'
          : (event.data.object as Stripe.PaymentIntent).last_payment_error?.message || 'paiement refusé';

        const { data: failed } = await supabase
          .from('orders')
          .update({ billing_status: 'echec' })
          .eq('tracking_code', orderId)
          .not('status', 'in', '(annulee,cancelled)') // commande abandonnée pour être refaite : pas d'alerte
          .or('billing_status.is.null,billing_status.neq.paye')
          .select('id');

        if (failed?.length) {
          await notifyFailedPayment(orderId, reason).catch((e) => console.error('Telegram failed-payment notify failed:', e));
        }
      }
    }

    // Paiement en 1 clic : prélèvement SEPA confirmé quelques jours après la commande.
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.purpose === 'one_click' && pi.metadata?.orderId) {
        await supabase
          .from('orders')
          .update({ billing_status: 'paye', paid_at: new Date().toISOString() })
          .eq('tracking_code', pi.metadata.orderId)
          .neq('billing_status', 'paye');
      }
    }

    if (event.type === 'checkout.session.completed' && (event.data.object as Stripe.Checkout.Session).metadata?.purpose === 'pay_all') {
      // « Tout régler » : toutes les factures du paiement groupé passent en réglées, reçu détaillé par e-mail.
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid') await settlePayAll(supabase, stripe, session);
    } else if (event.type === 'checkout.session.completed' && (event.data.object as Stripe.Checkout.Session).metadata?.purpose === 'save_payment_method') {
      // Carte ou RIB enregistré depuis l'espace client : il devient le moyen de paiement par défaut (1 clic).
      const session = event.data.object as Stripe.Checkout.Session;
      const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
      if (typeof session.customer === 'string' && typeof setupIntent.payment_method === 'string') {
        await stripe.customers.update(session.customer, { invoice_settings: { default_payment_method: setupIntent.payment_method } });
      }
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        let updateData: any = {};
        const amountDue = session.metadata?.price ? Number(session.metadata.price) : null;

        if (session.mode === 'payment') {
          // Particulier, ou pro qui a payé tout de suite par carte
          // Le statut de la course (en_attente → dispatch) ne change pas : seul le paiement est enregistré.
          updateData = {
            payment_mode: 'carte',
            billing_status: 'paye',
            amount_due: amountDue,
            paid_at: new Date().toISOString(),
            // Facture créée par Stripe au paiement (envoyée au client à la livraison de la course).
            ...(typeof session.invoice === 'string' ? { stripe_invoice_id: session.invoice } : {}),
            ...(typeof session.customer === 'string' ? { stripe_customer_id: session.customer } : {}),
          };
        } else if (session.mode === 'setup') {
          // Pro en paiement fin de mois : carte enregistrée, débitée par le cron deferred-payments à J+30.
          const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string);
          const paymentMethodId = setupIntent.payment_method as string;
          const customerId = session.customer as string;

          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });

          const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
          updateData = {
            payment_mode: 'fin_de_mois',
            billing_status: 'a_debiter',
            amount_due: amountDue,
            payment_due_date: dueDate,
            stripe_customer_id: customerId,
            stripe_payment_method_id: paymentMethodId,
          };
        }

        // Avant la mise à jour : pour ne prévenir Telegram qu'une fois (Stripe peut renvoyer l'événement)
        const { data: before } = await supabase
          .from('orders')
          .select('client_type, billing_status, stripe_invoice_id')
          .eq('tracking_code', orderId)
          .maybeSingle();

        // Course livrée non payée : une facture « à régler » est déjà partie. Le client paie finalement
        // la page Checkout : on annule cette facture pour ne pas le faire payer deux fois.
        if (before?.billing_status === 'a_regler' && before.stripe_invoice_id) {
          const pending = await stripe.invoices.retrieve(before.stripe_invoice_id).catch(() => null);
          if (pending?.status === 'open') await stripe.invoices.voidInvoice(pending.id!).catch((e) => console.error('Annulation facture à régler :', e?.message));
        }

        const { error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('tracking_code', orderId); // orderId = code de suivi (OC-XXXXXXXX)

        if (error) console.error('Webhook order update error:', error.message);

        // Particulier : l'alerte Telegram part seulement quand la course est payée
        if (session.mode === 'payment' && before?.client_type === 'particulier' && before.billing_status !== 'paye') {
          await notifyPaidOrder(orderId).catch((e) => console.error('Telegram paid-order notify failed:', e));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}
