# Prompt pour le Développement de l'Application Chauffeur (Driver App)

## Contexte du Projet
Nous développons "One Connexion", une plateforme de livraison express. Le backend (Supabase) et le dashboard Admin/Client (React/Vite) sont déjà en place. Nous avons maintenant besoin de l'application mobile pour les chauffeurs.

## Stack Technique Recommandée
- **Framework** : React Native avec Expo (pour iOS et Android) ou PWA (Progressive Web App) avec Vite/React.
- **Backend** : Supabase (déjà existant).
- **Cartographie** : React Native Maps (ou Leaflet pour PWA).
- **UI Library** : NativeWind (Tailwind pour React Native) ou Tamagui.
- **State Management** : Zustand ou React Query.

## Base de Données Existante (Supabase)
L'application doit se connecter aux tables existantes :
- `drivers` : Informations du chauffeur, statut (`available`, `busy`, `offline`), position GPS (`current_lat`, `current_lng`).
- `orders` : Commandes à livrer. Le chauffeur doit voir les commandes où `driver_id` correspond à son ID.
- `order_events` : Pour logger les actions (accepté, en route, livré, etc.).

## Fonctionnalités Requises

### 1. Authentification
- Login avec Email/Mot de passe (Supabase Auth).
- Vérification que l'utilisateur existe bien dans la table `public.drivers`.
- Persistance de la session.

### 2. Gestion du Statut (Switch On/Off)
- Un toggle visible pour passer de "En ligne" (Available) à "Hors ligne" (Offline).
- Si "En ligne", l'application doit envoyer la position GPS du chauffeur à la table `drivers` toutes les X secondes (Tracking).

### 3. Liste des Courses (Dashboard)
- **Onglet "En cours"** : Affiche la commande actuellement prise en charge.
- **Onglet "À venir"** : Liste des commandes assignées par l'admin (statut `assigned` ou `dispatched`).
- **Onglet "Terminées"** : Historique des courses du jour.

### 4. Détail d'une Course
- Affichage clair des adresses (Enlèvement / Livraison).
- Boutons d'action rapide pour appeler le client ou lancer le GPS (Waze/Google Maps).
- Affichage des notes et instructions spéciales.

### 5. Workflow de Livraison (États)
L'application doit permettre de faire avancer le statut de la commande :
1.  **Accepter la course** (passe à `accepted`).
2.  **En route vers l'enlèvement**.
3.  **Arrivé à l'enlèvement**.
4.  **Colis récupéré** (passe à `in_progress`).
5.  **En route vers la livraison**.
6.  **Arrivé à la livraison**.
7.  **Livré** (passe à `delivered`).

### 6. Preuve de Livraison (POD)
- À l'étape "Livré", l'application doit demander une preuve :
    - **Signature** : Zone de dessin sur l'écran.
    - **Photo** : Prise de photo du colis déposé.
- Ces preuves doivent être uploadées dans Supabase Storage (bucket `proofs`) et les URLs enregistrées dans la commande.

### 7. Profil & Documents
- Affichage des infos personnelles.
- Affichage du véhicule.
- Statut des documents (Permis, Assurance) : Validité, date d'expiration.

## Instructions pour l'IA (Copiez-collez ceci)
"Agis comme un expert React Native / Expo. Je veux créer une application mobile pour les chauffeurs de ma plateforme de livraison. J'utilise Supabase comme backend.
Voici la structure de ma base de données (tables `drivers`, `orders`).
Crée-moi une structure de projet Expo avec TypeScript.
Implémente les écrans suivants :
1. LoginScreen (Auth Supabase).
2. HomeScreen (Carte + Switch statut + Liste des commandes).
3. OrderDetailScreen (Détails + Actions de workflow).
4. DeliveryProofScreen (Signature + Photo).
Utilise `react-native-maps` pour la carte et `lucide-react-native` pour les icônes.
Gère le tracking GPS en arrière-plan si possible."
