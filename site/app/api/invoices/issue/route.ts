import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { issueInternalInvoice } from '@/lib/issue-invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Appelée par la base (trigger sur orders, via pg_net) dès qu'une course est livrée :
// émet tout de suite la facture Stripe de cette course (30 jours pour payer).
// Pas de secret : la route n'accepte qu'un id de course, ne lit aucun montant dans la requête et
// n'agit que sur une facture déjà ouverte en base (course livrée, prix enregistré). Idempotente.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = body?.order_id;
  if (typeof orderId !== 'string' || !UUID.test(orderId)) {
    return Response.json({ error: 'order_id invalide' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: item } = await supabase.from('invoice_items').select('invoice_id').eq('order_id', orderId).maybeSingle();
  if (!item) return Response.json({ ok: true, skipped: true, detail: 'course non facturable (pas livrée, sans prix ou déjà payée)' });

  const result = await issueInternalInvoice(supabase, stripe, item.invoice_id);
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
