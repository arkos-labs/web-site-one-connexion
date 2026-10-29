import { NextResponse } from "next/server";
import { requireAdmin, adminSupabase } from "@/lib/admin-auth";
import { EMAIL } from "@/lib/site-content";
import { buildProspectMail } from "@/lib/prospection/mail";

// Envoi manuel, depuis le tableau de bord : l'admin relit et clique. Rien n'est envoyé automatiquement.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, to, subject, body } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !UUID.test(id)) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  if (typeof to !== "string" || !EMAIL_RE.test(to.trim())) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  if (typeof subject !== "string" || !subject.trim() || subject.length > 150) return NextResponse.json({ error: "Objet invalide." }, { status: 400 });
  if (typeof body !== "string" || !body.trim() || body.length > 4000) return NextResponse.json({ error: "Message invalide." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Envoi non configuré (RESEND_API_KEY manquante)." }, { status: 500 });

  const from = process.env.CONTACT_FROM ?? `ONE CONNEXION <${EMAIL}>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to.trim()],
      reply_to: EMAIL,
      subject: subject.trim(),
      ...buildProspectMail(body),
    }),
  });
  if (!res.ok) {
    console.error("prospect send failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez ou écrivez directement depuis votre messagerie." }, { status: 502 });
  }

  // Trace dans la fiche : statut « démarché », date, et une note avec l'adresse utilisée.
  const supabase = adminSupabase();
  const { data: row } = await supabase.from("prospect_targets").select("status, notes").eq("id", id).maybeSingle();
  const stamp = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
  const note = `[${stamp}] E-mail envoyé à ${to.trim()} : « ${subject.trim()} »`;
  await supabase
    .from("prospect_targets")
    .update({
      status: row?.status === "a_contacter" ? "contacte" : row?.status ?? "contacte",
      contacted_at: new Date().toISOString(),
      notes: [row?.notes, note].filter(Boolean).join("\n"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
