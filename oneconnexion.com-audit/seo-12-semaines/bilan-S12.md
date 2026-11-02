# Bilan S12 — Plan d'action SEO oneconnexion.com

Date : 2 novembre 2026 · Périmètre : fiches S1 à S11 du plan, préparées dans le dépôt cloné
(`C:\Users\CHERK\seo-work\web-site-one-connexion`), **non poussées, non déployées**.

## 1. Statut réel

| Élément | Statut |
|---|---|
| Fiches S1 à S11 | Préparées, vérifiées en rendu local (title, H1, H2, JSON-LD, liens, mots). Pas de build complet ni de test des résultats enrichis Google. |
| Mise en ligne | **Aucune.** Les données GSC ci-dessous décrivent donc le site *avant* toute modification du plan. |
| Netlinking | **0 lien obtenu sur 18 visés** (je ne peux pas faire d'outreach). `netlinking-suivi.csv` est créé, vide. |
| Règle des 90 jours | Elle ne démarre qu'à la mise en ligne de chaque lot. Aucune évaluation de résultat n'est possible aujourd'hui. |

Conséquence : les objectifs du jalon S12 (≥150 clics/28 j, position moyenne ≤30, 12 requêtes en top 20) **ne peuvent
être ni validés ni infirmés** — ils mesurent l'effet de pages qui ne sont pas en ligne.

## 2. GSC — 28 jours (06/10 → 31/10/2026) vs baseline du plan

| Mesure | Baseline plan (04/10→31/10) | Relevé S12 (06/10→31/10) |
|---|---|---|
| Clics | 28 | 27 |
| Impressions | 2 342 | 2 224 |
| Position moyenne | 41,2 | non recalculée (série journalière fournie, 24,8 à 60,1 selon les jours) |

Lecture : plateau, comme attendu sans déploiement. Les fichiers sont dans `releves-gsc/`
(`2026-11-02-S12-releve-positions.csv`, `2026-11-02-S12-serie-journaliere.csv`).
Sources : export GSC `query × page`, 28 jours.

## 3. Positions par mot-clé du §3 (28 j)

Les cas notables (détail dans le CSV) :

| Mot-clé | Position 28 j | Réf. plan (90 j) | Remarque |
|---|---|---|---|
| pli confidentiel | 9,35 (89 imp., 0 clic) | 9,6 | Quick win n°1 : le title de S1 est la réponse prévue |
| coursier banlieue paris | 17,1 (77 imp.) | 41,9 | Déjà mieux que la baseline avant S5 |
| coursier paris banlieue | 26,3 (104 imp.) | 33,1 | Objectif plan S8 : ≤ 28 → **déjà atteint** |
| courses en ligne charenton le pont | 7,7 | 7,7 | Page zone existante, rien à faire |
| tarif coursier paris | 36,9 | 50,4 | Plus proche de l'objectif ≤ 35 à J+30 |
| prix coursier paris | 39,3 (/tarifs) | 49,4 | |
| coursier ile de france | 38,4 (accueil) | 62,8 | |
| coursier express paris | 66,5 (via /zones/paris) | 61,5 | La page express n'a qu'1 impression : à surveiller |
| coursier urgent paris | absent | — | La page est en ligne mais ne ressort pas encore |

Requêtes encore sans page cible qui ressorte : `coursier pour transport de sang réfrigéré` (63 imp. sur
`transport-medical`, pos. 71 → la nouvelle page S9 doit reprendre la requête), `livraison le jour même b2b`
(7 imp. sur `livraison-e-commerce`, pos. 32,6 → la page S10 doit la reprendre).

## 4. Contrôle de cannibalisation (une seule URL par requête)

**Le critère « aucune requête servie par deux URLs » n'est pas satisfait aujourd'hui.** Plusieurs requêtes sont servies
par 2 ou 3 URLs :

| Requête | URLs concernées (impressions, position) | Action prévue |
|---|---|---|
| coursier ile de france | `/` (47, 38) · `/zones/paris` (26, 86) · `/tarifs` (24, 79) | Cible : l'accueil. S7 rapproche l'accueil de la requête ; surveiller `/zones/paris` |
| prix coursier paris | `/tarifs` (69, 39) · `/zones/paris` (62, 52,5) | `/tarifs` + guide S2/S11 ; retirer les occurrences « prix » de `/zones/paris` si l'écart persiste |
| tarif coursier paris | `/tarifs` (89, 37) · `/zones/paris` (56, 54) | Idem |
| coursier paris banlieue / banlieue paris | `/zones/petite-couronne` (104, 26) · `/zones/paris` (23, 71) | S5 renforce `petite-couronne` ; S7 n'a gardé qu'une mention de « banlieue » sur `/zones/paris` |
| coursier pour transport de sang réfrigéré | `transport-medical` (63) · 2 guides (16 + 14) | La page S9 `transport-prelevements-sang` devient la cible ; à mesurer à J+45 |
| expédition / livraison internationale / b2b laboratoire | guide labo (pos 5-7, peu d'imp.) · `transport-medical` (pos 56-62, plus d'imp.) | À arbitrer à J+60 : le guide ressort mieux mais capte peu |
| coursier express paris | `/zones/paris` (48, 66) · `/services/coursier-express-paris` (1, 70) | La page express doit prendre la requête après S6 |

Nouveau risque créé par le plan : le guide S11 `combien-coute-un-coursier-a-paris` et le guide S2
`prix-coursier-express-paris` visent des requêtes proches. Contrôle à J+60.

## 5. Contrôle des 20 meta descriptions d'arrondissements

**3 sur 20 sont uniques** (17e, 15e, 8e). Les 17 autres partagent encore le même patron
(« Coursier dans le Ne arrondissement de Paris : une course dédiée… »). Critère FAIT SI non atteint : prévu pour S13–S18
(§ plan S13–S24), à raison de 3 pages par semaine comme l'impose la fiche 4.14.

## 6. Écarts assumés par rapport au plan

1. **Horaires** : le plan affirme « 7j/7, 7h–23h ». Vous avez choisi de le conserver. Le reste du site, le chatbot, le pied de page,
   le Hero, la FAQ et l'About de l'accueil affichent encore **lundi–samedi, 9h–19h** (une cinquantaine d'endroits (55 lignes), listés dans
   `harmonisation-horaires.md`). Les pages modifiées disent maintenant l'inverse des pages non modifiées, parfois sur la même URL
   (l'accueil, par exemple). Les données structurées de l'accueil annoncent aussi 7j/7 07:00–23:00.
2. « Commande avant 15h » (S10) : non reprise, aucune heure limite n'existe sur le site.
3. « Mettre en place un compte en 3 étapes » (S10) : non repris, la page décrit 5 étapes.
4. « Facturation mensuelle » (S10) : non reprise, non documentée.
5. H1 de `coursier-express-paris` laissé tel quel (le texte du plan diffère du H1 en ligne).
6. Modèle de page étendu (outline.extraSections, extraH2, landing avec FAQ/offres, guide `faqHeading`) pour atteindre les 5 ou 6 H2
   demandés. Les autres pages ne changent pas.
7. Pas de test des résultats enrichis Google ni de build complet : le plan demande de valider chaque JSON-LD avant mise en ligne.

## 7. Ordre de mise en ligne conseillé

Les branches sont empilées (`seo/s1-…` → `seo/s11-…`). Pour respecter « 1 déploiement par jour, 2 pages par semaine », fusionner
une branche par semaine, dans l'ordre, et noter la date dans `changelog-seo.md` :

| Semaine de mise en ligne | Branche à fusionner | Pages |
|---|---|---|
| D1 | `seo/s1-plis-confidentiels` | /methode (correctif), /services/plis-confidentiels |
| D2 | `seo/s2-tarifs` | /tarifs, guide prix |
| D3 | `seo/s3-arrondissements` | /zones/paris-17e, paris-15e |
| D4 | `seo/s4-methode` | /zones/paris-8e, /methode |
| D5 | `seo/s5-petite-couronne` | /zones/petite-couronne |
| D6 | `seo/s6-express-urgent` | express, urgent |
| D7 | `seo/s7-accueil-paris` | accueil, /zones/paris |
| D8 | `seo/s8-defense-flotte` | La Défense, /flotte |
| D9 | `seo/s9-secteurs-sang` | /secteurs, nouvelle page prélèvements sanguins |
| D10 | `seo/s10-jour-meme` | nouvelle page jour même, compte entreprise |
| D11 | `seo/s11-ecommerce-guide` | e-commerce, nouveau guide |

Avant D1 : décider la question des horaires (point 6.1), sinon D1 à D11 exposent progressivement des promesses incohérentes.
Après chaque fusion : relever le sitemap, soumettre les nouvelles URLs dans GSC, ajouter la date au changelog.

## 8. Ce qui reste à faire de votre côté

- Décision sur les horaires, puis harmonisation (voir `harmonisation-horaires.md`).
- Fusion/déploiement hebdomadaire des branches, et passage des JSON-LD au test des résultats enrichis.
- Netlinking : 18 liens thématiques (voir `plan-S13-S24.md`), à suivre dans `netlinking-suivi.csv`.
- Relevés GSC à D4, D8, D12 (28 j glissants) dans `releves-gsc/`.
