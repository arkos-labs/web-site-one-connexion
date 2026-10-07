/**
 * lib/address-idf.ts
 * Vérifie qu'une adresse saisie existe vraiment (Base Adresse Nationale)
 * et qu'elle se trouve en Île-de-France.
 */

const IDF_DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

export type AddressCheck =
  | { ok: true; label: string }
  | { ok: false; error: string };

/** « 12 bis rue … » → « 12bis rue … » : c'est le format de la Base Adresse Nationale. */
export const joinNumberSuffix = (s: string) =>
  s.replace(/^(\s*\d+)\s+(bis|ter|quater|quinquies)\b/i, "$1$2");

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export async function checkIdfAddress(address: string, which: "d'enlèvement" | "de livraison"): Promise<AddressCheck> {
  const q = joinNumberSuffix(address.trim());
  const notFound = `L'adresse ${which} est introuvable en Île-de-France. Choisissez une adresse dans la liste de suggestions (numéro, rue, code postal).`;

  try {
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&lat=48.8566&lon=2.3522`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return { ok: true, label: q }; // service indisponible : on ne bloque pas la commande
    const data = await res.json();
    const idf = ((data.features ?? []) as any[]).filter((f) =>
      IDF_DEPARTMENTS.includes(String(f.properties?.postcode ?? "").slice(0, 2))
    );

    // Adresse choisie dans les suggestions : le libellé correspond exactement
    const exact = idf.find((f) => normalize(f.properties.label) === normalize(q));
    if (exact) return { ok: true, label: exact.properties.label };

    // Saisie libre : on n'accepte qu'une adresse qui correspond vraiment à ce qui a été tapé
    // (même numéro, même code postal, mêmes mots), jamais une adresse voisine.
    const best = idf[0];
    if (best && ["housenumber", "street"].includes(best.properties.type) && best.properties.score >= 0.75) {
      const label = normalize(best.properties.label);
      const labelWords = new Set(label.split(" "));
      const words = normalize(q).split(" ").filter((w) => w.length >= 3 && !/^\d+$/.test(w));
      const matched = words.filter((w) => labelWords.has(w)).length;
      const inputNumber = q.match(/^\s*(\d+)/)?.[1];
      const inputPostcode = q.match(/(\d{5})/)?.[1];
      const sameNumber = !inputNumber || best.properties.housenumber?.toLowerCase().startsWith(inputNumber);
      const samePostcode = !inputPostcode || best.properties.postcode === inputPostcode;
      if (words.length > 0 && matched / words.length >= 0.8 && sameNumber && samePostcode) {
        return { ok: true, label: best.properties.label };
      }
    }

    return { ok: false, error: notFound };
  } catch {
    return { ok: true, label: q }; // réseau indisponible : on ne bloque pas la commande
  }
}
