import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fiche chauffeur (admin) : e-mail de connexion et dernière connexion, lus dans le compte du chauffeur
// (non accessibles depuis le navigateur).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: driver } = await admin.from('drivers').select('auth_id').eq('id', id).maybeSingle();
  if (!driver) return NextResponse.json({ error: 'Chauffeur introuvable.' }, { status: 404 });
  if (!driver.auth_id) return NextResponse.json({ email: null, lastSignInAt: null });

  const { data } = await admin.auth.admin.getUserById(driver.auth_id);
  return NextResponse.json({ email: data.user?.email ?? null, lastSignInAt: data.user?.last_sign_in_at ?? null });
}
