import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Commande passée sans compte : on crée le compte client avec l'e-mail de la commande et on
// lui rattache la course, pour qu'il suive son déroulé depuis l'espace client.
// Renvoie un jeton de connexion à usage unique (verifyOtp côté navigateur) : le client est
// connecté d'un clic et choisit son mot de passe.
// Sécurité : seulement pour une commande récente, sans compte, et jamais pour un e-mail
// qui a déjà un compte (sinon taper l'e-mail de quelqu'un suffirait à entrer chez lui).
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { trackingCode } = await req.json();
    if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, created_at, contact_email, contact_name, contact_phone, client_type, raison_sociale, siret, tva_number, adresse_facturation')
      .eq('tracking_code', trackingCode)
      .maybeSingle();

    const email = order?.contact_email?.trim().toLowerCase();
    if (!order || !email || Date.now() - new Date(order.created_at).getTime() > MAX_AGE_MS) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    let userId = order.user_id as string | null;

    if (userId) {
      // Déjà rattachée : on ne redonne un accès que si c'est le compte créé par ce parcours
      // (même e-mail, créé avec la commande) et qu'il n'a encore jamais été utilisé.
      const { data } = await admin.auth.admin.getUserById(userId);
      const u = data.user;
      const fresh = u && u.email?.toLowerCase() === email && !u.last_sign_in_at
        && new Date(u.created_at).getTime() >= new Date(order.created_at).getTime() - 60_000;
      if (!fresh) return NextResponse.json({ existing: true, email });
    } else {
      const pro = order.client_type === 'entreprise';
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password: randomBytes(24).toString('base64url'), // remplacé par celui que le client choisit
        email_confirm: true,
        // Pas encore de mot de passe choisi : le lien « Suivre ma commande » des e-mails le proposera.
        app_metadata: { password_set: false },
        user_metadata: {
          role: 'client',
          full_name: order.contact_name ?? '',
          phone: order.contact_phone ?? '',
          company_name: pro ? (order.raison_sociale || order.contact_name || '') : '',
          siret: pro ? order.siret ?? '' : '',
          tva_number: pro ? order.tva_number ?? '' : '',
          adresse_facturation: pro ? order.adresse_facturation ?? '' : '',
        },
      });
      if (error || !created.user) {
        // E-mail déjà inscrit : le client se connecte lui-même.
        if (error?.code === 'email_exists' || /already/i.test(error?.message ?? '')) {
          return NextResponse.json({ existing: true, email });
        }
        throw error ?? new Error('Compte non créé');
      }
      userId = created.user.id;

      const { data: linked } = await admin
        .from('orders')
        .update({ user_id: userId })
        .eq('id', order.id)
        .is('user_id', null)
        .select('id');
      if (!linked?.length) {
        await admin.auth.admin.deleteUser(userId);
        return NextResponse.json({ existing: true, email });
      }
    }

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (linkError || !link.properties?.hashed_token) throw linkError ?? new Error('Lien de connexion non créé');

    return NextResponse.json({ created: true, email, orderId: order.id, tokenHash: link.properties.hashed_token });
  } catch (err: any) {
    console.error('Compte invité :', err?.message ?? err);
    return NextResponse.json({ error: 'Compte non créé.' }, { status: 500 });
  }
}
