/**
 * lib/prospection/sirene.ts
 * Entreprises cibles : base officielle des entreprises (SIRENE, via l'API publique recherche-entreprises,
 * sans clé). On filtre par code d'activité (NAF) et par département.
 */

export type Sector = "juridique" | "laboratoire" | "ecommerce";

export const SECTORS: { key: Sector; label: string; naf: string; need: string }[] = [
  {
    key: "juridique",
    label: "Cabinet juridique",
    naf: "69.10Z",
    need: "Plis, dossiers et actes à remettre vite entre le cabinet, les tribunaux et les études.",
  },
  {
    key: "laboratoire",
    label: "Laboratoire",
    naf: "86.90B",
    need: "Prélèvements et échantillons à acheminer vite, dans un transport fermé.",
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    naf: "47.91Z",
    need: "Livraisons du jour même à Paris et en Île-de-France.",
  },
];

/** Paris, petite couronne, grande couronne (77, 78, 91, 95). */
export const PROSPECT_DEPARTMENTS = ["75", "92", "93", "94", "77", "78", "91", "95"];

export type Company = {
  siret: string;
  siren: string;
  name: string;
  city: string | null;
  postcode: string | null;
  department: string | null;
  naf: string | null;
};

type ApiResult = {
  siren: string;
  nom_complet?: string;
  siege?: {
    siret?: string;
    code_postal?: string | null;
    libelle_commune?: string | null;
    departement?: string | null;
    activite_principale?: string | null;
    etat_administratif?: string | null;
  };
};

/** Entreprises actives d'un secteur dans un département. Liste vide si le service ne répond pas. */
export async function searchCompanies(naf: string, department: string, perPage = 25): Promise<Company[]> {
  const url = new URL("https://recherche-entreprises.api.gouv.fr/search");
  url.searchParams.set("activite_principale", naf);
  url.searchParams.set("departement", department);
  url.searchParams.set("per_page", String(perPage));
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: ApiResult[] };
    return (data.results ?? [])
      .filter((r) => r.siege?.siret && r.siege.etat_administratif !== "F")
      .map((r) => ({
        siret: r.siege!.siret!,
        siren: r.siren,
        name: r.nom_complet ?? r.siren,
        city: r.siege?.libelle_commune ?? null,
        postcode: r.siege?.code_postal ?? null,
        department: r.siege?.departement ?? department,
        naf: r.siege?.activite_principale ?? naf,
      }));
  } catch {
    return [];
  }
}
