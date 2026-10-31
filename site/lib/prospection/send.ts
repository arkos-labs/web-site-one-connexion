/** Envoi d'un mail de prospection via Resend. Retourne true si Resend a accepté le message. */
import { EMAIL } from "@/lib/site-content";

export async function sendProspectMail(to: string, subject: string, text: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.CONTACT_FROM ?? `ONE CONNEXION <${EMAIL}>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: EMAIL, subject, text, html }),
  });
  if (!res.ok) console.error("prospect mail failed", res.status);
  return res.ok;
}
