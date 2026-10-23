import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { isServedAddress, MAX_FLASH_DELIVERIES, ServiceLevel } from '@/lib/pricing';
import { priceRoute, deliveriesOf } from '@/lib/route-distance';
import { sessionUser, customerIdFor, savedMethodOf } from '@/lib/payment-method';
import { notifyPaidOrder } from '@/lib/telegram-dashboard';
import { sendOrderConfirmation } from '@/lib/order-confirmation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

// Paiement en 1 clic avec le moyen enregistré du client connecté, sans passer par la page Stripe.
//  - « carte » (régler maintenant) : débit immédiat de la carte, ou prélèvement SEPA lancé ;
//  - « fin_de_mois » (dans les 30 jours) : débit programmé à J+30 (cron deferred-payments).
// Si la banque demande une confirmation (3-D Secure) ou refuse : { fallback: true }, le client
// passe par la page Stripe habituelle. Le montant est recalculé ici, jamais lu dans la requête.
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ fallback: true });

  try {
    const { trackingCode, paymentMode } = await req.json();
    if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    }
    const deferred = paymentMode === 'fin_de_mois';

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, created_at, status, payment_mode, billing_status, pickup_address, dropoff_address, stops, delai, client_type, siret')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    if (!order || order.user_id !== user.id || order.payment_mode || order.billing_status === 'paye'
        || Date.now() - new Date(order.created_at).getTime() > MAX_AGE_MS
        || ['annulee', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ fallback: true });
    }
    const deliveries = deliveriesOf(order);
    if (!isServedAddress(order.pickup_address) || deliveries.some((a) => !isServedAddress(a))) {
      return NextResponse.json({ error: 'Adresse hors zone.' }, { status: 400 });
    }
    if (order.delai === 'flash' && deliveries.length > MAX_FLASH_DELIVERIES) {
      return NextResponse.json({ error: `En Super 1 h, ${MAX_FLASH_DELIVERIES} adresses de livraison au maximum.` }, { status: 400 });
    }

    const customerId = await customerIdFor(admin, stripe, user, false);
    const saved = await savedMethodOf(stripe, customerId);
    if (!saved || !customerId) return NextResponse.json({ fallback: true });

    // Particulier : carte uniquement, réglée tout de suite (ni prélèvement, ni paiement à 30 jours).
    const pro = order.client_type === 'entreprise' && !!order.siret;
    if (!pro && (deferred || saved.method.type !== 'card')) return NextResponse.json({ fallback: true });

    // Course A → B, plus chaque adresse de livraison en plus (lib/pricing.ts).
    const { total: price } = await priceRoute(order.pickup_address, deliveries, (order.delai || 'standard') as ServiceLevel);
    const common = { amount_due: price, stripe_customer_id: customerId, stripe_payment_method_id: saved.method.id };

    if (deferred) {
      const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      await admin.from('orders').update({
        ...common, payment_mode: 'fin_de_mois', billing_status: 'a_debiter', payment_due_date: dueDate,
      }).eq('id', order.id);
      return NextResponse.json({ ok: true, scheduled: true, method: saved.method.label });
    }

    let pi: Stripe.PaymentIntent;
    try {
      pi = await stripe.paymentIntents.create(
        {
          amount: Math.round(price * 100),
          currency: 'eur',
          customer: customerId,
          payment_method: saved.method.id,
          payment_method_types: [saved.method.type],
          off_session: true,
          confirm: true,
          description: `Course ${trackingCode}`,
          metadata: { orderId: trackingCode, purpose: 'one_click' },
        },
        { idempotencyKey: `pay-saved-${order.id}` }
      );
    } catch (err: any) {
      // Carte refusée ou authentification demandée : la page Stripe prend le relais.
      console.error('Paiement 1 clic refusé :', trackingCode, err?.code ?? err?.message);
      const pending = err?.raw?.payment_intent?.id;
      if (pending) await stripe.paymentIntents.cancel(pending).catch(() => {});
      return NextResponse.json({ fallback: true, reason: err?.code ?? 'refus' });
    }

    if (pi.status !== 'succeeded' && pi.status !== 'processing') {
      await stripe.paymentIntents.cancel(pi.id).catch(() => {});
      return NextResponse.json({ fallback: true, reason: pi.status });
    }

    // Carte : payé tout de suite. Prélèvement SEPA : en cours (confirmé par le webhook sous quelques jours).
    const paid = pi.status === 'succeeded';
    await admin.from('orders').update({
      ...common, payment_mode: 'carte',
      billing_status: paid ? 'paye' : 'prelevement_en_cours',
      ...(paid ? { paid_at: new Date().toISOString() } : {}),
    }).eq('id', order.id);

    if (order.client_type === 'particulier') {
      await notifyPaidOrder(trackingCode).catch((e) => console.error('Telegram paid-order notify failed:', e));
      // E-mail de confirmation (la facture part à la livraison).
      await sendOrderConfirmation(admin, trackingCode);
    }
    return NextResponse.json({ ok: true, paid, method: saved.method.label });
  } catch (err: any) {
    console.error('Paiement 1 clic :', err?.message ?? err);
    return NextResponse.json({ fallback: true });
  }
}
