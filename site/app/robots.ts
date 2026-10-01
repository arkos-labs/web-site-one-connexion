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
      // AI search crawlers (citations in Google AI, ChatGPT, Perplexity)
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"],
        allow: "/",
        disallow: ["/dashboard/", "/admin/"],
      },
      // Google's Gemini and vertex AI opt-out
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
