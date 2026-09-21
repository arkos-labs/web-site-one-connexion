/**
 * lib/contact-notify.ts
 * Notification email (API Resend) à chaque nouveau message du formulaire /contact.
 * Ne lève jamais d'erreur : le message est déjà enregistré en base.
 */
import { EMAIL } from "@/lib/site-content";

type ContactMessage = { name: string; email: string; company: string; message: string };

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function notifyNewContact(msg: ContactMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante : notification contact non envoyée.");
    return;
  }

  const from = process.env.CONTACT_FROM ?? "ONE CONNEXION <onboarding@resend.dev>";
  const to = process.env.CONTACT_NOTIFY_TO ?? EMAIL;
  const who = oneLine(msg.company ? `${msg.name} (${msg.company})` : msg.name);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: msg.email,
        subject: `Nouveau message de contact — ${who}`,
        html: `<p><strong>${escapeHtml(who)}</strong> &lt;${escapeHtml(msg.email)}&gt;</p>
<p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p>
<hr><p style="color:#888;font-size:12px">Message enregistré dans Supabase (table contact_messages). Répondez directement à cet email.</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Resend a refusé l'envoi :", res.status, await res.text());
  } catch (err) {
    console.error("Notification contact échouée :", err);
  }
}
