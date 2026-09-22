# Changements SEO appliqués — oneconnexion.com (21–22/09/2026)

## Résumé
**Score de santé SEO :** 72 → 82/100  
**Spam boilerplate éliminé** sur 57 pages  
**12 mots-clés prioritaires identifiés** (à ajouter)

---

## 1️⃣ Spam nettoyé ✓ FAIT

### Footer (100% identique avant)
- ❌ SIREN 101 517 100 → retiré du texte visible
- ✅ Taglines diversifiées par page (14 variantes uniques)
  - Accueil : « Livraisons urgentes pour cabinets juridiques... »
  - Tarifs : « Des tarifs clairs et adaptés à vos volumes »
  - Paris : « Paris intramuros livré en moins de 45 minutes »
  - Petite couronne : « Petite couronne couverte 24/7 »
  - Services : « Plis confidentiels, transport médical, livraison e-commerce »
  - (+ 9 autres)

### Navigation
- ❌ Retirer : « Guides pratiques », « Références clients »
- ✅ Navigation réduite de 8 à 6 liens du footer

**Code changé :** `site/components/Footer.tsx` (commit 815b5a0)

---

## 2️⃣ Mots-clés manquants à ajouter (prochaine étape)

### Priorité 1 : Termes de prix/coût (volume élevé, CPC fort)
| Mot-clé | Vol. | CPC | Page | Note |
|---|---|---|---|---|
| coursier paris pas cher | 320 | 5,30 € | /tarifs | KGR 0,20 (très accessible) |
| prix coursier paris | 90 | 2,20 € | /tarifs | À ajouter en H2 |
| tarif coursier paris | 140 | 1,90 € | /tarifs | À ajouter dans le titre |

### Priorité 2 : Localisation (zones manquantes)
| Mot-clé | Vol. | CPC | Page | Note |
|---|---|---|---|---|
| coursier paris banlieue | 210 | 5,85 € | /zones/petite-couronne | KGR 0,89 (accessible) |

### Priorité 3 : Services mal positionnés
| Mot-clé | Vol. | CPC | Page | Note |
|---|---|---|---|---|
| service coursier paris | 110 | 5,88 € | /services | Inverser mot-clés |
| livraison coursier paris | 30 | 12,91 € | /services/livraison-e-commerce | CPC le plus élevé |
| coursier paris urgent | — | — | accueil + /services/plis | Expression absente |

### À ignorer (hors cible B2B)
- Emploi (recrutement 90, devenir coursier 30) = candidats, pas clients
- Particuliers (« pour particulier » 90, « pas cher particulier ») = hors profil
- Autres villes (Lille, Lyon, Marseille, etc.)
- Concurrents (Glovo, Stuart)

**Données :** `oneconnexion.com-audit/MOTS-CLES-MANQUANTS.md`

---

## 3️⃣ Audit complété

### Points forts confirmés
- ✓ Crawlabilité 100% (57/57 URLs en 200)
- ✓ Canoniques auto-référencées
- ✓ HSTS, X-Content-Type-Options, X-Frame-Options
- ✓ Pas d'avis faux, pas de cloaking
- ✓ Structured data propre (LocalBusiness, Service, BreadcrumbList)
- ✓ Toutes les images avec alt
- ✓ Sitemap avec lastmod (depuis hier)
- ✓ /llms.txt publié avec faits clés
- ✓ /politique-de-confidentialite existe et est liée

### À améliorer encore (medium term)
- Diversifier les descriptions SEO des zones (data-77.ts, data-78.ts) : « traçabilité complète » répétée 15x
- Enrichir les pages zones avec contenu vraiment local (clients types, FAQ locale)
- 9 communes en noindex (Rueil, Saint-Cloud, etc.) : à ré-évaluer avec Search Console
- Créer/vérifier la fiche Google Business Profile
- Ajouter LinkedIn à sameAs
- Collecter de vrais avis pour aggregateRating

**Rapports complets :**
- `FULL-AUDIT-REPORT.md` : findings détaillés par catégorie
- `ACTION-PLAN.md` : plan par priorité (critique, élevé, moyen, faible)

---

## 4️⃣ Prochaines étapes recommandées

### Semaine 1 (urgent)
1. Ajouter les 12 mots-clés prioritaires dans les titres/H1/descriptions (cf. plan détaillé)
2. Connecter Search Console pour vérifier indexation (57 URLs)

### Semaine 2-4
3. Enrichir les pages zones avec du contenu unique (clients, accès, FAQ)
4. Créer Google Business Profile + LinkedIn
5. Diversifier les descriptions des zones (retirer « traçabilité complète » 15x)

### Après 4-8 semaines
6. Mesurer dans Search Console : requêtes, positions, clics
7. Lancer PageSpeed/CrUX pour Core Web Vitals réels
8. Ajuster titres/descriptions si besoin

---

## 📊 Estimations d'impact

| Action | Impact estimé | Timeline |
|---|---|---|
| Ajouter 12 mots-clés | +50–100 visites/mois | 4–8 semaines |
| Enrichir 35 pages zones | +100–200 visites/mois | 8–12 semaines |
| GBP + avis vrais | +30–50 visites/mois | 4–8 semaines |
| **Total cumulé** | **+180–350 visites/mois** | **12 semaines** |

Baseline actuelle : ~10–20 visites/mois (nouveau site, pas de backlinks). Cible modeste mais réaliste sans link building agressif.

---

## 🔗 Fichiers liés

- [MOTS-CLES.md](MOTS-CLES.md) — Tous les mots du site (80 simples + 80 expressions)
- [MOTS-CLES-MANQUANTS.md](MOTS-CLES-MANQUANTS.md) — Mots-clés du CSV non présents + stratégie
- [SPAM-A-NETTOYER.md](SPAM-A-NETTOYER.md) — Boilerplate détecté et solutions appliquées
- [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md) — Audit complet 0–100 par catégorie
- [ACTION-PLAN.md](ACTION-PLAN.md) — Plan priorisé (critique, élevé, moyen, faible)
