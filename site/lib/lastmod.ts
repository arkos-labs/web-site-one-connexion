/**
 * lib/lastmod.ts
 * Date de dernière modification réelle d'un fichier source (dernier commit git).
 * Repli sur SITE_LAST_UPDATED si git n'est pas disponible au build.
 */
import { execFileSync } from "node:child_process";
import { SITE_LAST_UPDATED } from "@/lib/site-content";

export function lastModified(...files: string[]): Date {
  let latest = 0;
  for (const file of files) {
    try {
      const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      const t = Date.parse(iso);
      if (!Number.isNaN(t) && t > latest) latest = t;
    } catch {
      // git indisponible : on retombe sur la date globale ci-dessous.
    }
  }
  return latest ? new Date(latest) : SITE_LAST_UPDATED;
}
