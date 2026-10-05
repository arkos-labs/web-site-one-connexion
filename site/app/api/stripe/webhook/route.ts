import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
      await supabase
        .from('invoices')
        .update(paid
          ? { status: 'payee', payment_date: new Date().toISOString().slice(0, 10) }
          : { status: 'echec' })
        .eq('stripe_invoice_id', stripeInvoice.id);

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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        let updateData: any = {};
        const amountDue = session.metadata?.price ? Number(session.metadata.price) : null;

        if (session.mode === 'payment') {
          // Particulier, ou pro qui a payé tout de suite par carte
          updateData = {
            status: 'paye',
            payment_mode: 'carte',
            billing_status: 'paye',
            amount_due: amountDue,
            paid_at: new Date().toISOString(),
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
            status: 'valide',
            payment_mode: 'fin_de_mois',
            billing_status: 'a_debiter',
            amount_due: amountDue,
            payment_due_date: dueDate,
            stripe_customer_id: customerId,
            stripe_payment_method_id: paymentMethodId,
          };
        }

        const { error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('tracking_code', orderId); // orderId = code de suivi (OC-XXXXXXXX)

        if (error) {
          // Colonnes de paiement absentes (migration 20261004_deferred_payment non appliquée) :
          // on enregistre au moins le statut, comme avant.
          console.error('Webhook order update error:', error.message);
          await supabase
            .from('orders')
            .update({ status: updateData.status })
            .eq('tracking_code', orderId);
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
