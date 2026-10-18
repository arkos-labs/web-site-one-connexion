import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

// Le client est revenu de Stripe sans payer pour corriger sa commande : on ferme la page de paiement
// (plus aucun paiement possible dessus) et on annule la commande en attente, qu'il va refaire.
// Seulement une commande récente, encore en attente et jamais payée.
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { trackingCode, sessionId } = await req.json();
    if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: order } = await admin
      .from('orders')
      .select('id, status, created_at, payment_mode, billing_status, driver_id')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    if (!order) return NextResponse.json({ abandoned: false });

    const recent = Date.now() - new Date(order.created_at).getTime() <= MAX_AGE_MS;
    const unpaid = !order.payment_mode && (!order.billing_status || order.billing_status === 'echec');
    if (!recent || !unpaid || order.driver_id || !['en_attente', 'pending'].includes(order.status)) {
      return NextResponse.json({ abandoned: false });
    }

    // Page de paiement encore ouverte : on l'expire (seulement si elle est bien celle de cette commande).
    if (typeof sessionId === 'string' && /^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
      const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
      if (session?.metadata?.orderId === trackingCode) {
        if (session.payment_status === 'paid' || session.status === 'complete') return NextResponse.json({ abandoned: false });
        if (session.status === 'open') await stripe.checkout.sessions.expire(sessionId).catch(() => null);
      }
    }

    await admin
      .from('orders')
      .update({ status: 'annulee' })
      .eq('id', order.id)
      .in('status', ['en_attente', 'pending'])
      .is('payment_mode', null);

    return NextResponse.json({ abandoned: true });
  } catch (err: any) {
    console.error('Abandon commande :', err?.message ?? err);
    return NextResponse.json({ error: 'Erreur.' }, { status: 500 });
  }
}
