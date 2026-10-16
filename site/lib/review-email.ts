/**
 * lib/review-email.ts
 * E-mail « Comment s'est passée votre course ? » envoyé après la livraison (API Resend),
 * avec un bouton qui ouvre directement la fenêtre d'avis de la fiche Google.
 */
import { EMAIL_LOGO_ATTACHMENT } from '@/lib/email-logo';
import { EMAIL, PHONE_DISPLAY, SITE_URL } from '@/lib/site-content';

/** Lien direct « Laisser un avis » de la fiche Google Business (Place ID de la fiche). */
export const GOOGLE_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL ?? 'https://search.google.com/local/writereview?placeid=ChIJ03P4ffzN6gURKEyb9g0skuk';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendReviewEmail(i: { to: string; name: string; trackingCode: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY manquante : e-mail d’avis non envoyé.');
    return false;
  }
  const from = process.env.INVOICE_FROM ?? `ONE CONNEXION <${EMAIL}>`;

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F4F2EE;font-family:Arial,Helvetica,sans-serif;color:#0E0F10">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F2EE;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#ffffff;padding:22px 28px;border-bottom:4px solid #ed5518">
<img src="cid:logo" width="150" height="43" alt="ONE CONNEXION" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 28px 8px">
<p style="margin:0 0 6px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ed5518;font-weight:700">Votre avis compte</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">Comment s’est passée votre course ?</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">Bonjour ${esc(i.name || '')},<br>votre course <strong>${esc(i.trackingCode)}</strong> a été livrée. Merci de nous avoir fait confiance.</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6">Si vous avez 30 secondes, un avis sur Google nous aide énormément : c’est ce qui permet à d’autres professionnels de nous trouver.</p>
<p style="margin:22px 0"><a href="${esc(GOOGLE_REVIEW_URL)}" style="background:#ed5518;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:6px;display:inline-block">★ Laisser un avis sur Google</a></p>
<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#4A4845">Il suffit de choisir une note, d’écrire une phrase (facultatif) et de valider. Il faut être connecté à un compte Google.</p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:13px;line-height:1.6;color:#4A4845;border-top:1px solid #eee">
Un souci avec votre course ? Répondez à cet e-mail ou appelez-nous au ${esc(PHONE_DISPLAY)}, nous le réglons tout de suite.<br>
<a href="${SITE_URL}" style="color:#c94410">www.oneconnexion.com</a></td></tr>
</table></td></tr></table></body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [i.to],
        reply_to: EMAIL,
        subject: 'Comment s’est passée votre course ONE CONNEXION ?',
        html,
        attachments: [EMAIL_LOGO_ATTACHMENT],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('Resend a refusé l’e-mail d’avis :', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Envoi de l’e-mail d’avis échoué :', err);
    return false;
  }
}
