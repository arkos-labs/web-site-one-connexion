/**
 * lib/service-schema.ts
 * JSON-LD Service des pages hub (/services, /zones, /zones/grande-couronne), calqué sur le
 * schéma des pages de zone : prestataire référencé par @id, téléphone et prix repris des
 * constantes publiées sur /contact et /tarifs (aucune valeur en dur).
 */
import { PHONE_TEL, SITE_URL } from "@/lib/site-content";
import { gridPrice } from "@/lib/pricing";

export function hubServiceSchema(opts: {
  path: string;
  name: string;
  description: string;
  areaName: string;
  /** Offre « Normal à Paris » (grille /tarifs). À omettre quand le prix dépend de la distance. */
  withOffer?: boolean;
}) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: opts.name,
    serviceType: "Coursier express à moto",
    description: opts.description,
    url,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "AdministrativeArea", name: opts.areaName },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}/contact`,
      servicePhone: PHONE_TEL,
    },
    ...(opts.withOffer && {
      offers: {
        "@type": "Offer",
        name: "Course Normal à Paris (sous 3 h)",
        price: String(gridPrice("standard", 0)),
        priceCurrency: "EUR",
        url: `${SITE_URL}/tarifs`,
        priceSpecification: {
          "@type": "PriceSpecification",
          price: String(gridPrice("standard", 0)),
          priceCurrency: "EUR",
          valueAddedTaxIncluded: true,
        },
      },
    }),
  };
}
