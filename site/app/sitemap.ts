/**
 * app/sitemap.ts
 * Sitemap généré depuis lib/services : impossible de le désynchroniser
 * des pages réellement publiées.
 */
import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";
import { INDEXED_ZONE_SLUGS, getZone } from "@/lib/zones/data";
import { lastModified } from "@/lib/lastmod";

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

const STATIC_ZONE_PAGES = new Set(["paris", "la-defense", "petite-couronne"]);

function sourceFiles(path: string): string[] {
  if (path === "") return ["app/page.tsx"];
  if (path.startsWith("/services/")) {
    const slug = path.slice("/services/".length);
    return ["app/services/[slug]/page.tsx", `lib/services/${slug}.ts`];
  }
  if (path.startsWith("/zones/")) {
    const slug = path.slice("/zones/".length);
    if (STATIC_ZONE_PAGES.has(slug)) return [`app/zones${path.slice(6)}/page.tsx`];
    const dept = getZone(slug)?.dept.slice(0, 2);
    const data = dept && dept !== "75" ? `lib/zones/data-${dept}.ts` : "lib/zones/data.ts";
    return ["app/zones/[slug]/page.tsx", data];
  }
  return [`app${path}/page.tsx`];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...SERVICE_SLUGS.map((slug) => `/services/${slug}`),
    ...INDEXED_ZONE_SLUGS.map((slug) => `/zones/${slug}`),
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModified(...sourceFiles(path)),
  }));
}
