import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/order-confirmation';

// E-mail de confirmation d'une commande pro, appelé par le navigateur juste après la commande.
// Route publique : seulement une commande pro créée à l'instant, et l'e-mail part à l'adresse de
// la commande, une seule fois (voir lib/order-confirmation). Le particulier le reçoit après paiement.
const MAX_AGE_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const { trackingCode } = await req.json().catch(() => ({}));
  if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
    return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: order } = await admin
    .from('orders')
    .select('client_type, created_at')
    .eq('tracking_code', trackingCode)
    .maybeSingle();
  if (!order || order.client_type !== 'entreprise' || Date.now() - new Date(order.created_at).getTime() > MAX_AGE_MS) {
    return NextResponse.json({ sent: false });
  }
  const sent = await sendOrderConfirmation(admin, null, trackingCode);
  return NextResponse.json({ sent });
}
