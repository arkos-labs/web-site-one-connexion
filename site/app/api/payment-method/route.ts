import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sessionUser, customerIdFor, savedMethodOf } from '@/lib/payment-method';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});
const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Moyen de paiement enregistré du client connecté (paiement en 1 clic).
// GET : le moyen enregistré · POST : page Stripe pour en enregistrer un · DELETE : le retirer.

export async function GET() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  try {
    const saved = await savedMethodOf(stripe, await customerIdFor(admin(), stripe, user, false));
    return NextResponse.json({ method: saved?.method ?? null });
  } catch (err: any) {
    console.error('Moyen de paiement (lecture) :', err?.message);
    return NextResponse.json({ method: null });
  }
}

export async function POST(req: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  try {
    const customer = await customerIdFor(admin(), stripe, user, true);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const back = `${origin}/dashboard/parametres?onglet=facturation`;

    // Carte, et RIB si le prélèvement SEPA est activé dans Stripe.
    const create = (types: Stripe.Checkout.SessionCreateParams.PaymentMethodType[]) => stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer!,
      payment_method_types: types,
      currency: 'eur',
      success_url: `${back}&moyen=ok`,
      cancel_url: back,
      metadata: { purpose: 'save_payment_method', user_id: user.id },
    });
    let session: Stripe.Checkout.Session;
    try {
      session = await create(['card', 'sepa_debit']);
    } catch (err: any) {
      if (!String(err?.message).includes('sepa_debit')) throw err;
      session = await create(['card']);
    }
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Moyen de paiement (ajout) :', err?.message);
    return NextResponse.json({ error: 'Enregistrement indisponible.' }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  try {
    const saved = await savedMethodOf(stripe, await customerIdFor(admin(), stripe, user, false));
    if (saved) await stripe.paymentMethods.detach(saved.method.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Moyen de paiement (retrait) :', err?.message);
    return NextResponse.json({ error: 'Retrait impossible.' }, { status: 500 });
  }
}
