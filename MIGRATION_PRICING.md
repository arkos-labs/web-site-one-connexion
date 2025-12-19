# Migration du Système de Tarification vers Supabase

## 📋 Vue d'ensemble

Ce document décrit la migration du système de tarification de **One Connexion** depuis un objet JavaScript en dur vers une base de données PostgreSQL hébergée sur Supabase.

## 🎯 Objectifs

1. **Éliminer le code en dur** : Remplacer l'objet géant `PRISES_EN_CHARGE` par une table SQL
2. **Faciliter la maintenance** : Permettre la mise à jour des tarifs sans redéploiement
3. **Améliorer les performances** : Utiliser un cache en mémoire pour réduire les requêtes
4. **Préparer l'évolutivité** : Permettre l'ajout de nouvelles villes facilement

## 📁 Fichiers créés

### 1. Scripts SQL

#### `sql/create_city_pricing_table.sql`
- Crée la table `city_pricing` avec toutes les colonnes nécessaires
- Configure les contraintes, indexes et triggers
- Active Row Level Security (RLS)
- Crée une fonction de recherche `find_city_pricing()`

**Colonnes de la table :**
```sql
- id (UUID, PK)
- city_name (TEXT, UNIQUE) -- Nom normalisé de la ville
- zip_code (TEXT, NULLABLE) -- Code postal
- price_normal (NUMERIC)
- price_express (NUMERIC)
- price_urgence (NUMERIC)
- price_vl_normal (NUMERIC)
- price_vl_express (NUMERIC)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `sql/insert_city_pricing_data.sql`
- Insère toutes les 274 villes de l'objet `PRISES_EN_CHARGE`
- Données organisées par département (75, 77, 78, 91, 92, 93, 94, 95)
- Inclut des requêtes de vérification

### 2. Code TypeScript

#### `src/utils/pricingEngineDb.ts` (NOUVEAU)
Nouveau module pour interagir avec Supabase :

**Fonctions principales :**
- `getPriseEnCharge(ville, formule)` - Version asynchrone
- `calculateOneConnexionPriceAsync()` - Calcul de prix avec Supabase
- `calculerToutesLesFormulesAsync()` - Calcul pour toutes les formules
- `preloadCityPricingCache()` - Préchargement du cache
- `getAllCities()` - Liste de toutes les villes
- `searchCitiesByPrefix()` - Recherche pour autocomplétion

**Fonctionnalités :**
- ✅ Cache en mémoire (TTL: 1 heure)
- ✅ Recherche exacte et partielle
- ✅ Normalisation des noms de villes
- ✅ Gestion d'erreurs robuste
- ✅ Logs détaillés

#### `src/utils/pricingEngine.ts` (MODIFIÉ)
- Ajout de notes `@deprecated` sur les fonctions synchrones
- Conservation pour compatibilité ascendante
- Redirection vers `pricingEngineDb.ts`

## 🚀 Instructions de migration

### Étape 1 : Exécuter les scripts SQL sur Supabase

1. **Connectez-vous à votre projet Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Créer la table**
   ```bash
   # Dans l'éditeur SQL de Supabase, exécutez :
   sql/create_city_pricing_table.sql
   ```

3. **Insérer les données**
   ```bash
   # Ensuite, exécutez :
   sql/insert_city_pricing_data.sql
   ```

4. **Vérifier l'insertion**
   ```sql
   SELECT COUNT(*) FROM city_pricing;
   -- Devrait retourner 274 villes
   ```

### Étape 2 : Mettre à jour le code de l'application

#### Option A : Migration progressive (Recommandé)

Remplacez progressivement les appels dans votre code :

**Avant :**
```typescript
import { calculateOneConnexionPrice } from '@/utils/pricingEngine';

const result = calculateOneConnexionPrice(
    'Paris',
    'Versailles',
    15000,
    'NORMAL'
);
```

**Après :**
```typescript
import { calculateOneConnexionPriceAsync } from '@/utils/pricingEngineDb';

const result = await calculateOneConnexionPriceAsync(
    'Paris',
    'Versailles',
    15000,
    'NORMAL'
);
```

#### Option B : Préchargement du cache au démarrage

Dans votre fichier principal (ex: `App.tsx` ou `main.tsx`) :

```typescript
import { preloadCityPricingCache } from '@/utils/pricingEngineDb';

// Au démarrage de l'application
useEffect(() => {
    preloadCityPricingCache();
}, []);
```

### Étape 3 : Tester la migration

1. **Test unitaire**
   ```typescript
   import { getPriseEnCharge } from '@/utils/pricingEngineDb';

   const tarif = await getPriseEnCharge('PARIS', 'NORMAL');
   console.log(tarif); // Devrait afficher 2
   ```

2. **Test de recherche**
   ```typescript
   import { searchCitiesByPrefix } from '@/utils/pricingEngineDb';

   const villes = await searchCitiesByPrefix('PAR');
   console.log(villes); // ['PARIS', 'PARIS-01', 'PARIS-02', ...]
   ```

3. **Test de calcul complet**
   ```typescript
   import { calculateOneConnexionPriceAsync } from '@/utils/pricingEngineDb';

   const result = await calculateOneConnexionPriceAsync(
       'Paris',
       'Versailles',
       15000,
       'NORMAL'
   );
   console.log(result);
   ```

## 🔒 Sécurité (RLS)

Les politiques Row Level Security sont configurées comme suit :

- **Lecture (SELECT)** : Accessible à tous (public)
- **Écriture (INSERT/UPDATE/DELETE)** : Réservée aux administrateurs

Pour modifier les tarifs, l'utilisateur doit avoir `role = 'admin'` dans la table `users`.

## 📊 Performance

### Cache en mémoire
- **TTL** : 1 heure
- **Stratégie** : Lazy loading + préchargement optionnel
- **Invalidation** : Automatique après expiration

### Optimisations
- Index sur `city_name` pour recherche rapide
- Requêtes parallèles avec `Promise.all()`
- Recherche exacte prioritaire, puis partielle

## 🛠️ Maintenance

### Ajouter une nouvelle ville

```sql
INSERT INTO city_pricing (
    city_name, 
    zip_code, 
    price_normal, 
    price_express, 
    price_urgence, 
    price_vl_normal, 
    price_vl_express
) VALUES (
    'NOUVELLE-VILLE',
    '95000',
    10,
    13,
    16,
    14,
    17
);
```

### Modifier un tarif

```sql
UPDATE city_pricing
SET 
    price_normal = 12,
    price_express = 15
WHERE city_name = 'PARIS';
```

### Vider le cache après modification

```typescript
import { clearCityPricingCache } from '@/utils/pricingEngineDb';

clearCityPricingCache();
```

## ⚠️ Points d'attention

1. **Compatibilité ascendante** : Les anciennes fonctions synchrones sont conservées mais dépréciées
2. **Gestion d'erreurs** : Toujours utiliser try/catch avec les fonctions asynchrones
3. **Cache** : Pensez à précharger le cache au démarrage pour de meilleures performances
4. **RLS** : Assurez-vous que la table `users` existe avec un champ `role`

## 📝 Checklist de migration

- [ ] Exécuter `create_city_pricing_table.sql` sur Supabase
- [ ] Exécuter `insert_city_pricing_data.sql` sur Supabase
- [ ] Vérifier que 274 villes sont insérées
- [ ] Remplacer les imports dans le code
- [ ] Ajouter `preloadCityPricingCache()` au démarrage
- [ ] Tester les calculs de prix
- [ ] Vérifier les logs de cache
- [ ] Supprimer l'objet `PRISES_EN_CHARGE` (optionnel, après tests)

## 🎉 Avantages de la migration

✅ **Maintenabilité** : Mise à jour des tarifs sans redéploiement  
✅ **Performance** : Cache intelligent avec TTL  
✅ **Scalabilité** : Ajout facile de nouvelles villes  
✅ **Sécurité** : RLS pour protéger les données  
✅ **Traçabilité** : Timestamps de création/modification  
✅ **Flexibilité** : Recherche avancée et autocomplétion  

## 📞 Support

En cas de problème, vérifiez :
1. Les logs de la console (cache hits/misses)
2. Les erreurs Supabase dans l'onglet Network
3. Les politiques RLS dans le dashboard Supabase
4. La connexion à Supabase (`supabase` client configuré)

---

**Date de création** : 2025-12-19  
**Version** : 2.0  
**Auteur** : Architecture de base de données
