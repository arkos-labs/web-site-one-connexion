# Plan S13 → S24 — oneconnexion.com

Principe : ce plan suppose que S1 à S11 sont en ligne (voir `bilan-S12.md` §7). **Les semaines S13+ se comptent à partir de
la mise en ligne de D11**, pas du calendrier du 2 novembre. Règles inchangées : 1 déploiement par jour, 2 pages par semaine
(3 pour les arrondissements, seul cas autorisé par la fiche 4.14), aucune évaluation avant 90 jours, `backup/` avant chaque modif.

## Phase 4 — Finir ce qui est engagé (S13 → S18)

| Sem. | Action | FAIT SI |
|---|---|---|
| S13 | Meta descriptions uniques : paris-1er, paris-2e, paris-3e (lieux propres issus de `lib/zones/paris-local.ts`) | 6 / 20 uniques |
| S14 | paris-4e, paris-5e, paris-6e | 9 / 20 |
| S15 | paris-7e, paris-9e, paris-10e | 12 / 20 |
| S16 | paris-11e, paris-12e, paris-13e | 15 / 20 |
| S17 | paris-14e, paris-16e, paris-18e | 18 / 20 |
| S18 | paris-19e, paris-20e | 20 / 20 : aucune meta description identique dans `/zones/` |

Mécanisme déjà en place : `ARRONDISSEMENT_DESCRIPTIONS` dans `lib/zones/plan.ts`. Chaque description cite ≥ 3 lieux de l'arrondissement
et ≤ 160 caractères.

## Phase 5 — Mesurer et corriger (S19 → S21)

| Sem. | Action | Déclencheur |
|---|---|---|
| S19 | Relevé GSC complet (28 j) sur les pages de D1 à D4 ; contrôle de cannibalisation (voir `bilan-S12.md` §4) | ≥ 90 jours après D1 pour les pages D1 |
| S20 | Si `/zones/paris` garde `prix`/`tarif` en concurrence avec `/tarifs` : retirer les occurrences de prix de `/zones/paris` | Écart de position < 10 entre les deux URLs |
| S21 | Arbitrage guide labo / `transport-medical` sur les requêtes laboratoire ; arbitrage guide S2 / guide S11 | Une requête servie par deux URLs depuis > 30 jours |

## Phase 6 — Vague 4, uniquement si les données le justifient (S22 → S24)

| Sem. | Action | Condition |
|---|---|---|
| S22 | Évaluer « coursier paris » / « coursier dans paris » (2 400 recherches/mois chacune) sur `/zones/paris` | Position ≤ 30 sur ≥ 1 des deux |
| S23 | Compléter le contenu de `/zones/paris` (parcours d'un envoi, quartiers) sans dupliquer `/zones/petite-couronne` | Condition S22 remplie |
| S24 | Bilan S24 : relevé 28 j, positions du §3, nouveau plan 12 semaines | — |

Interdits maintenus : pas de pages villes supplémentaires avant d'avoir différencié les 20 arrondissements (S18 terminée) ; pas de
« pas cher » ni « vélo » ; pas de pages aéroports.

## Netlinking (en parallèle, ~1,5 lien/semaine)

18 liens visés, aucun obtenu. Suivi dans `netlinking-suivi.csv`. Répartition d'ancres : 50 % marque/URL nue, 30 % génériques,
20 % exactes (max. 2 liens avec la même ancre exacte). Cibles dans l'ordre de rendement : annuaires B2B locaux (4), presse logistique
(3), partenariats métiers juridique/santé (3), fédérations sectorielles (2), tribunes invitées (2), mentions presse locale (2),
guides locaux qualitatifs (2).
Jalons : ≥ 5 liens « obtenus » à D4, ≥ 11 à D8, ≥ 18 à D12.

## Relevés GSC à produire

Dans `releves-gsc/` : export 28 j glissants à D4, D8, D12 et S19, avec la même structure que
`2026-11-02-S12-releve-positions.csv` (mot-clé, page, impressions, clics, position, position de référence).
