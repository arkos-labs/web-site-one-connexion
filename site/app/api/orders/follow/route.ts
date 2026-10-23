import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient, type User } from '@supabase/supabase-js';
import { sessionUser } from '@/lib/payment-method';
import { checkOrderLinkToken, ORDER_LINK_MAX_AGE_MS } from '@/lib/order-link';

// Bouton « Suivre ma commande » de l'e-mail de confirmation (page /suivre/[code]).
// Le jeton du lien prouve que la personne a reçu l'e-mail de la commande. Réponses :
//  - { orderId }                    : connecté avec le bon compte → suivi de la course ;
//  - { mode: 'set-password', … }    : compte sans mot de passe (ou créé ici) → il en choisit un ;
//  - { mode: 'login', email }       : compte avec mot de passe → il le tape, la page rappelle cette route ;
//  - { mode: 'other-account', … }   : connecté avec un autre compte que celui de la commande.
// Le lien ne fait jamais entrer dans un compte qui a déjà un mot de passe.

const ORDER_FIELDS = 'id, user_id, created_at, contact_email, contact_name, contact_phone, client_type, raison_sociale, siret, tva_number, adresse_facturation';

export async function POST(req: Request) {
  try {
    const { trackingCode, token } = await req.json().catch(() => ({}));
    if (typeof trackingCode !== 'string' || !/^OC-[A-Z0-9]{8}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Lien invalide.' }, { status: 400 });
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: order } = await admin.from('orders').select(ORDER_FIELDS).eq('tracking_code', trackingCode).maybeSingle();
    if (!order || !checkOrderLinkToken(order.id, token)) {
      return NextResponse.json({ error: 'Lien invalide.' }, { status: 403 });
    }
    if (Date.now() - new Date(order.created_at).getTime() > ORDER_LINK_MAX_AGE_MS) {
      return NextResponse.json({ error: 'Lien expiré.', expired: true }, { status: 410 });
    }

    // Rattache la course au compte si elle n'en a pas encore.
    const link = async (userId: string) => {
      if (order.user_id === userId) return true;
      if (order.user_id) return false;
      const { data } = await admin.from('orders').update({ user_id: userId }).eq('id', order.id).is('user_id', null).select('id');
      return !!data?.length;
    };

    // Adresse de la commande : celle saisie, ou celle du compte (commande passée depuis l'espace client).
    let owner: User | null = null;
    if (order.user_id) owner = (await admin.auth.admin.getUserById(order.user_id)).data.user ?? null;
    const email = (owner?.email ?? order.contact_email ?? '').trim().toLowerCase();
    if (!email) return NextResponse.json({ error: 'Commande sans adresse e-mail.' }, { status: 404 });

    // Déjà connecté sur cet appareil.
    const me = await sessionUser();
    if (me) {
      if (me.id === order.user_id || (!order.user_id && me.email?.toLowerCase() === email && (await link(me.id)))) {
        return NextResponse.json({ orderId: order.id });
      }
      return NextResponse.json({ mode: 'other-account', email: me.email });
    }

    // Pas de compte pour cette adresse : on le crée, sans mot de passe pour l'instant.
    if (!owner) {
      const pro = order.client_type === 'entreprise';
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password: randomBytes(24).toString('base64url'), // remplacé par celui que le client choisit
        email_confirm: true,
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
      if (created?.user) {
        owner = created.user;
      } else if (!(error?.code === 'email_exists' || /already/i.test(error?.message ?? ''))) {
        throw error ?? new Error('Compte non créé');
      }
    }

    // Lien de connexion à usage unique : sert seulement si le compte n'a pas de mot de passe.
    // Il renvoie aussi le compte quand il existait déjà (pas de recherche par e-mail dans Supabase).
    const { data: magic, error: magicError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (magicError || !magic.user || !magic.properties?.hashed_token) throw magicError ?? new Error('Lien de connexion non créé');
    const account = magic.user;

    if (account.app_metadata?.password_set === false) {
      if (!(await link(account.id))) return NextResponse.json({ mode: 'login', email });
      return NextResponse.json({ mode: 'set-password', email, orderId: order.id, tokenHash: magic.properties.hashed_token });
    }
    return NextResponse.json({ mode: 'login', email });
  } catch (err) {
    console.error('Suivre ma commande :', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Suivi indisponible pour le moment.' }, { status: 500 });
  }
}
