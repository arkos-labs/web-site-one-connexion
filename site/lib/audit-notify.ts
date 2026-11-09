/**
 * lib/audit-notify.ts
 * Email (API Resend) à chaque audit terminé. Ne lève jamais d'erreur :
 * l'audit est déjà enregistré en base.
 */
import { EMAIL } from "@/lib/site-content";

type AuditSubmission = {
  volume: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  global: number;
};

const STAGE_NAMES: Record<string, string> = {
  decl: "Déclenchement de la course",
  remise: "Remise du pli au coursier",
  suivi: "Suivi pendant le trajet",
  preuve: "Preuve de livraison",
  cloture: "Clôture et pilotage",
};

export async function notifyNewAudit(audit: AuditSubmission): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante : notification audit non envoyée.");
    return;
  }

  const from = process.env.CONTACT_FROM ?? `ONE CONNEXION <${EMAIL}>`;
  const to = process.env.CONTACT_NOTIFY_TO ?? EMAIL;

  const rows = Object.entries(STAGE_NAMES)
    .map(([key, name]) => `<tr><td style="padding:6px 12px 6px 0">${name}</td><td style="padding:6px 0"><strong>${audit.scores[key] ?? 0} / 100</strong></td></tr>`)
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Audit de traçabilité terminé : score ${audit.global} / 100`,
        html: `<p><strong>Un audit de traçabilité vient d'être terminé.</strong></p>
<p>Volume déclaré : ${audit.volume.toLowerCase()}</p>
<p>Score global : <strong>${audit.global} / 100</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>
<hr><p style="color:#888;font-size:12px">Détail des réponses enregistré dans Supabase (table audit_submissions).</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Resend a refusé l'envoi audit :", res.status, await res.text());
  } catch (err) {
    console.error("Notification audit échouée :", err);
  }
}
