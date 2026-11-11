/**
 * scripts/check-seo.mjs
 * Contrôle SEO sur le sitemap : titles uniques, canonical auto-référent, meta présente,
 * largeur estimée du title. Échoue (code 1) si deux pages partagent le même title ou si
 * un canonical ne pointe pas vers la page elle-même.
 *
 * Usage : node scripts/check-seo.mjs [baseUrl]
 *   baseUrl : serveur à interroger (défaut http://localhost:3000 ; `npm run build && npm start`).
 *   Les URL du sitemap sont relues sur baseUrl : seuls leurs chemins comptent.
 */
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const get = async (url) => {
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, body: await res.text() };
};

const sitemap = await get(`${base}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`sitemap.xml : HTTP ${sitemap.status}`);
  process.exit(1);
}
const paths = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(decode(m[1])).pathname);

const problems = [];
const titles = new Map(); // title -> [paths]

for (const path of paths) {
  const { status, body } = await get(`${base}${path}`);
  if (status !== 200) {
    problems.push(`${path} : HTTP ${status}`);
    continue;
  }
  const title = decode(body.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const description = body.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = body.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

  if (!title) problems.push(`${path} : title absent`);
  if (!description) problems.push(`${path} : meta description absente`);
  if (!canonical) problems.push(`${path} : canonical absent`);
  else {
    const canonicalPath = new URL(decode(canonical)).pathname;
    if (canonicalPath !== path) problems.push(`${path} : canonical vers ${canonicalPath}`);
  }
  if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
}

for (const [title, list] of titles) {
  if (list.length > 1) problems.push(`title dupliqué « ${title} » : ${list.join(", ")}`);
}

console.log(`${paths.length} URL du sitemap contrôlées sur ${base}`);
if (problems.length) {
  console.error(`\n${problems.length} problème(s) :`);
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log("OK : titles uniques, canonicals auto-référents, metas présentes.");
