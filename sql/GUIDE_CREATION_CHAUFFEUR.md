# 🎯 GUIDE : Création de Chauffeurs

## 📋 Problème Résolu

Quand vous créez un chauffeur via l'interface admin, il doit être correctement inséré dans **deux tables** :
1. **`public.profiles`** - Informations de base (nom, email, rôle, statut)
2. **`public.drivers`** - Informations opérationnelles (véhicule, localisation, stats)

## ✅ Solution Mise en Place

### 1. Architecture de la Base de Données

```
auth.users (Supabase Auth)
    ↓
public.profiles (Table centrale - TOUS les utilisateurs)
    ↓ (si role = 'chauffeur')
public.drivers (Informations opérationnelles des chauffeurs)
```

### 2. Fonction `create_driver_user`

La fonction a été mise à jour pour :
- ✅ Créer l'utilisateur dans `auth.users` avec email `username@driver.local`
- ✅ Insérer dans `public.profiles` avec `role = 'chauffeur'` et `status = 'approved'`
- ✅ Insérer dans `public.drivers` avec les informations du véhicule
- ✅ Gérer les conflits avec `ON CONFLICT DO UPDATE`

## 🚀 Comment Utiliser

### Option 1 : Exécuter le Script Complet (Recommandé pour Reset)

Si vous voulez **réinitialiser complètement** la base de données :

```bash
# Dans Supabase SQL Editor
# Exécuter le fichier : sql/RESET_DATABASE.sql
# Puis exécuter : sql/create_driver_rpc.sql
```

### Option 2 : Mettre à Jour Uniquement la Fonction

Si votre base de données est déjà configurée et vous voulez juste mettre à jour la fonction :

```bash
# Dans Supabase SQL Editor
# Exécuter uniquement : sql/create_driver_rpc.sql
```

## 📝 Utilisation dans l'Interface Admin

### Créer un Chauffeur

1. **Ouvrir le Dashboard Admin**
2. **Aller dans "Chauffeurs"**
3. **Cliquer sur "Nouveau Chauffeur"**
4. **Remplir le formulaire** :
   - **Identifiant** : `chauffeur1` (utilisé pour se connecter)
   - **Mot de passe** : `123456` (minimum 6 caractères)
   - **Prénom** : `Jean`
   - **Nom** : `Dupont`
   - **Téléphone** : `06 12 34 56 78`
   - **Type de véhicule** : `Scooter`
   - **Plaque** : `AB-123-CD`
   - **Capacité** : `10 colis`

5. **Valider** → Le chauffeur est créé !

### Ce qui se passe en coulisses

```sql
-- 1. Création dans auth.users
INSERT INTO auth.users (email, ...) 
VALUES ('chauffeur1@driver.local', ...);

-- 2. Création dans profiles
INSERT INTO public.profiles (
  id, email, first_name, last_name, phone, 
  role, status, driver_id
) VALUES (
  new_user_id, 'chauffeur1@driver.local', 'Jean', 'Dupont', '06...',
  'chauffeur', 'approved', 'chauffeur1'
);

-- 3. Création dans drivers
INSERT INTO public.drivers (
  user_id, status, vehicle_type, vehicle_registration, vehicle_capacity
) VALUES (
  new_user_id, 'offline', 'Scooter', 'AB-123-CD', '10 colis'
);
```

## 🔍 Vérification

### Vérifier qu'un chauffeur a été créé correctement

```sql
-- 1. Vérifier dans auth.users
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email LIKE '%@driver.local';

-- 2. Vérifier dans profiles
SELECT id, email, first_name, last_name, role, status, driver_id
FROM public.profiles
WHERE role = 'chauffeur';

-- 3. Vérifier dans drivers
SELECT d.user_id, d.status, d.vehicle_type, d.vehicle_registration,
       p.first_name, p.last_name
FROM public.drivers d
JOIN public.profiles p ON p.id = d.user_id;
```

### Résultat Attendu

Pour un chauffeur créé avec identifiant `chauffeur1` :

**auth.users** :
```
id: 123e4567-e89b-12d3-a456-426614174000
email: chauffeur1@driver.local
role: chauffeur
```

**public.profiles** :
```
id: 123e4567-e89b-12d3-a456-426614174000
email: chauffeur1@driver.local
first_name: Jean
last_name: Dupont
role: chauffeur
status: approved
driver_id: chauffeur1
```

**public.drivers** :
```
user_id: 123e4567-e89b-12d3-a456-426614174000
status: offline
vehicle_type: Scooter
vehicle_registration: AB-123-CD
vehicle_capacity: 10 colis
```

## 🔐 Connexion du Chauffeur

Le chauffeur peut maintenant se connecter à l'application chauffeur avec :
- **Identifiant** : `chauffeur1`
- **Mot de passe** : `123456`

L'application convertit automatiquement `chauffeur1` en `chauffeur1@driver.local` pour l'authentification.

## 🐛 Dépannage

### Erreur : "Cet identifiant est déjà utilisé"

**Cause** : Un chauffeur avec cet identifiant existe déjà.

**Solution** : Choisir un autre identifiant ou supprimer l'ancien chauffeur.

### Erreur : "column does not exist"

**Cause** : La structure de la base de données ne correspond pas à la fonction.

**Solution** : Exécuter `RESET_DATABASE.sql` puis `create_driver_rpc.sql`.

### Le chauffeur n'apparaît pas dans la table `drivers`

**Cause** : Le trigger `handle_new_user` n'a pas fonctionné ou la fonction a échoué.

**Solution** : Vérifier les logs et réexécuter `create_driver_rpc.sql`.

## 📚 Fichiers Importants

- **`sql/RESET_DATABASE.sql`** : Réinitialise la base de données complète
- **`sql/create_driver_rpc.sql`** : Crée/met à jour la fonction `create_driver_user`
- **`sql/SETUP_COMPLET.sql`** : Combine les deux scripts ci-dessus
- **`src/components/admin/drivers/CreateDriverModal.tsx`** : Interface de création

## ✨ Améliorations Futures

- [ ] Ajouter la validation du format de plaque d'immatriculation
- [ ] Permettre l'upload de documents (permis, assurance) lors de la création
- [ ] Envoyer un email/SMS au chauffeur avec ses identifiants
- [ ] Générer automatiquement un mot de passe sécurisé
- [ ] Ajouter un QR code pour faciliter la première connexion

---

**Date de mise à jour** : 2025-12-13  
**Version** : 2.0 - Architecture centralisée avec profiles + drivers
