import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SECTORS, PROSPECT_DEPARTMENTS, searchCompanies, type Company, type Sector } from "@/lib/prospection/sirene";
import { needPhrase } from "@/lib/prospection/need";

// Chaque lundi : un seul secteur, en alternance (avocats, puis laboratoires, puis e-commerce…).
// 15 nouvelles entreprises par semaine, jamais déjà listées ni déjà clientes.
const PER_WEEK = 15;
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const week = mondayOf(new Date());

  // Entreprises à exclure : déjà listées, ou déjà clientes (SIRET du compte ou de la fiche client).
  const [{ data: listed }, { data: clients }] = await Promise.all([
    supabase.from("prospect_targets").select("siret"),
    supabase.from("clients").select("siret").not("siret", "is", null),
  ]);
  const known = new Set([...(listed ?? []), ...(clients ?? [])].map((r) => String(r.siret)));

  const offset = weekNumber(week) % PROSPECT_DEPARTMENTS.length; // on tourne d'un département à l'autre
  const rows: Record<string, unknown>[] = [];

  const sector = SECTORS[weekNumber(week) % SECTORS.length];
  {
    const picked: Company[] = [];
    for (let i = 0; i < PROSPECT_DEPARTMENTS.length && picked.length < PER_WEEK; i++) {
      const dept = PROSPECT_DEPARTMENTS[(offset + i) % PROSPECT_DEPARTMENTS.length];
      for (const company of await searchCompanies(sector.naf, dept)) {
        if (picked.length >= PER_WEEK) break;
        if (known.has(company.siret)) continue;
        known.add(company.siret);
        picked.push(company);
      }
    }
    for (const c of picked) {
      rows.push({
        siret: c.siret,
        siren: c.siren,
        name: c.name,
        city: c.city,
        postcode: c.postcode,
        department: c.department,
        sector: sector.key as Sector,
        naf: c.naf,
        need: await needPhrase(sector.key, c.name, c.city),
        batch_week: week,
      });
    }
  }

  if (rows.length) {
    const { error } = await supabase.from("prospect_targets").upsert(rows, { onConflict: "siret", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, week, added: rows.length });
}

function mondayOf(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7; // lundi = 0
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return m.toISOString().slice(0, 10);
}

function weekNumber(isoMonday: string): number {
  return Math.floor(Date.parse(isoMonday) / (7 * 86400000));
}
