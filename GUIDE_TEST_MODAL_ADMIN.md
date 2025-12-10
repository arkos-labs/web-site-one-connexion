# Guide de Test - Modal Admin Création Commande

## 🚀 Démarrage

### Option 1 : Redémarrage automatique
```powershell
.\restart-dev.ps1
```

### Option 2 : Redémarrage manuel
```powershell
# 1. Arrêter tous les processus Node
Get-Process -Name node | Stop-Process -Force

# 2. Attendre 2 secondes
Start-Sleep -Seconds 2

# 3. Démarrer le serveur
npm run dev
```

## ✅ Tests à effectuer

### 1. Accès au modal
1. Ouvrir le navigateur sur `http://localhost:5173`
2. Se connecter en tant qu'admin
3. Aller dans la section "Commandes"
4. Cliquer sur le bouton "Créer une commande" ou "Nouvelle commande"
5. ✅ Le modal doit s'ouvrir

### 2. Voir les clients existants
1. Dans le modal, cliquer dans le champ de recherche client
2. ✅ Le dropdown doit s'afficher avec TOUS les clients de la base
3. Taper quelques lettres (ex: "jean")
4. ✅ La liste doit se filtrer en temps réel
5. Cliquer en dehors du dropdown
6. ✅ Le dropdown doit se fermer

### 3. Sélectionner un client
1. Cliquer dans le champ de recherche
2. Cliquer sur un client dans la liste
3. ✅ Le client doit être sélectionné
4. ✅ Une carte avec les infos du client doit apparaître
5. ✅ Le dropdown doit se fermer
6. ✅ Les contacts de retrait doivent être pré-remplis

### 4. Désélectionner un client
1. Avec un client sélectionné, cliquer sur le bouton X rouge
2. ✅ Le client doit être désélectionné
3. ✅ Le champ de recherche doit redevenir vide
4. ✅ Les contacts de retrait doivent rester (pas effacés)

### 5. Créer un nouveau client
1. Cliquer sur le bouton "Nouveau client" (en haut à droite)
2. ✅ Un nouveau modal doit s'ouvrir
3. Remplir le formulaire :
   - Nom de l'entreprise : "Test SARL"
   - Prénom contact : "Jean"
   - Nom contact : "Dupont"
   - Email : "test@example.com"
   - Téléphone : "0612345678"
   - Adresse : "123 Rue de Test, 75001 Paris"
4. Cliquer sur "Créer le client"
5. ✅ Un toast de confirmation doit apparaître
6. ✅ Le modal de création doit se fermer
7. ✅ Le nouveau client doit être automatiquement sélectionné
8. ✅ Le nouveau client doit apparaître dans la carte

### 6. Vérifier que le modal est visible sans scroll
1. Avec le modal ouvert
2. ✅ Tous les éléments doivent être visibles sans avoir à scroller
3. ✅ Les boutons "Annuler" et "Créer la commande" doivent être visibles en bas

## 🐛 Problèmes possibles

### Le dropdown ne s'affiche pas
**Cause** : Pas de clients dans la base de données
**Solution** : Créer un client via le bouton "Nouveau client"

### Le modal de création ne s'ouvre pas
**Cause** : Erreur JavaScript dans la console
**Solution** : 
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs
3. Copier l'erreur et la partager

### Le serveur ne démarre pas
**Cause** : Port déjà utilisé ou erreur de compilation
**Solution** :
```powershell
# Tuer tous les processus Node
Get-Process -Name node | Stop-Process -Force

# Nettoyer le cache
npm cache clean --force

# Réinstaller les dépendances
npm install

# Redémarrer
npm run dev
```

### Les clients ne s'affichent pas
**Vérifications** :
1. Vérifier que vous êtes connecté en tant qu'admin
2. Vérifier dans Supabase qu'il y a des profils avec `role = 'client'`
3. Vérifier la console pour les erreurs de requête

## 📊 Données de test

Si vous n'avez pas de clients dans la base, utilisez le bouton "Nouveau client" pour créer ces clients de test :

### Client 1
- Société : ACME Corp
- Prénom : Jean
- Nom : Dupont
- Email : jean.dupont@acme.fr
- Téléphone : 0612345678
- Adresse : 123 Avenue des Champs-Élysées, 75008 Paris

### Client 2
- Société : Tech Solutions
- Prénom : Marie
- Nom : Martin
- Email : marie.martin@techsol.fr
- Téléphone : 0698765432
- Adresse : 456 Rue de la Paix, 92100 Boulogne-Billancourt

### Client 3
- Société : Services Plus
- Prénom : Pierre
- Nom : Durand
- Email : p.durand@servicesplus.fr
- Téléphone : 0687654321
- Adresse : 789 Boulevard Saint-Germain, 75006 Paris

## 🎯 Résultat attendu

À la fin des tests, vous devriez pouvoir :
- ✅ Voir tous les clients de la base
- ✅ Rechercher et filtrer les clients
- ✅ Sélectionner un client existant
- ✅ Créer un nouveau client
- ✅ Le nouveau client est automatiquement sélectionné
- ✅ Désélectionner un client
- ✅ Le modal est entièrement visible sans scroll

## 📝 Notes

- Le dropdown se ferme automatiquement au clic extérieur
- Le dropdown se ferme automatiquement après sélection d'un client
- Le dropdown ne s'affiche pas si un client est déjà sélectionné
- La recherche filtre par nom, prénom, email ET société
- Les contacts de retrait sont pré-remplis avec les infos du client sélectionné
