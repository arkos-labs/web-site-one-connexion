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
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}
