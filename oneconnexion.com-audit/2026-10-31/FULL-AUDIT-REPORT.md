# Audit SEO complet — www.oneconnexion.com

**Date :** 31 octobre 2026
**Périmètre :** 50 pages du sitemap (toutes indexables), plus contrôles techniques sur le domaine
**Type d'activité détecté :** service local B2B (coursier moto/scooter, zone de service Paris et Île-de-France, siège à Saint-Mandé, pas d'accueil client)

> Ce rapport décrit le site **en ligne**. Les corrections faites sur la branche `plaquette-medical` (titres, liens, répétitions de « Paris ») ne sont pas toutes en production. Certaines constatations disparaîtront après la fusion dans `main`.

---

## Score de santé SEO : 75 / 100

| Catégorie | Poids | Score | Contribution |
|---|---|---|---|
| SEO technique | 22 % | 82 | 18,0 |
| Qualité du contenu | 23 % | 68 | 15,6 |
| SEO on-page | 20 % | 75 | 15,0 |
| Données structurées | 10 % | 85 | 8,5 |
| Performance (CWV) | 10 % | 60 | 6,0 |
| Préparation recherche IA | 10 % | 80 | 8,0 |
| Images | 5 % | 75 | 3,8 |
| **Total** | | | **75** |

Le score de performance est une **estimation** : l'API PageSpeed Insights avait atteint son quota du jour, aucune mesure Lighthouse ni donnée terrain (CrUX) n'a pu être récupérée. Il repose sur le poids mesuré des ressources de l'accueil.

---

## Résumé

**Ce qui fonctionne bien**
- Les 50 pages répondent en 200, avec un temps de réponse serveur moyen de 320 ms (max 488 ms).
- Une seule balise H1 par page, aucune page sans H1.
- Canonical présente et cohérente sur les 50 pages, `index, follow` partout.
- Aucun titre ni aucune meta description en double.
- Données structurées sur 47 pages sur 50 (fil d'Ariane, FAQ, Service, Article, LocalBusiness).
- Toutes les images ont un attribut `alt`.
- En-têtes de sécurité complets (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- `robots.txt` propre, sitemap déclaré, robots des moteurs IA autorisés, `llms.txt` présent et bien rédigé.
- Les ~100 pages de villes sont en `noindex, follow` et hors sitemap : c'est cohérent avec la décision du 31 octobre (textes trop proches d'une ville à l'autre).

**Les 5 problèmes principaux**
1. **Image du Hero trop lourde ou introuvable** : en ligne, la vidéo de l'accueil pointe vers `/hero-poster.webp`, qui renvoie 404. Le fichier qui existe, `/hero-poster.jpg`, pèse 838 Ko. La correction sur la branche pointe vers ce JPG, ce qui ralentira l'affichage (LCP).
2. **Zoom bloqué sur mobile** : la balise viewport contient `maximum-scale=1, user-scalable=no`. C'est un défaut d'accessibilité que Lighthouse pénalise.
3. **15 meta descriptions trop longues** (161 à 227 caractères) : Google les coupe dans les résultats.
4. **3 titres trop longs ou maladroits** : `/methode` (« Coursier méthode : … », 71 car.), `/secteurs` (« Coursier secteurs : … », 68 car.), `/zones` (« Zones île-de-france : … », 67 car.).
5. **Pages hubs qui envoient leurs liens vers des pages non indexées** : `/zones` (153 liens), `/zones/petite-couronne` (124) et `/zones/grande-couronne` (93) pointent vers ~105 villes en `noindex`. Ces liens consomment l'autorité interne sans bénéfice dans Google.

**5 actions rapides**
1. Convertir `hero-poster.jpg` en WebP (~60–100 Ko) et pointer la vidéo dessus.
2. Retirer `maximum-scale=1, user-scalable=no` de la balise viewport.
3. Raccourcir les 15 meta descriptions à 150–155 caractères.
4. Réécrire les titres de `/methode`, `/secteurs` et `/zones`.
5. Ajouter le profil Google Business et les réseaux sociaux dans `sameAs` (seul Wikidata y figure).

---

## SEO technique — 82/100

| Contrôle | Résultat |
|---|---|
| Statut HTTP des 50 pages | 200 partout |
| Page inexistante | 404 correct |
| HTTP vers HTTPS | `http://oneconnexion.com` → `https://oneconnexion.com` → `https://www.oneconnexion.com` (2 redirections 308) |
| Domaine sans www | 308 permanent vers www |
| Canonical | présente et correcte sur 50/50 |
| Meta robots | `index, follow` sur 50/50 ; villes en `noindex, follow` |
| robots.txt | autorise tout, bloque `/dashboard/` et `/admin/`, déclare le sitemap |
| Sitemap | 50 URL, toutes avec la même `lastmod` (date du dernier déploiement) |
| Sécurité | HSTS 2 ans + includeSubDomains, CSP, nosniff, SAMEORIGIN |
| Cache CDN | Vercel, HIT sur l'accueil |

**Constatations**
- **Moyen — Chaîne de 2 redirections** depuis `http://oneconnexion.com`. Rediriger directement vers `https://www.oneconnexion.com/` (règle de domaine Vercel).
- **Moyen — `lastmod` identique pour toutes les URL** : la date change à chaque déploiement, même si la page n'a pas changé. Google finit par ignorer ce signal. Mettre la date de dernière modification réelle de chaque page.
- **Moyen — Zoom désactivé** (`user-scalable=no`) : à retirer.

## Qualité du contenu — 68/100

| Page | Mots (contenu principal) |
|---|---|
| `/contact` | 112 |
| `/mentions-legales` | 221 |
| `/guides` | 230 |
| Plage sur le site | 112 à 1 437 |

**Constatations**
- **Moyen — Page contact pauvre** (112 mots) : ajouter adresse, zone desservie, horaires, délais de réponse et un plan.
- **Moyen — Guides signés par l'organisation, pas par une personne** : `author` pointe vers l'entreprise. Pour l'E-E-A-T, ajouter un auteur nommé (fonction, expérience) et une date de mise à jour réelle (tous datés du 21 septembre).
- **Faible — Page `/guides` courte** (230 mots) : ajouter une introduction qui présente chaque guide.
- **Info — Pages de villes** : hors index. Pour les réintégrer, il faut un texte propre à chaque ville (comme pour les arrondissements). Commencer par les villes où il y a des clients.

## SEO on-page — 75/100

**Titres à revoir**

| Page | Longueur | Titre actuel |
|---|---|---|
| `/methode` | 71 | Coursier méthode : processus transparent et fiable de livraison express |
| `/secteurs` | 68 | Coursier secteurs : solutions par domaine d'activité \| ONE CONNEXION |
| `/zones` | 67 | Zones île-de-france : couverture complète de Paris et Île-de-France |

**Meta descriptions trop longues (> 160 caractères)**
`/` (161), `/services` (179), `/methode` (162), `/secteurs` (180), `/zones` (178), `/zones/la-defense` (161), `/zones/petite-couronne` (179), `/zones/grande-couronne` (195), `/cgv` (172), `/services/compte-entreprise` (203), `/services/coursier-express-paris` (227), `/services/coursier-moto-paris` (214), `/guides/transport-de-prelevements-medicaux` (169), `/guides/expedier-du-materiel-de-laboratoire` (177), `/guides/coursier-paris-banlieue` (193).

**Maillage interne**
- 61 liens par page en moyenne.
- Les hubs `/zones` (153), `/zones/petite-couronne` (124) et `/zones/grande-couronne` (93) lient ~105 villes non indexées. Garder les listes pour les visiteurs, mais envisager de les regrouper par département avec un lien vers le hub, ou d'indexer d'abord les villes qui ont un contenu propre.

## Données structurées — 85/100

| Type | Pages |
|---|---|
| BreadcrumbList | 47 |
| FAQPage | 37 |
| Service | 29 |
| Article | 5 |
| WebPage | 4 |
| LocalBusiness + Organization | 1 (accueil) |
| WebSite | 1 |
| ContactPage | 1 |

**Constatations**
- **Moyen — `sameAs` limité à Wikidata** : ajouter la fiche Google Business, LinkedIn et les annuaires où l'entreprise est inscrite.
- **Faible — Pas d'avis (`aggregateRating`)** : à ajouter seulement s'il y a des avis vérifiables affichés sur le site.
- **Info — FAQPage** : Google n'affiche plus les FAQ en résultat enrichi pour la plupart des sites. Le balisage reste utile pour les moteurs IA, pas besoin de le retirer.
- **Info — Pages légales sans schema** : normal.

## Performance — 60/100 (estimation)

Mesures Lighthouse indisponibles (quota PageSpeed dépassé). Poids mesurés sur l'accueil :

| Ressource | Poids |
|---|---|
| `/hero-poster.jpg` | 838 Ko |
| `/videos/hero-video-opt.mp4` (lecture auto) | 706 Ko |
| `/logo-google.png` (logo du schema) | 394 Ko |
| `/images/about-coursier-opt.jpg` | 167 Ko |
| HTML de l'accueil | 126 Ko |
| Scripts JS | 13 fichiers |

**Constatations**
- **Élevé — Image de couverture de la vidéo** : en ligne, elle renvoie 404 (`.webp` absent). Le JPG existant pèse 838 Ko. La convertir en WebP compressé (cible < 100 Ko) et la référencer.
- **Moyen — Logo du schema à 394 Ko** : le réduire à 512 × 512 px en PNG optimisé (< 50 Ko).
- **À faire — Mesurer** : relancer PageSpeed Insights (mobile et ordinateur) quand le quota est disponible, et vérifier les Core Web Vitals dans Search Console.

## Préparation recherche IA — 80/100

- `llms.txt` présent, clair, avec prestations, zone, horaires et contact.
- GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot et Google-Extended autorisés.
- NAP cohérent sur l'accueil : 5 Square Nungesser, 94160 Saint-Mandé, 06 66 02 67 07.
- **Moyen — Peu de signaux de marque externes** : une seule entrée `sameAs`. Les IA citent davantage les entreprises présentes sur plusieurs sources (Google Business, LinkedIn, annuaires pros, avis).

## Images — 75/100

- 100 % des images ont un `alt`.
- Images lourdes sur l'accueil (voir Performance).

---

## Limites de cet audit

- Pas de mesures Lighthouse ni de données terrain (quota PageSpeed atteint).
- Pas d'accès aux données Search Console, Analytics ou backlinks dans cette session.
- Les pages de villes (noindex) n'ont pas été auditées en détail.
- Captures d'écran non produites.
