-- ============================================================================
-- 🔥 RESTRUCTURATION COMPLÈTE DE LA BASE DE DONNÉES
-- ============================================================================
-- Ce script nettoie et restructure toutes les tables pour éliminer la redondance
-- et créer une architecture claire et maintenable
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SAUVEGARDE DES DONNÉES EXISTANTES
-- ============================================================================

-- Créer des tables temporaires pour sauvegarder les données
CREATE TABLE IF NOT EXISTS temp_backup_profiles AS SELECT * FROM public.profiles;
CREATE TABLE IF NOT EXISTS temp_backup_drivers AS SELECT * FROM public.drivers;
CREATE TABLE IF NOT EXISTS temp_backup_clients AS SELECT * FROM public.clients;
CREATE TABLE IF NOT EXISTS temp_backup_admins AS SELECT * FROM public.admins;

-- ============================================================================
-- ÉTAPE 2 : SUPPRESSION DES TABLES REDONDANTES
-- ============================================================================

-- Supprimer les triggers existants
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Supprimer les tables redondantes (on garde profiles comme table centrale)
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
-- On garde drivers car elle contient des infos spécifiques (véhicule, etc.)

-- ============================================================================
-- ÉTAPE 3 : RESTRUCTURATION DE LA TABLE PROFILES (Table Centrale)
-- ============================================================================

-- Supprimer et recréer la table profiles avec tous les champs nécessaires
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    -- Identifiants
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations de base (communes à tous)
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    
    -- Rôle et statut
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'chauffeur')),
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    
    -- Informations spécifiques CLIENT
    company_name TEXT,
    siret TEXT,
    billing_address TEXT,
    
    -- Informations spécifiques CHAUFFEUR
    driver_id TEXT UNIQUE, -- Identifiant unique généré par l'admin
    driver_license_number TEXT,
    driver_license_expiry DATE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT email_required CHECK (email IS NOT NULL),
    CONSTRAINT client_company_name CHECK (role != 'client' OR company_name IS NOT NULL),
    CONSTRAINT driver_phone CHECK (role != 'chauffeur' OR phone IS NOT NULL)
);

-- Index pour améliorer les performances
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_driver_id ON public.profiles(driver_id) WHERE driver_id IS NOT NULL;

-- Commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Table centrale contenant tous les utilisateurs (admin, client, chauffeur)';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: admin, client, chauffeur';
COMMENT ON COLUMN public.profiles.status IS 'Statut du compte: pending (en attente), approved (validé), rejected (rejeté), suspended (suspendu)';
COMMENT ON COLUMN public.profiles.driver_id IS 'Identifiant unique du chauffeur, généré par l''admin après validation';

-- ============================================================================
-- ÉTAPE 4 : RESTRUCTURATION DE LA TABLE DRIVERS
-- ============================================================================

-- Garder uniquement les informations spécifiques au métier de chauffeur
DROP TABLE IF EXISTS public.drivers CASCADE;

CREATE TABLE public.drivers (
    -- Référence au profil
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Statut opérationnel (différent du statut du compte)
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'unavailable')),
    
    -- Informations véhicule principal
    vehicle_type TEXT,
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT,
    vehicle_year INTEGER,
    
    -- Localisation en temps réel
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMPTZ,
    
    -- Statistiques
    total_deliveries INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_ratings INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);

COMMENT ON TABLE public.drivers IS 'Informations opérationnelles spécifiques aux chauffeurs';
COMMENT ON COLUMN public.drivers.status IS 'Statut opérationnel: online, offline, busy, unavailable';

-- ============================================================================
-- ÉTAPE 5 : TABLE DRIVER_VEHICLES (Gestion multi-véhicules)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Informations véhicule
    vehicle_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    registration TEXT NOT NULL UNIQUE,
    capacity TEXT,
    year INTEGER,
    color TEXT,
    
    -- Statut
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte: un seul véhicule principal par chauffeur
    CONSTRAINT one_primary_vehicle UNIQUE (driver_id, is_primary) WHERE is_primary = true
);

CREATE INDEX idx_driver_vehicles_driver ON public.driver_vehicles(driver_id);
CREATE INDEX idx_driver_vehicles_registration ON public.driver_vehicles(registration);

COMMENT ON TABLE public.driver_vehicles IS 'Gestion des véhicules des chauffeurs (support multi-véhicules)';

-- ============================================================================
-- ÉTAPE 6 : TABLE DRIVER_DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Type de document
    document_type TEXT NOT NULL CHECK (document_type IN (
        'license', 'insurance', 'registration', 'identity', 
        'kbis', 'criminal_record', 'other'
    )),
    
    -- Fichier
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    
    -- Validation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    validated_by UUID REFERENCES public.profiles(id),
    validated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Expiration
    expiry_date DATE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_driver_documents_driver ON public.driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON public.driver_documents(status);
CREATE INDEX idx_driver_documents_type ON public.driver_documents(document_type);

COMMENT ON TABLE public.driver_documents IS 'Documents des chauffeurs (permis, assurance, etc.)';

-- ============================================================================
-- ÉTAPE 7 : TABLE ORDERS (Simplifiée)
-- ============================================================================

-- Vérifier si la table existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        CREATE TABLE public.orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            
            -- Références
            client_id UUID NOT NULL REFERENCES public.profiles(id),
            driver_id UUID REFERENCES public.profiles(id),
            
            -- Statut
            status TEXT DEFAULT 'pending' CHECK (status IN (
                'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
            )),
            
            -- Adresses
            pickup_address TEXT NOT NULL,
            pickup_latitude DECIMAL(10, 8),
            pickup_longitude DECIMAL(11, 8),
            delivery_address TEXT NOT NULL,
            delivery_latitude DECIMAL(10, 8),
            delivery_longitude DECIMAL(11, 8),
            
            -- Détails
            package_description TEXT,
            delivery_type TEXT,
            notes TEXT,
            
            -- Tarification
            price DECIMAL(10, 2),
            distance_km DECIMAL(10, 2),
            
            -- Dates
            scheduled_at TIMESTAMPTZ,
            accepted_at TIMESTAMPTZ,
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            cancelled_at TIMESTAMPTZ,
            
            -- Métadonnées
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_orders_client ON public.orders(client_id);
        CREATE INDEX idx_orders_driver ON public.orders(driver_id);
        CREATE INDEX idx_orders_status ON public.orders(status);
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 8 : TABLE MESSAGES (Unifiée)
-- ============================================================================

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    user1_id UUID NOT NULL REFERENCES public.profiles(id),
    user2_id UUID REFERENCES public.profiles(id), -- NULL pour support
    
    -- Type
    conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'support', 'order')),
    order_id UUID REFERENCES public.orders(id),
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    
    -- Expéditeur
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Contenu
    content TEXT NOT NULL,
    
    -- Statut
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_conversations_users ON public.conversations(user1_id, user2_id);

-- ============================================================================
-- ÉTAPE 9 : NOUVEAU TRIGGER SIMPLIFIÉ
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_status TEXT;
BEGIN
    -- Récupérer le rôle depuis les métadonnées
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    
    -- Définir le statut par défaut
    IF user_role = 'chauffeur' THEN
        user_status := 'pending'; -- Les chauffeurs doivent être validés
    ELSE
        user_status := 'approved'; -- Clients et admins sont approuvés automatiquement
    END IF;
    
    -- Insérer dans profiles
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        company_name
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        user_role,
        user_status,
        NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    -- Si c'est un chauffeur, créer l'entrée dans drivers
    IF user_role = 'chauffeur' THEN
        INSERT INTO public.drivers (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erreur dans handle_new_user pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 10 : RESTAURATION DES DONNÉES
-- ============================================================================

-- Restaurer les données depuis les backups
INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, role, status, 
    company_name, driver_id, created_at, updated_at
)
SELECT 
    id, email, first_name, last_name, phone, role, 
    COALESCE(status, 'approved'),
    company_name, driver_id, created_at, updated_at
FROM temp_backup_profiles
ON CONFLICT (id) DO NOTHING;

-- Restaurer les chauffeurs
INSERT INTO public.drivers (
    user_id, status, vehicle_type, vehicle_registration, 
    vehicle_capacity, created_at, updated_at
)
SELECT 
    user_id, status, vehicle_type, vehicle_registration,
    vehicle_capacity, created_at, updated_at
FROM temp_backup_drivers
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- ÉTAPE 11 : NETTOYAGE
-- ============================================================================

-- Supprimer les tables de backup
DROP TABLE IF EXISTS temp_backup_profiles;
DROP TABLE IF EXISTS temp_backup_drivers;
DROP TABLE IF EXISTS temp_backup_clients;
DROP TABLE IF EXISTS temp_backup_admins;

-- ============================================================================
-- ÉTAPE 12 : VÉRIFICATIONS FINALES
-- ============================================================================

SELECT '=== ✅ STRUCTURE FINALE ===' as info;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '=== ✅ NOMBRE D''UTILISATEURS PAR RÔLE ===' as info;
SELECT role, status, COUNT(*) as count
FROM public.profiles
GROUP BY role, status
ORDER BY role, status;

SELECT '=== ✅ NOMBRE DE CHAUFFEURS ===' as info;
SELECT COUNT(*) as total_drivers FROM public.drivers;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Table profiles: Table centrale unique pour tous les utilisateurs
-- ✅ Table drivers: Uniquement les infos opérationnelles des chauffeurs
-- ✅ Table driver_vehicles: Gestion multi-véhicules
-- ✅ Table driver_documents: Documents des chauffeurs
-- ✅ Table orders: Commandes simplifiées
-- ✅ Table conversations + messages: Messagerie unifiée
-- ❌ Suppression: admins, clients (redondantes)
-- ❌ Suppression: contact_messages, support_messages, threads (redondantes)
-- ============================================================================
