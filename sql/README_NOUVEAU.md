# 📁 Dossier SQL - Scripts Supabase

## 🚀 DÉMARRAGE RAPIDE

### Vous avez un problème de création de chauffeurs ?

**Lisez d'abord** : [`SOLUTION_RAPIDE.md`](./SOLUTION_RAPIDE.md) ⚡

### Ordre d'exécution recommandé :

```
1. DIAGNOSTIC_RAPIDE.sql     ← Commencez par ici !
2. RESET_DATABASE.sql        ← Si le diagnostic dit que les tables manquent
3. create_driver_rpc.sql     ← Toujours exécuter
4. TEST_CREATE_DRIVER.sql    ← Pour vérifier que tout fonctionne
```

---

## 📚 Documentation

### Guides Principaux

| Fichier | Description |
|---------|-------------|
| **SOLUTION_RAPIDE.md** | ⚡ Guide ultra-rapide en 3 étapes |
| **DEPANNAGE_CREATION_CHAUFFEUR.md** | 🔧 Guide complet de dépannage |
| **GUIDE_CREATION_CHAUFFEUR.md** | 📖 Guide détaillé avec explications |
| **RESUME_SOLUTION.md** | 📊 Résumé technique de la solution |

---

## 🛠️ Scripts SQL

### Scripts de Diagnostic

| Fichier | Utilité | Quand l'utiliser |
|---------|---------|------------------|
| **DIAGNOSTIC_RAPIDE.sql** | Diagnostic en 2 minutes | Toujours en premier ! |
| **DIAGNOSTIC_INSCRIPTION.sql** | Diagnostic détaillé inscription | Si problème d'inscription |
| **DIAGNOSTIC_COMPLET.sql** | Diagnostic complet système | Pour analyse approfondie |

### Scripts d'Installation

| Fichier | Utilité | Quand l'utiliser |
|---------|---------|------------------|
| **RESET_DATABASE.sql** | Réinitialisation complète | Si tables manquent ou structure incorrecte |
| **create_driver_rpc.sql** | Fonction create_driver_user | Toujours (après RESET_DATABASE) |
| **SETUP_COMPLET.sql** | Installation complète | Alternative : combine RESET + create_driver |

### Scripts de Test

| Fichier | Utilité | Quand l'utiliser |
|---------|---------|------------------|
| **TEST_CREATE_DRIVER.sql** | Test automatisé création chauffeur | Après installation pour vérifier |

---

## 🏗️ Architecture de la Base de Données

### Tables Principales

```
auth.users (Supabase Auth)
    ↓
public.profiles (Table centrale - TOUS les utilisateurs)
    ├── admin
    ├── client
    └── chauffeur
        ↓
public.drivers (Informations opérationnelles des chauffeurs)
```

### Tables Complètes

1. **profiles** - Informations de base de tous les utilisateurs
2. **drivers** - Informations opérationnelles des chauffeurs
3. **driver_vehicles** - Véhicules des chauffeurs (multi-véhicules)
4. **driver_documents** - Documents des chauffeurs (permis, assurance, etc.)
5. **orders** - Commandes de livraison
6. **conversations** - Conversations entre utilisateurs
7. **messages** - Messages des conversations
8. **invoices** - Factures
9. **plaintes** - Réclamations

---

## 🔧 Fonctions SQL

### create_driver_user

Crée un chauffeur avec identifiant/mot de passe.

**Paramètres** :
- `username` - Identifiant de connexion
- `password` - Mot de passe
- `first_name` - Prénom
- `last_name` - Nom
- `phone` - Téléphone
- `address` - Adresse
- `siret` - Numéro SIRET
- `vehicle_type` - Type de véhicule
- `vehicle_registration` - Plaque d'immatriculation
- `vehicle_capacity` - Capacité du véhicule

**Retourne** : UUID du chauffeur créé

**Exemple** :
```sql
SELECT create_driver_user(
    'chauffeur1',
    'password123',
    'Jean',
    'Dupont',
    '0612345678',
    '123 Rue de Paris',
    '12345678900012',
    'Scooter',
    'AB-123-CD',
    '10 colis'
);
```

---

## 🔍 Vérifications Utiles

### Vérifier qu'un chauffeur existe dans toutes les tables

```sql
SELECT 
    u.email,
    p.first_name || ' ' || p.last_name as nom_complet,
    p.role,
    p.status,
    d.vehicle_type,
    CASE 
        WHEN d.user_id IS NOT NULL THEN '✅ OUI'
        ELSE '❌ NON'
    END as entree_drivers
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.drivers d ON d.user_id = p.id
WHERE u.email LIKE '%@driver.local'
ORDER BY u.created_at DESC;
```

### Vérifier que le trigger existe

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND trigger_name = 'handle_new_user';
```

### Vérifier que la fonction existe

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_driver_user';
```

---

## 🐛 Problèmes Courants

### "relation 'public.drivers' does not exist"

**Solution** : Exécuter `RESET_DATABASE.sql`

### "function create_driver_user does not exist"

**Solution** : Exécuter `create_driver_rpc.sql`

### "column 'first_name' does not exist in table drivers"

**Solution** :
```sql
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text);
```
Puis exécuter `create_driver_rpc.sql`

### Le chauffeur est créé dans profiles mais pas dans drivers

**Solution** : Vérifier le trigger et réexécuter `RESET_DATABASE.sql`

---

## 📖 Autres Fichiers (Historique)

Ces fichiers sont conservés pour référence mais ne sont plus nécessaires :

- `FINAL_COMPLETE_DRIVER_SYSTEM.sql` - Ancienne version
- `fix_database.sql` - Ancien script de réparation
- `fix_driver_email_domain.sql` - Ancien fix
- `setup_and_test_driver.sql` - Ancien script de test
- `update_driver_credentials.sql` - Ancien script de mise à jour
- `wipe_all_users.sql` - Script de nettoyage (ATTENTION : supprime tout !)

Et de nombreux fichiers de documentation historique (`.md`).

---

## ✅ Checklist Complète

- [ ] Exécuté `DIAGNOSTIC_RAPIDE.sql`
- [ ] Toutes les vérifications sont ✅
- [ ] Exécuté `RESET_DATABASE.sql` (si nécessaire)
- [ ] Exécuté `create_driver_rpc.sql`
- [ ] Exécuté `TEST_CREATE_DRIVER.sql` avec succès
- [ ] Chauffeur de test visible dans les 3 tables
- [ ] Création via interface admin fonctionne
- [ ] Connexion du chauffeur fonctionne

---

## 🆘 Besoin d'Aide ?

1. **Problème de création** → `DEPANNAGE_CREATION_CHAUFFEUR.md`
2. **Comprendre l'architecture** → `GUIDE_CREATION_CHAUFFEUR.md`
3. **Résumé technique** → `RESUME_SOLUTION.md`
4. **Solution rapide** → `SOLUTION_RAPIDE.md`

---

**Date de mise à jour** : 2025-12-13  
**Version** : 2.0 - Architecture centralisée avec profiles + drivers
