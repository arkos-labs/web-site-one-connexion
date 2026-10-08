export type ZoneCategory = "paris" | "hauts-de-seine" | "seine-saint-denis" | "val-de-marne";

export interface ZoneSector {
  /** Secteur concerné */
  name: string;
  /** Exemple concret d'usage dans cette zone */
  example: string;
  /** Lien vers la prestation */
  serviceHref: string;
  serviceLabel: string;
}

export interface ZoneFaqItem {
  q: string;
  a: string;
}

export interface ZoneGuide {
  title: string;
  paragraphs: string[];
}

/**
 * Contenu rédigé à la main pour une commune : il remplace les champs
 * correspondants de la fiche de base (intro, contexte, repères, acteurs).
 */
export interface LocalZoneContent {
  landmarks: string[];
  intro: string;
  logisticsContext: string;
  keyClients: string[];
  localGuide: ZoneGuide;
  faq: ZoneFaqItem[];
}

export interface ZoneCase {
  title: string;
  body: string;
}

/** Contenu d'approfondissement d'une commune : situations concrètes, conseils, questions en plus. */
export interface ExtraZoneContent {
  cases: ZoneCase[];
  tips: string[];
  faq: ZoneFaqItem[];
}

export interface Zone {
  slug: string;
  dept: string;
  name: string;
  /** ex: "Paris 8e arrondissement" */
  fullName: string;
  category: ZoneCategory;
  /** Quartiers / lieux emblématiques */
  landmarks: string[];
  /** Phrase d'introduction spécifique à la zone */
  intro: string;
  /** Contexte logistique propre à la zone */
  logisticsContext: string;
  /** Secteurs dominants dans cette zone avec exemples locaux */
  sectors: ZoneSector[];
  /** Institutions / entreprises types présentes */
  keyClients: string[];
  /** Temps de trajet estimé vers Paris centre */
  distanceParis?: string;
  /** Tarif applicable */
  pricingZone: "standard" | "devis";
  /**
   * Contenu 100 % propre à la zone (optionnel). Une zone qui en dispose remplace
   * la FAQ générique, ce qui évite le texte dupliqué d'une page à l'autre.
   */
  faq?: ZoneFaqItem[];
  localGuide?: ZoneGuide;
  /** false = pas de grille des 6 secteurs (texte formaté, identique d'une commune à l'autre). */
  showSectors?: boolean;
  /** Situations concrètes de livraison propres à la zone. */
  cases?: ZoneCase[];
  /** Conseils pratiques avant de commander dans cette zone. */
  tips?: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}
