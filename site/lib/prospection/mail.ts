/**
 * lib/prospection/mail.ts
 * Mise en forme des e-mails de prospection : présentation sobre, type lettre, avec un bouton « Commander une course ».
 * Texte écrit par l'admin, signature, mention de désinscription. Version HTML et version texte.
 */
import { SITE_URL } from "@/lib/site-content";

const ORDER_URL = `${SITE_URL}/#commander`;
const LOGO_URL = `${SITE_URL}/chat-avatar.png`;

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

  const html = `<!doctype html><html><body style="margin:0;padding:20px 16px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222222;">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;font-size:15px;line-height:1.6;color:#222222;">
<tr><td style="padding:0 0 18px 0;">
<img src="${LOGO_URL}" width="40" height="40" alt="ONE CONNEXION" style="display:block;border-radius:50%;">
</td></tr>
<tr><td>
${paragraphs.map((p) => `<p style="margin:0 0 14px 0;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
<p style="margin:18px 0 22px 0;"><a href="${ORDER_URL}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#ed5518;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Commander une course</a></p>
<p style="margin:0 0 4px 0;">Bien à vous,</p>
</td></tr>
<tr><td style="padding:0 0 22px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;line-height:1.5;color:#222222;">
<tr><td style="padding:0 0 4px 0;"><strong>Keisha Khoto Thinu</strong></td></tr>
<tr><td style="padding:0 0 4px 0;color:#555555;">Transport &amp; Course Express</td></tr>
<tr><td style="color:#555555;">06 73 53 50 83 · <a href="https://www.oneconnexion.com" style="color:#ed5518;text-decoration:none;">oneconnexion.com</a></td></tr>
</table>
</td></tr>
<tr><td style="padding:14px 0 0 0;border-top:1px solid #e5e5e5;font-size:11px;line-height:1.5;color:#888888;">
ONE CONNEXION · 5 Square Nungesser, 94160 Saint-Mandé<br>
Vous recevez ce message car votre entreprise exerce une activité en lien avec nos services. Pour ne plus le recevoir, répondez « STOP ».
</td></tr>
</table></body></html>`;

  return { text, html };
}
