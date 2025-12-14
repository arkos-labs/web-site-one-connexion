# 🚀 GUIDE COMPLET - Création et Connexion Chauffeur

## 📊 Architecture du système

Vous avez **2 applications** qui partagent la **même base de données Supabase** :

1. 🏢 **one connexion fini** → Application Admin/Client
   - L'admin crée les chauffeurs ici
   - Port: 5173 (npm run dev)

2. 🚗 **one-connexion-driver-80-main** → Application Chauffeur
   - Les chauffeurs se connectent ici
   - Port: (à vérifier)

---

## ✅ ÉTAPE 1 : Mettre à jour Supabase

### 1.1 Ouvrir Supabase SQL Editor
Allez sur : https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 1.2 Exécuter le script de correction
Copiez et exécutez le contenu de :
```
sql/fix_driver_email_domain.sql
```

Ce script va :
- ✅ Supprimer l'ancienne fonction `create_driver_user`
- ✅ Créer la nouvelle fonction avec le bon format d'email (`@driver.local`)

### 1.3 Corriger les chauffeurs existants (si nécessaire)
Si vous avez déjà créé des chauffeurs, exécutez :
```
sql/fix_existing_drivers_email.sql
```

---

## ✅ ÉTAPE 2 : Créer un chauffeur depuis l'Admin

### 2.1 Lancer l'application Admin
```bash
cd "c:\Users\CHERK\Desktop\projet\one connexion fini"
npm run dev
```

### 2.2 Se connecter en tant qu'Admin
- URL: http://localhost:5173/login
- Email: `cherkinicolas@gmail.com`
- Mot de passe: `admin123`

### 2.3 Créer un chauffeur de test
1. Aller dans **Dashboard Admin** → **Chauffeurs**
2. Cliquer sur **"Nouveau Chauffeur"**
3. Remplir le formulaire :
   - **Identifiant** : `test123`
   - **Mot de passe** : `password123`
   - **Prénom** : `Jean`
   - **Nom** : `Test`
   - **Téléphone** : `0612345678`
   - **Type véhicule** : `Scooter`
   - **Plaque** : `AB-123-CD`
4. Valider la création

### 2.4 Vérifier dans Supabase
Exécutez cette requête dans Supabase SQL Editor :
```sql
SELECT 
    u.email,
    p.role,
    d.first_name,
    d.last_name,
    d.status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.drivers d ON u.id = d.user_id
WHERE u.email = 'test123@driver.local';
```

Vous devriez voir :
- ✅ Email: `test123@driver.local`
- ✅ Role: `driver`
- ✅ Prénom: `Jean`
- ✅ Nom: `Test`
- ✅ Status: `offline`

---

## ✅ ÉTAPE 3 : Se connecter en tant que Chauffeur

### 3.1 Lancer l'application Chauffeur
```bash
cd "c:\Users\CHERK\Desktop\projet\one-connexion-driver-80-main"
npm run dev
```

### 3.2 Se connecter
1. Ouvrir l'application chauffeur dans le navigateur
2. Utiliser les identifiants :
   - **Identifiant** : `test123`
   - **Mot de passe** : `password123`

### 3.3 Vérifier la connexion
Le chauffeur devrait :
- ✅ Se connecter avec succès
- ✅ Accéder au dashboard chauffeur
- ✅ Voir son profil

---

## 🔍 VÉRIFICATION DES TABLES

### Tables remplies lors de la création d'un chauffeur :

1. **auth.users** ✅
   - Contient les credentials de connexion
   - Email format: `{identifiant}@driver.local`
   - Mot de passe hashé

2. **public.profiles** ✅
   - Contient le rôle de l'utilisateur
   - Role: `driver`

3. **public.drivers** ✅
   - Contient toutes les infos du chauffeur
   - Prénom, nom, téléphone, véhicule, etc.

### Requête de vérification complète :
```sql
SELECT 
    'auth.users' as table_name,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
WHERE u.email LIKE '%@driver.local'

UNION ALL

SELECT 
    'public.profiles' as table_name,
    p.id,
    p.role,
    p.created_at
FROM public.profiles p
WHERE p.role = 'driver'

UNION ALL

SELECT 
    'public.drivers' as table_name,
    d.user_id,
    d.first_name || ' ' || d.last_name as name,
    d.created_at
FROM public.drivers d;
```

---

## 🐛 DÉPANNAGE

### Problème : Le chauffeur ne peut pas se connecter

**Vérifier le format d'email :**
```sql
SELECT email FROM auth.users WHERE email LIKE '%@driver%';
```

Si vous voyez `@driver.oneconnexion`, exécutez :
```sql
UPDATE auth.users
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';
```

### Problème : Le chauffeur n'apparaît pas dans la table drivers

**Vérifier la cohérence :**
```sql
SELECT 
    u.id,
    u.email,
    p.role,
    d.user_id IS NOT NULL as has_driver_entry
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email LIKE '%@driver.local';
```

Si `has_driver_entry` est `false`, la fonction `create_driver_user` n'a pas fonctionné correctement.

---

## 📝 CHECKLIST FINALE

- [ ] Script `fix_driver_email_domain.sql` exécuté dans Supabase
- [ ] Script `fix_existing_drivers_email.sql` exécuté (si nécessaire)
- [ ] Chauffeur créé depuis l'interface admin
- [ ] Vérification dans Supabase : email format `@driver.local`
- [ ] Vérification : entrée dans `auth.users`
- [ ] Vérification : entrée dans `public.profiles` avec role `driver`
- [ ] Vérification : entrée dans `public.drivers`
- [ ] Application chauffeur lancée
- [ ] Connexion réussie avec les identifiants
- [ ] Accès au dashboard chauffeur

---

## 🎯 RÉSUMÉ

**Format d'email standardisé :** `{identifiant}@driver.local`

**Flux complet :**
1. Admin crée chauffeur → Fonction SQL `create_driver_user`
2. Fonction remplit 3 tables : `auth.users`, `profiles`, `drivers`
3. Chauffeur se connecte avec son identifiant
4. Application convertit : `identifiant` → `identifiant@driver.local`
5. Supabase Auth valide les credentials
6. Chauffeur accède au dashboard

**C'est tout ! 🚀**
