/**
 * app/sitemap.ts
 * Sitemap généré depuis lib/services : impossible de le désynchroniser
 * des pages réellement publiées.
 */
import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL, SITE_LAST_UPDATED } from "@/lib/site-content";
import { INDEXED_ZONE_SLUGS } from "@/lib/zones/data";

const STATIC_PATHS = [
  "",
  "/services",
  "/methode",
  "/flotte",
  "/references",
  "/tarifs",
  "/contact",
  "/secteurs",
  "/zones",
  "/zones/paris",
  "/zones/la-defense",
  "/zones/petite-couronne",
  "/mentions-legales",
  "/cgv",
  "/politique-de-confidentialite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...SERVICE_SLUGS.map((slug) => `/services/${slug}`),
    ...INDEXED_ZONE_SLUGS.map((slug) => `/zones/${slug}`),
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: SITE_LAST_UPDATED,
  }));
}
