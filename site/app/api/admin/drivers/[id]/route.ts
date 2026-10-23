import { NextResponse } from 'next/server';
import { adminSupabase, driverPhoto, requireAdmin } from '@/lib/admin-auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fiche chauffeur (admin) : e-mail de connexion, dernière connexion et photo, lus dans le compte du chauffeur
// (non accessibles depuis le navigateur). La photo, c'est le chauffeur qui l'ajoute depuis son appli.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const admin = adminSupabase();
  const { data: driver } = await admin.from('drivers').select('auth_id').eq('id', id).maybeSingle();
  if (!driver) return NextResponse.json({ error: 'Chauffeur introuvable.' }, { status: 404 });
  if (!driver.auth_id) return NextResponse.json({ email: null, lastSignInAt: null, avatarUrl: null });

  const [{ data }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(driver.auth_id),
    admin.from('profiles').select('avatar_url').eq('id', driver.auth_id).maybeSingle(),
  ]);
  return NextResponse.json({
    email: data.user?.email ?? null,
    lastSignInAt: data.user?.last_sign_in_at ?? null,
    avatarUrl: driverPhoto(data.user?.user_metadata, profile?.avatar_url),
  });
}
