# Prompt Complet pour le Développement de l'Application Chauffeur (Driver App)

Copie et colle ce prompt dans ton outil d'IA (ChatGPT, Claude, Cursor, etc.) pour générer le code de l'application chauffeur.

---

## Rôle
Agis comme un expert Senior React Native & Supabase. Je veux que tu m'aides à créer l'application mobile pour les chauffeurs de ma plateforme de livraison "One Connexion".

## Contexte
Le backend (Supabase) et le dashboard Admin/Client sont déjà opérationnels. L'application chauffeur doit s'intégrer parfaitement à cet écosystème existant.

## Stack Technique Imposée
- **Framework** : React Native avec Expo (TypeScript).
- **Backend** : Supabase (Client JS existant).
- **Navigation** : Expo Router.
- **UI Library** : NativeWind (Tailwind CSS) ou Tamagui (pour un look moderne et premium).
- **Cartographie** : `react-native-maps`.
- **Gestion d'état** : Zustand + React Query (TanStack Query).
- **Icônes** : Lucide React Native.

## Base de Données (Schéma Existant)
L'application doit interagir avec les tables suivantes (ne pas modifier le schéma, s'adapter à l'existant) :

### 1. `drivers` (Table Principale)
- **Champs clés** : `id` (UUID), `user_id` (Auth), `status` ('available', 'busy', 'offline'), `current_lat`, `current_lng`, `vehicle_type`.
- **Action** : Lire le profil, mettre à jour le statut et la position GPS.

### 2. `orders` (Commandes)
- **Champs clés** : `id`, `driver_id` (FK), `status` ('assigned', 'accepted', 'in_progress', 'delivered'), `pickup_address`, `delivery_address`, `pickup_lat`, `pickup_lng`, `delivery_lat`, `delivery_lng`, `pickup_time`.
- **Action** : Lire les commandes assignées, mettre à jour le statut de la commande.

### 3. `vehicles` (Nouveau module)
- **Champs clés** : `id`, `driver_id`, `brand`, `model`, `license_plate`, `status` ('active', 'inactive').
- **Action** : CRUD (Ajouter/Modifier/Supprimer un véhicule).

### 4. `driver_documents` (Administratif)
- **Champs clés** : `id`, `driver_id`, `document_type` ('permis', 'assurance', etc.), `file_url`, `expiry_date`, `verification_status`.
- **Action** : Uploader des photos de documents, voir le statut de validation.

## Fonctionnalités à Implémenter

### 1. Authentification & Sécurité
- Login avec Email/Mot de passe (Supabase Auth).
- **Vérification Critique** : Au login, vérifier que l'utilisateur existe bien dans la table `public.drivers`. Sinon, refuser l'accès.

### 2. Écran d'Accueil (Dashboard)
- **Switch de Statut** : Un gros bouton ou toggle pour passer de "En ligne" à "Hors ligne".
- **Tracking GPS** :
  - Si "En ligne" : Envoyer la position (`current_lat`, `current_lng`) à la table `drivers` toutes les 30 secondes (ou changement significatif).
  - Utiliser un service de background location si possible.
- **Résumé** : Afficher le nombre de courses du jour et le gain estimé (si disponible).

### 3. Gestion des Courses (Onglets)
- **Onglet "À venir"** : Liste des commandes avec statut `assigned`.
- **Onglet "En cours"** : La commande active (statut `accepted` ou `in_progress`).
- **Onglet "Terminées"** : Historique des commandes `delivered`.

### 4. Détail d'une Course & Workflow
- Afficher une carte avec le point de départ et d'arrivée.
- Boutons d'action rapide : "Appeler Client", "Ouvrir GPS" (Waze/Google Maps).
- **Workflow de Statut** (Machine à états) :
  1.  `assigned` -> Bouton **"Accepter la course"** -> passe à `accepted`.
  2.  `accepted` -> Bouton **"J'ai récupéré le colis"** -> passe à `in_progress`.
  3.  `in_progress` -> Bouton **"Livré"** -> Ouvre le module de preuve.

### 5. Module de Preuve de Livraison (POD)
- Ce module s'ouvre quand on clique sur "Livré".
- **Signature** : Zone de dessin (Canvas) pour que le client signe.
- **Photo** : Prendre une photo du colis déposé.
- **Validation** : Uploader l'image/signature dans Supabase Storage (bucket `proofs`), récupérer l'URL, et mettre à jour la commande en statut `delivered` avec l'URL de preuve.

### 6. Profil & Véhicules
- Écran pour gérer ses informations.
- Liste des véhicules : Ajouter un nouveau véhicule, définir le véhicule actif.
- Liste des documents : Voir les dates d'expiration, uploader une mise à jour.

## Design System
- **Couleurs** : Utilise une palette "Bleu Nuit" et "Jaune Vif" pour correspondre à l'identité "One Connexion".
- **Style** : Cards avec ombres douces, typographie lisible (Inter ou Poppins), boutons d'action larges et accessibles (faciles à cliquer en conduisant).

## Instructions de Génération de Code
- Commence par configurer le client Supabase et le Store (Zustand).
- Crée les types TypeScript basés sur le schéma DB fourni.
- Propose une structure de dossiers claire (`app`, `components`, `services`, `hooks`).
- Implémente d'abord le flux d'authentification et la liste des commandes.
