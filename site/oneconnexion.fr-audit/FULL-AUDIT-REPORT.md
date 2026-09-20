# SEO Audit — oneconnexion.fr (source-level)

**Date:** 2026-09-20 · **Scope:** Next.js 16 App Router codebase in `site/` (no live URL was crawled)
**Business type:** Local service / B2B courier (coursier moto), Île-de-France, based in Saint-Mandé (94)
**Overall SEO Health Score: 62 / 100** (estimate; Performance is inferred from assets, not measured)

## Method and limits

Read: `app/layout.tsx`, `robots.ts`, `sitemap.ts`, `next.config.ts`, `middleware.ts`, `JsonLd`, every page-level `metadata`, service/zone templates, `lib/zones/*`, `public/` asset sizes.
**Not done:** live crawl, rendered-HTML capture, Lighthouse/CrUX, Search Console, backlink data, redirect/www checks, security headers as actually served by Vercel. Anything about runtime behavior is a code-based inference.

## Score breakdown

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 62 | 13.6 |
| Content Quality | 23% | 72 | 16.6 |
| On-Page SEO | 20% | 66 | 13.2 |
| Schema | 10% | 58 | 5.8 |
| Performance (est.) | 10% | 45 | 4.5 |
| AI Search Readiness | 10% | 60 | 6.0 |
| Images | 5% | 40 | 2.0 |
| **Total** | | | **61.7 → 62** |

## Executive summary

**What works:** Metadata API used correctly with `metadataBase`; self-referencing canonicals on nearly all public pages; `robots.ts` + `sitemap.ts` generated from the same data as the pages; 4 service pages with Service + Breadcrumb + FAQ JSON-LD; 118 zone pages with unique titles/descriptions; `lang="fr"`; 404 is `noindex`; GA is gated behind cookie consent; sensible French keyword targeting ("coursier juridique Paris", "coursier Paris 1er"…).

### Top 5 issues
1. **Broken breadcrumb URLs on ~98 zone pages** — JSON-LD points to `/zones/hauts-de-seine`, `/zones/seine-saint-denis`, `/zones/val-de-marne`, which have no route (404).
2. **Heavy media** — 20 MB autoplay hero video with no `poster`; ~16 MB of unoptimized JPEG backgrounds applied via CSS `background-image` (one is 7.7 MB).
3. **No canonical on the homepage**, while the Hero generates `/?pickup=…&dropoff=…` URLs → duplicate-URL risk.
4. **No `og:image` / Twitter card anywhere**; three pages inherit the homepage's OG title/description.
5. **118 templated zone pages** built by a factory with near-identical sector blocks → thin/doorway-content risk at scale.

### Top 5 quick wins
1. Fix the zone breadcrumb (drop level 3 or create the 3 category hub routes) — ~10 min.
2. Add `alternates: { canonical: "/" }` to the root layout/home — 2 min.
3. Add `poster="/hero-poster.jpg"` + `preload="none"`/`metadata` to the hero `<video>` (file already exists) — 5 min.
4. Add `title.template` and shorten titles >60 chars — 15 min.
5. Add one default OG image + `twitter: { card: "summary_large_image" }` in the root layout — 15 min.

---

## Technical SEO (62)

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| **Critical** | Breadcrumb level 3 links to non-existent routes | `app/zones/[slug]/page.tsx:127` builds `${SITE_URL}/zones/${zone.category}`; only `paris`, `la-defense`, `petite-couronne` exist as static routes → 404 for `hauts-de-seine`, `seine-saint-denis`, `val-de-marne` | Remove the level or add `/zones/[dept]` hubs (also good internal linking) |
| **High** | Homepage has no canonical; query-string URLs generated | `app/layout.tsx` sets no `alternates`; `Hero.tsx:29` builds `/?pickup=&dropoff=#commander` | `alternates: { canonical: "/" }` on home. Prefer a form/JS handoff over query-string links |
| Medium | Sitemap omits `/contact`; `lastModified = new Date()` on every request; `changeFrequency`/`priority` are ignored by Google | `app/sitemap.ts` | Add `/contact`; use real per-page dates (git/content date) or omit |
| Medium | `/admin` not in robots disallow; `/connexion`, `/inscription` are blocked by robots but have no `noindex` | `app/robots.ts` | Add `/admin/`; add `robots: {index:false}` to dashboard/admin/auth layouts (a robots-blocked URL can still be indexed as URL-only) |
| Medium | Contact, legal pages have no canonical; `/contact` is a client page under a layout-only metadata | `app/contact/layout.tsx`, `cgv`, `mentions-legales` | Add `alternates.canonical` |
| Medium | No security headers configured | `next.config.ts` empty of `headers()` | Add CSP (report-only first), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; verify what Vercel already serves |
| Low | `next.config.ts` has `typescript.ignoreBuildErrors: true` and an `eslint` key (removed from Next 16 config) | `next.config.ts` | Not SEO, but it hides build breakage that can ship broken pages |
| Info | Middleware matcher only covers `/dashboard`, `/admin`, `/connexion`, `/inscription` → no TTFB cost on public pages | `middleware.ts` | Good, keep |

## Content Quality (72)

- **Strengths:** clear service positioning, unique intros/logistics text per zone, FAQ content on every service page, legal pages present (mentions légales, CGV), full address/phone/SIREN in schema.
- **High — unverifiable claims repeated site-wide:** "99,4 % ponctualité" appears in 8 places (Hero, flotte, zones/paris, la-defense, 3 service data files); "3,5 M€ assurance marchandises" too. If not documented, this is an E-E-A-T/trust and consumer-law risk; if documented, cite the source/period.
- **High — placeholder trust signals:** `Hero.tsx` still has `CLIENT_LOGO_SLOTS` placeholder ("logos clients à déposer avant mise en ligne"). Ship real logos/testimonials or remove the strip.
- **High — programmatic zone pages:** `lib/zones/factory.ts` stamps the same 6 sector blocks (same service links, same labels) across pages; only `example` strings differ. Google's scaled-content/doorway policies target exactly this. Add genuinely local content per page (named local courts/labs/clients served, real transit times, a local FAQ) or consolidate low-value zones into department hubs and `noindex` the remainder.
- **Medium — no About/team/"who we are" page**, no named people, no case studies; weak experience/expertise signals for a service where trust is the purchase driver.
- **Medium — no informational content** (guides/blog: "prix d'un coursier Paris", "délai de livraison plis huissier"…). All content is transactional.
- **Low:** `Événementiel` sector uses a `Stethoscope` icon (`zones/[slug]/page.tsx`) — copy/paste slip.

## On-Page SEO (66)

- No `title.template` in `app/layout.tsx`; several titles omit the brand while others hardcode it inconsistently.
- Titles over ~60 chars will truncate, e.g. `plis-confidentiels`: "Coursier juridique à Paris — plis confidentiels remis contre signature" (~72).
- Homepage H1 ("Le dernier kilomètre, tenu à l'heure depuis {year}") contains no target keyword (coursier / Paris / B2B). Keep the brand voice but put "coursier B2B à Paris" in the H1 or the first subtitle.
- `keywords` meta is ignored by Google; harmless, don't invest in it.
- `flotte`, `references`, `methode` define no `openGraph` → they inherit the **homepage** OG title/description.
- Internal linking is decent (zones ↔ services, related zones). Add department hub pages and link "Tarifs" from service pages.
- `app/contact/page.tsx` H1 present; other H1s: one per page confirmed via grep.

## Schema (58)

- **Wrong type:** `["LocalBusiness","MovingCompany"]` on home and every zone. A courier is not a moving company; use `LocalBusiness` (optionally `Organization` + `Service`). Mismatched types can suppress eligibility and confuse entity understanding.
- **118 duplicate LocalBusiness entities** (one per zone, distinct `@id`, same address/phone). Keep one canonical `#organization` on the home page and reference it: zone pages should emit `Service` with `provider: {"@id": ".../#organization"}` and `areaServed`.
- Service pages' `provider` is an anonymous `Organization` — should reference the `@id`.
- `areaServed` on zones uses `@type: "City"` with `containsPlace` of `LandmarksOrHistoricalBuildings` — landmarks aren't places served; drop `containsPlace`.
- Missing on the org: `sameAs` (LinkedIn/Google Business Profile), `image`, `geo`, `contactPoint`.
- FAQPage markup is valid but Google restricts FAQ rich results to authoritative gov/health sites; keep it for AI-answer engines, don't expect a SERP feature.
- Do **not** add `aggregateRating` unless real, visible reviews exist.
- `logo` path `/logo.png` exists ✓. `JsonLd` serializes with `JSON.stringify` inside `dangerouslySetInnerHTML` — safe here since data is first-party; escape `<` if user data ever enters it.

## Performance (45, estimated)

- **High:** `public/videos/hero-video.mp4` = **20.5 MB**, autoplay, no `poster`, no `preload` → wasted bandwidth on mobile and a poor LCP candidate. `hero-poster.jpg` (838 KB) exists but is unused. Re-encode to ≤2–3 MB (H.264/AV1, 720p, muted loop), add `poster`, `preload="metadata"`, and skip autoplay video under `prefers-reduced-motion`/Save-Data.
- **High:** page-hero backgrounds are CSS `background-image` from raw JPEGs: `services-bg-new.jpg` **7.7 MB**, `flotte-bg-new.jpg` 3.2 MB, `about-coursier.jpg` 2.7 MB, `references-bg-new.jpg` 2.7 MB, `methode-bg-new.jpg` 2.6 MB. CSS backgrounds bypass `next/image` optimization (AVIF/WebP, resizing). Switch to `next/image` with `fill`, `sizes`, `priority` for the above-the-fold one.
- **Medium:** `About.tsx` `<Image fill>` has no `sizes` → the browser assumes 100vw.
- **Medium:** Hero is a client component (`"use client"`), plus Lenis smooth-scroll runs on every page (`ClientShell`) — small but real main-thread/INP cost; consider loading Lenis only where needed and disabling for reduced motion.
- **Low:** three Google Fonts families (Archivo, Barlow Condensed, IBM Plex Mono) with 5+3+2 weights; trim weights. Fonts use `display: swap` ✓ and self-host through `next/font` ✓.
- **Low:** `Header.tsx:211` uses a raw `<img>`.
- Measure with PageSpeed/CrUX after fixing; no field data was available.

## Images (40)

- Alt text present on logos and About image ✓ (`Footer`: "ONE CONNEXION — Coursier moto B2B Paris").
- Hero video has no accessible text alternative/`aria-label`; decorative — add `aria-hidden`.
- CSS-background hero images carry no alt (decorative — acceptable) but forfeit image-search value; the only indexable content images are the About photo and logos.
- Unused assets shipped in `public/`: `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, `flotte-bg.jpg`, `references-bg.jpg`, `hero-bg.jpg`, `fleet-*.jpg` (verify usage before deleting).
- No OG/social image exists.

## AI Search Readiness (60)

- `robots.ts` allows all crawlers, including AI bots ✓ (decide deliberately whether to allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
- FAQ blocks, stat cards and short definitional paragraphs on service pages are good citation material.
- Weak: no named author/organization facts page, no third-party mentions/`sameAs`, no Google Business Profile link, no dated/sourced statistics → little for an LLM to corroborate.
- `llms.txt` is optional and not used by Google; low priority.

## Not assessed / next steps

Live crawl & rendered-HTML check, redirect behavior (apex → `www`, http → https), Core Web Vitals field data, Search Console indexation (especially how many of the 118 zone pages are indexed vs "Crawled – not indexed"), backlinks, Google Business Profile / NAP citations. Connect Search Console and run PageSpeed on the deployed URL to close these gaps.
