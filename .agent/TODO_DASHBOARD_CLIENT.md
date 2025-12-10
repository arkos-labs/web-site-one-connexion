# 📋 TODO - Dashboard Client One Connexion

## 🎯 Vue d'ensemble

Ce document liste toutes les fonctionnalités à implémenter ou améliorer dans le **dashboard client** de l'application One Connexion.

---

## ✅ Fonctionnalités déjà implémentées

### 1. **Page Dashboard Principal** (`DashboardClient.tsx`)
- ✅ Affichage des statistiques du mois (commandes, taux de succès, temps moyen, dépenses)
- ✅ Actions rapides (Suivi, Factures, Messages)
- ✅ Liste des commandes récentes (5 dernières)
- ✅ Modal de création de nouvelle commande
- ✅ Vérification du statut du compte (suspension/désactivation)
- ✅ Auto-refresh des commandes toutes les 5 secondes

### 2. **Page Commandes** (`Orders.tsx`)
- ✅ Liste complète de toutes les commandes
- ✅ Filtres par période (Aujourd'hui, 7 jours, 30 jours, Tout)
- ✅ Filtres par statut (Tous, En cours, Livrées, Annulées)
- ✅ Téléchargement du bon de commande en PDF
- ✅ Navigation vers les détails de commande

### 3. **Page Détails Commande** (`OrderDetail.tsx`)
- ✅ Affichage complet des informations de commande
- ✅ Timeline de suivi avec étapes
- ✅ Informations du chauffeur assigné
- ✅ Annulation de commande avec frais conditionnels (8€ si dispatché)
- ✅ Téléchargement du bon de commande

### 4. **Page Suivi** (`Tracking.tsx`)
- ✅ Carte interactive avec Leaflet
- ✅ Suivi en temps réel des commandes actives
- ✅ Timeline détaillée avec timestamps
- ✅ Calcul de durée entre étapes
- ✅ Affichage position chauffeur et points de livraison

### 5. **Page Factures** (`Invoices.tsx`)
- ✅ Liste de toutes les factures
- ✅ Filtres par statut (Toutes, En attente, Payées, En retard)
- ✅ Téléchargement des factures en PDF
- ✅ Modal de paiement (simulation)

### 6. **Page Messages** (`Messages.tsx`)
- ✅ Système de messagerie avec threads
- ✅ Communication avec l'administration
- ✅ Indicateurs de messages non lus
- ✅ Envoi de nouveaux messages
- ✅ Temps réel avec Supabase Realtime

### 7. **Page Aide** (`Help.tsx`)
- ✅ FAQ avec accordéon
- ✅ Bouton pour contacter le support
- ✅ Modal de nouveau message

### 8. **Page Paramètres** (`Settings.tsx`)
- ✅ Modification du profil (nom, prénom, entreprise, téléphone)
- ✅ Changement d'email avec confirmation
- ✅ Changement de mot de passe
- ✅ Préférences de notifications (email, SMS, factures auto)
- ✅ Déconnexion
- ✅ Suppression de compte

---

## 🚧 Fonctionnalités à améliorer ou compléter

### 1. **Dashboard Principal - Statistiques dynamiques** 🔴 PRIORITÉ HAUTE

**Problème actuel :**
- Les statistiques sont partiellement statiques ou incomplètes
- "Taux de succès" affiche toujours 100%
- "Temps moyen" affiche "-"
- "Dépenses" affiche toujours 0€

**À faire :**
```typescript
// Calculer les vraies statistiques depuis les commandes
- Nombre de commandes du mois (✅ déjà fait)
- Taux de succès réel = (commandes livrées / total commandes) * 100
- Temps moyen de livraison = moyenne des durées (dispatched_at -> delivered_at)
- Dépenses totales = somme des prix de toutes les commandes du mois
- Comparaison avec le mois précédent pour les pourcentages de changement
```

**Fichiers à modifier :**
- `src/pages/client/DashboardClient.tsx`
- Créer un hook personnalisé : `src/hooks/useClientStats.ts`

---

### 2. **Dashboard Principal - Activité récente** 🟡 PRIORITÉ MOYENNE

**Problème actuel :**
- Section "Activité récente" est un placeholder statique

**À faire :**
```typescript
// Afficher les événements récents du client
- Nouvelles commandes créées
- Changements de statut de commandes
- Nouveaux messages reçus
- Factures générées
- Paiements effectués

// Utiliser la table order_events et créer une vue unifiée
```

**Fichiers à modifier :**
- `src/pages/client/DashboardClient.tsx`
- Créer : `src/services/activityQueries.ts`
- Créer : `src/components/client/ActivityTimeline.tsx`

---

### 3. **Messages - Compteur de messages non lus** 🟡 PRIORITÉ MOYENNE

**Problème actuel :**
- L'action rapide "Messages" affiche toujours "0 nouveaux"

**À faire :**
```typescript
// Compter les messages non lus en temps réel
- Requête Supabase pour compter les messages où read = false
- Mettre à jour le compteur avec Realtime
- Afficher le badge sur l'icône de navigation
```

**Fichiers à modifier :**
- `src/pages/client/DashboardClient.tsx`
- `src/hooks/useUnreadMessages.ts` (à créer)
- `src/components/layout/ClientLayout.tsx` (pour le badge dans le menu)

---

### 4. **Factures - Intégration paiement réel** 🔴 PRIORITÉ HAUTE

**Problème actuel :**
- Le système de paiement est simulé
- Pas d'intégration avec Stripe

**À faire :**
```typescript
// Intégrer Stripe Payment Links
1. Générer un lien de paiement Stripe lors de la création de facture
2. Stocker le lien dans invoice.stripe_payment_link
3. Rediriger vers Stripe lors du clic sur "Payer"
4. Webhook Stripe pour mettre à jour le statut de paiement
5. Marquer la facture comme "paid" et enregistrer paid_date
```

**Fichiers à modifier :**
- `src/pages/client/Invoices.tsx`
- Créer : `src/services/stripeService.ts`
- Backend : Webhooks Stripe (Supabase Edge Functions)

---

### 5. **Commandes - Notifications en temps réel** 🟡 PRIORITÉ MOYENNE

**Problème actuel :**
- Pas de notifications push quand le statut d'une commande change
- Le client doit rafraîchir manuellement

**À faire :**
```typescript
// Notifications toast pour changements de statut
1. Écouter les changements sur la table orders avec Realtime
2. Afficher une notification toast quand :
   - Commande acceptée par admin
   - Chauffeur assigné
   - Commande en cours de livraison
   - Commande livrée
3. Jouer un son pour les notifications importantes
```

**Fichiers à modifier :**
- Créer : `src/hooks/useOrderNotifications.ts`
- `src/pages/client/DashboardClient.tsx`
- `src/pages/client/Orders.tsx`
- `src/pages/client/Tracking.tsx`

---

### 6. **Suivi - Estimation de temps d'arrivée (ETA)** 🟢 PRIORITÉ BASSE

**Problème actuel :**
- Pas d'estimation du temps d'arrivée
- Pas de calcul de distance restante

**À faire :**
```typescript
// Calculer et afficher l'ETA
1. Utiliser l'API de géolocalisation pour calculer la distance
2. Estimer le temps en fonction de la vitesse moyenne
3. Afficher "Arrivée estimée dans X minutes"
4. Mettre à jour en temps réel avec la position du chauffeur
```

**Fichiers à modifier :**
- `src/pages/client/Tracking.tsx`
- `src/hooks/useOrderTracking.ts`
- Créer : `src/utils/distanceCalculator.ts`

---

### 7. **Paramètres - Upload de logo entreprise** 🟢 PRIORITÉ BASSE

**Problème actuel :**
- Pas de possibilité d'uploader un logo d'entreprise
- Pas d'avatar personnalisé

**À faire :**
```typescript
// Permettre l'upload d'un logo
1. Ajouter un champ logo_url dans la table clients
2. Créer un composant d'upload d'image
3. Stocker dans Supabase Storage
4. Afficher le logo dans le header et les documents PDF
```

**Fichiers à modifier :**
- `src/pages/client/Settings.tsx`
- Créer : `src/components/client/LogoUploader.tsx`
- `src/services/storageService.ts`
- Schéma DB : Ajouter colonne `logo_url` à `clients`

---

### 8. **Commandes - Historique d'export** 🟢 PRIORITÉ BASSE

**Problème actuel :**
- Pas de possibilité d'exporter l'historique des commandes
- Pas de rapport mensuel/annuel

**À faire :**
```typescript
// Export des commandes
1. Bouton "Exporter" dans la page Orders
2. Formats : CSV, Excel, PDF
3. Filtres personnalisés pour l'export
4. Rapport mensuel automatique par email (optionnel)
```

**Fichiers à modifier :**
- `src/pages/client/Orders.tsx`
- Créer : `src/utils/exportService.ts`
- `src/lib/pdf-generator.ts` (étendre)

---

### 9. **Dashboard - Widget météo** 🟢 PRIORITÉ BASSE

**Problème actuel :**
- Aucune information contextuelle sur les conditions de livraison

**À faire :**
```typescript
// Afficher la météo locale
1. Intégrer une API météo (OpenWeather, etc.)
2. Afficher température et conditions actuelles
3. Alertes en cas de mauvais temps
4. Impact potentiel sur les livraisons
```

**Fichiers à modifier :**
- `src/pages/client/DashboardClient.tsx`
- Créer : `src/components/client/WeatherWidget.tsx`
- Créer : `src/services/weatherService.ts`

---

### 10. **Général - Mode hors ligne** 🟢 PRIORITÉ BASSE

**Problème actuel :**
- L'application ne fonctionne pas sans connexion internet
- Pas de cache local

**À faire :**
```typescript
// Fonctionnement hors ligne basique
1. Service Worker pour mise en cache
2. Afficher les dernières données en cache
3. Synchronisation automatique au retour en ligne
4. Indicateur de statut de connexion
```

**Fichiers à créer :**
- `public/service-worker.js`
- `src/hooks/useOfflineSync.ts`
- `src/components/ui/ConnectionStatus.tsx`

---

## 📊 Résumé des priorités

### 🔴 Priorité HAUTE (À faire en premier)
1. ✅ Statistiques dynamiques du dashboard
2. ✅ Intégration paiement Stripe

### 🟡 Priorité MOYENNE (Important mais pas urgent)
3. ✅ Activité récente
4. ✅ Compteur messages non lus
5. ✅ Notifications temps réel

### 🟢 Priorité BASSE (Nice to have)
6. ✅ ETA sur le suivi
7. ✅ Upload logo entreprise
8. ✅ Export historique
9. ✅ Widget météo
10. ✅ Mode hors ligne

---

## 🗄️ Modifications base de données nécessaires

### Nouvelles colonnes à ajouter

```sql
-- Table clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Table invoices (déjà présent normalement)
-- stripe_payment_link TEXT déjà dans le schéma

-- Pas d'autres modifications nécessaires pour l'instant
```

---

## 🎨 Améliorations UX/UI suggérées

1. **Animations de chargement** : Ajouter des skeletons au lieu de "Chargement..."
2. **Feedback visuel** : Plus d'animations sur les interactions
3. **Responsive mobile** : Tester et améliorer l'expérience mobile
4. **Dark mode** : Implémenter un thème sombre (optionnel)
5. **Raccourcis clavier** : Ajouter des shortcuts pour les actions fréquentes
6. **Tutoriel onboarding** : Guide pour les nouveaux utilisateurs

---

## 📝 Notes importantes

- Toutes les fonctionnalités critiques sont déjà implémentées ✅
- Le dashboard client est **fonctionnel et utilisable** en l'état
- Les améliorations listées sont des **optimisations** et **features additionnelles**
- Prioriser selon les besoins métier et les retours utilisateurs

---

**Dernière mise à jour :** 30 novembre 2025
**Statut global :** 🟢 Fonctionnel - Améliorations possibles
