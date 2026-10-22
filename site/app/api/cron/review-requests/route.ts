import { createClient } from '@supabase/supabase-js';
import { partyForOrder } from '@/lib/deliver-order-invoice';
import { sendReviewEmail } from '@/lib/review-email';

// Chaque jour : demande d'avis Google aux clients dont la course a été livrée il y a au moins 2 h
// (et pas plus de 3 jours, pour ne pas relancer d'anciennes courses). Un seul e-mail par client, pour
// toujours : review_requests (e-mail en minuscules, compte) est « réservé » avant l'envoi.
// orders.review_requested_at marque la course comme traitée, envoi ou non.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const olderThan = new Date(Date.now() - 2 * 3600000).toISOString();
  const newerThan = new Date(Date.now() - 3 * 86400000).toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['delivered', 'livree'])
    .is('review_requested_at', null)
    .lte('delivered_at', olderThan)
    .gte('delivered_at', newerThan)
    .not('tracking_code', 'like', 'OC-TEST%')
    .limit(50);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results: unknown[] = [];
  for (const o of orders ?? []) {
    if (o.billing_status === 'annule') continue;
    const { data: claimed } = await supabase
      .from('orders').update({ review_requested_at: new Date().toISOString() })
      .eq('id', o.id).is('review_requested_at', null).select('id').maybeSingle();
    if (!claimed) continue;

    const party = await partyForOrder(supabase, o);
    const email = party.email.trim().toLowerCase();
    if (!email) {
      await supabase.from('orders').update({ review_requested_at: null }).eq('id', o.id);
      results.push({ order: o.tracking_code || o.id, sent: false });
      continue;
    }

    // Client déjà sollicité (même compte, même sous un autre e-mail) : on ne redemande jamais.
    if (o.user_id) {
      const { data: asked } = await supabase.from('review_requests').select('email').eq('user_id', o.user_id).limit(1);
      if (asked?.length) { results.push({ order: o.tracking_code || o.id, sent: false, skipped: 'déjà demandé' }); continue; }
    }
    const { data: reserved } = await supabase
      .from('review_requests')
      .upsert({ email, user_id: o.user_id ?? null, order_id: o.id }, { onConflict: 'email', ignoreDuplicates: true })
      .select('email');
    if (!reserved?.length) { results.push({ order: o.tracking_code || o.id, sent: false, skipped: 'déjà demandé' }); continue; }

    const sent = await sendReviewEmail({ to: party.email, name: party.name, trackingCode: o.tracking_code || o.id, orderedAt: o.created_at });
    if (!sent) {
      await supabase.from('review_requests').delete().eq('email', email).eq('order_id', o.id);
      await supabase.from('orders').update({ review_requested_at: null }).eq('id', o.id);
    }
    results.push({ order: o.tracking_code || o.id, sent });
  }

  return Response.json({ processed: results.length, results });
}
