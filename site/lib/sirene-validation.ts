/**
 * lib/sirene-validation.ts
 * Validation Sirene : vérifier les infos B2B via l'API officielle INSEE
 * https://www.sirene.fr/sirene/public/accueil
 */

export interface SireneValidationResult {
  valid: boolean;
  siret?: string;
  siren?: string;
  raison_sociale?: string;
  adresse?: string;
  tva_number?: string;
  assujetti_tva?: boolean;
  error?: string;
}

/**
 * Valider un SIRET via l'API Sirene de l'INSEE
 * Format SIRET : 14 chiffres (SIREN 9 + établissement 5)
 */
export async function validateSiretViaINSEE(
  siret: string,
  companyName?: string
): Promise<SireneValidationResult> {
  // Nettoyage du SIRET
  const cleanSiret = siret.replace(/\s/g, "").trim();

  // Validation format
  if (!/^\d{14}$/.test(cleanSiret)) {
    return {
      valid: false,
      error: "Le SIRET doit contenir 14 chiffres.",
    };
  }

  const sirenNumber = cleanSiret.substring(0, 9);
  const tvaNumber = `FR${calculateTvaKey(sirenNumber)}${sirenNumber}`;

  try {
    // API Recherche d'entreprises (data.gouv.fr) : publique, sans clé, alimentée par Sirene
    const response = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}&page=1&per_page=1`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) }
    );

    // API indisponible (panne, rate limit) : on ne bloque pas la commande pour autant
    if (!response.ok) {
      console.warn("Recherche entreprises indisponible:", response.status);
      return { valid: true, siret: cleanSiret, siren: sirenNumber, tva_number: tvaNumber };
    }

    const data = await response.json();
    const entreprise = data.results?.[0];
    const etablissement = entreprise?.matching_etablissements?.find(
      (e: { siret?: string }) => e.siret === cleanSiret
    );

    if (!entreprise || entreprise.siren !== sirenNumber || !etablissement) {
      return {
        valid: false,
        error: "SIRET introuvable dans le répertoire Sirene. Vérifiez les 14 chiffres.",
      };
    }

    if (etablissement.etat_administratif === "F") {
      return {
        valid: false,
        error: "Cet établissement est fermé selon le répertoire Sirene.",
      };
    }

    return {
      valid: true,
      siret: cleanSiret,
      siren: sirenNumber,
      raison_sociale: entreprise.nom_raison_sociale || entreprise.nom_complet || companyName || "",
      adresse: etablissement.adresse || "",
      tva_number: tvaNumber,
    };
  } catch (err) {
    console.error("Sirene validation error:", err);
    return { valid: true, siret: cleanSiret, siren: sirenNumber, tva_number: tvaNumber };
  }
}

/**
 * Clé du N° TVA intracommunautaire français : (12 + 3 × (SIREN mod 97)) mod 97
 */
function calculateTvaKey(siren: string): string {
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return key.toString().padStart(2, "0");
}

/**
 * Valider les infos B2B complètes
 */
export async function validateB2BInfo(data: {
  siret: string;
  raison_sociale?: string;
  email: string;
  nom_contact: string;
  adresse_facturation?: string;
}): Promise<{
  valid: boolean;
  errors: string[];
  sireneData?: SireneValidationResult;
}> {
  const errors: string[] = [];

  // Validation basique
  if (!data.siret || !/^\d{14}$/.test(data.siret.replace(/\s/g, ""))) {
    errors.push("SIRET invalide (14 chiffres).");
  }
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Email invalide.");
  }
  if (!data.nom_contact || data.nom_contact.trim().length < 2) {
    errors.push("Nom de contact manquant.");
  }
  // Raison sociale et adresse sont fournies par Sirene si absentes
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validation Sirene
  const sireneData = await validateSiretViaINSEE(
    data.siret,
    data.raison_sociale || undefined
  );

  if (!sireneData.valid) {
    errors.push(sireneData.error || "Impossible de vérifier le SIRET.");
    return { valid: false, errors, sireneData };
  }

  return { valid: true, errors: [], sireneData };
}
