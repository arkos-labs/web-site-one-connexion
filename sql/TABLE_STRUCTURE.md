# 🗄️ Structure de la Table city_pricing

## 📊 Schéma de la Table

```sql
CREATE TABLE public.city_pricing (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_name         TEXT NOT NULL UNIQUE,
    zip_code          TEXT,
    price_normal      NUMERIC(10, 2) NOT NULL CHECK (price_normal >= 0),
    price_express     NUMERIC(10, 2) NOT NULL CHECK (price_express >= 0),
    price_urgence     NUMERIC(10, 2) NOT NULL CHECK (price_urgence >= 0),
    price_vl_normal   NUMERIC(10, 2) NOT NULL CHECK (price_vl_normal >= 0),
    price_vl_express  NUMERIC(10, 2) NOT NULL CHECK (price_vl_express >= 0),
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## 📋 Description des Colonnes

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique généré automatiquement |
| `city_name` | TEXT | NOT NULL, UNIQUE | Nom de la ville normalisé (ex: "PARIS", "VERSAILLES") |
| `zip_code` | TEXT | NULLABLE | Code postal (ex: "75000", "78000") |
| `price_normal` | NUMERIC(10,2) | NOT NULL, >= 0 | Tarif NORMAL en bons |
| `price_express` | NUMERIC(10,2) | NOT NULL, >= 0 | Tarif EXPRESS en bons |
| `price_urgence` | NUMERIC(10,2) | NOT NULL, >= 0 | Tarif URGENCE en bons |
| `price_vl_normal` | NUMERIC(10,2) | NOT NULL, >= 0 | Tarif VL_NORMAL en bons |
| `price_vl_express` | NUMERIC(10,2) | NOT NULL, >= 0 | Tarif VL_EXPRESS en bons |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de dernière modification |

## 🔑 Index

```sql
CREATE INDEX idx_city_pricing_city_name ON public.city_pricing(city_name);
```

**Objectif :** Accélérer les recherches par nom de ville

## 🔒 Row Level Security (RLS)

### Politique de Lecture (SELECT)
```sql
CREATE POLICY "city_pricing_select_policy"
    ON public.city_pricing
    FOR SELECT
    USING (true);
```
**Accès :** Public (tous les utilisateurs)

### Politique d'Écriture (INSERT/UPDATE/DELETE)
```sql
CREATE POLICY "city_pricing_admin_policy"
    ON public.city_pricing
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );
```
**Accès :** Réservé aux administrateurs

## ⚙️ Trigger

```sql
CREATE TRIGGER trigger_update_city_pricing_timestamp
    BEFORE UPDATE ON public.city_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_city_pricing_updated_at();
```

**Fonction associée :**
```sql
CREATE OR REPLACE FUNCTION update_city_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Objectif :** Met à jour automatiquement `updated_at` lors d'une modification

## 🔍 Fonction de Recherche

```sql
CREATE OR REPLACE FUNCTION public.find_city_pricing(search_city TEXT)
RETURNS TABLE (
    id UUID,
    city_name TEXT,
    zip_code TEXT,
    price_normal NUMERIC,
    price_express NUMERIC,
    price_urgence NUMERIC,
    price_vl_normal NUMERIC,
    price_vl_express NUMERIC
)
```

**Fonctionnalités :**
- Normalisation automatique du nom de ville
- Recherche exacte en priorité
- Recherche partielle en fallback
- Suppression des accents (via extension `unaccent`)

## 📊 Exemple de Données

| city_name | zip_code | price_normal | price_express | price_urgence | price_vl_normal | price_vl_express |
|-----------|----------|--------------|---------------|---------------|-----------------|------------------|
| PARIS | 75000 | 2 | 4 | 7 | 7 | 14 |
| VERSAILLES | 78000 | 9 | 12 | 15 | 13 | 16 |
| NANTERRE | 92000 | 5 | 8 | 11 | 9 | 12 |
| CRETEIL | 94000 | 7 | 10 | 13 | 11 | 14 |

## 📈 Statistiques

- **Nombre total de villes :** 274
- **Départements couverts :** 8 (75, 77, 78, 91, 92, 93, 94, 95)
- **Taille estimée :** ~50 KB
- **Index :** 1 (city_name)
- **Triggers :** 1 (updated_at)
- **Politiques RLS :** 2 (select, admin)

## 🔧 Requêtes Utiles

### Compter les villes
```sql
SELECT COUNT(*) FROM city_pricing;
```

### Rechercher une ville
```sql
SELECT * FROM city_pricing WHERE city_name = 'PARIS';
```

### Lister par département
```sql
SELECT city_name, zip_code 
FROM city_pricing 
WHERE zip_code LIKE '75%' 
ORDER BY city_name;
```

### Tarifs les plus élevés
```sql
SELECT city_name, price_normal 
FROM city_pricing 
ORDER BY price_normal DESC 
LIMIT 10;
```

### Villes modifiées récemment
```sql
SELECT city_name, updated_at 
FROM city_pricing 
ORDER BY updated_at DESC 
LIMIT 10;
```

## 🎯 Utilisation TypeScript

```typescript
import { supabase } from '@/lib/supabase';

// Récupérer une ville
const { data, error } = await supabase
    .from('city_pricing')
    .select('*')
    .eq('city_name', 'PARIS')
    .single();

// Rechercher par préfixe
const { data, error } = await supabase
    .from('city_pricing')
    .select('city_name')
    .ilike('city_name', 'PAR%')
    .order('city_name');

// Utiliser la fonction de recherche
const { data, error } = await supabase
    .rpc('find_city_pricing', { search_city: 'Paris' });
```

---

**Date :** 2025-12-19  
**Version :** 2.0  
**Auteur :** Architecture de base de données
