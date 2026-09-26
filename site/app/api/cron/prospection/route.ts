/**
 * app/api/cron/prospection/route.ts
 * Cron quotidien de prospection B2B :
 * 1. Cherche jusqu'à 5 nouvelles entreprises (codes NAF ciblés) et les enregistre.
 * 2. Tente de trouver un email public pour les prospects sans email connu.
 * 3. Envoie l'étape de séquence due (J0 / J+4 / J+10) pour chaque prospect en cours.
 * Volume visé : ~5 nouveaux prospects/jour, soit ~30-35/semaine avec les relances.
 */
import { createClient } from "@supabase/supabase-js";
import { findAndStoreNewProspects } from "@/lib/prospection/search-companies";
import { findWebsiteAndEmail } from "@/lib/prospection/find-email";
import { sendSequenceStep } from "@/lib/prospection/email-sequence";

const NEW_PROSPECTS_PER_RUN = 5;
const STEP_DELAYS_DAYS = { 2: 4, 3: 10 } as const; // délai depuis l'étape précédente

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const report = { newProspects: 0, emailsFound: 0, sequenceStep1: 0, sequenceStep2: 0, sequenceStep3: 0, errors: [] as string[] };

  // 1. Nouveaux prospects.
  try {
    const inserted = await findAndStoreNewProspects(NEW_PROSPECTS_PER_RUN);
    report.newProspects = inserted.length;
  } catch (err: any) {
    report.errors.push(`search: ${err.message}`);
  }

  // 2. Recherche d'email pour les prospects pas encore traités.
  const { data: pendingEmailLookup } = await supabase
    .from("prospects")
    .select("id, company_name")
    .eq("email_lookup_attempted", false)
    .limit(NEW_PROSPECTS_PER_RUN);

  for (const p of pendingEmailLookup ?? []) {
    try {
      const { website, email } = await findWebsiteAndEmail(p.company_name);
      await supabase
        .from("prospects")
        .update({
          website,
          contact_email: email,
          email_lookup_attempted: true,
          sequence_status: email ? "pending" : "no_email",
        })
        .eq("id", p.id);
      if (email) report.emailsFound += 1;
    } catch (err: any) {
      report.errors.push(`email-lookup ${p.id}: ${err.message}`);
    }
  }

  // 3. Étape 1 : premiers envois pour les prospects avec email trouvé.
  const { data: readyForStep1 } = await supabase
    .from("prospects")
    .select("id, company_name, contact_email, unsubscribe_token")
    .eq("sequence_status", "pending")
    .not("contact_email", "is", null)
    .limit(NEW_PROSPECTS_PER_RUN);

  for (const p of readyForStep1 ?? []) {
    const ok = await sendSequenceStep(p, 1);
    if (ok) {
      await supabase
        .from("prospects")
        .update({ sequence_status: "in_progress", step1_sent_at: new Date().toISOString() })
        .eq("id", p.id);
      report.sequenceStep1 += 1;
    }
  }

  // 4. Relances dues (étape 2 et 3) pour les prospects en cours.
  for (const [stepStr, delayDays] of Object.entries(STEP_DELAYS_DAYS)) {
    const step = Number(stepStr) as 2 | 3;
    const prevSentField = step === 2 ? "step1_sent_at" : "step2_sent_at";
    const cutoff = new Date(Date.now() - delayDays * 86400000).toISOString();

    const { data: due } = await supabase
      .from("prospects")
      .select("id, company_name, contact_email, unsubscribe_token")
      .eq("sequence_status", "in_progress")
      .lt(prevSentField, cutoff)
      .is(step === 2 ? "step2_sent_at" : "step3_sent_at", null)
      .limit(NEW_PROSPECTS_PER_RUN);

    for (const p of due ?? []) {
      const ok = await sendSequenceStep(p, step);
      if (ok) {
        const update: Record<string, unknown> = { [`step${step}_sent_at`]: new Date().toISOString() };
        if (step === 3) update.sequence_status = "completed";
        await supabase.from("prospects").update(update).eq("id", p.id);
        if (step === 2) report.sequenceStep2 += 1;
        else report.sequenceStep3 += 1;
      }
    }
  }

  return Response.json(report);
}
