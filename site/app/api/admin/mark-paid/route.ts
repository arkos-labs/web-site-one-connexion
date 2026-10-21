import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Paiement reçu hors Stripe (espèces, virement direct…) : l'admin marque la facture payée. Elle est aussi
// marquée payée sur Stripe (« paid out of band ») : plus de relance, et le client ne peut plus la régler deux fois.
//  - { orderId }   : facture d'une course (orders.billing_status) ;
//  - { invoiceId } : facture du compte (invoices.status).
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });

  const { orderId, invoiceId } = await req.json().catch(() => ({}));
  const id = orderId ?? invoiceId;
  if (typeof id !== 'string' || !UUID.test(id)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const table = orderId ? 'orders' : 'invoices';
  const { data: row } = await supabase.from(table).select('id, stripe_invoice_id').eq('id', id).maybeSingle();
  if (!row) return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });

  if (row.stripe_invoice_id) {
    try {
      const inv = await stripe.invoices.retrieve(row.stripe_invoice_id);
      if (inv.status === 'open' || inv.status === 'uncollectible') await stripe.invoices.pay(inv.id!, { paid_out_of_band: true });
      else if (inv.status !== 'paid') return NextResponse.json({ error: `Facture Stripe au statut ${inv.status}.` }, { status: 409 });
    } catch (err: any) {
      return NextResponse.json({ error: `Stripe : ${err.message}` }, { status: 500 });
    }
  }

  const paidAt = new Date().toISOString();
  const { error } = orderId
    ? await supabase.from('orders').update({ billing_status: 'paye', paid_at: paidAt }).eq('id', id)
    : await supabase.from('invoices').update({ status: 'payee', payment_date: paidAt.slice(0, 10) }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
