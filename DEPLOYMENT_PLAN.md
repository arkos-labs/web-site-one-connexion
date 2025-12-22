# Plan de Publication (Deployment Plan)

Ce document détaille les étapes pour préparer et publier l'application **Web Site One Connexion** dans un état prêt pour la démonstration (interface utilisateur fonctionnelle), en mettant de côté temporairement la connexion stricte à la base de données.

## 1. Nettoyage et Préparation (Effectué)
- [x] **Suppression des fichiers parasites** : Les fichiers temporaires, logs de conversation et documents de migration obsolètes ont été supprimés de la racine pour clarifier la structure du projet.
- [x] **Structure du projet** : Seuls les fichiers essentiels (`src`, `public`, `docs`, fichiers de configuration) sont conservés.

## 2. Configuration "Mode Démonstration"
L'objectif est de publier l'interface utilisateur (UI) pour validation visuelle et interactive, même sans backend actif.

### Gestion des Erreurs (Graceful Degradation)
L'application utilise Supabase. Si la base de données n'est pas connectée :
- Les appels API échoueront (erreurs console), mais *l'application ne doit pas crasher* (page blanche).
- L'interface doit rester navigable.
- Pour faciliter cela, assurez-vous que les composants critiques (cartes, tableaux de bord) ont des états de chargement ou des données par défaut (mock data) s'ils ne peuvent pas récupérer les données réelles.

### Variables d'Environnement
Même sans base de données "finie", le SDK Supabase a besoin de valeurs pour s'initialiser sans erreur fatale au démarrage.
Lors du déploiement, configurez ces variables (même avec des valeurs placeholder si vous n'avez pas encore votre instance finale) :

```bash
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_ANON_KEY="votre-cle-publique-anon"
```

*Note : Si vous ne les mettez pas, l'application risque de planter au chargement du client Supabase.*

## 3. Procédure de Déploiement (Vercel)
Vercel est recommandé pour ce type d'application (Vite + React).

1. **Push GitHub** : Assurez-vous que votre code propre ("sans parasites") est poussé sur votre dépôt GitHub (branche `main`).
2. **Nouveau Projet sur Vercel** :
   - Connectez votre compte GitHub à Vercel.
   - Importez le dépôt `web-site-one-connexion`.
3. **Paramètres de Build** (Normalement détectés automatiquement) :
   - **Framework Preset** : `Vite`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. **Variables d'Environnement** :
   - Ajoutez les clés `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans l'onglet "Environment Variables".
5. **Lancer le Déploiement** : Cliquez sur "Deploy".

## 4. Vérification Post-Publication
Une fois l'URL généreé (ex: `https://votre-app.vercel.app`) :

1. **Test de Chargement** : La page d'accueil doit s'afficher rapidement.
2. **Navigation** : Testez les liens vers Login, Inscription, et Dashboard.
3. **Responsive** : Vérifiez l'affichage sur mobile (via devtools ou téléphone).
4. **Console Logs** : Vérifiez la console (`F12`) pour vous assurer qu'il n'y a pas d'erreurs bloquantes (hormis les erreurs 401/404 liées à l'absence de base de données réelle).

## 5. Prochaines Étapes (Post-Publication)
- [ ] Connecter la vraie base de données Supabase.
- [ ] Configurer les politiques RLS (Row Level Security) comme documenté dans le dossier `docs/`.
- [ ] Activer l'authentification réelle.
