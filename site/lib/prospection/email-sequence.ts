/**
 * lib/prospection/email-sequence.ts
 * Séquence de 3 emails de démarchage à froid (J0 / J+4 / J+10), envoyés via Resend.
 * Chaque email porte un lien de désinscription (obligatoire, même en B2B).
 */
import { EMAIL, PHONE_DISPLAY, SITE_URL } from "@/lib/site-content";

type Prospect = {
  id: string;
  company_name: string;
  contact_email: string;
  unsubscribe_token: string;
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function unsubscribeLink(token: string): string {
  return `${SITE_URL}/api/prospection/unsubscribe?token=${token}`;
}

function footer(token: string): string {
  return `<hr><p style="color:#888;font-size:12px">
Vous recevez cet email car votre entreprise pourrait être intéressée par nos services de transport.
<a href="${unsubscribeLink(token)}">Se désinscrire</a> — ONE CONNEXION, ${escapeHtml(PHONE_DISPLAY)}, ${escapeHtml(EMAIL)}.
</p>`;
}

type StepContent = { subject: string; html: (p: Prospect) => string };

const STEPS: Record<1 | 2 | 3, StepContent> = {
  1: {
    subject: "Une solution de navette pour vos équipes et vos patients/clients",
    html: (p) => `<p>Bonjour,</p>
<p>ONE CONNEXION propose des solutions de transport et navette sur mesure pour les professionnels
(établissements de santé, opticiens, cabinets dentaires et audioprothésistes, e-commerçants) :
transport de collaborateurs, de patients, ou de colis, avec une gestion simple et fiable.</p>
<p>Seriez-vous intéressé(e) par un échange rapide pour voir si nous pouvons répondre à vos besoins
chez <strong>${escapeHtml(p.company_name)}</strong> ?</p>
<p>Cordialement,<br>L'équipe ONE CONNEXION</p>
${footer(p.unsubscribe_token)}`,
  },
  2: {
    subject: "Relance — transport sur mesure pour votre activité",
    html: (p) => `<p>Bonjour,</p>
<p>Je me permets de revenir vers vous suite à mon précédent message concernant nos solutions de
navette et transport pour les professionnels.</p>
<p>Si un besoin existe chez <strong>${escapeHtml(p.company_name)}</strong>, je serais ravi(e) d'en discuter
par téléphone au ${escapeHtml(PHONE_DISPLAY)} ou par retour d'email.</p>
<p>Cordialement,<br>L'équipe ONE CONNEXION</p>
${footer(p.unsubscribe_token)}`,
  },
  3: {
    subject: "Dernier message — restons en contact",
    html: (p) => `<p>Bonjour,</p>
<p>Je n'ai pas eu de retour suite à mes précédents messages — je comprends que le sujet n'est
peut-être pas une priorité actuellement.</p>
<p>N'hésitez pas à nous contacter quand vous le souhaitez : ${escapeHtml(EMAIL)} / ${escapeHtml(PHONE_DISPLAY)}.
Je vous souhaite une excellente continuation pour <strong>${escapeHtml(p.company_name)}</strong>.</p>
<p>Cordialement,<br>L'équipe ONE CONNEXION</p>
${footer(p.unsubscribe_token)}`,
  },
};

export async function sendSequenceStep(prospect: Prospect, step: 1 | 2 | 3): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante : email de prospection non envoyé.");
    return false;
  }

  const from = process.env.CONTACT_FROM ?? `ONE CONNEXION <${EMAIL}>`;
  const content = STEPS[step];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [prospect.contact_email],
        reply_to: EMAIL,
        subject: content.subject,
        html: content.html(prospect),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`Resend a refusé l'envoi (prospect ${prospect.id}, étape ${step}):`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Envoi prospection échoué (prospect ${prospect.id}, étape ${step}):`, err);
    return false;
  }
}
