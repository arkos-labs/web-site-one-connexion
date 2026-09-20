/**
 * app/sitemap.ts
 * Sitemap généré depuis lib/services : impossible de le désynchroniser
 * des pages réellement publiées.
 */
import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";
import { INDEXED_ZONE_SLUGS } from "@/lib/zones/data";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
    },
    {
      url: `${SITE_URL}/services`,
    },
    ...SERVICE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/services/${slug}`,
    })),
    {
      url: `${SITE_URL}/methode`,
    },
    {
      url: `${SITE_URL}/flotte`,
    },
    {
      url: `${SITE_URL}/references`,
    },
    {
      url: `${SITE_URL}/tarifs`,
    },
    {
      url: `${SITE_URL}/contact`,
    },
    {
      url: `${SITE_URL}/secteurs`,
    },
    {
      url: `${SITE_URL}/zones`,
    },
    {
      url: `${SITE_URL}/zones/paris`,
    },
    {
      url: `${SITE_URL}/zones/la-defense`,
    },
    {
      url: `${SITE_URL}/zones/petite-couronne`,
    },
    ...INDEXED_ZONE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/zones/${slug}`,
    })),
  ];
}
