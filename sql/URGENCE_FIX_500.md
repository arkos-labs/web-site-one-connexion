# 🚨 RÉPARATION URGENTE - Erreur 500 Database error

## ❌ Problème

**Erreur :** "Database error querying schema" (500)

**Cause :** Trigger SQL défaillant sur `auth.users` qui empêche la création/lecture des profils

---

## ✅ SOLUTION IMMÉDIATE (2 minutes)

### 1️⃣ Ouvrir Supabase SQL Editor
🔗 https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 2️⃣ Exécuter le script de réparation

**Copiez tout le contenu de :**
```
sql/fix_database.sql
```

**Collez dans Supabase et cliquez sur "Run" ▶️**

### 3️⃣ Vérifier le résultat

Vous devriez voir :
- ✅ Trigger handle_new_user créé
- ✅ Fonction handle_new_user existe
- ✅ Tous les utilisateurs ont un profil
- ✅ Tous les chauffeurs ont une entrée drivers

### 4️⃣ Tester la connexion

**Rechargez la page de connexion et reconnectez-vous**

✅ **L'erreur 500 devrait disparaître !**

---

## 🔧 Ce que fait le script

### 1. Nettoyage complet
- Supprime TOUS les triggers existants sur `auth.users`
- Supprime les fonctions triggers défaillantes

### 2. Reconstruction saine
- Vérifie/crée la table `profiles`
- Vérifie/crée la table `drivers`
- Ajoute les index pour les performances

### 3. Nouveau trigger unifié et sécurisé
- Fonction `handle_new_user()` avec `SECURITY DEFINER`
- Bloc `BEGIN ... EXCEPTION` pour ne jamais faire planter le login
- Logique :
  - Insère TOUJOURS dans `profiles`
  - Si rôle = 'driver' → insère dans `drivers`
  - Si rôle = 'client' → insère dans `clients` (si existe)
  - En cas d'erreur → log warning mais continue

### 4. Réparation des données existantes
- Crée des profils pour les utilisateurs sans profil
- Crée des entrées drivers pour les chauffeurs sans entrée

---

## 🎯 Pourquoi ça marchera

**Avant :**
```
Login → Trigger plante → Erreur 500 → Échec
```

**Après :**
```
Login → Trigger avec EXCEPTION → Profil créé → Succès ✅
```

**Le nouveau trigger :**
- ✅ Ne plante JAMAIS
- ✅ Crée toujours le profil
- ✅ Log les erreurs sans bloquer
- ✅ Compatible avec tous les rôles

---

## 📋 Checklist

- [ ] Script `fix_database.sql` exécuté dans Supabase
- [ ] Vérification : trigger handle_new_user créé
- [ ] Vérification : fonction existe
- [ ] Vérification : tous les utilisateurs ont un profil
- [ ] Test : connexion réussie (plus d'erreur 500)

---

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier les logs Supabase

1. Allez dans Supabase → Logs
2. Regardez les erreurs récentes
3. Cherchez "handle_new_user" ou "Database error"

### Vérifier manuellement

```sql
-- Vérifier que le trigger existe
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Vérifier que la fonction existe
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Vérifier les profils
SELECT COUNT(*) FROM public.profiles;

-- Vérifier les chauffeurs
SELECT COUNT(*) FROM public.drivers;
```

---

## ✅ Après la réparation

**Vous pourrez :**
- ✅ Vous connecter sans erreur 500
- ✅ Créer des chauffeurs depuis l'admin
- ✅ Les chauffeurs pourront se connecter
- ✅ Tout fonctionnera normalement

---

**Exécutez `sql/fix_database.sql` MAINTENANT ! 🚀**
