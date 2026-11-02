/**
 * lib/prospection/mail.ts
 * Mise en forme des e-mails de prospection : texte écrit par l'admin, puis bouton « Commander une course »,
 * signature et mention de désinscription. Version HTML et version texte.
 */
import { SITE_URL } from "@/lib/site-content";

const ORDER_URL = `${SITE_URL}/#commander`;
const LOGO_URL = `${SITE_URL}/chat-avatar.png`;
const SIGNATURE_LOGO_URL = `${SITE_URL}/sig-logo.png`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildProspectMail(body: string, contact?: string): { text: string; html: string } {
  const greeting = contact?.trim() ? `Bonjour ${contact.trim()},` : "Bonjour,";
  const paragraphs = [greeting, ...body.trim().split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)];

  const text = `${paragraphs.join("\n\n")}

Commander une course : ${ORDER_URL}

Bien à vous,
Keisha Khoto Thinu · Transport & Course Express
06 73 53 50 83 · oneconnexion.com

ONE CONNEXION · 5 Square Nungesser, 94160 Saint-Mandé
Vous recevez ce message car votre entreprise exerce une activité en lien avec nos services.
Pour ne plus recevoir nos messages, répondez « STOP » à cet e-mail.`;

  const html = `<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#0E0F10;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
<tr><td style="text-align:center;padding:6px 0 18px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
<td style="vertical-align:middle;padding-right:8px;"><img src="${LOGO_URL}" width="28" height="28" alt="" style="display:block;border-radius:50%;"></td>
<td style="vertical-align:middle;font-size:15px;font-weight:700;letter-spacing:0.12em;color:#0E0F10;">ONE CONNEXION</td>
</tr></table>
</td></tr>
<tr><td style="background:#ffffff;border-radius:14px;overflow:hidden;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0F10;">
<tr><td style="padding:34px 28px 30px 28px;">
<p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:0.16em;color:#ed5518;text-transform:uppercase;">Course dédiée · Île-de-France</p>
<p style="margin:0;font-size:32px;line-height:1.15;font-weight:800;color:#ffffff;">Votre envoi,<br>un seul coursier.</p>
</td>
<td style="width:110px;padding-right:20px;text-align:right;vertical-align:bottom;">
<img src="${LOGO_URL}" width="92" height="92" alt="" style="display:inline-block;border-radius:50%;">
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:30px 28px 6px 28px;font-size:16px;line-height:1.65;color:#33312E;">
${paragraphs.map((p) => `<p style="margin:0 0 14px 0;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
</td></tr>
<tr><td style="padding:14px 28px 30px 28px;">
<a href="${ORDER_URL}" style="display:inline-block;padding:15px 30px;border-radius:10px;background:#ed5518;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">Commander une course</a>
</td></tr>
<tr><td style="padding:0 28px 28px 28px;font-size:15px;line-height:1.6;color:#33312E;">
Bien à vous,
</td></tr>
<tr><td style="padding:0 28px 28px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#0E0F10;"><tr><td style="border-top:3px solid #ed5518;padding-top:10px;">
<img src="${SIGNATURE_LOGO_URL}" width="96" height="96" alt="ONE CONNEXION" style="display:block;width:96px;height:96px;margin-bottom:8px;">
<div style="font-size:15px;font-weight:bold;color:#0E0F10;line-height:1.3;">Keisha Khoto Thinu</div>
<div style="font-size:12px;color:#4A4845;margin-top:1px;">Transport &amp; Course Express</div>
<div style="font-size:11px;color:#8C8882;font-style:italic;margin-top:4px;">La livraison sur mesure pour les professionnels en Île-de-France</div>
<div style="font-size:12px;margin-top:8px;"><a href="tel:0673535083" style="color:#0E0F10;text-decoration:none;">06 73 53 50 83</a><span style="color:#DFDCD6;margin:0 6px;">|</span><a href="https://www.oneconnexion.com" style="color:#ed5518;text-decoration:none;">oneconnexion.com</a></div>
</td></tr></table>
</td></tr>

</table>

</td></tr>
<tr><td style="text-align:center;padding:20px 12px 0 12px;font-size:12px;line-height:1.6;color:#8C8882;">
Sent by ONE CONNEXION · <a href="https://www.oneconnexion.com" style="color:#ed5518;text-decoration:none;">oneconnexion.com</a><br>
5 Square Nungesser, 94160 Saint-Mandé<br>
Vous recevez ce message car votre entreprise exerce une activité en lien avec nos services. Pour ne plus recevoir nos messages, répondez « STOP » à cet e-mail.
</td></tr>
</table></body></html>`;

  return { text, html };
}
