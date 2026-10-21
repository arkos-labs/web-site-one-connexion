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
//  - release : débloque, elle repart dans le circuit (prête si déjà validée sur Stripe, sinon en cours) ;
//  - redo    : facture fausse pas encore envoyée : annulée sur Stripe puis préparée de nouveau.
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
  if (typeof invoiceId !== 'string' || !UUID.test(invoiceId) || !['prepare', 'hold', 'release', 'redo'].includes(action)) {
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

  if (action === 'redo') {
    if (!['prete', 'retenue'].includes(inv.status) || !inv.stripe_invoice_id) {
      return NextResponse.json({ error: 'Seule une facture préparée et pas encore envoyée peut être refaite.' }, { status: 409 });
    }
    // Rien ne doit partir pendant la reprise.
    const { data: held } = await supabase.from('invoices').update({ status: 'retenue' }).eq('id', inv.id).in('status', ['prete', 'retenue']).select('id').maybeSingle();
    if (!held) return NextResponse.json({ error: 'La facture vient de changer de statut, rechargez la page.' }, { status: 409 });
    try {
      const stripeInvoice = await stripe.invoices.retrieve(inv.stripe_invoice_id);
      if (stripeInvoice.status === 'paid') return NextResponse.json({ error: 'Cette facture est déjà payée sur Stripe.' }, { status: 409 });
      if (stripeInvoice.status === 'open' || stripeInvoice.status === 'uncollectible') await stripe.invoices.voidInvoice(stripeInvoice.id!);
      else if (stripeInvoice.status === 'draft') await stripe.invoices.del(stripeInvoice.id!);
    } catch (err: any) {
      return NextResponse.json({ error: `Annulation Stripe impossible : ${err.message}` }, { status: 500 });
    }
    await supabase
      .from('invoices')
      .update({ status: 'en_cours', stripe_invoice_id: null, hosted_invoice_url: null, pdf_url: null })
      .eq('id', inv.id);
    // Montants recalculés depuis les lignes (prix corrigés éventuels).
    await supabase.rpc('recalc_invoice', { p_invoice_id: inv.id });
    const result = await issueInternalInvoice(supabase, stripe, inv.id, `-redo-${Date.now()}`);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
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
