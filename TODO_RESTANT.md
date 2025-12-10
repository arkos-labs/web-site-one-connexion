# 📋 TODO - Tâches Restantes (Hors Paiements)

**Date**: 2025-12-07  
**Statut**: En cours

---

## 🔴 PRIORITÉ HAUTE

### 1. ✅ Paramètres Admin - Logique Réelle
**Fichier**: `src/pages/admin/Settings.tsx`  
**Statut**: ✅ **TERMINÉ**
- [x] Connecter le profil admin à Supabase
- [x] Implémenter la modification du mot de passe
- [x] Créer la table `tariff_metadata` pour les tarifs dynamiques
- [x] Connecter les inputs de tarification à la base de données
- [x] Créer le service `settingsService.ts`

### 2. ✅ Moteur de Tarification Dynamique
**Fichier**: `src/utils/pricingEngineNew.ts`  
**Statut**: ✅ **TERMINÉ**
- [x] Modifier `calculateOneConnexionPrice` pour accepter une config dynamique
- [x] Ajouter interface `PricingConfig` avec `bonValueEur` et `supplementPerKmBons`
- [x] Mettre à jour tous les appels à cette fonction dans le projet
- [x] Créer le helper `pricingConfigLoader.ts` avec cache
- [x] Intégrer dans `CommandeSansCompte.tsx` et `OrderWithoutAccount.tsx`

### 3. ✅ Page "Mot de Passe Oublié"
**Fichier**: `src/pages/ForgotPassword.tsx`  
**Statut**: ✅ **TERMINÉ**
- [x] Créer le composant avec formulaire email
- [x] Intégrer `supabase.auth.resetPasswordForEmail()`
- [x] Ajouter validation Zod
- [x] Design cohérent avec le reste du site
- [x] Messages de confirmation/erreur
- [x] Page de réinitialisation (`/reset-password`)

---

## 🟡 PRIORITÉ MOYENNE

### 4. 📜 Pages Légales (Contenu Statique)
**Statut**: ❌ À FAIRE

#### 4.1 CGV (Conditions Générales de Vente)
**Fichier**: `src/pages/CGV.tsx`
- [ ] Rédiger le contenu légal
- [ ] Intégrer dans le composant existant
- [ ] Ajouter la mise en forme

#### 4.2 Mentions Légales
**Fichier**: `src/pages/MentionsLegales.tsx`
- [ ] Rédiger les mentions légales
- [ ] Informations société (SIRET, adresse, etc.)
- [ ] Hébergeur, directeur de publication

#### 4.3 Politique de Cookies
**Fichier**: `src/pages/Cookies.tsx`
- [ ] Rédiger la politique
- [ ] Lister les cookies utilisés
- [ ] Expliquer l'utilisation

### 5. 🚗 Gestion des Chauffeurs - Compléments
**Fichier**: `src/pages/admin/Drivers.tsx`  
**Statut**: 🟡 PARTIEL

#### 5.1 Informations Véhicule
- [ ] Créer table `vehicles` dans Supabase
- [ ] Ajouter colonnes: `brand`, `model`, `plate_number`, `vehicle_type`
- [ ] Lier à la table `drivers` (foreign key)
- [ ] Afficher dans l'interface
- [ ] Permettre l'ajout/modification

#### 5.2 Documents Chauffeurs
- [ ] Créer table `driver_documents` dans Supabase
- [ ] Types: permis, assurance, carte grise, etc.
- [ ] Upload de fichiers (Supabase Storage)
- [ ] Affichage et gestion dans l'interface
- [ ] Alertes pour documents expirés

---

## 🟢 PRIORITÉ BASSE

### 6. 📧 Notifications Email - Vérification
**Statut**: 🟡 À VÉRIFIER
- [ ] Tester l'envoi de factures par email
- [ ] Vérifier les relances de paiement
- [ ] S'assurer que les Edge Functions sont actives
- [ ] Tester les notifications de commande

### 7. 🗺️ Autocomplete Adresses - Validation
**Fichier**: `src/components/AddressAutocomplete.tsx`  
**Statut**: 🟡 À VÉRIFIER
- [ ] Vérifier l'intégration LocationIQ
- [ ] Tester la recherche d'adresses
- [ ] Valider le calcul de distance
- [ ] Gérer les erreurs API

---

## 🚀 PROJET MAJEUR

### 8. 📱 Application Chauffeur
**Fichier**: `DRIVER_APP_PROMPT.md` (existe déjà)  
**Statut**: ❌ NON DÉMARRÉ

**Fonctionnalités requises**:
- [ ] Authentification chauffeur
- [ ] Réception des commandes
- [ ] Acceptation/Refus de commandes
- [ ] Navigation GPS
- [ ] Mise à jour du statut en temps réel
- [ ] Historique des courses
- [ ] Statistiques et gains

**Technologies suggérées**:
- React Native (iOS + Android)
- Supabase Realtime
- Google Maps API
- Notifications Push

---

## 📊 RÉCAPITULATIF

| Catégorie | Total | Terminé | En cours | À faire |
|-----------|-------|---------|----------|---------|
| **Priorité Haute** | 3 | 1 | 1 | 1 |
| **Priorité Moyenne** | 3 | 0 | 1 | 2 |
| **Priorité Basse** | 2 | 0 | 2 | 0 |
| **Projet Majeur** | 1 | 0 | 0 | 1 |
| **TOTAL** | 9 | 1 | 4 | 4 |

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

1. ✅ **Paramètres Admin** (TERMINÉ)
2. 🔧 **Moteur de Tarification Dynamique** (EN COURS)
3. 📄 **Page Mot de Passe Oublié**
4. 🚗 **Véhicules et Documents Chauffeurs**
5. 📜 **Pages Légales** (peut être fait en parallèle)
6. 🗺️ **Validation AddressAutocomplete**
7. 📧 **Vérification Emails**
8. 📱 **Application Chauffeur** (projet séparé, long terme)

---

## 📝 NOTES IMPORTANTES

- **Stripe/Paiements**: Volontairement exclus de cette TODO
- **Base de données**: Certaines tâches nécessitent des migrations SQL
- **Tests**: Chaque fonctionnalité doit être testée avant validation
- **Documentation**: Mettre à jour la doc au fur et à mesure

---

**Dernière mise à jour**: 2025-12-07 15:16
