import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sessionUser, customerIdFor } from '@/lib/payment-method';
import { dueInvoices, fitInOnePayment, encodeBatch } from '@/lib/pay-all';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

const adminClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// « Tout régler » depuis la page Vos factures.
//  GET  : nombre de factures à régler et total, relus chez Stripe (pour le bouton) ;
//  POST : page de paiement Stripe avec une ligne par course. Le montant n'est jamais lu dans la requête.

export async function GET() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  try {
    const due = await dueInvoices(adminClient(), stripe, user.id);
    const { batch, left } = fitInOnePayment(due);
    return NextResponse.json({
      count: batch.length,
      totalCents: batch.reduce((s, i) => s + i.amount, 0),
      left,
    });
  } catch (err) {
    console.error('Tout régler (résumé) :', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Factures indisponibles.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

  try {
    const admin = adminClient();
    const { batch } = fitInOnePayment(await dueInvoices(admin, stripe, user.id));
    if (!batch.length) return NextResponse.json({ error: 'Aucune facture à régler.' }, { status: 400 });

    const customerId = await customerIdFor(admin, stripe, user, true);
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const count = batch.length;
    const metadata = { purpose: 'pay_all', user_id: user.id, count: String(count), ...encodeBatch(batch) };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      // Une ligne par course, comme sur un ticket de caisse. Prix TTC (TVA 20 % comprise).
      line_items: batch.flatMap((inv) =>
        inv.lines.map((l) => ({
          price_data: { currency: 'eur', product_data: { name: l.description.slice(0, 250) }, unit_amount: l.amount },
          quantity: 1,
        }))
      ),
      payment_intent_data: {
        description: `Règlement de ${count} facture${count > 1 ? 's' : ''}`,
        // Reçu envoyé par Stripe (une ligne par course) : le site n'en envoie pas.
        ...(user.email ? { receipt_email: user.email } : {}),
        metadata: { purpose: 'pay_all', user_id: user.id },
      },
      metadata,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${origin}/dashboard/factures?reglement=ok`,
      cancel_url: `${origin}/dashboard/factures`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Tout régler :', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Paiement indisponible pour le moment. Réessayez dans un instant.' }, { status: 500 });
  }
}
