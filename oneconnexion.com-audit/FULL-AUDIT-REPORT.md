# Audit SEO — https://www.oneconnexion.com (mis à jour le 21/09/2026, 18h40)

**Score de santé SEO : 82 / 100** (72 lors du premier passage à 00h59, avant les correctifs déployés depuis)
Type d'activité : service local B2B, coursier moto (Saint-Mandé, Paris et Île-de-France). Stack : Next.js prérendu sur Vercel.
57 URL du sitemap testées, toutes en HTTP 200.

**Périmètre :** audit en direct, sans sous-agents. Non mesurés : Lighthouse/Core Web Vitals, captures d'écran, Search Console/GA4, backlinks. Le score Performance est estimé (TTFB ~0,5 s, cache CDN « HIT », prérendu).

| Catégorie | Poids | Score |
|---|---|---|
| SEO technique | 22 % | 88 |
| Qualité du contenu | 23 % | 74 |
| On-page | 20 % | 88 |
| Données structurées | 10 % | 85 |
| Performance (estimée) | 10 % | 75 |
| Visibilité IA | 10 % | 78 |
| Images | 5 % | 88 |

## Corrigé depuis le premier audit (vérifié en production)
- `/politique-de-confidentialite` existe (200), est liée depuis le pied de page et figure au sitemap.
- Titres : maximum 64 caractères (avant : jusqu'à 81), la plupart entre 45 et 60.
- Meta descriptions : 131 à 180 caractères (avant : 85 à 205), presque toutes dans la fourchette.
- `foundingDate` = `2026-02-21` (format ISO valide). `geo` (GeoCoordinates) ajouté au LocalBusiness.
- Sitemap avec `<lastmod>`. `/llms.txt` publié, avec faits clés et liens.
- Balise `meta keywords` retirée. Accueil passé de ~470 à ~720 mots avec section FAQ (8 questions).
- Données structurées ajoutées : ContactPage sur /contact, BreadcrumbList + WebPage sur /methode, /flotte, /references, BreadcrumbList sur /tarifs.

## Points forts
- Toutes les URL en 200, canoniques auto-référencées, un seul H1 par page, vraie 404.
- Chaîne de redirections propre : http → https apex → https www (308, 2 sauts).
- HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- robots.txt propre (bloque /dashboard/ et /admin/, déclare le sitemap).
- Toutes les `<img>` ont un alt. Pas de fausses notes ni faux avis dans les données structurées.
- Maillage local solide : 20 arrondissements, 15 communes, hubs /zones et /secteurs, 6 pages services.

## Constats restants

### Élevé
1. **Pages zones fortement gabaritées (35 pages, 640 à 750 mots).** Le recouvrement de textes (séquences de 5 mots) entre pages zones testées est de 33 à 44 %, avec la même structure de 7 H2. Ce n'est pas du doublon pur, mais le risque de pages satellites reste réel. Ajouter par zone du contenu réellement propre : sites et clients types de la zone, temps d'enlèvement réels, accès (périphérique, tunnels, zones piétonnes), une question FAQ locale. Passer en noindex ou fusionner les communes sans demande réelle.
2. **Aucune preuve externe (E-E-A-T).** Entreprise créée le 21/02/2026, pas de `sameAs` (LinkedIn, fiche Google), pas d'avis, pas de mentions tierces. Le statut de la fiche Google Business Profile n'a pas pu être vérifié.

### Moyen
3. **FAQPage sans effet enrichi :** depuis 2023 Google ne montre les résultats enrichis FAQ que pour les sites publics et de santé. Les 8 + 6 questions restent utiles comme contenu (et pour les moteurs IA), mais ne comptez pas sur l'affichage enrichi.
4. **/contact légère (~224 mots) et /mentions-legales (~361).** Acceptable pour ces pages ; ajouter sur /contact l'adresse, les horaires, le délai de devis (2 h) et une carte/`hasMap`.
5. **/tarifs sans schéma.** Ajouter un `Service` avec `offers` seulement si les prix sont publics et exacts ; sinon laisser tel quel.
6. **Quelques titres légèrement longs :** /secteurs (64), /zones/courbevoie (63), /tarifs (62), /zones/la-defense (62). À ramener à ≤60.
7. **Quelques meta descriptions hors fourchette :** /flotte (180, tronquée), /zones/paris-19e (134) et /zones/paris-15e (131), /zones/saint-maurice (133), un peu courtes.
8. **Lastmod uniforme :** toutes les URL portent la même date (`2026-09-21T00:00:00.000Z`), donc Google apprendra à l'ignorer. Utiliser la vraie date de dernière modification de chaque page.

### Faible
9. Pas d'en-tête Content-Security-Policy.
10. Canonique de l'accueil sans slash final (`https://www.oneconnexion.com`) : sans conséquence, cohérent avec le sitemap.
11. Le logo d'en-tête pourrait avoir un alt plus descriptif (« ONE CONNEXION, coursier B2B Paris »).
12. Aucun contenu éditorial (guides, blog) pour capter les requêtes d'information et être cité par les IA.

## Non vérifié
Core Web Vitals réels (PageSpeed/CrUX), indexation des 35 pages zones dans la Search Console, profil de backlinks, statut Google Business Profile.
