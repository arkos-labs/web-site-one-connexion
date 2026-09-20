# Dashboard Admin — Design

## Objectif
Donner à l'admin un espace unique pour piloter toute l'entreprise : dispatcher
les courses (ponctuelles et navettes récurrentes), gérer les chauffeurs, voir
les clients, et suivre le chiffre d'affaires.

## Accès & rôles
- La table `profiles` existe déjà (`id`, `full_name`, `company`, `phone`,
  `siret`, `vat_number`, `billing_address`, `created_at`). On ajoute une
  colonne `role TEXT NOT NULL DEFAULT 'client'` (contrainte CHECK
  `role IN ('client','admin')`).
- Middleware étendu : les routes `/admin/*` exigent `role = admin` (lecture du
  profil), sinon redirection vers `/dashboard`.
- Promotion en admin : faite manuellement en SQL après coup (pas d'UI pour
  ça dans ce scope).
- **Bouton de connexion sans identification (temporaire, dev only)** : sur la
  page `/connexion`, un bouton "Accès admin (dev)" qui appelle une route
  serveur créant/réutilisant une session via un compte admin fixe (seed), sans
  saisir de mot de passe. Visible uniquement quand
  `NEXT_PUBLIC_DEV_ADMIN_BYPASS=true` (variable d'env, absente/false en
  production). But : itérer vite pendant le dev, à retirer avant mise en
  production réelle.

## Nouvelles tables / colonnes
- `drivers` : `id`, `name`, `phone`, `vehicle`, `status`
  (`disponible` | `en_course` | `hors_service`), `notes`, `created_at`.
- `orders` : ajout de `driver_id` (FK → drivers, nullable). Le prix existe
  déjà (`price_estimate`, numeric nullable) — pas de nouvelle colonne.
- `navettes` : ajout de `driver_id` (FK → drivers, nullable) — assignation par
  défaut du modèle (voir "Dispatch" ci-dessous pour la vue unifiée). Le prix
  existe déjà (`estimated_price`).

## RLS
- Policies admin ajoutées sur `orders`, `navettes`, `drivers`, `profiles` :
  un utilisateur avec `role = admin` peut SELECT/UPDATE toutes les lignes
  (en plus des policies existantes restreignant les clients à leurs propres
  lignes).

## Pages `/admin`
- `/admin` — vue d'ensemble : CA du jour/mois, nb courses en cours, nb
  chauffeurs disponibles, courses non dispatchées en alerte.
- `/admin/courses` — **vue unique de dispatch** : liste fusionnée des
  commandes ponctuelles (`orders`) et des occurrences de navettes
  (`navettes`), avec pour chaque ligne :
  - type (ponctuelle / navette récurrente),
  - statut dispatché (oui si `driver_id` renseigné, sinon "à dispatcher"),
  - assignation/réassignation de chauffeur inline,
  - changement de statut de la course (`en_attente`, `confirmee`, `en_cours`,
    `livree`, `annulee` — valeurs déjà contraintes en base pour `orders`),
  - filtres : statut, type, dispatché/non dispatché.
- `/admin/navettes` — gestion des **modèles** de navettes récurrentes (créer,
  modifier, désactiver) ; pas de dispatch ici (renvoie vers `/admin/courses`).
- `/admin/chauffeurs` — CRUD chauffeurs, statut dispo/occupé, historique des
  courses par chauffeur.
- `/admin/clients` — liste des clients (`profiles` + agrégats : nb commandes,
  CA généré).
- `/admin/chiffre-affaires` — CA agrégé (jour/semaine/mois) à partir de
  `orders.price_estimate` (hors statut `annulee`) + estimation navettes
  (`navettes.estimated_price` × occurrences, navettes `active` uniquement).

## Navigation
- Nouvelle entrée de nav admin (séparée de `DASHBOARD_NAV_ITEMS` client),
  visible uniquement si `role = admin`.

## Hors scope
- Compte chauffeur connecté (vue chauffeur dédiée) — chauffeurs gérés
  uniquement par l'admin pour l'instant.
- Facturation réelle liée aux paiements — le CA reste une estimation basée
  sur les prix saisis.
- UI de promotion admin — reste une opération SQL manuelle.
