import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Verify that the requester is an admin
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse body
    const body = await req.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const phone = body.phone ? String(body.phone).trim() : null;
    const vehicle = body.vehicle ? String(body.vehicle).trim() : null;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nom, email et mot de passe sont requis' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, { status: 400 });
    }

    // 3. Admin create user using service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Clé SUPABASE_SERVICE_ROLE_KEY manquante dans les variables d\'environnement' }, { status: 500 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Le trigger handle_new_user crée le profil avec le rôle "driver" à partir de user_metadata.role
    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'driver', full_name: name, phone },
    });

    if (createError || !newUser.user) {
      return NextResponse.json({ error: createError?.message ?? 'Création du compte impossible' }, { status: 400 });
    }

    // 4. Fiche chauffeur liée au compte (auth_id) : sans elle le dispatch refuse l'attribution
    const { data: driver, error: driverError } = await adminSupabase
      .from('drivers')
      .insert({ auth_id: newUser.user.id, name, phone, vehicle, status: 'disponible' })
      .select()
      .single();

    if (driverError) {
      // Évite un compte orphelin sans fiche chauffeur
      await adminSupabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: driverError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, driver });
  } catch (err: any) {
    console.error('Create driver error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
