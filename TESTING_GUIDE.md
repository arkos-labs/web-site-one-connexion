# Guide de Test Complet - One Connexion

Ce guide vous permet de tester manuellement l'ensemble des fonctionnalités de l'application pour valider son bon fonctionnement.

## 1. Partie Publique (Visiteur)

- [ ] **Page d'accueil** : Vérifier que la page charge, que les animations fonctionnent et que les liens vers "Se connecter" / "S'inscrire" sont actifs.
- [ ] **Commande sans compte** :
    - Aller sur `/commande-sans-compte`.
    - Remplir le formulaire de départ et d'arrivée.
    - Vérifier le calcul du prix.
    - Simuler une validation de commande.
- [ ] **Pages d'information** : Vérifier l'affichage des pages "À propos", "Contact", "CGV", "Mentions Légales".

## 2. Partie Client (Entreprise/Particulier)

### Authentification
- [ ] **Inscription** : Créer un nouveau compte client. Vérifier la redirection vers le dashboard.
- [ ] **Connexion** : Se déconnecter et se reconnecter avec le nouveau compte.
- [ ] **Mot de passe oublié** : Tester le lien "Mot de passe oublié".

### Dashboard Client
- [ ] **Vue d'ensemble** : Vérifier que les statistiques (courses actives, dépenses) s'affichent (même à 0).
- [ ] **Nouvelle Course (Wizard)** :
    - Cliquer sur "Nouvelle Course".
    - **Étape 1 (Trajet)** : Saisir des adresses valides (Google Places). Vérifier l'affichage sur la carte.
    - **Étape 2 (Véhicule)** : Sélectionner un type de véhicule. Vérifier la mise à jour du prix estimé.
    - **Étape 3 (Options)** : Choisir "Immédiat" ou "Programmé". Ajouter des notes.
    - **Étape 4 (Validation)** : Confirmer la commande.
    - **Résultat** : Vérifier que la commande apparaît dans la liste "En cours".
- [ ] **Suivi de commande** :
    - Cliquer sur une commande en cours.
    - Vérifier l'affichage de la carte et du statut (En attente, Acceptée, etc.).
- [ ] **Historique** : Aller dans "Mes Commandes" et vérifier l'historique.
- [ ] **Factures** : Aller dans "Factures". Vérifier si des factures sont listées (si applicable).
- [ ] **Messagerie** : Envoyer un message au support/admin via l'onglet "Messagerie".
- [ ] **Paramètres** : Modifier les informations du profil (téléphone, adresse).

## 3. Partie Admin (Gestionnaire)

### Dashboard Admin
- [ ] **KPIs** : Vérifier que les chiffres globaux (CA, Courses du jour) correspondent à la réalité.
- [ ] **Carte en direct** : Vérifier si la carte s'affiche (même vide si pas de chauffeurs connectés).

### Gestion des Commandes
- [ ] **Liste des commandes** : Voir la nouvelle commande créée par le client test.
- [ ] **Détail commande** : Cliquer sur la commande.
- [ ] **Dispatch** :
    - Assigner un chauffeur à la commande (si des chauffeurs sont créés).
    - Changer le statut manuellement (ex: "En cours de livraison", "Livré").
    - Vérifier que le changement de statut est visible côté Client.
- [ ] **Annulation** : Tester l'annulation d'une commande.

### Gestion des Chauffeurs
- [ ] **Création (Nouveau)** :
    - Cliquer sur "Créer chauffeur".
    - Remplir le formulaire (Identité, SIRET, Véhicule, Capacité).
    - Valider et vérifier que le chauffeur apparaît dans la liste.
- [ ] **Détail Chauffeur** : Cliquer sur un chauffeur. Voir ses stats et documents.
- [ ] **Modification** : Tenter de modifier les infos d'un chauffeur (si implémenté).

### Gestion des Clients
- [ ] **Liste** : Voir le client test créé précédemment.
- [ ] **Détail** : Voir l'historique des commandes de ce client.
- [ ] **Actions** : Tester le blocage/déblocage d'un client (si implémenté).

### Autres
- [ ] **Messagerie** : Répondre au message envoyé par le client test.
- [ ] **Facturation** : Vérifier la génération des factures pour les commandes terminées.

## 4. Scénario de Test Complet (End-to-End)

1.  **Admin** : Créer un chauffeur "Test Driver" (Statut: Offline -> Online via base de données ou interface si dispo).
2.  **Client** : Créer une commande "Paris -> Lyon".
3.  **Admin** : Voir la commande en "En attente". L'assigner à "Test Driver".
4.  **Admin** : Passer la commande en "En cours" (Simulation du chauffeur qui récupère le colis).
5.  **Client** : Vérifier que le statut est passé à "En cours".
6.  **Admin** : Passer la commande en "Livrée".
7.  **Client** : Vérifier que la commande est dans l'historique "Terminées".
8.  **Admin** : Vérifier que le CA a augmenté.

## 5. Vérifications Techniques

- [ ] **Responsive** : Tester l'interface sur mobile (via l'inspecteur du navigateur `F12` -> Mode mobile).
- [ ] **Erreurs** : Garder la console du navigateur ouverte (`F12`) pour surveiller les erreurs rouges (API, JavaScript).
