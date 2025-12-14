# 🔥 Guide de Réinitialisation de la Base de Données

## ⚠️ ATTENTION

Ce script **SUPPRIME TOUTES LES DONNÉES** de votre base de données Supabase et recrée une architecture propre et optimisée.

**À utiliser uniquement si** :
- ✅ Vous êtes en développement
- ✅ Vous avez une sauvegarde complète
- ✅ Vous voulez repartir de zéro

---

## 📋 Ce que fait le script

### 1. **Nettoyage Complet**
- ❌ Supprime TOUS les triggers
- ❌ Supprime TOUTES les fonctions
- ❌ Supprime TOUTES les tables
- ❌ Supprime TOUTES les vues

### 2. **Reconstruction**
- ✅ Crée 9 tables optimisées
- ✅ Configure les index
- ✅ Active le RLS (Row Level Security)
- ✅ Crée les policies de sécurité
- ✅ Configure le trigger d'inscription

---

## 🗄️ Nouvelle Architecture

### Tables Créées

1. **`profiles`** - Table centrale (TOUS les utilisateurs)
2. **`drivers`** - Infos opérationnelles des chauffeurs
3. **`driver_vehicles`** - Véhicules des chauffeurs
4. **`driver_documents`** - Documents des chauffeurs
5. **`orders`** - Commandes
6. **`conversations`** - Conversations
7. **`messages`** - Messages
8. **`invoices`** - Factures
9. **`plaintes`** - Réclamations

### Tables Supprimées (Redondantes)

- ❌ `admins` (fusionné dans `profiles`)
- ❌ `clients` (fusionné dans `profiles`)
- ❌ `contact_messages` (remplacé par `conversations` + `messages`)
- ❌ `support_messages` (remplacé par `conversations` + `messages`)
- ❌ `threads` (remplacé par `conversations`)
- ❌ `order_events` (non utilisé)

---

## 🚀 Comment Exécuter

### Étape 1 : Sauvegarde (IMPORTANT !)

Si vous avez des données importantes :

```sql
-- Sauvegarder les utilisateurs
CREATE TABLE backup_profiles AS SELECT * FROM profiles;

-- Sauvegarder les commandes
CREATE TABLE backup_orders AS SELECT * FROM orders;
```

### Étape 2 : Exécuter le Script

1. Ouvrir **Supabase Dashboard**
2. Aller dans **SQL Editor**
3. Créer une nouvelle query
4. Copier-coller le contenu de `RESET_DATABASE.sql`
5. Cliquer sur **Run**

### Étape 3 : Vérifier

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier le trigger
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_schema = 'auth';

-- Vérifier les policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 📊 Comparaison Avant/Après

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Nombre de tables** | 15+ | 9 | -40% |
| **Tables utilisateurs** | 4 | 1 | -75% |
| **Tables messages** | 4 | 2 | -50% |
| **Redondance** | Élevée | Aucune | ✅ |
| **Complexité** | Élevée | Faible | ✅ |

---

## 🎯 Avantages de la Nouvelle Architecture

### 1. **Simplicité**
- Une seule table pour tous les utilisateurs
- Moins de JOINs
- Code plus simple

### 2. **Performance**
- Index optimisés
- Requêtes plus rapides
- Moins de tables à scanner

### 3. **Maintenabilité**
- Structure claire
- Facile à comprendre
- Facile à étendre

### 4. **Sécurité**
- RLS activé partout
- Policies bien définies
- Isolation des données

---

## 🔄 Migration du Code

Après avoir exécuté le script, vous devrez mettre à jour votre code :

### Avant
```typescript
// Récupérer un admin
const { data } = await supabase
  .from('admins')
  .select('*')
  .eq('user_id', userId);

// Récupérer un client
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', userId);
```

### Après
```typescript
// Récupérer n'importe quel utilisateur
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// Filtrer par rôle si nécessaire
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'admin');
```

---

## 📝 Checklist Post-Migration

- [ ] Vérifier que toutes les tables sont créées
- [ ] Vérifier que le trigger fonctionne (créer un utilisateur test)
- [ ] Vérifier les policies RLS
- [ ] Mettre à jour les hooks React (`useAuth`, etc.)
- [ ] Mettre à jour les types TypeScript
- [ ] Tester l'inscription
- [ ] Tester la connexion
- [ ] Tester les fonctionnalités principales

---

## 🆘 En Cas de Problème

### Erreur : "relation does not exist"
```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'profiles';
```

### Erreur : "permission denied"
```sql
-- Vérifier les policies RLS
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

### Restaurer une Sauvegarde
```sql
-- Si vous avez créé des backups
INSERT INTO profiles SELECT * FROM backup_profiles;
INSERT INTO orders SELECT * FROM backup_orders;
```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs Supabase
2. Vérifier la console du navigateur
3. Vérifier les erreurs SQL

---

## ✅ Résultat Attendu

Après exécution du script, vous aurez :

```
✅ 9 tables optimisées
✅ 0 redondance
✅ RLS activé
✅ Trigger configuré
✅ Policies de sécurité
✅ Architecture propre
```

---

**Date** : 2025-12-13  
**Version** : 2.0  
**Statut** : ✅ Prêt à exécuter
