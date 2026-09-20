/**
 * lib/services/index.ts
 * Source unique des prestations. L'ordre de SERVICES fait l'ordre d'affichage
 * sur la homepage, sur l'index et dans le sitemap.
 */
import type { Service } from "./types";
import { plisConfidentiels } from "./plis-confidentiels";
import { transportMedical } from "./transport-medical";
import { livraisonEcommerce } from "./livraison-e-commerce";
import { compteEntreprise } from "./compte-entreprise";

import { tourneesRegulieres } from "./tournees-regulieres";
import { transportEvenementiel } from "./transport-evenementiel";

export type {
  Service,
  ServiceStat,
  ServiceStep,
  ServiceUseCase,
  FaqItem,
} from "./types";

export const SERVICES: Service[] = [
  plisConfidentiels,
  transportMedical,
  livraisonEcommerce,
  tourneesRegulieres,
  transportEvenementiel,
  compteEntreprise,
];

export const SERVICE_SLUGS: string[] = SERVICES.map((service) => service.slug);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}
