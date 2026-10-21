import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { issueInternalInvoice } from '@/lib/issue-invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Actions de l'admin sur une facture du compte, avant son envoi :
//  - prepare : la valide sur Stripe tout de suite (PDF visible), elle part au prochain envoi du matin ;
//  - hold    : bloque l'envoi (retenue) ;
//  - release : débloque, elle repart dans le circuit (prête si déjà validée sur Stripe, sinon en cours).
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });

  const { invoiceId, action } = await req.json().catch(() => ({}));
  if (typeof invoiceId !== 'string' || !UUID.test(invoiceId) || !['prepare', 'hold', 'release'].includes(action)) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: inv } = await supabase.from('invoices').select('id, status, stripe_invoice_id').eq('id', invoiceId).maybeSingle();
  if (!inv) return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 });

  if (action === 'hold') {
    if (!['en_cours', 'prete'].includes(inv.status)) return NextResponse.json({ error: 'Cette facture est déjà envoyée ou en cours d\'envoi.' }, { status: 409 });
    await supabase.from('invoices').update({ status: 'retenue' }).eq('id', inv.id).eq('status', inv.status);
    return NextResponse.json({ status: 'retenue' });
  }

  if (action === 'release') {
    if (inv.status !== 'retenue') return NextResponse.json({ error: 'Cette facture n\'est pas bloquée.' }, { status: 409 });
    const status = inv.stripe_invoice_id ? 'prete' : 'en_cours';
    await supabase.from('invoices').update({ status }).eq('id', inv.id).eq('status', 'retenue');
    return NextResponse.json({ status });
  }

  // prepare
  if (inv.status === 'retenue' && !inv.stripe_invoice_id) {
    await supabase.from('invoices').update({ status: 'en_cours' }).eq('id', inv.id).eq('status', 'retenue');
  } else if (inv.status !== 'en_cours') {
    return NextResponse.json({ error: 'Cette facture est déjà validée sur Stripe.' }, { status: 409 });
  }
  const result = await issueInternalInvoice(supabase, stripe, inv.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
