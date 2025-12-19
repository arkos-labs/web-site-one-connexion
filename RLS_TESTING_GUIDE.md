# 🔒 Guide de Test RLS pour la Table Orders

## 📋 Prérequis

Avant d'exécuter le script RLS, assurez-vous que :
- ✅ La table `orders` existe
- ✅ Les tables `admins`, `clients`, et `drivers` existent
- ✅ Les colonnes `client_id` et `driver_id` sont de type UUID
- ✅ Vous avez des comptes de test pour chaque rôle

## 🚀 Installation

### Étape 1 : Exécuter le Script SQL

```bash
# Via Supabase Dashboard
1. Allez dans SQL Editor
2. Copiez le contenu de sql/enable_rls_orders.sql
3. Exécutez le script
4. Vérifiez qu'il n'y a pas d'erreurs
```

### Étape 2 : Vérifier l'Installation

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
-- Résultat attendu : rowsecurity = true

-- Lister toutes les politiques
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;
-- Résultat attendu : 6 politiques
```

## 🧪 Tests de Sécurité

### Test 1 : Client - Lecture de ses propres commandes ✅

**Objectif** : Un client ne doit voir QUE ses propres commandes.

```typescript
// Se connecter en tant que client
const { data: session } = await supabase.auth.signInWithPassword({
  email: 'client@test.com',
  password: 'password123'
});

// Essayer de lire toutes les commandes
const { data: orders, error } = await supabase
  .from('orders')
  .select('*');

// ✅ ATTENDU : Retourne uniquement les commandes où client_id = auth.uid()
// ❌ ÉCHEC : Si retourne des commandes d'autres clients
console.log('Nombre de commandes visibles:', orders?.length);
```

### Test 2 : Client - Tentative de lecture des commandes d'un autre client ❌

**Objectif** : Un client ne doit PAS pouvoir lire les commandes d'un autre.

```typescript
// Récupérer l'ID d'un autre client
const autreClientId = 'uuid-d-un-autre-client';

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('client_id', autreClientId);

// ✅ ATTENDU : data = [] (tableau vide) ou error
// ❌ ÉCHEC : Si retourne des données
console.log('Commandes d\'un autre client:', data);
```

### Test 3 : Client - Création de commande (client_id automatique) ✅

**Objectif** : Le client_id doit être forcé à auth.uid().

```typescript
// Essayer de créer une commande SANS spécifier client_id
const { data, error } = await supabase
  .from('orders')
  .insert({
    pickup_address: '123 Rue Test',
    delivery_address: '456 Avenue Test',
    delivery_type: 'express',
    price: 25.00,
    status: 'pending'
    // NE PAS INCLURE client_id
  })
  .select();

// ✅ ATTENDU : Commande créée avec client_id = auth.uid()
// ❌ ÉCHEC : Si client_id est null ou différent
console.log('Client ID de la commande créée:', data?.[0]?.client_id);
console.log('Auth UID:', (await supabase.auth.getUser()).data.user?.id);
```

### Test 4 : Client - Tentative de créer une commande pour un autre client ❌

**Objectif** : Un client ne doit PAS pouvoir créer une commande pour quelqu'un d'autre.

```typescript
const autreClientId = 'uuid-d-un-autre-client';

const { data, error } = await supabase
  .from('orders')
  .insert({
    client_id: autreClientId, // Tentative de fraude
    pickup_address: '123 Rue Test',
    delivery_address: '456 Avenue Test',
    delivery_type: 'express',
    price: 25.00,
    status: 'pending'
  })
  .select();

// ✅ ATTENDU : Commande créée MAIS avec client_id = auth.uid() (forcé par trigger)
// Le client_id fourni est ignoré
console.log('Client ID fourni:', autreClientId);
console.log('Client ID réel:', data?.[0]?.client_id);
```

### Test 5 : Client - Annulation de sa propre commande ✅

**Objectif** : Un client peut annuler ses commandes en statut pending/accepted.

```typescript
const { data: maCommande } = await supabase
  .from('orders')
  .select('id')
  .eq('client_id', (await supabase.auth.getUser()).data.user?.id)
  .eq('status', 'pending')
  .single();

const { data, error } = await supabase
  .from('orders')
  .update({ status: 'cancelled' })
  .eq('id', maCommande.id)
  .select();

// ✅ ATTENDU : Mise à jour réussie
// ❌ ÉCHEC : Si erreur de permission
console.log('Statut après annulation:', data?.[0]?.status);
```

### Test 6 : Client - Tentative de modification du client_id ❌

**Objectif** : Un client ne doit PAS pouvoir changer le client_id d'une commande.

```typescript
const { data: maCommande } = await supabase
  .from('orders')
  .select('id')
  .limit(1)
  .single();

const { data, error } = await supabase
  .from('orders')
  .update({ client_id: 'autre-uuid' })
  .eq('id', maCommande.id);

// ✅ ATTENDU : Erreur "Vous ne pouvez pas modifier le client_id"
// ❌ ÉCHEC : Si la modification réussit
console.log('Erreur attendue:', error?.message);
```

### Test 7 : Admin - Lecture de toutes les commandes ✅

**Objectif** : Un admin doit voir TOUTES les commandes.

```typescript
// Se connecter en tant qu'admin
const { data: session } = await supabase.auth.signInWithPassword({
  email: 'admin@oneconnexion.com',
  password: 'admin-password'
});

const { data: orders, error } = await supabase
  .from('orders')
  .select('*');

// ✅ ATTENDU : Retourne toutes les commandes de tous les clients
// ❌ ÉCHEC : Si retourne uniquement certaines commandes
console.log('Nombre total de commandes (admin):', orders?.length);
```

### Test 8 : Admin - Création de commande pour un client spécifique ✅

**Objectif** : Un admin peut créer une commande pour n'importe quel client.

```typescript
const clientCibleId = 'uuid-du-client-cible';

const { data, error } = await supabase
  .from('orders')
  .insert({
    client_id: clientCibleId, // Admin peut spécifier le client
    pickup_address: '123 Rue Test',
    delivery_address: '456 Avenue Test',
    delivery_type: 'express',
    price: 25.00,
    status: 'pending'
  })
  .select();

// ✅ ATTENDU : Commande créée avec le client_id spécifié
// ❌ ÉCHEC : Si client_id est différent ou null
console.log('Client ID spécifié:', clientCibleId);
console.log('Client ID créé:', data?.[0]?.client_id);
```

### Test 9 : Admin - Modification de n'importe quelle commande ✅

**Objectif** : Un admin peut modifier toutes les commandes.

```typescript
const { data: uneCommande } = await supabase
  .from('orders')
  .select('id')
  .limit(1)
  .single();

const { data, error } = await supabase
  .from('orders')
  .update({ 
    status: 'dispatched',
    driver_id: 'uuid-du-driver'
  })
  .eq('id', uneCommande.id)
  .select();

// ✅ ATTENDU : Mise à jour réussie
// ❌ ÉCHEC : Si erreur de permission
console.log('Mise à jour admin réussie:', !error);
```

### Test 10 : Driver - Lecture des commandes assignées ✅

**Objectif** : Un driver ne voit que les commandes qui lui sont assignées.

```typescript
// Se connecter en tant que driver
const { data: session } = await supabase.auth.signInWithPassword({
  email: 'driver@test.com',
  password: 'driver-password'
});

const driverId = session.user.id;

const { data: orders, error } = await supabase
  .from('orders')
  .select('*');

// ✅ ATTENDU : Retourne uniquement les commandes où driver_id = auth.uid()
// ❌ ÉCHEC : Si retourne d'autres commandes
console.log('Commandes du driver:', orders?.length);
orders?.forEach(order => {
  console.log('Driver ID de la commande:', order.driver_id);
  console.log('Match avec auth.uid():', order.driver_id === driverId);
});
```

### Test 11 : Driver - Mise à jour d'une commande assignée ✅

**Objectif** : Un driver peut mettre à jour ses commandes assignées.

```typescript
const { data: maCommande } = await supabase
  .from('orders')
  .select('id')
  .eq('driver_id', (await supabase.auth.getUser()).data.user?.id)
  .single();

const { data, error } = await supabase
  .from('orders')
  .update({ 
    status: 'in_progress',
    driver_lat: 48.8566,
    driver_lng: 2.3522
  })
  .eq('id', maCommande.id)
  .select();

// ✅ ATTENDU : Mise à jour réussie
// ❌ ÉCHEC : Si erreur de permission
console.log('Mise à jour driver réussie:', !error);
```

### Test 12 : Driver - Tentative de modification d'une commande non assignée ❌

**Objectif** : Un driver ne peut PAS modifier les commandes des autres.

```typescript
const { data: autreCommande } = await supabase
  .from('orders')
  .select('id')
  .neq('driver_id', (await supabase.auth.getUser()).data.user?.id)
  .limit(1)
  .single();

const { data, error } = await supabase
  .from('orders')
  .update({ status: 'delivered' })
  .eq('id', autreCommande.id);

// ✅ ATTENDU : Erreur de permission ou aucune ligne affectée
// ❌ ÉCHEC : Si la modification réussit
console.log('Erreur attendue:', error?.message);
```

### Test 13 : Utilisateur non authentifié - Aucun accès ❌

**Objectif** : Un utilisateur non connecté ne doit rien voir.

```typescript
// Se déconnecter
await supabase.auth.signOut();

const { data, error } = await supabase
  .from('orders')
  .select('*');

// ✅ ATTENDU : data = [] ou error
// ❌ ÉCHEC : Si retourne des données
console.log('Données visibles sans auth:', data);
```

## 📊 Checklist de Validation

Après avoir exécuté tous les tests :

- [ ] **Test 1** : Client voit uniquement ses commandes ✅
- [ ] **Test 2** : Client ne voit pas les commandes des autres ❌
- [ ] **Test 3** : Client_id forcé automatiquement à l'insertion ✅
- [ ] **Test 4** : Client ne peut pas créer pour un autre client ❌
- [ ] **Test 5** : Client peut annuler ses commandes ✅
- [ ] **Test 6** : Client ne peut pas modifier client_id ❌
- [ ] **Test 7** : Admin voit toutes les commandes ✅
- [ ] **Test 8** : Admin peut créer pour n'importe quel client ✅
- [ ] **Test 9** : Admin peut tout modifier ✅
- [ ] **Test 10** : Driver voit ses commandes assignées ✅
- [ ] **Test 11** : Driver peut mettre à jour ses commandes ✅
- [ ] **Test 12** : Driver ne peut pas modifier les autres commandes ❌
- [ ] **Test 13** : Utilisateur non auth ne voit rien ❌

## 🔧 Dépannage

### Problème : RLS ne semble pas fonctionner

```sql
-- Vérifier que RLS est bien activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
```

### Problème : Les politiques ne s'appliquent pas

```sql
-- Vérifier que les politiques existent
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Vérifier les fonctions helper
SELECT proname FROM pg_proc WHERE proname IN ('is_admin_or_dispatcher', 'is_active_driver');
```

### Problème : Erreur "permission denied"

```sql
-- Vérifier le rôle de l'utilisateur connecté
SELECT 
  auth.uid() as user_id,
  (SELECT role FROM admins WHERE id = auth.uid()) as admin_role,
  (SELECT status FROM drivers WHERE id = auth.uid()) as driver_status;
```

## 🎯 Résumé des Règles RLS

| Rôle | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| **Client** | Ses commandes uniquement | ✅ (client_id forcé) | ✅ Annulation uniquement | ❌ |
| **Driver** | Commandes assignées | ❌ | ✅ Commandes assignées | ❌ |
| **Admin/Dispatcher** | ✅ Tout | ✅ Tout | ✅ Tout | ❌ |
| **Super Admin** | ✅ Tout | ✅ Tout | ✅ Tout | ✅ |
| **Non authentifié** | ❌ | ❌ | ❌ | ❌ |

## 📝 Notes Importantes

1. **Performance** : Les fonctions helper utilisent des index. Assurez-vous qu'ils existent :
   ```sql
   CREATE INDEX IF NOT EXISTS idx_admins_id_role_status ON admins(id, role, status);
   CREATE INDEX IF NOT EXISTS idx_drivers_id_status ON drivers(id, status);
   CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
   CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
   ```

2. **Realtime** : Les événements Realtime respectent automatiquement RLS. Les clients ne recevront que les mises à jour des commandes qu'ils peuvent voir.

3. **Service Role** : Le service role bypass RLS. Ne l'utilisez que côté serveur pour les opérations admin.

4. **Audit** : Activez l'audit logging pour surveiller les tentatives d'accès non autorisées.

## ✅ Validation Finale

Une fois tous les tests passés, votre table `orders` est sécurisée ! 🎉

Les données sont protégées au niveau de la base de données, indépendamment du code frontend.
