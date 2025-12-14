# 🔧 DÉPANNAGE - Connexion chauffeur impossible

## ❌ Erreur : "Identifiant ou mot de passe incorrect"

### 🔍 Causes possibles

1. **Les scripts SQL n'ont pas été exécutés dans Supabase** ⭐ (cause la plus fréquente)
2. Le chauffeur n'existe pas dans la base de données
3. Le format d'email est incorrect
4. Le mot de passe ne correspond pas

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Exécuter le diagnostic

Ouvrez Supabase SQL Editor :
🔗 https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

Exécutez le script :
```
sql/diagnostic_connexion_chauffeur.sql
```

Ce script va vous dire exactement quel est le problème.

---

### Étape 2 : Appliquer la solution selon le diagnostic

#### 🔴 Si "Aucun chauffeur n'existe"

**Exécutez dans Supabase :**
```sql
-- Script 1 : Créer la fonction
sql/fix_driver_email_domain.sql

-- Script 2 : Créer un chauffeur de test
sql/setup_and_test_driver.sql
```

**Puis testez avec :**
- Identifiant : `test123`
- Mot de passe : `password123`

---

#### 🔴 Si "Format email incorrect (@driver.oneconnexion)"

**Exécutez dans Supabase :**
```sql
sql/fix_existing_drivers_email.sql
```

---

#### 🔴 Si "Fonction n'existe pas"

**Exécutez dans Supabase :**
```sql
sql/fix_driver_email_domain.sql
```

---

#### 🔴 Si "Pas d'entrée dans drivers"

Le chauffeur existe dans `auth.users` mais pas dans `drivers`.

**Solution :** Recréez le chauffeur depuis l'interface admin.

---

## 🎯 TEST RAPIDE

### Créer un chauffeur de test manuellement dans Supabase

Exécutez ce script dans Supabase SQL Editor :

```sql
-- Supprimer le chauffeur de test s'il existe
DELETE FROM public.drivers WHERE email = 'test123@driver.local';
DELETE FROM public.profiles WHERE email = 'test123@driver.local';
DELETE FROM auth.users WHERE email = 'test123@driver.local';

-- Créer le chauffeur de test
SELECT create_driver_user(
    'test123',              -- username
    'password123',          -- password
    'Jean',                 -- first_name
    'Test',                 -- last_name
    '0612345678',          -- phone
    '123 Rue de Test',     -- address
    '12345678900012',      -- siret
    'Scooter',             -- vehicle_type
    'AB-123-CD',           -- vehicle_registration
    '10 colis'             -- vehicle_capacity
);

-- Vérifier la création
SELECT 
    u.email,
    p.role,
    d.first_name,
    d.last_name
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.drivers d ON u.id = d.user_id
WHERE u.email = 'test123@driver.local';
```

**Résultat attendu :**
```
email                    | role   | first_name | last_name
-------------------------|--------|------------|----------
test123@driver.local     | driver | Jean       | Test
```

**Puis testez la connexion avec :**
- Identifiant : `test123`
- Mot de passe : `password123`

---

## 🔍 Vérifications manuelles

### 1. Vérifier que le chauffeur existe

```sql
SELECT * FROM auth.users WHERE email = 'test123@driver.local';
```

Si vide → Le chauffeur n'existe pas

### 2. Vérifier le format d'email

```sql
SELECT email FROM auth.users WHERE email LIKE '%@driver.%';
```

Doit afficher : `xxx@driver.local` (PAS `@driver.oneconnexion`)

### 3. Vérifier que la fonction existe

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_driver_user';
```

Si vide → La fonction n'existe pas

---

## 📋 Checklist de dépannage

- [ ] Script `diagnostic_connexion_chauffeur.sql` exécuté
- [ ] Résultat du diagnostic lu
- [ ] Script de correction exécuté (selon diagnostic)
- [ ] Chauffeur de test créé
- [ ] Vérification : chauffeur existe dans `auth.users`
- [ ] Vérification : chauffeur existe dans `drivers`
- [ ] Vérification : email format `@driver.local`
- [ ] Test de connexion avec `test123` / `password123`

---

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier la console du navigateur

1. Ouvrez la console (F12)
2. Essayez de vous connecter
3. Regardez les erreurs

**Erreurs courantes :**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid login credentials` | Email ou mot de passe incorrect | Vérifier le format email |
| `Database error` | Chauffeur n'existe pas dans `drivers` | Recréer le chauffeur |
| `Network error` | Problème de connexion Supabase | Vérifier `.env` |

---

## 🎯 Solution garantie

Si rien ne fonctionne, exécutez **TOUS** ces scripts dans l'ordre :

```sql
-- 1. Créer/Mettre à jour la fonction
sql/fix_driver_email_domain.sql

-- 2. Nettoyer les chauffeurs mal placés
sql/verify_no_drivers_in_clients.sql

-- 3. Corriger les emails existants
sql/fix_existing_drivers_email.sql

-- 4. Créer un chauffeur de test
sql/setup_and_test_driver.sql
```

Puis testez avec : `test123` / `password123`

---

## ✅ Ça devrait fonctionner !

Si après tout ça, ça ne fonctionne toujours pas, partagez le résultat du script `diagnostic_connexion_chauffeur.sql`.
