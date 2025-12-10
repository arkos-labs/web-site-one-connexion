# 🚀 Guide Rapide - Application de la Migration

## ⚠️ IMPORTANT : Suivez ces étapes dans l'ordre

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur **https://app.supabase.com**
2. Connectez-vous à votre compte
3. Sélectionnez votre projet One Connexion

### Étape 2 : Ouvrir l'éditeur SQL

1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"** (ou le bouton + en haut)

### Étape 3 : Copier et exécuter la migration

1. **Ouvrez le fichier** : `sql/migrations/add_detailed_order_fields.sql`
2. **Sélectionnez TOUT le contenu** (Ctrl+A)
3. **Copiez** (Ctrl+C)
4. **Collez dans l'éditeur SQL** de Supabase (Ctrl+V)
5. **Cliquez sur "Run"** (ou appuyez sur Ctrl+Enter)

### Étape 4 : Vérifier le résultat

Vous devriez voir dans les résultats :

```
✅ Migration terminée avec succès !
Total de commandes : X
Commandes avec données migrées : Y
Nouveaux champs ajoutés : ...
```

### Étape 5 : Tester l'application

1. **Rechargez votre application** (F5 dans le navigateur)
2. **Allez sur une commande existante**
3. **Vérifiez que vous voyez** :
   - ✅ Informations d'enlèvement (contact, téléphone)
   - ✅ Informations de livraison (contact, téléphone)
   - ✅ Détails de la commande
   - ✅ Informations de facturation (si commande sans compte)

### Étape 6 : Créer une nouvelle commande de test

1. **Allez sur** : http://localhost:5173/commander-sans-compte
2. **Remplissez le formulaire** avec toutes les informations
3. **Soumettez la commande**
4. **Consultez les détails** de cette nouvelle commande
5. **Téléchargez le bon de commande PDF**
6. **Vérifiez que TOUTES les informations** sont présentes

---

## 🆘 En cas de problème

### Problème : "permission denied"
**Solution** : Vous devez être connecté en tant qu'administrateur du projet Supabase.

### Problème : "column already exists"
**Solution** : C'est normal ! La migration utilise `IF NOT EXISTS`, donc elle ne créera pas les colonnes en double. Continuez.

### Problème : Je ne vois toujours pas les détails
**Solutions** :
1. ✅ Vérifiez que la migration s'est bien exécutée (voir Étape 4)
2. ✅ Rechargez complètement la page (Ctrl+F5)
3. ✅ Vérifiez la console du navigateur (F12) pour voir s'il y a des erreurs
4. ✅ Créez une NOUVELLE commande pour tester (les anciennes peuvent ne pas avoir toutes les données)

### Problème : Erreur dans la console
**Solution** : Ouvrez la console (F12) et partagez le message d'erreur.

---

## 📋 Checklist de vérification

Après la migration, vérifiez que vous pouvez voir :

### Dans la page de détails de commande :
- [ ] Section "Informations d'enlèvement" avec contact et téléphone
- [ ] Section "Informations de livraison" avec contact et téléphone
- [ ] Section "Détails de la commande" avec type de colis et formule
- [ ] Section "Informations de facturation" (pour commandes sans compte)

### Dans le bon de commande PDF :
- [ ] 📍 Informations d'enlèvement complètes
- [ ] 📍 Informations de livraison complètes
- [ ] 📦 Détails de la commande
- [ ] 💳 Informations de facturation (si applicable)

---

## 🎯 Prochaine étape

Une fois la migration appliquée avec succès :
1. **Testez avec une nouvelle commande** pour voir tous les détails
2. **Les anciennes commandes** afficheront les informations disponibles dans leurs champs JSONB
3. **Toutes les nouvelles commandes** auront tous les détails

---

**Besoin d'aide ?** Partagez une capture d'écran de ce que vous voyez !
