/**
 * lib/clean-path.ts
 * Adresse d'une page publique envoyée par le site : chemin seul, sans paramètres ni espace admin.
 */
export function cleanPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 120) return null;
  if (!/^\/[a-z0-9\/_-]*$/i.test(value)) return null;
  if (/^\/(admin|dashboard|telegram)(\/|$)/.test(value)) return null;
  return value;
}
