# 🚨 ACTION REQUISE : Appliquer les Policies RLS Admin

## ⚠️ ÉTAPE CRITIQUE

Les corrections du code React ont été appliquées automatiquement, mais **vous devez maintenant appliquer les policies RLS dans Supabase** pour que tout fonctionne.

Sans ces policies, les admins ne pourront **ni voir ni créer de clients**.

---

## 📋 Instructions (5 minutes)

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur : **https://app.supabase.com**
2. Connectez-vous
3. Sélectionnez votre projet : **dnwqyjsxnfnmfxkpiwtl**

### Étape 2 : Ouvrir SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query** (ou **+ New query**)

### Étape 3 : Copier le Script SQL

1. Ouvrez le fichier : `sql/admin_policies.sql`
2. **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)

### Étape 4 : Exécuter le Script

1. **Collez** le contenu dans l'éditeur SQL de Supabase (Ctrl+V)
2. Cliquez sur le bouton **Run** (ou appuyez sur Ctrl+Enter)
3. Attendez quelques secondes

### Étape 5 : Vérifier

Vous devriez voir un message de succès. Pour vérifier que tout est OK, exécutez cette requête :

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
```

Vous devriez voir au moins 10 policies avec "Admin" dans le nom.

---

## ✅ C'est Fait ?

Une fois les policies appliquées, vous pouvez tester le modal :

1. Ouvrez votre application (déjà en cours sur http://localhost:5173)
2. Allez dans **Dashboard Admin** → **Commandes**
3. Cliquez sur **+ Nouvelle Commande**
4. Testez la recherche de clients
5. Testez la création d'un nouveau client

---

## 📚 Documentation Complète

- **Résumé des corrections** : `RESUME_CORRECTIONS_MODAL_ADMIN.md`
- **Guide de test détaillé** : `GUIDE_TEST_MODAL_NOUVELLE_COMMANDE.md`
- **Documentation technique** : `CORRECTIF_MODAL_COMMANDE_ADMIN.md`

---

## 🐛 En Cas de Problème

### Erreur lors de l'exécution SQL

Si vous voyez une erreur du type "policy already exists" :
- C'est normal, certaines policies existaient peut-être déjà
- Continuez, les nouvelles seront créées

### Aucun client ne s'affiche

Vérifiez qu'il existe des clients dans la base :
```sql
SELECT * FROM clients LIMIT 5;
```

Si la table est vide, créez un client de test via le modal "+ Nouveau client".

### Erreur "permission denied"

Vérifiez que vous êtes bien connecté en tant qu'admin :
```sql
SELECT raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE id = auth.uid();
```

Le résultat doit être `admin`.

---

## 🎯 Prochaines Étapes

Après avoir appliqué les policies :

1. ✅ Testez la recherche de clients
2. ✅ Testez la création d'un nouveau client
3. ✅ Vérifiez que le récapitulatif se met à jour
4. ✅ Créez une commande complète

Consultez `GUIDE_TEST_MODAL_NOUVELLE_COMMANDE.md` pour les tests détaillés.

---

**Temps estimé : 5 minutes** ⏱️

**Difficulté : Facile** 🟢
