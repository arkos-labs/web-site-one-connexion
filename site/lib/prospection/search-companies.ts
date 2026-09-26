/**
 * lib/prospection/search-companies.ts
 * Recherche d'entreprises actives par code NAF via l'API publique
 * "Recherche d'entreprises" (data.gouv.fr / api.gouv.fr) — pas de clé requise.
 * Doc : https://recherche-entreprises.api.gouv.fr
 */
import { createClient } from "@supabase/supabase-js";

// Codes NAF ciblés : administratif santé, opticiens, dentistes/prothésistes dentaires,
// audioprothésistes, e-commerce.
export const TARGET_NAF_CODES = [
  "86.21Z", // Activité des médecins généralistes
  "86.90A", // Ambulances
  "86.90D", // Activités de santé humaine non classées ailleurs (administratif santé)
  "47.78A", // Commerces de détail d'optique
  "86.23Z", // Pratique dentaire
  "32.50A", // Fabrication de matériel médico-chirurgical (prothèses dentaires)
  "47.78C", // Audioprothésistes
  "47.91A", // Vente à distance sur catalogue général (e-commerce)
  "47.91B", // Vente à distance sur catalogue spécialisé (e-commerce)
] as const;

type ApiResult = {
  siret: string;
  nom_complet: string | null;
  nom_raison_sociale: string | null;
  activite_principale: string | null;
  siege: {
    siret: string;
    libelle_commune: string | null;
    code_postal: string | null;
    activite_principale: string | null;
  } | null;
};

type ApiResponse = { results: ApiResult[] };

async function searchByNaf(nafCode: string, page: number): Promise<ApiResult[]> {
  const url = new URL("https://recherche-entreprises.api.gouv.fr/search");
  url.searchParams.set("activite_principale", nafCode);
  url.searchParams.set("etat_administratif", "A"); // actives uniquement
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "25");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`recherche-entreprises API: ${res.status}`);
  const data = (await res.json()) as ApiResponse;
  return data.results ?? [];
}

/**
 * Cherche jusqu'à `limit` nouvelles entreprises (pas déjà en base) réparties sur les
 * codes NAF ciblés, et les insère dans `prospects`. Retourne les lignes insérées.
 */
export async function findAndStoreNewProspects(limit: number) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const inserted: { id: string; company_name: string; siret: string }[] = [];

  for (const naf of TARGET_NAF_CODES) {
    if (inserted.length >= limit) break;
    let page = 1;
    let candidates: ApiResult[];
    try {
      candidates = await searchByNaf(naf, page);
    } catch (err) {
      console.error(`Recherche NAF ${naf} échouée:`, err);
      continue;
    }

    for (const c of candidates) {
      if (inserted.length >= limit) break;
      const siret = c.siege?.siret ?? c.siret;
      const companyName = c.nom_raison_sociale ?? c.nom_complet ?? null;
      if (!siret || !companyName) continue;

      const { data, error } = await supabase
        .from("prospects")
        .insert({
          siret,
          company_name: companyName,
          naf_code: c.siege?.activite_principale ?? c.activite_principale ?? naf,
          city: c.siege?.libelle_commune ?? null,
          postal_code: c.siege?.code_postal ?? null,
        })
        .select("id, company_name, siret")
        .single();

      // Conflit sur siret (déjà en base) : on ignore silencieusement.
      if (error) {
        if (!error.message.includes("duplicate")) console.error("Insertion prospect échouée:", error.message);
        continue;
      }
      if (data) inserted.push(data);
    }
  }

  return inserted;
}
