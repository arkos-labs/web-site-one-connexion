/**
 * lib/prospection/find-email.ts
 * Tente de trouver un email de contact public pour une entreprise :
 * recherche son site web via l'annuaire "recherche-entreprises", puis
 * scanne une seule page (accueil ou /contact) pour un email publiquement affiché.
 * Best-effort : ne fait qu'une requête réseau courte par étape, jamais bloquant.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Domaines génériques à ignorer (images, tracking, exemples...)
const IGNORED_DOMAINS = ["sentry.io", "example.com", "wixpress.com", "godaddy.com"];

function extractBestEmail(html: string): string | null {
  const matches = html.match(EMAIL_REGEX) ?? [];
  const candidates = matches
    .map((m) => m.toLowerCase())
    .filter((m) => !m.endsWith(".png") && !m.endsWith(".jpg") && !m.endsWith(".svg"))
    .filter((m) => !IGNORED_DOMAINS.some((d) => m.endsWith(d)));
  if (candidates.length === 0) return null;
  // Préférence pour un email générique de contact plutôt qu'un email personnel trouvé au hasard.
  const preferred = candidates.find((m) => /^(contact|info|hello|bonjour)@/.test(m));
  return preferred ?? candidates[0];
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OneConnexionProspection/1.0)" },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Cherche un site web pour l'entreprise via l'annuaire public, puis un email dessus.
 * Retourne { website, email } — l'un ou l'autre peut être null si rien n'est trouvé.
 */
export async function findWebsiteAndEmail(companyName: string): Promise<{ website: string | null; email: string | null }> {
  let website: string | null = null;
  try {
    const url = new URL("https://recherche-entreprises.api.gouv.fr/search");
    url.searchParams.set("q", companyName);
    url.searchParams.set("per_page", "1");
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      website = data?.results?.[0]?.siege?.website ?? data?.results?.[0]?.website ?? null;
    }
  } catch (err) {
    console.error(`Recherche site web échouée pour ${companyName}:`, err);
  }

  if (!website) return { website: null, email: null };
  if (!/^https?:\/\//.test(website)) website = `https://${website}`;

  const homepage = await fetchText(website);
  let email = homepage ? extractBestEmail(homepage) : null;

  if (!email) {
    const contactPage = await fetchText(new URL("/contact", website).toString());
    if (contactPage) email = extractBestEmail(contactPage);
  }

  return { website, email };
}
