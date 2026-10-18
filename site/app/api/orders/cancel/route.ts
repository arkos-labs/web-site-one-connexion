import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

// Annulation par le client, possible tant qu'aucun chauffeur n'est attribué.
// Course déjà payée par carte : remboursée automatiquement (5 à 10 jours sur le relevé).
// Pro en fin de mois (carte/RIB à débiter, virement attendu) : rien n'a été encaissé,
// le cron deferred-payments voit la course annulée et ne débite pas / annule la facture.
const CANCELLABLE = ['en_attente', 'pending', 'confirmee'];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const auth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

    const { orderId } = await req.json();
    if (typeof orderId !== 'string' || !orderId) {
      return NextResponse.json({ error: 'Commande manquante.' }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, tracking_code, status, driver_id')
      .eq('id', orderId)
      .maybeSingle();
    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }
    if (order.driver_id || !CANCELLABLE.includes(order.status)) {
      return NextResponse.json(
        { error: 'Annulation impossible : un chauffeur est déjà attribué à cette course. Contactez One Connexion.' },
        { status: 409 }
      );
    }

    // Conditionnel : si le dispatch attribue un chauffeur au même moment, rien n'est annulé.
    const { data: cancelled } = await supabase
      .from('orders')
      .update({ status: 'annulee' })
      .eq('id', order.id)
      .is('driver_id', null)
      .in('status', CANCELLABLE)
      .select('id');
    if (!cancelled?.length) {
      return NextResponse.json(
        { error: 'Annulation impossible : un chauffeur est déjà attribué à cette course. Contactez One Connexion.' },
        { status: 409 }
      );
    }

    // Paiement par carte encaissé pour cette course ? (payment_intent_data.metadata.orderId, voir create-checkout)
    // Le code de suivi est choisi par le navigateur à la commande : on vérifie son format avant
    // de le mettre dans la requête de recherche Stripe.
    let refunded = false;
    if (!/^OC-[A-Z0-9]{8}$/.test(order.tracking_code ?? '')) {
      return NextResponse.json({ cancelled: true, refunded: false });
    }
    try {
      const { data: payments } = await stripe.paymentIntents.search({
        query: `metadata['orderId']:'${order.tracking_code}' AND status:'succeeded'`,
      });
      for (const pi of payments) {
        if (pi.metadata?.orderId !== order.tracking_code) continue;
        await stripe.refunds.create(
          { payment_intent: pi.id, reason: 'requested_by_customer', metadata: { orderId: order.tracking_code } },
          { idempotencyKey: `refund-${pi.id}` }
        );
        refunded = true;
      }
    } catch (err: any) {
      // Course annulée mais remboursement à faire à la main dans Stripe.
      console.error(`Remboursement échoué pour ${order.tracking_code}:`, err?.message);
      return NextResponse.json({ cancelled: true, refunded: false, refundError: true });
    }

    if (refunded) {
      await supabase.from('orders').update({ billing_status: 'rembourse' }).eq('id', order.id);
    }

    return NextResponse.json({ cancelled: true, refunded });
  } catch (err: any) {
    console.error('Annulation commande :', err);
    return NextResponse.json({ error: "Erreur lors de l'annulation. Veuillez réessayer." }, { status: 500 });
  }
}
