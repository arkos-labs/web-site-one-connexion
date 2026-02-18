# 🚀 Guide Rapide - Sécurisation RLS de la Table Orders

## ⚡ Installation en 5 Minutes

### Étape 1: Connexion à Supabase
1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu latéral

### Étape 2: Exécution du Script Principal
1. Ouvrez le fichier `sql/enable_rls_orders_security.sql`
2. Copiez tout le contenu
3. Collez-le dans le SQL Editor de Supabase
4. Cliquez sur **Run** (ou `Ctrl+Enter`)
5. ✅ Vérifiez qu'il n'y a pas d'erreurs

### Étape 3: Vérification
1. Ouvrez le fichier `sql/test_rls_orders_security.sql`
2. Copiez et exécutez-le dans le SQL Editor
3. ✅ Vérifiez que tous les tests passent

### Étape 4: Tests avec Différents Rôles
Créez des utilisateurs de test via **Authentication > Users** :
- `test-client@example.com` (rôle: client)
- `test-admin@example.com` (rôle: admin)
- `test-driver@example.com` (rôle: driver)

Connectez-vous avec chaque compte et testez l'accès aux commandes.

---

## 🔒 Ce Qui a Été Sécurisé

### ✅ Protection des Données Clients
- Les clients ne voient **que leurs propres commandes**
- Le `client_id` est **automatiquement forcé** lors de la création
- Impossible de modifier le `client_id` après création

### ✅ Accès Contrôlé pour les Chauffeurs
- Les chauffeurs voient uniquement leurs commandes assignées
- Ils peuvent accepter/refuser/démarrer/terminer leurs courses

### ✅ Accès Complet pour les Admins
- Les admins peuvent voir et modifier toutes les commandes
- Ils peuvent créer des commandes pour n'importe quel client

---

## 📋 Règles Implémentées

| Action | Client | Chauffeur | Admin/Dispatcher |
|--------|--------|-----------|------------------|
| **Voir ses commandes** | ✅ | ✅ | ✅ |
| **Voir toutes les commandes** | ❌ | ❌ | ✅ |
| **Créer une commande** | ✅ (pour soi) | ❌ | ✅ (pour tous) |
| **Modifier ses commandes** | ✅ (si pending) | ✅ (assignées) | ✅ (toutes) |
| **Supprimer une commande** | ❌ | ❌ | ✅ |

---

## 🛡️ Sécurités Automatiques

### 1. Forçage du client_id
```typescript
// Frontend - Le client essaie de créer une commande pour un autre client
const { data, error } = await supabase
  .from('orders')
  .insert({
    client_id: 'autre-client-id',  // ⚠️ Tentative de fraude
    pickup_address: 'Adresse A',
    delivery_address: 'Adresse B',
    // ...
  });

// ✅ Résultat: Le client_id sera automatiquement forcé à auth.uid()
```

### 2. Protection contre la Modification
```typescript
// Frontend - Le client essaie de modifier le client_id
const { data, error } = await supabase
  .from('orders')
  .update({ client_id: 'autre-client-id' })
  .eq('id', 'order-id');

// ❌ Résultat: Erreur "Vous ne pouvez pas modifier le client_id"
```

### 3. Isolation des Données
```typescript
// Frontend - Le client essaie de voir toutes les commandes
const { data, error } = await supabase
  .from('orders')
  .select('*');

// ✅ Résultat: Seulement les commandes où client_id = auth.uid()
```

---

## 🚨 Points d'Attention

### ⚠️ Service Role Keys
Les **Service Role Keys** contournent le RLS !
- ✅ Utilisez-les **uniquement côté serveur** (Edge Functions)
- ❌ **JAMAIS** dans le code frontend
- ❌ **JAMAIS** dans le code client

```typescript
// ❌ DANGEREUX - Ne JAMAIS faire ça
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxx.supabase.co',
  'service_role_key_here'  // ⚠️ Contourne le RLS !
)
```

```typescript
// ✅ CORRECT - Utiliser la clé anon
const supabase = createClient(
  'https://xxx.supabase.co',
  'anon_key_here'  // ✅ Respecte le RLS
)
```

### ⚠️ Ne Jamais Désactiver RLS
```sql
-- ❌ NE JAMAIS FAIRE CECI
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

---

## 🔍 Vérifications Rapides

### Vérifier que RLS est Activé
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
-- Résultat attendu: rowsecurity = true
```

### Vérifier les Policies
```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'orders';
-- Résultat attendu: au moins 9 policies
```

### Tester l'Isolation des Données
```typescript
// En tant que client
const { data } = await supabase
  .from('orders')
  .select('client_id')
  .neq('client_id', user.id);  // Essayer de voir les commandes des autres

console.log(data);  // ✅ Doit être vide []
```

---

## 📞 Support

### En cas de Problème

1. **Vérifiez les logs Supabase**
   - SQL Editor > Logs
   - Recherchez les erreurs RLS

2. **Vérifiez le rôle de l'utilisateur**
   ```sql
   SELECT id, email, role 
   FROM profiles 
   WHERE id = auth.uid();
   ```

3. **Consultez la documentation**
   - Voir `docs/RLS_SECURITY_GUIDE.md`
   - [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Script `enable_rls_orders_security.sql` exécuté
- [ ] Tests `test_rls_orders_security.sql` passés
- [ ] Testé avec un compte client
- [ ] Testé avec un compte chauffeur
- [ ] Testé avec un compte admin
- [ ] Vérifié que les Service Role Keys ne sont pas exposées
- [ ] Documentation lue et comprise
- [ ] Équipe formée sur le RLS

---

## 🎯 Prochaines Étapes

Après avoir sécurisé la table `orders`, pensez à :

1. **Sécuriser les autres tables**
   - `invoices`
   - `clients`
   - `drivers`
   - `messages`

2. **Mettre en place un monitoring**
   - Logs d'accès
   - Alertes sur les tentatives d'accès non autorisées

3. **Former l'équipe**
   - Bonnes pratiques RLS
   - Utilisation correcte des clés API

---

**Besoin d'aide ?** Consultez `docs/RLS_SECURITY_GUIDE.md` pour plus de détails.

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-12-19
