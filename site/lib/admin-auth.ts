/**
 * lib/admin-auth.ts (serveur)
 * Routes de l'espace admin : vérifie que la personne connectée est admin.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Admin connecté, sinon la réponse d'erreur à renvoyer. */
export async function requireAdmin(): Promise<NextResponse | null> {
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

export const adminSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Photo du chauffeur : celle qu'il a choisie dans l'appli chauffeur (rangée dans son compte,
 * user_metadata.avatar_url), sinon profiles.avatar_url.
 */
export function driverPhoto(userMetadata: Record<string, unknown> | undefined, profileAvatar: string | null | undefined): string | null {
  const fromApp = userMetadata?.avatar_url;
  return (typeof fromApp === 'string' && fromApp) || profileAvatar || null;
}
