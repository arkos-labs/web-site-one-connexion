# 🚨 CORRECTION CRITIQUE - Chauffeurs dans table clients

## ❌ Problème identifié

La fonction `create_driver_user` ne mettait **PAS** le rôle 'driver' dans les métadonnées utilisateur (`raw_user_meta_data`).

### Conséquence

Le trigger `handle_new_user` utilisait le rôle par défaut **'client'** et créait automatiquement une entrée dans la table `clients` pour chaque chauffeur créé ! 😱

```sql
-- AVANT (INCORRECT)
jsonb_build_object(
  'full_name', first_name || ' ' || last_name,
  'username', username
)
-- ❌ Pas de 'role' → trigger utilise 'client' par défaut
-- ❌ Chauffeur créé dans table clients !
```

---

## ✅ Solution appliquée

### Fichiers corrigés

1. ✅ `sql/create_driver_rpc.sql` - Ajout du rôle 'driver'
2. ✅ `sql/fix_driver_email_domain.sql` - Ajout du rôle 'driver'
3. ✅ `sql/verify_no_drivers_in_clients.sql` - Script de vérification et nettoyage

### Code corrigé

```sql
-- APRÈS (CORRECT)
jsonb_build_object(
  'role', 'driver',  -- ✅ Rôle explicite
  'full_name', first_name || ' ' || last_name,
  'username', username
)
-- ✅ Trigger voit role = 'driver'
-- ✅ Trigger ne crée PAS de client
-- ✅ Chauffeur créé UNIQUEMENT dans table drivers
```

---

## 🔍 Comment le trigger fonctionne

### Trigger `handle_new_user` (fix_signup_trigger.sql)

```sql
-- Ligne 17 : Récupère le rôle des métadonnées
user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');

-- Ligne 46 : Vérifie le rôle avant de créer un client
IF user_role = 'client' THEN
    INSERT INTO public.clients (...) VALUES (...);
END IF;
```

### Comportement

| Métadonnées | Rôle détecté | Action du trigger |
|-------------|--------------|-------------------|
| `{}` (vide) | `'client'` (défaut) | ❌ Crée un client |
| `{'role': 'client'}` | `'client'` | ✅ Crée un client |
| `{'role': 'driver'}` | `'driver'` | ✅ Ne crée PAS de client |
| `{'role': 'admin'}` | `'admin'` | ✅ Ne crée PAS de client |

---

## 🚀 Actions à effectuer MAINTENANT

### 1️⃣ Mettre à jour la fonction dans Supabase

Ouvrez : https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

**Exécutez le script corrigé :**
```
sql/fix_driver_email_domain.sql
```

Ce script contient maintenant :
- ✅ Format email : `@driver.local`
- ✅ Rôle dans métadonnées : `'role', 'driver'`

### 2️⃣ Vérifier et nettoyer les données existantes

**Exécutez le script de vérification :**
```
sql/verify_no_drivers_in_clients.sql
```

Ce script va :
1. ✅ Vérifier s'il y a des chauffeurs dans la table `clients`
2. ✅ Supprimer automatiquement ces entrées incorrectes
3. ✅ Afficher un rapport de cohérence des données

### 3️⃣ Tester la création d'un nouveau chauffeur

Créez un chauffeur depuis l'interface admin et vérifiez :

```sql
-- Vérifier que le chauffeur N'EST PAS dans clients
SELECT 
    u.email,
    p.role,
    c.user_id IS NOT NULL as dans_clients,
    d.user_id IS NOT NULL as dans_drivers
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.clients c ON u.id = c.user_id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email = 'test123@driver.local';
```

**Résultat attendu :**
```
email                    | role   | dans_clients | dans_drivers
-------------------------|--------|--------------|-------------
test123@driver.local     | driver | false        | true
```

✅ `dans_clients` doit être **false**
✅ `dans_drivers` doit être **true**

---

## 📊 Flux corrigé

```
ADMIN CRÉE CHAUFFEUR
        ↓
create_driver_user()
        ↓
INSERT INTO auth.users
  raw_user_meta_data = {
    'role': 'driver',  ← ✅ CRITIQUE
    'full_name': '...',
    'username': '...'
  }
        ↓
TRIGGER handle_new_user s'exécute
        ↓
user_role = 'driver'  ← ✅ Récupéré des métadonnées
        ↓
IF user_role = 'client' ?
  → NON (car 'driver')
  → ✅ Ne crée PAS de client
        ↓
INSERT INTO profiles (role = 'driver')
        ↓
INSERT INTO drivers (...)
        ↓
✅ CHAUFFEUR CRÉÉ UNIQUEMENT DANS DRIVERS
```

---

## 🎯 Vérification rapide

### Commande SQL rapide

```sql
-- Compter les chauffeurs mal placés
SELECT 
    COUNT(*) as chauffeurs_dans_clients
FROM public.clients c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.role = 'driver';
```

**Résultat attendu :** `0`

---

## 📝 Checklist de correction

- [ ] Script `fix_driver_email_domain.sql` mis à jour avec le rôle
- [ ] Script exécuté dans Supabase
- [ ] Script `verify_no_drivers_in_clients.sql` exécuté
- [ ] Vérification : aucun chauffeur dans table clients
- [ ] Nouveau chauffeur créé depuis l'admin
- [ ] Vérification : nouveau chauffeur UNIQUEMENT dans drivers
- [ ] Connexion du chauffeur réussie

---

## 🆘 Si des chauffeurs sont déjà dans clients

**Pas de panique !** Le script `verify_no_drivers_in_clients.sql` les supprime automatiquement.

Les chauffeurs resteront fonctionnels car leurs données sont dans la table `drivers`.

---

## ✅ Résumé

**Problème :** Chauffeurs créés dans table `clients` à cause du rôle manquant
**Solution :** Ajout de `'role', 'driver'` dans les métadonnées
**Résultat :** Chauffeurs créés UNIQUEMENT dans table `drivers`

**C'est corrigé ! 🎉**
