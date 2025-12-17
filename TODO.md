# 📋 TODO - One Connexion

**Date de dernière mise à jour**: 2025-12-17
**Statut actuel**: Production-Ready

---

## 🔥 PRIORITÉS ACTUELLES

### ✅ Base de Données (Terminé)
- [x] Exécuter `00_wipe_everything.sql` (Remplacé par `repair_database_complete.sql`)
- [x] Exécuter `01_init_drivers_core.sql` (Inclus dans repair)
- [x] Tester inscription chauffeur
- [x] Tester connexion chauffeur
- [x] Réparer compte admin (RLS & Permissions fixés)
- [x] Fix Bug 406 & Auto-création profil Client
- [x] Setup Supabase Trigger for User Profile
- [x] Fix RLS Policies for Orders Table
- [x] Suppression des scripts SQL du dépôt (Backup sécurisé dans sql/_archive/)

### Phase 1: Consolidation & Corrections Critiques
- [x] Tarification dynamique
- [x] Consolidation moteur pricing (pricingEngine.ts)
- [x] Réparation critique Header
- [x] Mot de passe oublié
- [x] Pages légales (CGV, Mentions, Cookies)
- [x] Véhicules & Documents (backend)
- [x] Authentification admin/client
- [x] Authentification Multi-rôles
- [x] Inscription Utilisateurs
- [x] Seed SQL Users
- [x] Dashboards fonctionnels
- [x] Audit et Nettoyage Web

### Phase 2: Nettoyage Codebase
- [x] Suppression code mort (dossiers examples/, pages de test)
- [x] Nettoyage routes inutilisées
- [x] Suppression fichiers temporaires
- [x] Nettoyage complet src/ et sql/ (14/12/2024)
  - Suppression composants inutilisés (QuickOrderForm, CreateClientForm)
  - Archivage scripts SQL temporaires (105 fichiers → sql/_archive/)
  - Conservation uniquement des scripts essentiels (28 fichiers actifs)
  - Suppression dossier examples/ et documentation temporaire (40+ fichiers .md)
  - Projet ultra-propre et production-ready
- [x] Nettoyage final - Suppression pollution cachée (14/12/2024)
  - Suppression dossier .gemini/
  - Dossier sql/ maintenu minimal (README.md uniquement)
  - Code source 100% propre et prêt pour production

### Phase 3: Gestion Base de Données
- [x] Création du script de nettoyage total (Wipe DB) - `00_wipe_everything.sql`
- [x] Architecture DB : Tables Profiles & Drivers créées
- [x] Architecture DB : Trigger d'inscription Chauffeur actif
- [x] Architecture DB : Tables Véhicules & Documents créées
- [x] Module Client (Tables orders, invoices)
- [x] Module Admin (Tables admins, permissions - géré via backup)

---

## 🚧 EN COURS

- [x] Vérification des routes et du Routing
- [ ] Test de connexion Auth
- [ ] Tests de build production
- [ ] Optimisation des performances

---

## ⏳ À FAIRE

### Corrections Mineures (1-2h)
1. **Erreur TypeScript dans Drivers.tsx** ✅
   - [x] Adapter le format du véhicule au type `DriverVehicle`
   - Fichier: `src/pages/admin/Drivers.tsx`

2. **Appliquer les migrations SQL** ⏳
   - [x] Exécuter `sql/add_tariff_metadata.sql` dans Supabase
   - [x] Exécuter `sql/add_vehicles_documents.sql` dans Supabase
   - [x] Base de données synchronisée (repair_database_complete.sql exécuté) ✅
   - [x] Base de données synchronisée (repair_database_complete.sql exécuté) ✅
   - [x] Correction droits création commande (RLS Policy INSERT) ✅
   - [x] Fix Création Client CRM (Suppression contrainte FK clients_id_fkey) ✅
   - [x] Fix Création Chauffeur (RPC Signature & Colonnes manquantes) ✅
   - [x] Fix Colonne Username manquante dans Drivers ✅
   - [x] Guide de configuration complet
   - [ ] Site URL & Redirect URLs (à configurer dans Supabase)

3. **Configurer Supabase Storage** ✅
   - [x] Créer bucket "documents" (privé) - À configurer dans Supabase Dashboard
   - [x] Service storageService.ts créé et 100% fonctionnel
     - Upload avec validation (max 5MB, formats: JPG, PNG, WEBP, PDF)
     - Suppression de fichiers
     - Récupération d'URLs publiques
     - Gestion d'erreurs complète
   - [x] Intégration frontend dans DocumentManager.tsx (drag & drop, progress bar)
   - Note: Les RLS policies du bucket doivent être configurées manuellement dans Supabase

4. **Configurer les emails Supabase** ✅
   - [x] Templates Reset Password & Confirm Email
   - [x] Templates HTML modernes et responsive
   - [x] Versions texte (fallback)
   - [x] Guide de configuration complet
   - [ ] Site URL & Redirect URLs (à configurer dans Supabase)

### Fonctionnalités Manquantes (3-5h)
5. **Interface de gestion des véhicules (Admin)**
   - Page détail chauffeur avec liste véhicules
   - Modal ajout/modification/suppression

6. **Interface de gestion des documents (Admin)**
   - Liste documents en attente
   - Modal visualisation/approbation
   - Upload drag & drop

7. **Notifications en temps réel** ✅
   - [x] Supabase Realtime pour nouvelles commandes
   - [x] RLS & Realtime Orders (Drivers specific access)
   - [x] Mise à jour automatique de toutes les pages
   - [x] Plus besoin de rafraîchir manuellement
   - [x] Badge compteur en temps réel
   - [x] Dispatch Realtime avec Toast de confirmation (driver_accepted, in_progress)
   - [x] Gestion désassignation Realtime (driver_refused → colonne "En Attribution" + Badge REFUSÉE + bouton Réattribuer)

8. **Alignement avec l'App Chauffeur** ✅
   - [x] OrderStatus unifié : 'pending_acceptance' | 'accepted' | 'assigned' | 'driver_accepted' | 'driver_refused' | 'in_progress' | 'delivered' | 'cancelled'
   - [x] DriverStatus unifié : 'online' | 'busy' | 'offline' | 'suspended'
   - [x] driver_id dans orders stocke l'ID Auth (user_id) pour correspondre à l'App Chauffeur
   - [x] Statut 'assigned' au lieu de 'dispatched' lors de l'assignation

9. **Système de messagerie complet**
   - Conversations groupées
   - Marquage lu/non lu
   - Pièces jointes

---

## 🎨 AMÉLIORATIONS UI/UX (Optionnel)

- [ ] Améliorer responsive mobile
- [ ] Animations et transitions
- [ ] Mode sombre
- [ ] Statistiques avancées (graphiques)

---

## 🔒 SÉCURITÉ & PERFORMANCE (Avant Production)

- [ ] Audit de sécurité complet
- [ ] Validation inputs côté serveur
- [ ] Rate limiting API
- [ ] Optimisation des performances
  - Lazy loading composants
  - Code splitting
  - Optimisation images
  - Mise en cache

---

## 📦 DÉPLOIEMENT

- [ ] Build de production (`npm run build`)
- [ ] Tests du build localement
- [ ] Configuration variables d'environnement prod
- [ ] Déploiement Vercel/Netlify
- [ ] Configuration DNS et domaine
- [ ] Activation HTTPS/SSL

---

## 📚 DOCUMENTATION

- [ ] README.md complet
- [ ] Guide utilisateur (Admin/Client)
- [ ] Documentation API/Services

---

## 🔵 PHASE 6: APP CHAUFFEUR (TRÈS OPTIONNEL - 40-60h)

- [ ] Dashboard chauffeur
- [ ] Acceptation de courses
- [x] Refus de course & Reset disponibilité
- [x] Historique des refus (qui a refusé, combien de fois)
- [ ] Navigation GPS
- [x] Gestion statut disponibilité
- [ ] Historique livraisons
- [ ] Gestion documents personnels

---

## 📊 TEMPS ESTIMÉ

```
┌─────────────────────────────────────────┐
│ ESTIMATION DES TEMPS                    │
├─────────────────────────────────────────┤
│ Corrections mineures:    1-2h           │
│ Fonctionnalités:         3-5h           │
│ UI/UX (optionnel):       3-4h           │
│ Sécurité & Perf:         2-3h           │
│ Déploiement:             2-3h           │
├─────────────────────────────────────────┤
│ MINIMUM (urgent):        6-10h          │
│ RECOMMANDÉ:              11-17h         │
│ AVEC APP CHAUFFEUR:      51-77h         │
└─────────────────────────────────────────┘
```

---

## 🎯 PROCHAINE ACTION RECOMMANDÉE

**Option A**: Finir les corrections mineures (1-2h)  
**Option B**: Préparer le déploiement (2-3h)  
**Option C**: Continuer développement fonctionnalités (3-5h)
