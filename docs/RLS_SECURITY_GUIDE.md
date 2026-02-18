# 🔒 Guide de Sécurité RLS pour la Table Orders

## 📋 Vue d'ensemble

Ce document explique la configuration de Row Level Security (RLS) mise en place sur la table `orders` pour garantir la sécurité des données.

## 🎯 Objectifs de Sécurité

### 1. **Isolation des Données Clients**
- Chaque client ne peut voir **que ses propres commandes**
- Le `client_id` est **automatiquement forcé** à l'ID de l'utilisateur authentifié
- Impossible de modifier le `client_id` après création (sauf pour les admins)

### 2. **Accès Complet pour Admins/Dispatchers**
- Les admins et dispatchers peuvent voir **toutes les commandes**
- Ils peuvent créer des commandes pour n'importe quel client
- Ils peuvent modifier et supprimer toutes les commandes

### 3. **Accès Limité pour Chauffeurs**
- Les chauffeurs peuvent voir uniquement leurs commandes assignées
- Ils peuvent modifier le statut de leurs commandes (accepter, refuser, démarrer, terminer)

## 🛡️ Règles de Sécurité Implémentées

### Règles de Lecture (SELECT)

| Rôle | Peut Voir |
|------|-----------|
| **Client** | Uniquement ses propres commandes (`client_id = auth.uid()`) |
| **Chauffeur** | Ses commandes assignées (`driver_id = auth.uid()`) |
| **Admin/Dispatcher** | Toutes les commandes |

### Règles d'Écriture (INSERT)

| Rôle | Peut Créer | Restrictions |
|------|------------|--------------|
| **Client** | Ses propres commandes | `client_id` forcé à `auth.uid()` via trigger |
| **Admin/Dispatcher** | Commandes pour n'importe quel client | Aucune restriction |

### Règles de Modification (UPDATE)

| Rôle | Peut Modifier | Restrictions |
|------|---------------|--------------|
| **Client** | Ses commandes en attente uniquement | Statut = `pending_acceptance` |
| **Chauffeur** | Ses commandes assignées | Peut mettre `driver_id` à NULL (refus) |
| **Admin/Dispatcher** | Toutes les commandes | Aucune restriction |

### Règles de Suppression (DELETE)

| Rôle | Peut Supprimer |
|------|----------------|
| **Client** | ❌ Non |
| **Chauffeur** | ❌ Non |
| **Admin** | ✅ Oui (toutes les commandes) |
| **Dispatcher** | ❌ Non |

## 🔧 Installation

### Prérequis

1. Avoir une table `profiles` avec une colonne `role` contenant les valeurs :
   - `'admin'`
   - `'dispatcher'`
   - `'client'`
   - `'driver'`

2. Avoir une table `drivers` avec une colonne `user_id` liée à `auth.uid()`

### Étapes d'Installation

1. **Connectez-vous à Supabase**
   - Allez sur [app.supabase.com](https://app.supabase.com)
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu latéral
   - Créez une nouvelle requête

3. **Exécutez le Script**
   - Copiez le contenu de `sql/enable_rls_orders_security.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur `Ctrl+Enter`

4. **Vérifiez les Résultats**
   - Le script affichera des messages de confirmation
   - Vérifiez qu'il n'y a pas d'erreurs

## ✅ Tests de Sécurité

### Test 1: Isolation des Données Clients

```sql
-- En tant que client (user_id = 'client-123')
SELECT * FROM orders;
-- ✅ Résultat attendu: Uniquement les commandes où client_id = 'client-123'
```

### Test 2: Forçage du client_id

```sql
-- En tant que client (user_id = 'client-123')
INSERT INTO orders (
    client_id,
    pickup_address,
    delivery_address,
    price,
    delivery_type,
    status
) VALUES (
    'autre-client-456',  -- ⚠️ Tentative de créer une commande pour un autre client
    '123 Rue A',
    '456 Rue B',
    25.00,
    'express',
    'pending_acceptance'
);

-- ✅ Résultat: La commande sera créée avec client_id = 'client-123' (forcé par le trigger)
```

### Test 3: Protection contre la Modification du client_id

```sql
-- En tant que client (user_id = 'client-123')
UPDATE orders 
SET client_id = 'autre-client-456'
WHERE id = 'order-789';

-- ❌ Résultat attendu: Erreur "Vous ne pouvez pas modifier le client_id d'une commande"
```

### Test 4: Accès Admin

```sql
-- En tant qu'admin
SELECT * FROM orders;
-- ✅ Résultat attendu: Toutes les commandes de tous les clients
```

### Test 5: Accès Chauffeur

```sql
-- En tant que chauffeur (user_id = 'driver-999')
SELECT * FROM orders;
-- ✅ Résultat attendu: Uniquement les commandes où driver_id = 'driver-999'
```

## 🚨 Points de Vigilance

### 1. **Ne JAMAIS désactiver RLS**
```sql
-- ❌ NE JAMAIS FAIRE CECI
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

### 2. **Utiliser les Service Role Keys avec Précaution**
- Les Service Role Keys **contournent le RLS**
- À utiliser uniquement côté serveur (Edge Functions, backend)
- **JAMAIS** dans le code frontend

### 3. **Vérifier les Rôles dans la Table profiles**
```sql
-- Vérifier qu'un utilisateur a le bon rôle
SELECT id, email, role FROM profiles WHERE id = auth.uid();
```

### 4. **Tester Après Chaque Modification**
- Toujours tester avec différents rôles après une modification
- Utiliser des comptes de test pour chaque rôle

## 📊 Monitoring et Audit

### Vérifier les Policies Actives

```sql
SELECT 
    policyname,
    cmd AS operation,
    qual AS using_clause
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
```

### Vérifier que RLS est Activé

```sql
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'orders';
```

### Vérifier les Triggers de Sécurité

```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders';
```

## 🔄 Maintenance

### Ajouter un Nouveau Rôle

Si vous ajoutez un nouveau rôle (ex: `'manager'`), modifiez la fonction helper :

```sql
CREATE OR REPLACE FUNCTION is_admin_or_dispatcher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dispatcher', 'manager')  -- Ajouter le nouveau rôle
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### Modifier une Policy

```sql
-- 1. Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Nom de la policy" ON orders;

-- 2. Créer la nouvelle policy
CREATE POLICY "Nom de la policy"
ON orders
FOR SELECT
TO authenticated
USING (votre_condition);
```

## 🆘 Dépannage

### Problème: "permission denied for table orders"

**Cause**: RLS est activé mais aucune policy ne correspond à votre cas

**Solution**: Vérifiez que :
1. L'utilisateur est authentifié (`auth.uid()` n'est pas NULL)
2. Le rôle est correctement défini dans la table `profiles`
3. Les policies couvrent votre cas d'usage

### Problème: "new row violates row-level security policy"

**Cause**: La clause `WITH CHECK` de la policy INSERT/UPDATE n'est pas satisfaite

**Solution**: Vérifiez que les données insérées/modifiées respectent les conditions de la policy

### Problème: Les admins ne peuvent pas voir toutes les commandes

**Cause**: Le rôle n'est pas correctement défini ou la fonction `is_admin_or_dispatcher()` ne fonctionne pas

**Solution**:
```sql
-- Vérifier le rôle de l'utilisateur
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- Tester la fonction
SELECT is_admin_or_dispatcher();
```

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## 🎓 Bonnes Pratiques

1. **Toujours tester en local d'abord** (avec Supabase CLI)
2. **Utiliser des transactions** pour les modifications critiques
3. **Documenter chaque policy** avec des commentaires SQL
4. **Auditer régulièrement** les accès et les policies
5. **Former les développeurs** aux principes du RLS
6. **Utiliser des comptes de test** pour chaque rôle
7. **Ne jamais exposer les Service Role Keys** dans le frontend

## 🔐 Checklist de Sécurité

- [x] RLS activé sur la table `orders`
- [x] Policies de lecture pour clients, chauffeurs, admins
- [x] Policies d'écriture avec validation du `client_id`
- [x] Trigger pour forcer le `client_id` à `auth.uid()`
- [x] Trigger pour empêcher la modification du `client_id`
- [x] Fonction helper `is_admin_or_dispatcher()`
- [x] Tests de sécurité documentés
- [x] Documentation complète
- [ ] Tests effectués avec des comptes réels
- [ ] Formation de l'équipe sur le RLS
- [ ] Monitoring mis en place

---

**Auteur**: Expert Sécurité Supabase  
**Date**: 2025-12-19  
**Version**: 1.0.0  
**Statut**: ✅ Production Ready
