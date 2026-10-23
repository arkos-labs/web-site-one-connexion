/**
 * lib/order-link.ts (serveur)
 * Lien « Suivre ma commande » de l'e-mail de confirmation : /suivre/OC-XXXXXXXX?t=<jeton>.
 * Le jeton (HMAC de l'identifiant de la commande) prouve que la personne a reçu l'e-mail : il permet
 * de choisir un mot de passe pour un compte qui n'en a pas encore, jamais d'entrer dans un compte
 * qui en a un (le client tape alors son mot de passe).
 */
import { createHmac, timingSafeEqual } from 'crypto';
import { SITE_URL } from '@/lib/site-content';

/** Lien valable 30 jours après la commande. */
export const ORDER_LINK_MAX_AGE_MS = 30 * 86400000;

function key(): string {
  const k = process.env.ORDER_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error('Clé des liens de suivi manquante');
  return k;
}

export function orderLinkToken(orderId: string): string {
  return createHmac('sha256', key()).update(`order-follow:${orderId}`).digest('base64url').slice(0, 32);
}

export function checkOrderLinkToken(orderId: string, token: unknown): boolean {
  if (typeof token !== 'string' || token.length !== 32) return false;
  const a = Buffer.from(orderLinkToken(orderId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function orderFollowUrl(trackingCode: string, orderId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;
  return `${base}/suivre/${trackingCode}?t=${orderLinkToken(orderId)}`;
}
