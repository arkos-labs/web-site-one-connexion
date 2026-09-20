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
    const { email, firstName, lastName, company, phone, accountType, siret } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Admin create user using service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Clé SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local' }, { status: 500 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Générer un mot de passe aléatoire sécurisé
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + "!";

    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`,
        company: accountType === 'pro' ? company : null,
        phone,
      }
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (newUser?.user && siret) {
      await adminSupabase.from('profiles').update({ siret }).eq('id', newUser.user.id);
    }

    return NextResponse.json({ success: true, user: newUser.user });
  } catch (err: any) {
    console.error('Create client error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
