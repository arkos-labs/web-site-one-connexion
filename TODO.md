# 📋 TODO - One Connexion

**Date de dernière mise à jour**: 2025-12-11  
**Statut actuel**: Préparation Production

---

## ✅ TÂCHES COMPLÉTÉES

### Phase 1: Consolidation & Corrections Critiques
- [x] Tarification dynamique
- [x] Consolidation moteur pricing (pricingEngine.ts)
- [x] Réparation critique Header
- [x] Mot de passe oublié
- [x] Pages légales (CGV, Mentions, Cookies)
- [x] Véhicules & Documents (backend)
- [x] Authentification admin/client
- [x] Dashboards fonctionnels
- [x] Audit et Nettoyage Web

### Phase 2: Nettoyage Codebase
- [x] Suppression code mort (dossiers examples/, pages de test)
- [x] Nettoyage routes inutilisées
- [x] Suppression fichiers temporaires

---

## 🚧 EN COURS

- [ ] Vérification des routes et du Routing
- [ ] Tests de build production
- [ ] Optimisation des performances

---

## ⏳ À FAIRE

### Corrections Mineures (1-2h)
1. **Erreur TypeScript dans Drivers.tsx**
   - Adapter le format du véhicule au type `DriverVehicle`
   - Fichier: `src/pages/admin/Drivers.tsx`

2. **Appliquer les migrations SQL**
   - `sql/add_tariff_metadata.sql`
   - `sql/add_vehicles_documents.sql`

3. **Configurer Supabase Storage**
   - Créer bucket "documents" (privé)
   - Configurer RLS policies

4. **Configurer les emails Supabase**
   - Templates Reset Password & Confirm Email
   - Site URL & Redirect URLs

### Fonctionnalités Manquantes (3-5h)
5. **Interface de gestion des véhicules (Admin)**
   - Page détail chauffeur avec liste véhicules
   - Modal ajout/modification/suppression

6. **Interface de gestion des documents (Admin)**
   - Liste documents en attente
   - Modal visualisation/approbation
   - Upload drag & drop

7. **Notifications en temps réel**
   - Supabase Realtime pour nouvelles commandes
   - Badge compteur

8. **Système de messagerie complet**
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
- [ ] Navigation GPS
- [ ] Gestion statut disponibilité
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
