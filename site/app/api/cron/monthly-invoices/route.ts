import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { issueInternalInvoice } from '@/lib/issue-invoice';
import { deliverOrderInvoice } from '@/lib/deliver-order-invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Filet de sécurité, appelé chaque jour : chaque course livrée est normalement facturée tout de suite
// (trigger en base -> /api/invoices/issue). Ce passage émet les factures encore ouvertes
// (appel manqué, erreur Stripe temporaire, factures créées avant ce fonctionnement).
// Le nom de la route est conservé (vercel.json).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id')
    .eq('status', 'en_cours')
    .gt('total_amount', 0)
    .order('created_at');

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: unknown[] = [];
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
