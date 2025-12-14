# 🏗️ Nouvelle Architecture de Base de Données

## 📋 Vue d'ensemble

Cette restructuration **élimine la redondance** et crée une architecture **claire, maintenable et évolutive**.

---

## 🎯 Objectifs

1. ✅ **Éliminer la redondance** : Une seule table `profiles` pour tous les utilisateurs
2. ✅ **Simplifier la gestion** : Moins de tables, moins de complexité
3. ✅ **Améliorer les performances** : Index optimisés, requêtes plus rapides
4. ✅ **Faciliter l'évolution** : Architecture extensible

---

## 📊 Avant / Après

### ❌ **AVANT** (Redondant)
```
auth.users (Supabase)
├── admins (table séparée)
├── clients (table séparée)
├── drivers (table séparée)
└── profiles (table séparée)

messages (table)
contact_messages (table)
support_messages (table)
threads (table)
```

### ✅ **APRÈS** (Optimisé)
```
auth.users (Supabase)
└── profiles (TABLE CENTRALE - tous les utilisateurs)
    └── drivers (uniquement infos opérationnelles)
        ├── driver_vehicles (multi-véhicules)
        └── driver_documents (documents)

conversations (table)
└── messages (table)
```

---

## 🗄️ Structure Détaillée

### 1. **`profiles`** - Table Centrale ⭐

**Rôle** : Contient TOUS les utilisateurs (admin, client, chauffeur)

```sql
CREATE TABLE public.profiles (
    -- Identifiants
    id UUID PRIMARY KEY,
    
    -- Informations de base (TOUS)
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    
    -- Rôle et statut
    role TEXT CHECK (role IN ('admin', 'client', 'chauffeur')),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    
    -- Informations CLIENT
    company_name TEXT,
    siret TEXT,
    billing_address TEXT,
    
    -- Informations CHAUFFEUR
    driver_id TEXT UNIQUE,
    driver_license_number TEXT,
    driver_license_expiry DATE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ
);
```

**Avantages** :
- ✅ Une seule requête pour récupérer un utilisateur
- ✅ Pas de JOIN complexes
- ✅ Gestion unifiée des rôles
- ✅ Évolutif (ajout de nouveaux rôles facile)

---

### 2. **`drivers`** - Informations Opérationnelles

**Rôle** : Uniquement les infos **métier** des chauffeurs (statut, véhicule, localisation)

```sql
CREATE TABLE public.drivers (
    user_id UUID PRIMARY KEY REFERENCES profiles(id),
    
    -- Statut opérationnel
    status TEXT CHECK (status IN ('online', 'offline', 'busy', 'unavailable')),
    
    -- Véhicule principal
    vehicle_type TEXT,
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT,
    
    -- Localisation temps réel
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMPTZ,
    
    -- Statistiques
    total_deliveries INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_ratings INTEGER DEFAULT 0
);
```

**Pourquoi séparer ?**
- ✅ Infos opérationnelles mises à jour fréquemment
- ✅ Pas de pollution de la table `profiles`
- ✅ Optimisation des requêtes temps réel

---

### 3. **`driver_vehicles`** - Gestion Multi-Véhicules

**Rôle** : Support de plusieurs véhicules par chauffeur

```sql
CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY,
    driver_id UUID REFERENCES profiles(id),
    
    vehicle_type TEXT,
    brand TEXT,
    model TEXT,
    registration TEXT UNIQUE,
    capacity TEXT,
    year INTEGER,
    color TEXT,
    
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);
```

**Avantages** :
- ✅ Un chauffeur peut avoir plusieurs véhicules
- ✅ Changement de véhicule facile
- ✅ Historique des véhicules

---

### 4. **`driver_documents`** - Documents des Chauffeurs

**Rôle** : Gestion des documents (permis, assurance, etc.)

```sql
CREATE TABLE public.driver_documents (
    id UUID PRIMARY KEY,
    driver_id UUID REFERENCES profiles(id),
    
    document_type TEXT CHECK (document_type IN (
        'license', 'insurance', 'registration', 'identity', 
        'kbis', 'criminal_record', 'other'
    )),
    
    file_name TEXT,
    file_url TEXT,
    
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
    validated_by UUID REFERENCES profiles(id),
    validated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    expiry_date DATE
);
```

**Avantages** :
- ✅ Validation administrative
- ✅ Suivi des expirations
- ✅ Historique des documents

---

### 5. **`orders`** - Commandes Simplifiées

**Rôle** : Gestion des courses

```sql
CREATE TABLE public.orders (
    id UUID PRIMARY KEY,
    
    client_id UUID REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id),
    
    status TEXT CHECK (status IN (
        'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
    )),
    
    pickup_address TEXT,
    pickup_latitude DECIMAL,
    pickup_longitude DECIMAL,
    delivery_address TEXT,
    delivery_latitude DECIMAL,
    delivery_longitude DECIMAL,
    
    package_description TEXT,
    delivery_type TEXT,
    notes TEXT,
    
    price DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    
    scheduled_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);
```

---

### 6. **`conversations` + `messages`** - Messagerie Unifiée

**Rôle** : Remplace `messages`, `contact_messages`, `support_messages`, `threads`

```sql
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id), -- NULL pour support
    conversation_type TEXT CHECK (conversation_type IN ('direct', 'support', 'order')),
    order_id UUID REFERENCES orders(id),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES profiles(id),
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ
);
```

**Avantages** :
- ✅ Une seule structure pour tous les types de messages
- ✅ Gestion unifiée
- ✅ Moins de tables

---

## 🔄 Trigger Simplifié

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_status TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Chauffeurs en pending, autres en approved
    IF user_role = 'chauffeur' THEN
        user_status := 'pending';
    ELSE
        user_status := 'approved';
    END IF;
    
    -- Insérer dans profiles
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, role, status, company_name
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        user_role,
        user_status,
        NEW.raw_user_meta_data->>'company_name'
    );
    
    -- Si chauffeur, créer l'entrée dans drivers
    IF user_role = 'chauffeur' THEN
        INSERT INTO public.drivers (user_id) VALUES (NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Comparaison des Tables

| Avant | Après | Gain |
|-------|-------|------|
| 15+ tables | **7 tables** | -53% |
| 3 tables utilisateurs | **1 table** | -67% |
| 4 tables messages | **2 tables** | -50% |
| Redondance élevée | **Aucune** | ✅ |

---

## 🎯 Requêtes Simplifiées

### Récupérer un utilisateur (AVANT)
```sql
-- Fallait chercher dans 4 tables !
SELECT * FROM profiles WHERE id = ?;
SELECT * FROM admins WHERE user_id = ?;
SELECT * FROM clients WHERE user_id = ?;
SELECT * FROM drivers WHERE user_id = ?;
```

### Récupérer un utilisateur (APRÈS)
```sql
-- Une seule requête !
SELECT * FROM profiles WHERE id = ?;
```

### Récupérer un chauffeur avec son véhicule (APRÈS)
```sql
SELECT 
    p.*,
    d.status as driver_status,
    d.vehicle_type,
    d.rating
FROM profiles p
LEFT JOIN drivers d ON d.user_id = p.id
WHERE p.id = ? AND p.role = 'chauffeur';
```

---

## ✅ Avantages de la Nouvelle Architecture

1. **Simplicité** : Moins de tables = moins de complexité
2. **Performance** : Moins de JOINs = requêtes plus rapides
3. **Maintenabilité** : Structure claire et logique
4. **Évolutivité** : Facile d'ajouter de nouveaux rôles
5. **Cohérence** : Une source de vérité unique
6. **Sécurité** : RLS plus simple à gérer

---

## 🚀 Migration

### Étape 1 : Exécuter le script
```bash
# Dans Supabase SQL Editor
# Exécuter : sql/RESTRUCTURATION_COMPLETE.sql
```

### Étape 2 : Vérifier
```sql
-- Vérifier la structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les données
SELECT role, status, COUNT(*) 
FROM profiles 
GROUP BY role, status;
```

### Étape 3 : Mettre à jour le code
- Modifier les requêtes pour utiliser `profiles` au lieu de `admins`/`clients`
- Simplifier les hooks React
- Mettre à jour les types TypeScript

---

## 📝 Tables Finales

1. ✅ **`profiles`** - Tous les utilisateurs
2. ✅ **`drivers`** - Infos opérationnelles chauffeurs
3. ✅ **`driver_vehicles`** - Véhicules des chauffeurs
4. ✅ **`driver_documents`** - Documents des chauffeurs
5. ✅ **`orders`** - Commandes
6. ✅ **`conversations`** - Conversations
7. ✅ **`messages`** - Messages
8. ✅ **`invoices`** - Factures (existante)
9. ✅ **`plaintes`** - Réclamations (existante)

---

**Date** : 2025-12-13  
**Version** : 2.0  
**Statut** : ✅ Prêt pour migration
