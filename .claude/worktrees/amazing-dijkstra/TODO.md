# TODO - One Connexion

**Statut**: Production-Ready (phases 1-3 complètes)

---

## Actions manuelles requises (Supabase)

- [ ] Configurer Site URL & Redirect URLs dans Supabase Dashboard
- [ ] Exécuter `sql/align_with_driver_app.sql` dans Supabase
- [ ] Modifier `Dispatch.tsx` lignes ~158, ~322, ~558 : `'dispatched'` → `'assigned'`
- [ ] Tester l'assignation, l'acceptation et le refus de courses

---

## Fonctionnalités manquantes

- [ ] Interface admin : gestion véhicules (liste, ajout, modification, suppression)
- [ ] Interface admin : gestion documents (approbation, visualisation, upload)
- [ ] Système de messagerie (conversations, lu/non-lu, pièces jointes)

---

## Déploiement

- [ ] Build production (`npm run build`) + tests locaux
- [ ] Configuration variables d'environnement prod
- [ ] Déploiement Vercel/Netlify + DNS + HTTPS

---

## Optionnel

- [ ] Sécurité : audit, rate limiting, validation serveur, performances
- [ ] UI/UX : responsive mobile, animations, mode sombre, graphiques
- [ ] App Chauffeur (dashboard, GPS, historique) — ~40-60h
