# Action Plan — oneconnexion.fr

## Critical (fix immediately)
- [ ] **Zone breadcrumb 404s** — `app/zones/[slug]/page.tsx:127`: remove level 3 or create `/zones/hauts-de-seine|seine-saint-denis|val-de-marne` hubs and add them to the sitemap.

## High (within 1 week)
- [ ] Canonical `/` on the homepage; stop generating `/?pickup=…&dropoff=…` links from `Hero.tsx`.
- [ ] Hero video: re-encode 20 MB → ≤3 MB, add `poster="/hero-poster.jpg"`, `preload="metadata"`, `aria-hidden`.
- [ ] Convert CSS `background-image` heroes to `next/image` (compress the 7.7 MB `services-bg-new.jpg` and the four 2.6–3.2 MB files).
- [ ] Substantiate or remove the "99,4 %" and "3,5 M€" claims (8 places); replace placeholder client-logo strip with real logos/testimonials or delete it.
- [ ] Decide zone-page strategy: enrich each with genuinely local content, or consolidate to department hubs and `noindex` thin pages. Check Search Console for indexation.

## Medium (within 1 month)
- [ ] Add default `openGraph.images` + `twitter` card in root layout; add `openGraph` to flotte/references/methode/contact.
- [ ] `title.template` ("%s | ONE CONNEXION"); trim titles >60 chars.
- [ ] Schema: drop `MovingCompany`; single `#organization` entity with `sameAs`, `image`, `geo`, `contactPoint`; zone/service pages reference it via `@id`; remove `containsPlace` landmarks.
- [ ] Sitemap: add `/contact`, real `lastModified`, drop `priority`/`changeFrequency`.
- [ ] robots: disallow `/admin/`; add `noindex` to dashboard/admin/auth layouts.
- [ ] Add `sizes` to `About.tsx` image; canonicals on contact + legal pages.
- [ ] Homepage H1 or lead paragraph includes "coursier B2B à Paris".
- [ ] Add an About/team page and 2–3 case studies (E-E-A-T).
- [ ] Security headers in `next.config.ts` (verify Vercel defaults first).

## Low (backlog)
- [ ] Trim font weights; lazy-load Lenis; swap raw `<img>` in `Header.tsx:211`.
- [ ] Remove unused `public/` assets and default Next SVGs.
- [ ] Fix `Événementiel` icon (Stethoscope).
- [ ] Remove `ignoreBuildErrors` and stale `eslint` config key.
- [ ] Optional: `llms.txt`; explicit AI-crawler policy in robots.

## Ongoing
- [ ] Connect Search Console + GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID` is not in `.env.local`; confirm it's set in Vercel).
- [ ] Claim/optimize Google Business Profile; keep NAP identical to schema (5 Square Nungesser, 94160 Saint-Mandé).
- [ ] Publish 1–2 informational guides per month (pricing, délais, plis huissier/notaire, transport de prélèvements).
- [ ] Re-run this audit against the deployed URL for CWV and crawl data.

---
## Correctifs appliqués le 2026-09-20 (build de production vérifié)
Fil d'Ariane des zones · canonical d'accueil · poster/preload/aria-hidden de la vidéo (20 Mo → 0,7 Mo) · fonds JPEG (2,5–7,5 Mo → 0,1–0,7 Mo) · og:image + Twitter card · `title.template` + titres raccourcis · OG dédiés flotte/références/méthode · schema (LocalBusiness seul, entité `#organization` référencée par `@id`, Service pour zones, `containsPlace` retiré) · sitemap (+/contact, champs factices retirés) · robots (+/admin/, connexion/inscription en noindex) · en-têtes de sécurité + X-Robots-Tag privé · `sizes` sur l'image À propos · icône Événementiel · H1/eyebrow avec « Coursier B2B Paris ».

## Reste à faire (nécessite une décision ou du contenu réel)
- Justifier ou retirer « 99,4 % » et « 3,5 M€ » ; vrais logos/témoignages (bandeau `Hero.tsx`).
- Enrichir les 118 pages de zones (contenu local unique) ou les regrouper/noindex.
- Page À propos/équipe, études de cas, guides ; `sameAs` + fiche Google Business Profile.
- Search Console + GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), mesure Core Web Vitals sur l'URL déployée.
