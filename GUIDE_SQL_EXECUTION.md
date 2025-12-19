# 🚀 Guide Rapide d'Exécution SQL

## Étape 1 : Accéder à Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **One Connexion**
3. Cliquez sur **SQL Editor** dans le menu de gauche

## Étape 2 : Créer la Table

1. Cliquez sur **New Query**
2. Copiez-collez le contenu de `sql/create_city_pricing_table.sql`
3. Cliquez sur **Run** (ou Ctrl+Enter)
4. Vérifiez le message de succès

**Résultat attendu :**
```
Success. No rows returned
```

## Étape 3 : Insérer les Données

1. Cliquez sur **New Query** (nouvelle requête)
2. Copiez-collez le contenu de `sql/insert_city_pricing_data.sql`
3. Cliquez sur **Run** (ou Ctrl+Enter)
4. Attendez quelques secondes (274 insertions)

**Résultat attendu :**
```
Success. 274 rows inserted
```

## Étape 4 : Vérifier l'Insertion

Exécutez cette requête de vérification :

```sql
-- Compter le nombre total de villes
SELECT COUNT(*) as total_cities FROM city_pricing;

-- Afficher quelques exemples
SELECT city_name, price_normal, price_express, price_urgence 
FROM city_pricing 
ORDER BY city_name 
LIMIT 10;

-- Vérifier Paris
SELECT * FROM city_pricing WHERE city_name = 'PARIS';

-- Vérifier les départements
SELECT 
    SUBSTRING(zip_code, 1, 2) as departement,
    COUNT(*) as nombre_villes
FROM city_pricing
GROUP BY SUBSTRING(zip_code, 1, 2)
ORDER BY departement;
```

**Résultats attendus :**
- Total : 274 villes
- Paris existe avec price_normal = 2
- 8 départements (75, 77, 78, 91, 92, 93, 94, 95)

## Étape 5 : Tester la Fonction de Recherche

```sql
-- Recherche exacte
SELECT * FROM find_city_pricing('PARIS');

-- Recherche partielle
SELECT * FROM find_city_pricing('Versailles');

-- Recherche avec accents (devrait fonctionner)
SELECT * FROM find_city_pricing('Évry');
```

## Étape 6 : Vérifier les Politiques RLS

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'city_pricing';

-- Lister les politiques
SELECT * FROM pg_policies WHERE tablename = 'city_pricing';
```

## 🔧 Commandes Utiles

### Ajouter une nouvelle ville
```sql
INSERT INTO city_pricing (
    city_name, zip_code, 
    price_normal, price_express, price_urgence, 
    price_vl_normal, price_vl_express
) VALUES (
    'NOUVELLE-VILLE', '95000',
    10, 13, 16, 14, 17
);
```

### Modifier un tarif
```sql
UPDATE city_pricing
SET 
    price_normal = 12,
    price_express = 15,
    updated_at = NOW()
WHERE city_name = 'PARIS';
```

### Supprimer une ville
```sql
DELETE FROM city_pricing WHERE city_name = 'VILLE-A-SUPPRIMER';
```

### Rechercher des villes
```sql
-- Par préfixe
SELECT city_name FROM city_pricing 
WHERE city_name LIKE 'PAR%' 
ORDER BY city_name;

-- Par département
SELECT city_name, zip_code FROM city_pricing 
WHERE zip_code LIKE '75%' 
ORDER BY city_name;

-- Tarifs les plus élevés
SELECT city_name, price_normal 
FROM city_pricing 
ORDER BY price_normal DESC 
LIMIT 10;
```

## ⚠️ En Cas de Problème

### Erreur : "relation city_pricing already exists"
```sql
-- Supprimer la table existante
DROP TABLE IF EXISTS city_pricing CASCADE;

-- Puis réexécuter create_city_pricing_table.sql
```

### Erreur : "duplicate key value violates unique constraint"
```sql
-- Vider la table
TRUNCATE TABLE city_pricing;

-- Puis réexécuter insert_city_pricing_data.sql
```

### Erreur : "extension unaccent does not exist"
```sql
-- Activer l'extension
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### Vérifier les erreurs
```sql
-- Voir les dernières erreurs
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction (aborted)';
```

## ✅ Checklist de Vérification

- [ ] Table `city_pricing` créée
- [ ] 274 villes insérées
- [ ] Index créé sur `city_name`
- [ ] Trigger `updated_at` fonctionne
- [ ] RLS activé
- [ ] Fonction `find_city_pricing()` disponible
- [ ] Extension `unaccent` activée
- [ ] Politiques RLS configurées

## 🎯 Prochaine Étape

Une fois ces étapes terminées, passez à la mise à jour du code TypeScript :
- Voir `MIGRATION_PRICING.md` pour les instructions détaillées
- Voir `src/utils/pricingEngineExamples.ts` pour des exemples d'utilisation

---

**Temps estimé** : 5-10 minutes  
**Difficulté** : ⭐ Facile
