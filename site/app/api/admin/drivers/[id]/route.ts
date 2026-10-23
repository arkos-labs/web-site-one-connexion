import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // sous la limite de 4,5 Mo des requêtes Vercel
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Admin connecté, sinon la réponse d'erreur à renvoyer. */
async function requireAdmin() {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });
  return null;
}

const adminClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Fiche chauffeur (admin) : e-mail de connexion, dernière connexion et photo, lus dans le compte du chauffeur
// (non accessibles depuis le navigateur).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const admin = adminClient();
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
    avatarUrl: profile?.avatar_url ?? null,
  });
}

// Photo du chauffeur, choisie par l'admin : rangée dans le bucket public « avatars », adresse enregistrée
// dans profiles.avatar_url du compte du chauffeur (là où l'appli chauffeur la lira aussi).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('photo');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });
  const ext = PHOTO_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Photo en JPG, PNG ou WebP uniquement.' }, { status: 400 });
  if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Photo trop lourde (4 Mo maximum).' }, { status: 400 });

  const admin = adminClient();
  const { data: driver } = await admin.from('drivers').select('auth_id').eq('id', id).maybeSingle();
  if (!driver) return NextResponse.json({ error: 'Chauffeur introuvable.' }, { status: 404 });
  if (!driver.auth_id) return NextResponse.json({ error: "Ce chauffeur n'a pas de compte : créez-lui un accès d'abord." }, { status: 409 });

  const path = `drivers/${id}/${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage.from('avatars').upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (upErr) return NextResponse.json({ error: 'Photo non enregistrée.' }, { status: 500 });
  const avatarUrl = admin.storage.from('avatars').getPublicUrl(path).data.publicUrl;

  const { error } = await admin.from('profiles').update({ avatar_url: avatarUrl }).eq('id', driver.auth_id);
  if (error) return NextResponse.json({ error: 'Photo non enregistrée.' }, { status: 500 });
  return NextResponse.json({ avatarUrl });
}
