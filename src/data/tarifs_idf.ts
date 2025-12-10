/**
 * GRILLE TARIFAIRE ONE CONNEXION - ILE-DE-FRANCE
 * ===============================================
 * 
 * SYSTÈME DE BONS:
 * - 1 bon = 5,5 €
 * - Aucune estimation par distance
 * - Prix fixe par ville et formule
 * 
 * FORMULES:
 * - NORMAL: Livraison standard
 * - EXPRESS: Livraison rapide  
 * - URGENCE: Livraison en urgence
 * - VL_NORMAL: Véhicule léger normal
 * - VL_EXPRESS: Véhicule léger express
 * 
 * EXEMPLE:
 * - Melun + EXPRESS = 27 bons = 27 × 5,5€ = 148,5€
 * - Cachan + URGENCE = 11 bons = 11 × 5,5€ = 60,5€
 * 
 * @generated
 * @date 2024-12-03
 */

export type Formule = "NORMAL" | "EXPRESS" | "URGENCE" | "VL_NORMAL" | "VL_EXPRESS";

export interface TarifVille {
  cp: string;
  ville: string;
  formules: Record<Formule, number>; // Nombre de bons (pas d'euros)
}

export interface PrixCalcule {
  cp: string;
  ville: string;
  formule: Formule;
  nb_bons: number;
  prix_euros: number;
  calcul: string; // "27 × 5,5€ = 148,5€"
}

// ===================================================================
// CONSTANTES
// ===================================================================

export const PRIX_PAR_BON = 5.5;

export const FORMULES: Formule[] = [
  "NORMAL",
  "EXPRESS",
  "URGENCE",
  "VL_NORMAL",
  "VL_EXPRESS"
];

export const NOMS_FORMULES: Record<Formule, string> = {
  "NORMAL": "Livraison Normale",
  "EXPRESS": "Express",
  "URGENCE": "Urgence",
  "VL_NORMAL": "Véhicule Léger Normal",
  "VL_EXPRESS": "Véhicule Léger Express"
};

export const DESCRIPTIONS_FORMULES: Record<Formule, string> = {
  "NORMAL": "Livraison standard dans les délais normaux",
  "EXPRESS": "Livraison rapide et prioritaire",
  "URGENCE": "Livraison d'urgence au plus vite",
  "VL_NORMAL": "Livraison en véhicule léger (colis de petite taille)",
  "VL_EXPRESS": "Livraison express en véhicule léger"
};

// ===================================================================
// GRILLE TARIFAIRE - TOUTES LES VILLES D'ILE-DE-FRANCE
// ===================================================================
// Source: grille_tarifaire.pdf
// Format: [CP, Ville, NORMAL, EXPRESS, URGENCE, VL_NORMAL, VL_EXPRESS] (en bons)
// ===================================================================

export const TARIFS_BONS: TarifVille[] = [
  // SEINE-ET-MARNE (77)
  {
    cp: "77000",
    ville: "Melun",
    formules: { NORMAL: 25, EXPRESS: 27, URGENCE: 35, VL_NORMAL: 18, VL_EXPRESS: 22 }
  },
  {
    cp: "77100",
    ville: "Meaux",
    formules: { NORMAL: 28, EXPRESS: 31, URGENCE: 40, VL_NORMAL: 20, VL_EXPRESS: 25 }
  },
  {
    cp: "77170",
    ville: "Brie-Comte-Robert",
    formules: { NORMAL: 24, EXPRESS: 26, URGENCE: 34, VL_NORMAL: 17, VL_EXPRESS: 21 }
  },
  {
    cp: "77604",
    ville: "Noisiel",
    formules: { NORMAL: 22, EXPRESS: 24, URGENCE: 32, VL_NORMAL: 16, VL_EXPRESS: 20 }
  },
  {
    cp: "77160",
    ville: "Dammarie-les-Lys",
    formules: { NORMAL: 26, EXPRESS: 28, URGENCE: 36, VL_NORMAL: 18, VL_EXPRESS: 23 }
  },
  {
    cp: "77200",
    ville: "Torcy",
    formules: { NORMAL: 23, EXPRESS: 25, URGENCE: 33, VL_NORMAL: 16, VL_EXPRESS: 21 }
  },
  {
    cp: "77600",
    ville: "Mitry-Mory",
    formules: { NORMAL: 21, EXPRESS: 23, URGENCE: 31, VL_NORMAL: 15, VL_EXPRESS: 19 }
  },
  {
    cp: "77300",
    ville: "Fontainebleau",
    formules: { NORMAL: 30, EXPRESS: 34, URGENCE: 44, VL_NORMAL: 22, VL_EXPRESS: 28 }
  },
  {
    cp: "77350",
    ville: "Le Mée-sur-Seine",
    formules: { NORMAL: 27, EXPRESS: 29, URGENCE: 38, VL_NORMAL: 19, VL_EXPRESS: 24 }
  },
  {
    cp: "77400",
    ville: "Lagny-sur-Marne",
    formules: { NORMAL: 20, EXPRESS: 22, URGENCE: 29, VL_NORMAL: 14, VL_EXPRESS: 18 }
  },
  {
    cp: "77420",
    ville: "Champs-sur-Marne",
    formules: { NORMAL: 21, EXPRESS: 23, URGENCE: 31, VL_NORMAL: 15, VL_EXPRESS: 19 }
  },
  {
    cp: "77200",
    ville: "Marne-la-Vallée",
    formules: { NORMAL: 22, EXPRESS: 24, URGENCE: 32, VL_NORMAL: 16, VL_EXPRESS: 20 }
  },
  {
    cp: "77500",
    ville: "Chelles",
    formules: { NORMAL: 19, EXPRESS: 21, URGENCE: 28, VL_NORMAL: 13, VL_EXPRESS: 17 }
  },
  {
    cp: "77600",
    ville: "Bussy-Saint-Georges",
    formules: { NORMAL: 23, EXPRESS: 25, URGENCE: 33, VL_NORMAL: 16, VL_EXPRESS: 21 }
  },
  {
    cp: "77700",
    ville: "Serris",
    formules: { NORMAL: 24, EXPRESS: 26, URGENCE: 34, VL_NORMAL: 17, VL_EXPRESS: 22 }
  },
  {
    cp: "77130",
    ville: "Montereau-Fault-Yonne",
    formules: { NORMAL: 32, EXPRESS: 37, URGENCE: 48, VL_NORMAL: 24, VL_EXPRESS: 30 }
  },

  // YVELINES (78)
  {
    cp: "78000",
    ville: "Versailles",
    formules: { NORMAL: 18, EXPRESS: 20, URGENCE: 26, VL_NORMAL: 13, VL_EXPRESS: 16 }
  },
  {
    cp: "78200",
    ville: "Les Mureaux",
    formules: { NORMAL: 25, EXPRESS: 28, URGENCE: 36, VL_NORMAL: 18, VL_EXPRESS: 23 }
  },
  {
    cp: "78150",
    ville: "Le Chesnay",
    formules: { NORMAL: 17, EXPRESS: 19, URGENCE: 25, VL_NORMAL: 12, VL_EXPRESS: 15 }
  },
  {
    cp: "78100",
    ville: "Saint-Germain-en-Laye",
    formules: { NORMAL: 20, EXPRESS: 22, URGENCE: 29, VL_NORMAL: 14, VL_EXPRESS: 18 }
  },
  {
    cp: "78300",
    ville: "Poissy",
    formules: { NORMAL: 22, EXPRESS: 24, URGENCE: 32, VL_NORMAL: 15, VL_EXPRESS: 20 }
  },
  {
    cp: "78560",
    ville: "Conflans-Sainte-Honorine",
    formules: { NORMAL: 23, EXPRESS: 25, URGENCE: 33, VL_NORMAL: 16, VL_EXPRESS: 21 }
  },
  {
    cp: "78400",
    ville: "Chatou",
    formules: { NORMAL: 19, EXPRESS: 21, URGENCE: 27, VL_NORMAL: 13, VL_EXPRESS: 17 }
  },
  {
    cp: "78960",
    ville: "Vaux-sur-Seine",
    formules: { NORMAL: 24, EXPRESS: 26, URGENCE: 34, VL_NORMAL: 17, VL_EXPRESS: 22 }
  },

  // ESSONNE (91)
  {
    cp: "91000",
    ville: "Évry-Courcouronnes",
    formules: { NORMAL: 21, EXPRESS: 23, URGENCE: 30, VL_NORMAL: 15, VL_EXPRESS: 19 }
  },
  {
    cp: "91100",
    ville: "Corbeil-Essonnes",
    formules: { NORMAL: 23, EXPRESS: 25, URGENCE: 33, VL_NORMAL: 16, VL_EXPRESS: 21 }
  },
  {
    cp: "91300",
    ville: "Massy",
    formules: { NORMAL: 17, EXPRESS: 19, URGENCE: 25, VL_NORMAL: 12, VL_EXPRESS: 15 }
  },
  {
    cp: "91140",
    ville: "Savigny-sur-Orge",
    formules: { NORMAL: 18, EXPRESS: 20, URGENCE: 26, VL_NORMAL: 13, VL_EXPRESS: 16 }
  },
  {
    cp: "91700",
    ville: "Sainte-Geneviève-des-Bois",
    formules: { NORMAL: 19, EXPRESS: 21, URGENCE: 27, VL_NORMAL: 13, VL_EXPRESS: 17 }
  },
  {
    cp: "91170",
    ville: "Viry-Châtillon",
    formules: { NORMAL: 20, EXPRESS: 22, URGENCE: 29, VL_NORMAL: 14, VL_EXPRESS: 18 }
  },
  {
    cp: "91200",
    ville: "Athis-Mons",
    formules: { NORMAL: 21, EXPRESS: 23, URGENCE: 30, VL_NORMAL: 15, VL_EXPRESS: 19 }
  },
  {
    cp: "91120",
    ville: "Palaiseau",
    formules: { NORMAL: 18, EXPRESS: 20, URGENCE: 26, VL_NORMAL: 13, VL_EXPRESS: 16 }
  },

  // HAUTS-DE-SEINE (92)
  {
    cp: "92100",
    ville: "Boulogne-Billancourt",
    formules: { NORMAL: 12, EXPRESS: 14, URGENCE: 18, VL_NORMAL: 8, VL_EXPRESS: 11 }
  },
  {
    cp: "92110",
    ville: "Clichy",
    formules: { NORMAL: 13, EXPRESS: 15, URGENCE: 19, VL_NORMAL: 9, VL_EXPRESS: 12 }
  },
  {
    cp: "92200",
    ville: "Neuilly-sur-Seine",
    formules: { NORMAL: 11, EXPRESS: 13, URGENCE: 17, VL_NORMAL: 8, VL_EXPRESS: 10 }
  },
  {
    cp: "92300",
    ville: "Levallois-Perret",
    formules: { NORMAL: 13, EXPRESS: 15, URGENCE: 19, VL_NORMAL: 9, VL_EXPRESS: 12 }
  },
  {
    cp: "92400",
    ville: "Courbevoie",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 20, VL_NORMAL: 10, VL_EXPRESS: 12 }
  },
  {
    cp: "92500",
    ville: "Rueil-Malmaison",
    formules: { NORMAL: 15, EXPRESS: 17, URGENCE: 22, VL_NORMAL: 11, VL_EXPRESS: 14 }
  },
  {
    cp: "92600",
    ville: "Asnières-sur-Seine",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },
  {
    cp: "92700",
    ville: "La Garenne-Colombes",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },

  // SEINE-SAINT-DENIS (93)
  {
    cp: "93000",
    ville: "Bobigny",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },
  {
    cp: "93100",
    ville: "Montreuil",
    formules: { NORMAL: 13, EXPRESS: 15, URGENCE: 19, VL_NORMAL: 9, VL_EXPRESS: 12 }
  },
  {
    cp: "93200",
    ville: "Saint-Denis",
    formules: { NORMAL: 15, EXPRESS: 17, URGENCE: 22, VL_NORMAL: 11, VL_EXPRESS: 14 }
  },
  {
    cp: "93300",
    ville: "Aubervilliers",
    formules: { NORMAL: 15, EXPRESS: 17, URGENCE: 22, VL_NORMAL: 11, VL_EXPRESS: 14 }
  },
  {
    cp: "93400",
    ville: "Saint-Ouen-sur-Seine",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },
  {
    cp: "93500",
    ville: "Pantin",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },

  // VAL-DE-MARNE (94)
  {
    cp: "94000",
    ville: "Créteil",
    formules: { NORMAL: 13, EXPRESS: 15, URGENCE: 19, VL_NORMAL: 9, VL_EXPRESS: 12 }
  },
  {
    cp: "94100",
    ville: "Saint-Maur-des-Fossés",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 20, VL_NORMAL: 10, VL_EXPRESS: 12 }
  },
  {
    cp: "94200",
    ville: "Ivry-sur-Seine",
    formules: { NORMAL: 13, EXPRESS: 15, URGENCE: 19, VL_NORMAL: 9, VL_EXPRESS: 12 }
  },
  {
    cp: "94230",
    ville: "Cachan",
    formules: { NORMAL: 9, EXPRESS: 10, URGENCE: 11, VL_NORMAL: 6, VL_EXPRESS: 8 }
  },
  {
    cp: "94300",
    ville: "Vincennes",
    formules: { NORMAL: 11, EXPRESS: 13, URGENCE: 17, VL_NORMAL: 8, VL_EXPRESS: 10 }
  },
  {
    cp: "94400",
    ville: "Vitry-sur-Seine",
    formules: { NORMAL: 14, EXPRESS: 16, URGENCE: 21, VL_NORMAL: 10, VL_EXPRESS: 13 }
  },

  // VAL-D'OISE (95)
  {
    cp: "95000",
    ville: "Cergy",
    formules: { NORMAL: 26, EXPRESS: 29, URGENCE: 37, VL_NORMAL: 19, VL_EXPRESS: 24 }
  },
  {
    cp: "95100",
    ville: "Argenteuil",
    formules: { NORMAL: 18, EXPRESS: 20, URGENCE: 26, VL_NORMAL: 13, VL_EXPRESS: 16 }
  },
  {
    cp: "95200",
    ville: "Sarcelles",
    formules: { NORMAL: 17, EXPRESS: 19, URGENCE: 25, VL_NORMAL: 12, VL_EXPRESS: 15 }
  },

  // PARIS (75)
  {
    cp: "75001",
    ville: "Paris 1er",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75002",
    ville: "Paris 2e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75003",
    ville: "Paris 3e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75004",
    ville: "Paris 4e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75005",
    ville: "Paris 5e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75006",
    ville: "Paris 6e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75007",
    ville: "Paris 7e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75008",
    ville: "Paris 8e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75009",
    ville: "Paris 9e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75010",
    ville: "Paris 10e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75011",
    ville: "Paris 11e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75012",
    ville: "Paris 12e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75013",
    ville: "Paris 13e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75014",
    ville: "Paris 14e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75015",
    ville: "Paris 15e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75016",
    ville: "Paris 16e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75017",
    ville: "Paris 17e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75018",
    ville: "Paris 18e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75019",
    ville: "Paris 19e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  },
  {
    cp: "75020",
    ville: "Paris 20e",
    formules: { NORMAL: 8, EXPRESS: 10, URGENCE: 13, VL_NORMAL: 5, VL_EXPRESS: 7 }
  }
];

// ===================================================================
// INDEX DE RECHERCHE RAPIDE
// ===================================================================

export const INDEX_TARIFS = new Map<string, number>();
export const VILLES_PAR_CP = new Map<string, number[]>();
export const VILLES_PAR_NOM = new Map<string, number>();

// Initialisation des index au chargement du module
TARIFS_BONS.forEach((tarif, index) => {
  const cle = `${tarif.cp}_${tarif.ville}`;
  INDEX_TARIFS.set(cle, index);

  if (!VILLES_PAR_CP.has(tarif.cp)) {
    VILLES_PAR_CP.set(tarif.cp, []);
  }
  VILLES_PAR_CP.get(tarif.cp)!.push(index);

  // Index par nom de ville (en minuscules pour recherche insensible à la casse)
  VILLES_PAR_NOM.set(tarif.ville.toLowerCase(), index);
});

// ===================================================================
// FONCTIONS DE CALCUL DE PRIX
// ===================================================================

/**
 * Récupère le tarif en bons pour une ville et une formule
 * 
 * @param cp - Code postal
 * @param ville - Nom de la ville
 * @param formule - Formule choisie
 * @returns Nombre de bons
 * @throws Erreur si la ville n'existe pas
 */
export function getTarifBons(cp: string, ville: string, formule: Formule): number {
  const cle = `${cp}_${ville}`;
  const index = INDEX_TARIFS.get(cle);

  if (index === undefined) {
    throw new Error(`Ville non trouvée: ${cp} ${ville}`);
  }

  return TARIFS_BONS[index].formules[formule];
}

/**
 * Calcule le prix EXACT en euros
 * 
 * Formule: prix_euros = nombre_de_bons × 5.5
 * 
 * @param cp - Code postal
 * @param ville - Nom de la ville
 * @param formule - Formule choisie
 * @returns Résultat du calcul avec détails
 * @throws Erreur si la ville n'existe pas
 */
export function calculerPrix(cp: string, ville: string, formule: Formule): PrixCalcule {
  const nb_bons = getTarifBons(cp, ville, formule);
  const prix_euros = Math.round(nb_bons * PRIX_PAR_BON * 100) / 100;
  const calcul = `${nb_bons} × 5,5€ = ${prix_euros}€`;

  return {
    cp,
    ville,
    formule,
    nb_bons,
    prix_euros,
    calcul
  };
}

/**
 * Calcule les prix pour toutes les formules d'une ville
 * 
 * @param cp - Code postal
 * @param ville - Nom de la ville
 * @returns Objet avec tous les prix calculés
 */
export function calculerTousLesPrix(cp: string, ville: string): Record<Formule, PrixCalcule> {
  const result: Partial<Record<Formule, PrixCalcule>> = {};

  for (const formule of FORMULES) {
    result[formule] = calculerPrix(cp, ville, formule);
  }

  return result as Record<Formule, PrixCalcule>;
}

// ===================================================================
// VALIDATION ET AUTOCOMPLÉTION
// ===================================================================

/**
 * Vérifie qu'une ville existe
 * 
 * @param cp - Code postal
 * @param ville - Nom de la ville
 * @returns true si la ville existe
 */
export function validerVille(cp: string, ville: string): boolean {
  const cle = `${cp}_${ville}`;
  return INDEX_TARIFS.has(cle);
}

/**
 * Récupère toutes les villes pour un code postal
 * 
 * @param cp - Code postal
 * @returns Liste des villes avec leurs tarifs
 */
export function getVillesParCP(cp: string): TarifVille[] {
  const indices = VILLES_PAR_CP.get(cp) || [];
  return indices.map(index => TARIFS_BONS[index]);
}

/**
 * Recherche des villes par pattern (autocomplétion)
 * 
 * @param pattern - Texte à chercher (case-insensitive)
 * @param limit - Nombre maximum de résultats
 * @returns Liste des villes correspondantes
 */
export function rechercherVilles(pattern: string, limit: number = 10): TarifVille[] {
  if (!pattern || pattern.length < 2) {
    return [];
  }

  const lower = pattern.toLowerCase();
  const resultats = TARIFS_BONS.filter(t =>
    t.ville.toLowerCase().includes(lower) || t.cp.includes(lower)
  );

  return resultats.slice(0, limit);
}

/**
 * Récupère une ville par son nom exact
 * 
 * @param nomVille - Nom de la ville
 * @returns Ville avec ses tarifs ou undefined
 */
export function getTarifParNom(nomVille: string): TarifVille | undefined {
  const lower = nomVille.toLowerCase();
  const index = VILLES_PAR_NOM.get(lower);
  return index !== undefined ? TARIFS_BONS[index] : undefined;
}

// ===================================================================
// FORMATAGE POUR AFFICHAGE
// ===================================================================

/**
 * Formate un prix pour affichage
 * 
 * @param prix - Prix en euros
 * @param bons - Nombre de bons (optionnel)
 * @returns Chaîne formatée
 */
export function formaterPrix(prix: number, bons?: number): string {
  const formatted = prix.toFixed(2).replace(".", ",");

  if (bons !== undefined) {
    return `${bons} bons = ${formatted}€`;
  }

  return `${formatted}€`;
}

/**
 * Formate un résultat de calcul pour affichage
 * 
 * @param resultat - Résultat du calcul
 * @returns Chaîne formatée
 */
export function formaterResultat(resultat: PrixCalcule): string {
  return `${resultat.ville} (${resultat.cp}) - ${NOMS_FORMULES[resultat.formule]}
${resultat.calcul}`;
}

/**
 * Génère un devis formaté
 * 
 * @param cp - Code postal
 * @param ville - Nom de la ville
 * @returns String avec tous les prix
 */
export function genererDevis(cp: string, ville: string): string {
  if (!validerVille(cp, ville)) {
    return `❌ Ville non trouvée: ${cp} ${ville}`;
  }

  const prixs = calculerTousLesPrix(cp, ville);
  let devis = `📋 DEVIS - ${ville} (${cp})\n`;
  devis += `${"=".repeat(50)}\n`;

  for (const formule of FORMULES) {
    const p = prixs[formule];
    devis += `\n${NOMS_FORMULES[formule]}\n`;
    devis += `  ${p.calcul}\n`;
  }

  return devis;
}

// ===================================================================
// EXPORT PAR DÉFAUT
// ===================================================================

export default {
  TARIFS_BONS,
  PRIX_PAR_BON,
  FORMULES,
  NOMS_FORMULES,
  DESCRIPTIONS_FORMULES,
  INDEX_TARIFS,
  VILLES_PAR_CP,
  VILLES_PAR_NOM,
  // Fonctions de calcul
  getTarifBons,
  calculerPrix,
  calculerTousLesPrix,
  // Validation et recherche
  validerVille,
  rechercherVilles,
  getTarifParNom,
  getVillesParCP,
  // Formatage
  formaterPrix,
  formaterResultat,
  genererDevis
};
