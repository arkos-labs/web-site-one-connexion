# 🔧 Guide de Dépannage - Erreur 500 Inscription

## ❌ Problème

Lors de l'inscription d'un chauffeur, vous obtenez :
```
Error d'inscription
Database error saving new user
```

**Erreur dans la console** :
```
500 (Internal Server Error)
Registration error: AuthApiError: Database error saving new user
```

---

## 🔍 Cause

Le **trigger `handle_new_user`** échoue lors de l'insertion dans la base de données. Cela peut être dû à :

1. ❌ La table `profiles` n'existe pas
2. ❌ La table `drivers` n'existe pas
3. ❌ Le trigger `handle_new_user` n'est pas configuré
4. ❌ Le trigger a une erreur dans son code
5. ❌ Les permissions RLS bloquent l'insertion

---

## ✅ Solution

### Étape 1 : Diagnostic

Exécuter le script de diagnostic dans **Supabase SQL Editor** :

```sql
-- Copier-coller le contenu de :
sql/DIAGNOSTIC_INSCRIPTION.sql
```

Ce script va vous dire **exactement** ce qui manque.

---

### Étape 2 : Selon le Résultat

#### Cas A : Les tables n'existent pas

**Symptôme** :
```
❌ Table profiles MANQUANTE !
❌ Table drivers MANQUANTE !
```

**Solution** :
```sql
-- Exécuter dans Supabase SQL Editor :
sql/RESET_DATABASE.sql
```

Cela va créer toutes les tables nécessaires.

---

#### Cas B : Le trigger n'existe pas

**Symptôme** :
```
✅ Tables OK
❌ Trigger MANQUANT
```

**Solution** :
```sql
-- Exécuter dans Supabase SQL Editor :
sql/FIX_TRIGGER_INSCRIPTION.sql
```

Cela va créer le trigger corrigé.

---

#### Cas C : Le trigger existe mais a une erreur

**Symptôme** :
```
✅ Tables OK
✅ Trigger OK
❌ Erreur 500 persiste
```

**Solution** :

1. **Voir les logs Supabase** :
   - Dashboard → Logs → Postgres Logs
   - Chercher les erreurs récentes

2. **Recréer le trigger** :
```sql
-- Exécuter :
sql/FIX_TRIGGER_INSCRIPTION.sql
```

---

## 🚀 Procédure Complète (Recommandée)

Si vous voulez **repartir de zéro** avec une base propre :

### 1. Exécuter RESET_DATABASE.sql

```sql
-- Dans Supabase SQL Editor
-- Copier-coller le contenu de :
sql/RESET_DATABASE.sql
```

**Ce que ça fait** :
- ✅ Supprime TOUT (utilisateurs, tables, triggers)
- ✅ Recrée 9 tables optimisées
- ✅ Configure le trigger
- ✅ Active le RLS

### 2. Vérifier avec VERIFICATION_RESET.sql

```sql
-- Copier-coller le contenu de :
sql/VERIFICATION_RESET.sql
```

**Résultat attendu** :
```
✅ 9 tables créées
✅ 0 utilisateurs
✅ Trigger configuré
✅ Policies RLS actives
```

### 3. Tester l'inscription

Retourner sur votre app et créer un compte test :
- Email : `test@example.com`
- Nom : `Test Chauffeur`
- Téléphone : `+33612345678`
- Mot de passe : `test123`

### 4. Vérifier dans Supabase

```sql
-- Vérifier que l'utilisateur a été créé
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Vérifier le profil
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Vérifier l'entrée driver
SELECT * FROM drivers WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'test@example.com'
);
```

**Résultat attendu** :
```
✅ 1 ligne dans auth.users
✅ 1 ligne dans profiles (status='pending', role='chauffeur')
✅ 1 ligne dans drivers (status='offline')
```

---

## 🐛 Débogage Avancé

### Voir les logs du trigger

```sql
-- Activer les logs
SET client_min_messages TO NOTICE;

-- Créer un utilisateur test
-- Les logs s'afficheront dans la console SQL
```

### Tester le trigger manuellement

```sql
-- Simuler une insertion
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Insérer dans auth.users (simulation)
    -- Le trigger devrait se déclencher
    
    -- Vérifier
    SELECT * FROM profiles WHERE id = test_user_id;
END $$;
```

---

## 📋 Checklist de Vérification

Avant de tester l'inscription, vérifier que :

- [ ] La table `profiles` existe
- [ ] La table `drivers` existe
- [ ] Le trigger `handle_new_user` existe
- [ ] La fonction `handle_new_user()` existe
- [ ] Les policies RLS sont configurées
- [ ] Supabase est bien connecté (vérifier `.env`)

---

## 🎯 Résumé des Scripts

| Script | Utilité |
|--------|---------|
| **`DIAGNOSTIC_INSCRIPTION.sql`** | Identifier le problème |
| **`FIX_TRIGGER_INSCRIPTION.sql`** | Corriger le trigger |
| **`RESET_DATABASE.sql`** | Tout recréer (solution radicale) |
| **`VERIFICATION_RESET.sql`** | Vérifier que tout est OK |

---

## 💡 Ordre d'Exécution Recommandé

```
1. DIAGNOSTIC_INSCRIPTION.sql
   ↓
2. Selon le résultat :
   - Si tables manquantes → RESET_DATABASE.sql
   - Si trigger manquant → FIX_TRIGGER_INSCRIPTION.sql
   ↓
3. VERIFICATION_RESET.sql
   ↓
4. Tester l'inscription
```

---

## ✅ Après la Correction

Une fois le problème résolu, l'inscription devrait :

1. ✅ Créer un utilisateur dans `auth.users`
2. ✅ Créer un profil dans `profiles` (status='pending')
3. ✅ Créer une entrée dans `drivers` (status='offline')
4. ✅ Afficher le message : "Demande d'inscription envoyée !"
5. ✅ Rediriger vers `/login` après 3 secondes

---

**Prêt ?** → Commencez par exécuter `DIAGNOSTIC_INSCRIPTION.sql` ! 🚀
