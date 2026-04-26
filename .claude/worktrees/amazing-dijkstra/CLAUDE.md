# One Connexion — Contexte projet

## Stack
- React + Vite + TypeScript, Tailwind CSS
- Supabase (auth, DB, storage, realtime)
- Rôles : admin / client / chauffeur

## Structure src/
- `components/` — UI par rôle (admin, client, driver, shared, ui)
- `pages/` — Pages par rôle (admin, client, driver, public, legal)
- `services/` — Appels Supabase organisés par domaine
- `types/` — Types TypeScript partagés
- `utils/pricing/` — Moteur de tarification (`pricingEngine.ts`)
- `routes/` — Configuration React Router

## Règles importantes
- **Langue** : répondre en français, termes techniques en anglais
- **OrderStatus** : `pending_acceptance | accepted | assigned | driver_accepted | driver_refused | in_progress | delivered | cancelled`
- **DriverStatus** : `online | busy | offline | suspended`
- `driver_id` dans `orders` stocke l'ID Auth (pas l'ID profil)
- Realtime Supabase actif sur les orders (ne pas supprimer)

## Tâches en attente
Voir `TODO.md` — principalement actions manuelles Supabase + déploiement
