import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sessionUser } from '@/lib/payment-method';

// Le client connecté vient de choisir son mot de passe : son compte n'est plus « sans mot de passe ».
// Le lien « Suivre ma commande » des e-mails lui demandera désormais ce mot de passe (app/api/orders/follow).
export async function POST() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  if (user.app_metadata?.password_set === false) {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { error } = await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, password_set: true } });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
