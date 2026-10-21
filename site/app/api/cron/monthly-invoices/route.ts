import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { issueInternalInvoice, sendPreparedInvoice } from '@/lib/issue-invoice';
import { deliverOrderInvoice } from '@/lib/deliver-order-invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Appelé chaque jour (9 h à Paris) : envoie les factures préparées (visibles par l'admin depuis la veille),
// puis prépare celles restées ouvertes. Une course livrée est normalement préparée tout de suite
// (trigger en base -> /api/invoices/issue) ; ce passage rattrape un appel manqué ou une erreur Stripe.
// Le nom de la route est conservé (vercel.json).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // 1) Envoi des factures préparées la veille ou avant, que l'admin n'a pas bloquées.
  const { data: prepared, error: preparedError } = await supabase.from('invoices').select('id').eq('status', 'prete').order('created_at');
  if (preparedError) return Response.json({ error: preparedError.message }, { status: 500 });

  const results: unknown[] = [];
  for (const inv of prepared ?? []) {
    results.push(await sendPreparedInvoice(supabase, stripe, inv.id));
  }

  // 2) Préparation des factures encore ouvertes : elles partiront au prochain passage.
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id')
    .eq('status', 'en_cours')
    .gt('total_amount', 0)
    .order('created_at');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  for (const inv of invoices ?? []) {
    results.push(await issueInternalInvoice(supabase, stripe, inv.id));
  }

  // Courses livrées dont la facture n'est pas encore partie (payées, à 30 jours, ou non payées).
  const since = new Date(Date.now() - 45 * 86400000).toISOString();
  const { data: pending } = await supabase
    .from('orders')
    .select('id')
    .in('status', ['delivered', 'livree'])
    .is('invoice_sent_at', null)
    .gte('delivered_at', since)
    .limit(50);
  for (const o of pending ?? []) {
    results.push(await deliverOrderInvoice(supabase, stripe, o.id));
  }

  return Response.json({ processed: results.length, results });
}
