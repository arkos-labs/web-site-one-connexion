import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
});

// Facture Stripe d'une course, pour la fiche de suivi du client.
// La commande est lue avec la session du client : la RLS garantit qu'elle est bien à lui.
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

    const { orderId } = await req.json();
    if (typeof orderId !== 'string' || !orderId) return NextResponse.json({ error: 'Commande manquante.' }, { status: 400 });

    const { data: order } = await supabase
      .from('orders')
      .select('id, stripe_invoice_id')
      .eq('id', orderId)
      .maybeSingle();
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    if (!order.stripe_invoice_id) return NextResponse.json({ invoice: null });

    const invoice = await stripe.invoices.retrieve(order.stripe_invoice_id);
    if (invoice.status === 'draft' || invoice.status === 'void') return NextResponse.json({ invoice: null });

    return NextResponse.json({
      invoice: {
        number: invoice.number,
        status: invoice.status, // paid | open | uncollectible
        url: invoice.hosted_invoice_url,
        pdf: invoice.invoice_pdf,
      },
    });
  } catch (err: any) {
    console.error('Facture course :', err?.message ?? err);
    return NextResponse.json({ error: 'Facture indisponible.' }, { status: 500 });
  }
}
