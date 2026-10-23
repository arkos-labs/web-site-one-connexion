/**
 * lib/order-confirmation.ts (serveur)
 * E-mail « Votre commande est confirmée » (API Resend) : numéro de course, trajet, prix, bouton
 * « Suivre ma commande ». Particulier : envoyé après le paiement. Pro : envoyé dès la commande.
 * La facture n'y figure jamais : elle part une seule fois, à la livraison (lib/deliver-order-invoice).
 * Une seule fois par commande : Resend ignore un second envoi avec la même clé d'idempotence (24 h).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { EMAIL_LOGO_ATTACHMENT } from '@/lib/email-logo';
import { EMAIL, PHONE_DISPLAY, SITE_URL } from '@/lib/site-content';
import { orderRouteLabel } from '@/lib/order-route';
import { normalizeOrderPriceTTC } from '@/lib/price-display';
import { orderFollowUrl } from '@/lib/order-link';

const DELAIS: Record<string, string> = {
  standard: 'Normal (3 h)',
  urgent: 'Urgent (1 h 30)',
  flash: 'Super (1 h)',
  navette: 'Course programmée',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export type OrderConfirmationInput = {
  to: string;
  name: string;
  trackingCode: string;
  route: string;
  delai: string;
  priceTTC: number | null;
  pro: boolean;
  followUrl: string;
};

export function orderConfirmationHtml(i: OrderConfirmationInput): string {
  const payment = i.pro
    ? 'Votre facture vous sera envoyée par e-mail à la livraison de la course.'
    : '<strong style="color:#1a7f37">Paiement reçu.</strong> Votre facture vous sera envoyée par e-mail à la livraison de la course.';

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;font-size:13px;color:#6B6862;width:110px;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:14px;line-height:1.5">${value}</td></tr>`;

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#0E0F10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#ffffff;padding:22px 28px;border-bottom:4px solid #ed5518">
<img src="cid:logo" width="150" height="43" alt="ONE CONNEXION" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 28px 8px">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ed5518;font-weight:700">Commande confirmée</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">Votre commande a bien été passée</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6">Bonjour ${esc(i.name || '')},<br>merci pour votre commande. Un dispatcheur prend en charge votre course et vous contacte si besoin.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;border-radius:8px"><tr><td style="padding:16px 18px;text-align:center">
<p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6B6862">Numéro de course</p>
<p style="margin:6px 0 0;font-size:26px;font-weight:700;letter-spacing:.06em;font-family:'Courier New',monospace">${esc(i.trackingCode)}</p>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 4px">
${row('Trajet', esc(i.route))}
${row('Délai', esc(i.delai))}
${i.priceTTC != null ? row('Prix', `<strong>${eur(i.priceTTC)} TTC</strong>`) : ''}
</table>
<p style="margin:22px 0 8px"><a href="${esc(i.followUrl)}" style="background:#ed5518;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:6px;display:inline-block">Suivre ma commande</a></p>
<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#4A4845">Suivez chaque étape en direct depuis votre espace client. Première fois ? Vous choisirez votre mot de passe en un clic.</p>
<p style="margin:18px 0;padding:12px 14px;background:#FFF4EE;border-left:3px solid #ed5518;font-size:14px;line-height:1.6">${payment}</p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:1.6;color:#4A4845;border-top:1px solid #eee">
Une question sur votre course ? Répondez à cet e-mail ou appelez-nous au ${esc(PHONE_DISPLAY)}.<br>
<a href="${SITE_URL}" style="color:#c94410">www.oneconnexion.com</a></td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Envoie la confirmation d'une commande. Sans erreur bloquante : une commande ne doit jamais échouer
 * parce que l'e-mail n'est pas parti. Renvoie true si Resend l'a accepté.
 */
export async function sendOrderConfirmation(admin: SupabaseClient, trackingCode: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY manquante : confirmation de commande non envoyée.');
    return false;
  }
  try {
    const { data: o } = await admin
      .from('orders')
      .select('id, user_id, tracking_code, contact_email, contact_name, raison_sociale, client_type, pickup_address, dropoff_address, stops, delai, price_estimate, amount_due')
      .eq('tracking_code', trackingCode)
      .maybeSingle();
    if (!o) return false;

    // Commande passée depuis l'espace client : pas d'e-mail de contact, celui du compte.
    let to = (o.contact_email as string | null)?.trim() || null;
    if (!to && o.user_id) {
      const { data } = await admin.auth.admin.getUserById(o.user_id);
      to = data.user?.email ?? null;
    }
    if (!to) return false;

    const pro = o.client_type === 'entreprise';
    const price = o.amount_due != null ? Number(o.amount_due) : normalizeOrderPriceTTC(o.price_estimate, o.pickup_address, o.dropoff_address, o.delai);

    const html = orderConfirmationHtml({
      to,
      name: (o.contact_name as string) || (o.raison_sociale as string) || '',
      trackingCode: o.tracking_code,
      route: orderRouteLabel(o),
      delai: DELAIS[o.delai as string] ?? (o.delai as string) ?? '',
      priceTTC: price,
      pro,
      followUrl: orderFollowUrl(o.tracking_code, o.id),
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `order-confirmation-${o.id}`,
      },
      body: JSON.stringify({
        from: process.env.INVOICE_FROM ?? `ONE CONNEXION <${EMAIL}>`,
        to: [to],
        reply_to: EMAIL,
        subject: `Commande ${o.tracking_code} confirmée - ONE CONNEXION`,
        html,
        attachments: [EMAIL_LOGO_ATTACHMENT],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('Resend a refusé la confirmation de commande :', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Confirmation de commande non envoyée :', trackingCode, err instanceof Error ? err.message : err);
    return false;
  }
}
