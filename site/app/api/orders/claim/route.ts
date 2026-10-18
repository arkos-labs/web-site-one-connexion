import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Commande passée sans être connecté, avec l'e-mail d'un compte existant : une fois le client
// connecté (il a prouvé que le compte est à lui), la course est rattachée à son compte.
// Uniquement une commande récente, sans compte, dont l'e-mail est celui du compte connecté.
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const auth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await auth.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

    const { trackingCode } = await req.json();
    if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, created_at, contact_email')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    if (!order) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    if (order.user_id === user.id) return NextResponse.json({ orderId: order.id });

    const sameEmail = order.contact_email?.trim().toLowerCase() === user.email.toLowerCase();
    const recent = Date.now() - new Date(order.created_at).getTime() <= MAX_AGE_MS;
    if (order.user_id || !sameEmail || !recent) {
      return NextResponse.json({ error: 'Commande non rattachable.' }, { status: 403 });
    }

    const { data: linked } = await admin
      .from('orders')
      .update({ user_id: user.id })
      .eq('id', order.id)
      .is('user_id', null)
      .select('id');
    if (!linked?.length) return NextResponse.json({ error: 'Commande non rattachable.' }, { status: 409 });

    return NextResponse.json({ orderId: order.id });
  } catch (err: any) {
    console.error('Rattachement commande :', err?.message ?? err);
    return NextResponse.json({ error: 'Erreur.' }, { status: 500 });
  }
}
