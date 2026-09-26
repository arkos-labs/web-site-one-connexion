/**
 * app/robots.ts
 * Directives d'indexation. Le site est entièrement public : rien à exclure
 * hormis les espaces connectés. Les robots des moteurs de réponse IA sont
 * listés explicitement pour que leur accès ne dépende pas du seul joker.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

const PRIVATE_PATHS = ["/dashboard/", "/admin/"];

const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: AI_SEARCH_BOTS,
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
