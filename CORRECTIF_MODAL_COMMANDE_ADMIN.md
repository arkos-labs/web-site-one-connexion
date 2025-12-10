# 🔧 Correctif Modal "Nouvelle Commande" - Section Admin

## 📋 Problèmes Identifiés

### 1. **Incohérence Base de Données**
- ❌ Le code React utilise la table `profiles`
- ✅ Le schéma SQL définit la table `clients`
- **Impact** : Aucune donnée ne peut être récupérée ou insérée

### 2. **Absence de Policies RLS pour Admin**
- ❌ Aucune policy permettant aux admins de gérer les clients
- ❌ Les admins ne peuvent ni lire ni créer de clients
- **Impact** : Recherche de clients impossible, création impossible

### 3. **Problèmes dans CreateOrderModal.tsx**
- Ligne 228 : `from('profiles')` → doit être `from('clients')`
- Ligne 229 : Sélection de colonnes inexistantes dans `clients`
- Ligne 230 : Filtre par `role='client'` inexistant dans la table `clients`

### 4. **Problèmes dans CreateClientModal.tsx**
- Ligne 53 : `from('profiles')` → doit être `from('clients')`
- Ligne 64 : Insertion de `role: 'client'` inexistant dans le schéma

### 5. **Problèmes dans OrderWizardModal.tsx**
- Ligne 109 : `from('profiles')` → doit être `from('clients')`
- Même problème de colonnes et de filtre

## 🛠️ Solutions Appliquées

### 1. Création de Policies RLS pour Admin

```sql
-- Fonction helper pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies pour que les admins puissent tout gérer
CREATE POLICY "Admins can view all clients" ON public.clients
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert clients" ON public.clients
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update all clients" ON public.clients
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete clients" ON public.clients
    FOR DELETE USING (is_admin());

-- Idem pour orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert orders" ON public.orders
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (is_admin());
```

### 2. Correction de CreateOrderModal.tsx

**Changements** :
- `from('profiles')` → `from('clients')`
- Suppression du filtre `.eq('role', 'client')`
- Adaptation du mapping des données

### 3. Correction de CreateClientModal.tsx

**Changements** :
- `from('profiles')` → `from('clients')`
- Suppression de `role: 'client'` de l'insertion
- Le champ `user_id` reste NULL pour les clients créés par admin

### 4. Correction de OrderWizardModal.tsx

**Changements** :
- `from('profiles')` → `from('clients')`
- Suppression du filtre `.eq('role', 'client')`

## 📝 Étapes d'Application

### Étape 1 : Appliquer les policies SQL
```bash
# Exécuter le fichier SQL dans Supabase
psql -h [SUPABASE_HOST] -U postgres -d postgres -f sql/admin_policies.sql
```

### Étape 2 : Corriger les fichiers React
- ✅ CreateOrderModal.tsx
- ✅ CreateClientModal.tsx
- ✅ OrderWizardModal.tsx
- ✅ StepPickup.tsx (si nécessaire)

### Étape 3 : Tester le flow complet
1. Ouvrir le modal "Nouvelle Commande"
2. Rechercher un client existant
3. Créer un nouveau client via "+ Nouveau"
4. Vérifier que le récapitulatif se met à jour
5. Compléter la commande

## ✅ Résultat Attendu

Après correction :
- ✅ La recherche de clients fonctionne
- ✅ Le bouton "+ Nouveau" ouvre le modal de création
- ✅ La création de client fonctionne et met à jour la liste
- ✅ Le client créé est automatiquement sélectionné
- ✅ Le récapitulatif se met à jour en temps réel
- ✅ La commande peut être créée avec succès

## 🔍 Tests de Validation

### Test 1 : Recherche de client
```
1. Ouvrir "Nouvelle Commande"
2. Taper "Jean" dans la recherche
3. Vérifier que les clients s'affichent
```

### Test 2 : Création de client
```
1. Cliquer "+ Nouveau client"
2. Remplir le formulaire
3. Cliquer "Créer le client"
4. Vérifier que le client apparaît dans la liste
5. Vérifier qu'il est automatiquement sélectionné
```

### Test 3 : Mise à jour du récapitulatif
```
1. Sélectionner un client
2. Vérifier que le nom apparaît dans le récapitulatif
3. Remplir les adresses
4. Vérifier que le récapitulatif se met à jour
```

## 📊 Fichiers Modifiés

1. `sql/admin_policies.sql` (nouveau)
2. `src/components/admin/orders/CreateOrderModal.tsx`
3. `src/components/admin/clients/CreateClientModal.tsx`
4. `src/components/admin/orders/wizard/OrderWizardModal.tsx`
5. `src/components/admin/orders/wizard/steps/StepPickup.tsx` (si applicable)
