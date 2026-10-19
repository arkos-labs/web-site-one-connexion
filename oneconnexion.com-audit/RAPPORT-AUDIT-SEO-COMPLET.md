# 📊 AUDIT SEO COMPLET — oneconnexion.com
**Date:** 2026-10-19  
**Domaine:** https://www.oneconnexion.com  
**Type:** Courier B2B (Île-de-France)  
**SEO Health Score: 72/100**

---

## 📈 RÉSUMÉ EXÉCUTIF

### Situation actuelle
- ✅ **Infrastructure technique:** Excellente (88/100) — Next.js/Vercel, prerendered, edge-cached
- ✅ **Crawlabilité & indexabilité:** Bonnes — 149 URLs valides, sitemap correct
- ⚠️ **Performance:** Problématique sur mobile (51-82/100) — LCP 4-8s au lieu de <2.5s
- ⚠️ **Contenu:** Acceptable mais gaps critiques (66/100) — /references trop courte, "interlocuteur unique" toujours présent
- ⚠️ **Schema & données structurées:** 66/100 — Gaps sur OpeningHours, WebSite, Service
- ❌ **Présence de marque tiers:** Très faible (66/100) — Pas de Wikipedia, Reddit, LinkedIn, YouTube
- ⚠️ **Expérience de recherche:** 61/100 — Cannibalisation, zone pages mal typées, e-commerce page faible

### Blocages principaux (par ordre d'impact)
1. **JavaScript du main thread énorme** (3.5s evaluation) → LCP mobile 4-8s
2. **Doorway-page risk** sur les 125 pages zone (85% du site, bulk-indexed 18 oct)
3. **Cannibalisation** sur "coursier paris" et "prix coursier paris" (6 URLs)
4. **Confiance insuffisante** — Zéro mentions tiers, pas d'avis, pas de clients nommés
5. **Contenu mince** sur hubs critiques (/references 207w, /guides 149w)

### Impact attendu des fixes
- **Core Web Vitals:** Mobile LCP 4-8s → <2.5s (+34 points Lighthouse)
- **Indexation:** 125 zone pages: découvert → indexé (3-7 jours après fix)
- **CTR:** +3-5% via meta descriptions optimisées (déjà commencé)
- **Rankings:** +1-3 positions via trust signals + schema fixes

---

## 🔍 SCORES PAR DIMENSION

| Dimension | Score | État | Priorité |
|-----------|-------|------|----------|
| **SEO Technique** | 88/100 | ✅ Excellent | LOW |
| **Core Web Vitals** | 35/100 | ❌ Critique | 🔴 CRITICAL |
| **Contenu & E-E-A-T** | 66/100 | ⚠️ Acceptable | HIGH |
| **Schema & Données** | 66/100 | ⚠️ Acceptable | MEDIUM |
| **Expérience de recherche** | 61/100 | ⚠️ Moyen | HIGH |
| **Présence AI/Brand** | 66/100 | ⚠️ Faible | MEDIUM |
| **Sitemap & Indexation** | 78/100 | ✅ Bon | MEDIUM |

---

## 🚨 PLAN D'ACTION PRIORITAIRE

### PHASE 1: CORRECTIFS CRITIQUES (SEMAINE 1)

#### 1️⃣ Core Web Vitals — LCP mobile (CRITICAL)
**Enjeu:** Mobile score 51-82 vs Desktop 97-100; LCP 4-8s vs cible <2.5s

**Fixes (dans cet ordre):**

a) **Désactiver Lenis smooth scroll sur mobile** (30 min)
   - Fichier: `site/components/ClientShell.tsx`
   - Raison: RAF permanent long task (0.6s TBT)
   - Impact: -20% TBT mobile
   ```javascript
   // Pseudo-code
   const isTouch = typeof window !== 'undefined' && 
     window.matchMedia("(hover: none)").matches;
   if (!isTouch) {
     lenis = new Lenis(...);
   }
   ```

b) **Google Tag Manager — charger après consentement** (1h)
   - Fichier: `site/app/layout.tsx`
   - Raison: 119 KB, 70 KB inutilisé, 0.5s bootup
   - Solution: `next/script afterInteractive` + consentement
   ```javascript
   <Script
     src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
     strategy="afterInteractive"
     async
   />
   ```

c) **Hero video — ajouter poster + preload** (30 min)
   - Fichier: `site/components/sections/Hero.tsx`
   - Problème: 706 KB mp4 sans poster = LCP delay 1.5s
   - Solution:
     ```jsx
     <video
       poster="/hero-poster.webp" // Convertir en WebP 40-60 KB
       preload="metadata"
       fetchpriority="high"
     />
     ```
   - Impact: LCP home 4.7s → 2.8s

d) **AddressAutocomplete — lazy-load** (1h)
   - Fichier: `site/components/sections/Hero.tsx`
   - Raison: 1+ MB script, non-critique above-fold
   ```javascript
   const AddressAutocomplete = dynamic(() => 
     import('./AddressAutocomplete'), { ssr: false }
   );
   ```

e) **Favicon — réduire de 69 KB** (15 min)
   - Fichier: `public/icon.png`
   - Solution: SVG ou PNG optimisé (<5 KB)
   - Impact: -70 KB download

**Résultat attendu Phase 1:**
- Mobile LCP: 4-8s → <2.5s ✅
- Mobile score: 51 → 75+
- TBT: 420-1940ms → 200-400ms

---

#### 2️⃣ Schema & Données structurées
**Temps: 2-3h | Impact: Moyen (AI citations, AIO inclusion)**

Fichier principal: `site/app/page.tsx`, `site/components/PageSchema.tsx`

```json
// Ajouter à home
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.oneconnexion.com/#website",
  "url": "https://www.oneconnexion.com/",
  "name": "ONE CONNEXION",
  "publisher": { "@id": "https://www.oneconnexion.com/#organization" }
}

// Remplacer openingHours
"openingHoursSpecification": [{
  "@type": "OpeningHoursSpecification",
  "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  "opens": "09:00",
  "closes": "19:00"
}]

// Améliorer LocalBusiness
{
  "sameAs": [
    "https://www.wikidata.org/wiki/Q141752000",
    "https://www.linkedin.com/company/ONE-CONNEXION", // À ajouter
    "https://www.google.com/maps/place/ONE-CONNEXION", // GBP URL
    "https://www.pappers.fr/entreprise/..." // À ajouter
  ]
}
```

**Checklist:**
- [ ] Ajouter WebSite node
- [ ] Remplacer openingHours par openingHoursSpecification
- [ ] Fixer sameAs (LinkedIn, GBP, Pappers)
- [ ] Mettre à jour description schema (supprimer "interlocuteur unique")
- [ ] Ajouter Service node à home
- [ ] Valider avec Rich Results Test

---

#### 3️⃣ "Interlocuteur unique" — Purge globale
**Temps: 30 min | Impact: Trust + consistency**

Rechercher & remplacer dans:
- [ ] `og:description` (tous les fichiers page.tsx)
- [ ] `twitter:description`
- [ ] LocalBusiness description dans PageSchema
- [ ] `/references` page copy (remplacé par "Marchandise assurée")
- [ ] Meta keywords tag: **SUPPRIMER** (Google ignore)

```bash
grep -r "interlocuteur unique" site/
# Remplacer par "Marchandise assurée" partout
```

---

### PHASE 2: CONTENU & CONFIANCE (SEMAINES 2-3)

#### 4️⃣ Confiance — Ajouter preuves (Trust signals)
**Temps: 1-2 jours | Impact: +2-3 positions, +1-2% CTR**

Fichiers cibles: `/references/page.tsx`, tous `/services/*`

**Actions:**
- [ ] Ajouter **3-5 clients nommés** (avec permission) sur /references
- [ ] Ajouter **Google Business Profile reviews count** (Review schema)
- [ ] Ajouter **sample proof-of-delivery** screenshot (HTML image)
- [ ] Ajouter **insurance mention** (1 ligne par page service)
  ```
  "Assurance Marchandise complète. Couverture jusqu'à 100k€."
  ```
- [ ] Créer "/about" page: fondateur + équipe + SIREN + forme juridique
- [ ] Ajouter `Person` schema + LinkedIn pour founder

**Before/after /references:**
```
Before: 207 words, pas de clients
After: 600+ words, 3-5 case studies, Review schema, AggregateRating
```

---

#### 5️⃣ Zone pages — Fixer titles & descriptions
**Temps: 2-3h (scripted) | Impact: CTR +2-3%**

**Pattern actuel:** "Coursier Poissy 78300 - Villa Savoye"  
**Pattern nouveau:** "Coursier Poissy 78300 : livraison express dès 42€"

Fichier: `site/lib/zones/data.ts` (ou script de batch update)

```javascript
// Nouveau template
title: `Coursier ${zone.name} ${zone.postal} : livraison express dès ${price}€ TTC`,
description: `Livraison rapide à ${zone.name} (${zone.dept}). Enlèvement < 45 min, suivi GPS, remise horodatée. Dès ${price}€ TTC.`
```

**Checklist:**
- [ ] Titres < 60 caractères
- [ ] Descriptions < 155 caractères
- [ ] Ajouter prix dès 21€ (Paris) ou 42€ (petite couronne)
- [ ] Supprimer landmarks des titres (garder en body)

---

#### 6️⃣ Page e-commerce — Restructurer
**Temps: 3-4h | Impact: +2-3 positions, conversion**

Fichier: `site/app/services/livraison-e-commerce/page.tsx`

**Changes:**
```javascript
// Avant
H1: "Coursier jour"
Title: "Coursier jour : livraison same-day..."

// Après
H1: "Livraison same-day e-commerce à Paris & Île-de-France"
Title: "Livraison e-commerce same-day : dès 21€ TTC"
```

**Ajouter sections:**
- [ ] "Dès 21€ TTC dans Paris, 42€ petite couronne"
- [ ] "API & intégrations: Shopify, WooCommerce, custom"
- [ ] "Volume pricing" (bulk discount)
- [ ] "Delivery slots" (même-jour, J+1)
- [ ] "Insurance included"
- [ ] CTA: "Obtenir un tarif sans compte"

---

#### 7️⃣ /references page — Expansion 207w → 600w
**Temps: 4-5h | Impact: Trust, AIO inclusion**

**Ajouter:**
- [ ] 2-3 case studies nommés (anonyme si besoin) avec chiffres
  - Ex: "Cabinet juridique Île-de-France, 150 assignations/mois, 99.8% SLA"
- [ ] "Logotypes clients" row (6-8 logos, B&W)
- [ ] Reviews widget (Google stars + "Voir 42 avis")
- [ ] FAQ: "Qui utilise ONE CONNEXION?" (sectors list)
- [ ] Service sectors callout: 4 sectors × 100w each = 400w
- [ ] Review schema block + AggregateRating

```jsx
<AggregateRating
  ratingValue="4.8"
  reviewCount="42"
  bestRating="5"
  worstRating="1"
/>
```

---

### PHASE 3: OPTIMISATION SÉMANTIQUE (SEMAINES 3-4)

#### 8️⃣ Résoudre cannibalisation
**Temps: 2-3h | Impact: +1-2 positions**

**Query-to-page mapping:**

| Query intent | Owner page | Secundaires | Action |
|---|---|---|---|
| "coursier paris" | `/zones/paris` | `/`, `/services/coursier-express-paris` | Add rel="canonical" ou merge |
| "prix coursier paris" | `/tarifs` | `/guides/prix-coursier-express-paris` | Differentiate guide (autre angle) |
| "coursier moto paris" | `/services/coursier-moto-paris` | `/services/coursier-express-paris` | Add price "dès 31.50€" |
| "coursier médical" | `/services/transport-medical` | Zone pages medical | Zone pages add "Demander" CTA |

**Fixes:**
- [ ] Primary page: H1 + title avec query principal
- [ ] Secondary pages: Differentiate (angle unique)
- [ ] Ajouter internal links (primary → secondaires avec ancre context)
- [ ] Si duplication: vérifier canonical, sinon merger

---

#### 9️⃣ Pages zone — Ajouter signaux locaux
**Temps: 1-2 jours | Impact: +1 position avg**

Ajouter aux zone pages:

- [ ] **Embedded map** (Google Maps API ou OSM)
- [ ] **"Service area" graphic** (département + villes voisines)
- [ ] **GBP review widget** si Google Business Profile existe
- [ ] **Lien GBP** dans schema sameAs
- [ ] **"Communes voisines" block** (liens internes contextuels)
  ```
  Besoin d'un coursier à Montreuil, Vincennes ou Fontenay?
  [Coursier Montreuil] [Coursier Vincennes] [Coursier Fontenay]
  ```

---

#### 🔟 Liens internes — Ajouter equity
**Temps: 30 min | Impact: +0.5-1 position**

Home page `<main>` actuellement: 3 links  
Ajouter:

```html
<a href="/tarifs">Voir la grille tarifaire</a>
<a href="/zones/paris">Coursier Paris avec remise</a>
<a href="/guides/prix-coursier-express-paris">Comment coûte un coursier?</a>
```

Zone pages: Ajouter "communes voisines" + parent hub link

---

### PHASE 4: MONITORING (CONTINU)

#### 1️⃣1️⃣ Vérifier Core Web Vitals
**Temps: 15 min | Fréquence: Hebdo**

Outils:
- Google Search Console > Core Web Vitals
- PageSpeed Insights (https://pagespeed.web.dev)
- Vercel Speed Insights (déjà installé)

Cibles:
- LCP: <2.5s (Good)
- INP: <200ms (Good)
- CLS: <0.1 (Good)

---

#### 1️⃣2️⃣ GSC — Vérifier indexation des 125 zones
**Temps: 15 min | Fréquence: 3j après fixes**

Checklist GSC:
- [ ] Indexing > Pages: combien de 125 zones indexées?
- [ ] Coverage: "Crawled, not indexed" count
- [ ] Sitemaps: 149 discovered URLs confirmés
- [ ] Queries: tracking "coursier paris", "prix coursier"

**Alert:** Si >20 zones "Crawled, not indexed" → risque doorway page confirmed

---

#### 1️⃣3️⃣ Mesurer impact meta descriptions
**Temps: 5 min | Fréquence: 3j après optimisation**

Tracking (GSC):
- [ ] `/tarifs` CTR: 0% → target 0.8-1.2%
- [ ] `/zones/paris` CTR: 0.95% → target 2-2.5%
- [ ] `/zones/petite-couronne` CTR: 0% → target 2.5-3%
- [ ] `/transport-medical` CTR: 2.08% → target 2.5-3%

**Timeline:** 7-14 jours pour snippet refresh Google

---

## 📋 TIMELINE COMPLÈTE

```
SEMAINE 1 (MAINTENANT - 2026-10-26)
├─ Phase 1: Core Web Vitals fixes (5h)
│  ├─ Lenis disable mobile (30 min)
│  ├─ GTM afterInteractive (1h)
│  ├─ Hero poster + preload (30 min)
│  ├─ AddressAutocomplete lazy (1h)
│  └─ Favicon optimize (15 min)
├─ Phase 2a: Schema fixes (2-3h)
├─ Phase 2b: Purge "interlocuteur unique" (30 min)
└─ Commit + test Lighthouse

SEMAINE 2-3 (2026-10-27 - 2026-11-09)
├─ Phase 2c: Trust signals (/references, /about, reviews)
├─ Phase 2d: Zone titles batch update
├─ Phase 2e: E-commerce page restructure
└─ Expand /guides (3 → 8 guides)

SEMAINE 4 (2026-11-10 - 2026-11-16)
├─ Phase 3: Cannibalisation + local signals
├─ Internal linking audit + fixes
└─ GSC verification (indexation zones)

MONITORING (CONTINU)
├─ Weekly: Core Web Vitals checks
├─ 3j post-meta-update: CTR tracking
├─ Monthly: Full audit refresh
└─ Quarterly: SERP position tracking (DataForSEO)
```

---

## 💰 ROI ESTIMÉ

| Fix | Investissement | Gain estimé | Timeline |
|-----|---|---|---|
| Core Web Vitals | 5h dev | +34 Lighthouse pts, +0.5-1 pos | 2-3 jours post-deploy |
| Trust signals | 1-2j dev | +2-3 positions, +1-2% CTR | 2-4 semaines (crawl) |
| Meta descriptions | ✅ Déjà fait | +3-5% CTR | 7-14 jours |
| Zone pages | 3-4h batch | +1-2 positions/page | 3-7 jours |
| Internal links | 30 min | +0.5-1 pos home | 1-2 semaines |
| **TOTAL** | **~2-3 jours dev** | **+3-6 positions, +10-15% organic traffic** | **1-2 mois** |

---

## 📊 MÉTRIQUES DE SUCCÈS

**Avant fixes (baseline 2026-10-19):**
- Organic traffic: ~150 sessions/mois (57 zone pages non-indexées)
- Avg position (GSC): 25-35
- CTR: 2.66%
- Mobile score: 51-82
- Mobile LCP: 4-8s

**Cible 30j après fixes:**
- Organic traffic: 180-200 sessions/mois (+20-30%)
- Avg position: 18-22 (pour top keywords)
- CTR: 3.5-4% (+30-50%)
- Mobile score: 80+
- Mobile LCP: <2.5s

**Cible 90j après fixes:**
- Organic traffic: 250-300 sessions/mois (+70-100%)
- Avg position: 15-18
- CTR: 4-5%
- 100+ zone pages indexed

---

## 🔗 RESSOURCES

- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Courier Service](https://schema.org/CourierService)
- [Next.js Performance Guide](https://nextjs.org/learn/foundations/how-nextjs-works/rendering)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

---

**Rapport généré:** 2026-10-19  
**Version:** 1.0 (Complet)  
**Prochaine révision:** 2026-11-19 (post-Phase 2)

