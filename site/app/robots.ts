/**
 * app/robots.ts
 * Directives d'indexation. Le site est entièrement public : rien à exclure.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
