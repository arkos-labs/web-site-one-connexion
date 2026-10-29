import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildProspectMail } from "@/lib/prospection/mail";
import { sendProspectMail } from "@/lib/prospection/send";

// Chaque lundi à 9 h : envoie les mails préparés le dimanche. Ne fait rien tant que
// PROSPECTION_AUTO_SEND n'est pas à « on » dans Vercel : c'est l'interrupteur.
export const maxDuration = 300;
const MAX_PER_RUN = 30;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.PROSPECTION_AUTO_SEND !== "on") {
    return NextResponse.json({ ok: true, skipped: "Envoi automatique désactivé (PROSPECTION_AUTO_SEND)." });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: rows, error } = await supabase
    .from("prospect_targets")
    .select("id, email, mail_subject, mail_body")
    .eq("mail_status", "brouillon")
    .not("email", "is", null)
    .order("created_at")
    .limit(MAX_PER_RUN);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const row of rows ?? []) {
    const m = buildProspectMail(row.mail_body ?? "");
    const ok = await sendProspectMail(row.email!, row.mail_subject ?? "Livraisons urgentes", m.text, m.html);
    if (ok) {
      const now = new Date().toISOString();
      await supabase
        .from("prospect_targets")
        .update({ mail_status: "envoye", sent_at: now, status: "contacte", contacted_at: now, updated_at: now })
        .eq("id", row.id);
      sent++;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return NextResponse.json({ ok: true, sent, candidates: rows?.length ?? 0 });
}
