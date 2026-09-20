/**
 * lib/zones/factory.ts
 * Factory pour générer les données Zone à partir d'un spec minimal.
 * Permet de créer rapidement des centaines de pages avec du contenu unique
 * sans répéter les 6 secteurs en entier pour chaque ville.
 */
import type { Zone, ZoneCategory, ZoneSector } from "./types";

export interface ZoneSpec {
  slug: string;
  dept: string;
  name: string;
  fullName?: string;
  category: ZoneCategory;
  landmarks: string[];
  intro: string;
  logisticsContext: string;
  /** Surcharge partielle des 6 secteurs (example et serviceLabel uniquement) */
  sectorExamples: {
    juridique: string;
    medical: string;
    ecommerce: string;
    corporate: string;
    evenementiel: string;
    grandsComptes: string;
  };
  keyClients: string[];
  distanceParis?: string;
  pricingZone: "standard" | "devis";
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string[];
}

export function makeZone(spec: ZoneSpec): Zone {
  const sectors: ZoneSector[] = [
    {
      name: "Juridique & Notarial",
      example: spec.sectorExamples.juridique,
      serviceHref: "/services/plis-confidentiels",
      serviceLabel: "Plis confidentiels",
    },
    {
      name: "Médical & Laboratoires",
      example: spec.sectorExamples.medical,
      serviceHref: "/services/transport-medical",
      serviceLabel: "Transport médical",
    },
    {
      name: "E-commerce & Retail",
      example: spec.sectorExamples.ecommerce,
      serviceHref: "/services/livraison-e-commerce",
      serviceLabel: "Livraison e-commerce",
    },
    {
      name: "Corporate & Agences",
      example: spec.sectorExamples.corporate,
      serviceHref: "/services/plis-confidentiels",
      serviceLabel: "Course dédiée",
    },
    {
      name: "Événementiel",
      example: spec.sectorExamples.evenementiel,
      serviceHref: "/services/transport-evenementiel",
      serviceLabel: "Transport événementiel",
    },
    {
      name: "Grands comptes",
      example: spec.sectorExamples.grandsComptes,
      serviceHref: "/services/compte-entreprise",
      serviceLabel: "Compte entreprise",
    },
  ];

  return {
    slug: spec.slug,
    dept: spec.dept,
    name: spec.name,
    fullName: spec.fullName ?? `${spec.name} — ${deptLabel(spec.dept)}`,
    category: spec.category,
    landmarks: spec.landmarks,
    intro: spec.intro,
    logisticsContext: spec.logisticsContext,
    sectors,
    keyClients: spec.keyClients,
    distanceParis: spec.distanceParis,
    pricingZone: spec.pricingZone,
    seo: {
      title: spec.seoTitle,
      description: spec.seoDesc,
      keywords: spec.seoKeywords,
    },
  };
}

function deptLabel(dept: string): string {
  const d = dept.slice(0, 2);
  const map: Record<string, string> = {
    "75": "Paris",
    "92": "Hauts-de-Seine",
    "93": "Seine-Saint-Denis",
    "94": "Val-de-Marne",
    "91": "Essonne",
    "95": "Val-d'Oise",
    "77": "Seine-et-Marne",
    "78": "Yvelines",
  };
  return map[d] ?? `Dept. ${d}`;
}
