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
import { coursierExpressParis } from "./coursier-express-paris";
import { coursierMotoParis } from "./coursier-moto-paris";

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

/**
 * Pages de référencement : routées et dans le sitemap, mais absentes des cartes
 * (homepage, footer, index /services) pour ne pas doublonner les prestations.
 */
const SEO_SERVICES: Service[] = [coursierExpressParis, coursierMotoParis];

const ROUTED_SERVICES: Service[] = [...SERVICES, ...SEO_SERVICES];

export const SERVICE_SLUGS: string[] = ROUTED_SERVICES.map((service) => service.slug);

export function getService(slug: string): Service | undefined {
  return ROUTED_SERVICES.find((service) => service.slug === slug);
}
