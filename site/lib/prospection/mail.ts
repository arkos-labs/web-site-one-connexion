/**
 * lib/prospection/mail.ts
 * Mise en forme des e-mails de prospection : texte écrit par l'admin, puis bouton « Commander »,
 * bouton « Créer un compte », signature, et mention de désinscription. Version HTML et version texte.
 */
import { EMAIL, PHONE_DISPLAY, SITE_URL } from "@/lib/site-content";

/** Signature en bas du message. À remplacer par le nom de l'expéditeur si besoin. */
export const SIGNATURE_NAME = "L'équipe ONE CONNEXION";

const ORDER_URL = `${SITE_URL}/#commander`;
const ACCOUNT_URL = `${SITE_URL}/inscription`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const button = (href: string, label: string, primary: boolean) =>
  `<a href="${href}" style="display:inline-block;margin:6px 8px 6px 0;padding:14px 22px;border-radius:6px;font-weight:700;font-size:15px;text-decoration:none;${
    primary ? "background:#ed5518;color:#ffffff;" : "background:#ffffff;color:#0E0F10;border:2px solid #0E0F10;"
  }">${label}</a>`;

export function buildProspectMail(body: string): { text: string; html: string } {
  const paragraphs = body.trim().split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const textBody = paragraphs.join("\n\n");
  const text = `${textBody}

Commander en 2 minutes : ${ORDER_URL}
Créer un compte entreprise : ${ACCOUNT_URL}

${SIGNATURE_NAME}
ONE CONNEXION · ${PHONE_DISPLAY} · ${EMAIL}

—
Vous recevez ce message car votre entreprise exerce une activité en lien avec nos services.
Pour ne plus recevoir nos messages, répondez « STOP » à cet e-mail.
ONE CONNEXION · 5 Square Nungesser, 94160 Saint-Mandé`;

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f2ee;font-family:Arial,Helvetica,sans-serif;color:#0E0F10;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;">
<tr><td style="padding:28px 28px 8px 28px;font-size:16px;line-height:1.6;">
${paragraphs.map((p) => `<p style="margin:0 0 16px 0;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
</td></tr>
<tr><td style="padding:8px 28px 24px 28px;">
${button(ORDER_URL, "Commander une course", true)}
${button(ACCOUNT_URL, "Créer un compte entreprise", false)}
</td></tr>
<tr><td style="padding:0 28px 28px 28px;font-size:14px;line-height:1.6;color:#4A4845;">
<strong style="color:#0E0F10;">${esc(SIGNATURE_NAME)}</strong><br>
ONE CONNEXION · ${PHONE_DISPLAY} · <a href="mailto:${EMAIL}" style="color:#ed5518;">${EMAIL}</a><br>
5 Square Nungesser, 94160 Saint-Mandé
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #dfdcd6;font-size:12px;line-height:1.5;color:#8C8882;">
Vous recevez ce message car votre entreprise exerce une activité en lien avec nos services.
Pour ne plus recevoir nos messages, répondez « STOP » à cet e-mail.
</td></tr>
</table></body></html>`;

  return { text, html };
}
