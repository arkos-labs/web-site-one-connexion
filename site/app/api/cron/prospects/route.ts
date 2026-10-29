import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SECTORS, PROSPECT_DEPARTMENTS, searchCompanies, type Company, type Sector } from "@/lib/prospection/sirene";
import { findContact, type Contact } from "@/lib/prospection/find";

// Chaque dimanche soir : prépare la liste de la semaine (un secteur, en alternance) avec un mail par entreprise.
// Rien n'est envoyé ici : l'envoi part le lundi (/api/cron/prospects-send).
const PER_WEEK = 15;
const CONCURRENCY = 5;
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const week = mondayOf(new Date());
  const sector = SECTORS[weekNumber(week) % SECTORS.length];

  // Exclure : entreprises déjà listées (jamais recontactées) et déjà clientes.
  const [{ data: listed }, { data: clients }] = await Promise.all([
    supabase.from("prospect_targets").select("siret"),
    supabase.from("clients").select("siret").not("siret", "is", null),
  ]);
  const known = new Set([...(listed ?? []), ...(clients ?? [])].map((r) => String(r.siret)));

  const offset = weekNumber(week) % PROSPECT_DEPARTMENTS.length;
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

  // Recherche du site et de l'adresse générique, par lots, puis rédaction du mail.
  const contacts: Contact[] = [];
  for (let i = 0; i < picked.length; i += CONCURRENCY) {
    const batch = picked.slice(i, i + CONCURRENCY);
    contacts.push(...(await Promise.all(batch.map((c) => findContact(c, sector.key as Sector)))));
  }

  const rows = picked.map((c, i) => buildRow(c, contacts[i], sector.key as Sector, week));
  if (rows.length) {
    const { error } = await supabase.from("prospect_targets").upsert(rows, { onConflict: "siret", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, week, sector: sector.key, added: rows.length, withEmail: rows.filter((r) => r.mail_status === "brouillon").length });
}

function buildRow(c: Company, contact: Contact, sector: Sector, week: string) {
  const need = SECTORS.find((s) => s.key === sector)!.need;
  const opener = contact.pitch ?? need;
  const body = `${opener}

Avec ONE CONNEXION, un coursier vient chercher votre envoi en moins de 45 minutes à Paris et en petite couronne, et le remet en main propre, avec preuve de remise.

Le prix est affiché avant de commander : 28 € TTC dans Paris, 39 € TTC en petite couronne (jusqu'à 8 km), commande en 2 minutes.`;
  return {
    siret: c.siret,
    siren: c.siren,
    name: c.name,
    city: c.city,
    postcode: c.postcode,
    department: c.department,
    sector,
    naf: c.naf,
    need,
    website: contact.website,
    email: contact.email,
    pitch: contact.pitch,
    mail_subject: `Livraisons urgentes à ${c.city ?? "Paris"}`,
    mail_body: body,
    mail_status: contact.email ? "brouillon" : "pas_d_email",
    batch_week: week,
  };
}

function mondayOf(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7;
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return m.toISOString().slice(0, 10);
}

function weekNumber(isoMonday: string): number {
  return Math.floor(Date.parse(isoMonday) / (7 * 86400000));
}
