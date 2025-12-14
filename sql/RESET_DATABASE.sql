-- ============================================================================
-- 🔥 NETTOYAGE COMPLET ET RECONSTRUCTION DE LA BASE DE DONNÉES
-- ============================================================================
-- ⚠️ ATTENTION : Ce script SUPPRIME TOUTES LES DONNÉES !
-- ⚠️ À utiliser uniquement en développement ou avec une sauvegarde complète
-- ============================================================================

-- ============================================================================
-- ÉTAPE 0 : SUPPRESSION DE TOUS LES UTILISATEURS (REPARTIR À ZÉRO)
-- ============================================================================

-- ⚠️ ATTENTION : Cette étape supprime TOUS les utilisateurs de auth.users
-- Cela inclut les admins, clients et chauffeurs

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Désactiver temporairement le trigger pour éviter les erreurs
    DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
    
    -- Supprimer tous les utilisateurs un par un
    FOR user_record IN SELECT id FROM auth.users LOOP
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
    
    RAISE NOTICE 'Tous les utilisateurs ont été supprimés de auth.users';
END $$;

-- ============================================================================
-- ÉTAPE 1 : SUPPRESSION COMPLÈTE DE TOUTES LES TABLES
-- ============================================================================

-- Supprimer tous les triggers
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Supprimer toutes les fonctions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_on_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;

-- Supprimer toutes les tables (dans l'ordre pour respecter les contraintes)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.plaintes CASCADE;
DROP TABLE IF EXISTS public.driver_documents CASCADE;
DROP TABLE IF EXISTS public.driver_vehicles CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les vues
DROP VIEW IF EXISTS public.v_vehicles_stats CASCADE;

-- ============================================================================
-- ÉTAPE 2 : CRÉATION DE LA NOUVELLE ARCHITECTURE
-- ============================================================================

-- ============================================================================
-- TABLE 1 : PROFILES (Table Centrale - TOUS les utilisateurs)
-- ============================================================================

CREATE TABLE public.profiles (
    -- Identifiants
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations de base (communes à TOUS)
    email TEXT NOT NULL UNIQUE,
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
    driver_id TEXT UNIQUE, -- Identifiant unique (optionnel, généré par admin)
    driver_license_number TEXT,
    driver_license_expiry DATE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT email_required CHECK (email IS NOT NULL),
    CONSTRAINT client_company_name CHECK (role != 'client' OR company_name IS NOT NULL)
);

-- Index pour performances
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_driver_id ON public.profiles(driver_id) WHERE driver_id IS NOT NULL;

-- Commentaires
COMMENT ON TABLE public.profiles IS 'Table centrale contenant TOUS les utilisateurs (admin, client, chauffeur)';
COMMENT ON COLUMN public.profiles.role IS 'Rôle: admin, client, chauffeur';
COMMENT ON COLUMN public.profiles.status IS 'Statut: pending (en attente), approved (validé), rejected (rejeté), suspended (suspendu)';
COMMENT ON COLUMN public.profiles.driver_id IS 'Identifiant unique du chauffeur (optionnel, généré par admin)';

-- ============================================================================
-- TABLE 2 : DRIVERS (Informations opérationnelles des chauffeurs)
-- ============================================================================

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
    rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_location ON public.drivers(current_latitude, current_longitude);

COMMENT ON TABLE public.drivers IS 'Informations opérationnelles des chauffeurs (statut, véhicule, localisation)';
COMMENT ON COLUMN public.drivers.status IS 'Statut opérationnel: online, offline, busy, unavailable';

-- ============================================================================
-- TABLE 3 : DRIVER_VEHICLES (Gestion multi-véhicules)
-- ============================================================================

CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Informations véhicule
    vehicle_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    registration TEXT NOT NULL UNIQUE,
    capacity TEXT,
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    color TEXT,
    
    -- Statut
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_driver_vehicles_driver ON public.driver_vehicles(driver_id);
CREATE INDEX idx_driver_vehicles_registration ON public.driver_vehicles(registration);
CREATE INDEX idx_driver_vehicles_active ON public.driver_vehicles(is_active) WHERE is_active = true;

COMMENT ON TABLE public.driver_vehicles IS 'Véhicules des chauffeurs (support multi-véhicules)';

-- ============================================================================
-- TABLE 4 : DRIVER_DOCUMENTS (Documents des chauffeurs)
-- ============================================================================

CREATE TABLE public.driver_documents (
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
CREATE INDEX idx_driver_documents_expiry ON public.driver_documents(expiry_date) WHERE expiry_date IS NOT NULL;

COMMENT ON TABLE public.driver_documents IS 'Documents des chauffeurs (permis, assurance, etc.)';

-- ============================================================================
-- TABLE 5 : ORDERS (Commandes)
-- ============================================================================

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
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

COMMENT ON TABLE public.orders IS 'Commandes de livraison';

-- ============================================================================
-- TABLE 6 : CONVERSATIONS (Messagerie)
-- ============================================================================

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Participants
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Type
    conversation_type TEXT DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'support', 'order')),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE INDEX idx_conversations_user1 ON public.conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON public.conversations(user2_id);
CREATE INDEX idx_conversations_order ON public.conversations(order_id);
CREATE INDEX idx_conversations_active ON public.conversations(is_active) WHERE is_active = true;

COMMENT ON TABLE public.conversations IS 'Conversations entre utilisateurs';

-- ============================================================================
-- TABLE 7 : MESSAGES (Messages)
-- ============================================================================

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    
    -- Expéditeur
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
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
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_messages_unread ON public.messages(is_read) WHERE is_read = false;

COMMENT ON TABLE public.messages IS 'Messages des conversations';

-- ============================================================================
-- TABLE 8 : INVOICES (Factures)
-- ============================================================================

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Références
    order_id UUID NOT NULL REFERENCES public.orders(id),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Informations facture
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    
    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_order ON public.invoices(order_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

COMMENT ON TABLE public.invoices IS 'Factures des commandes';

-- ============================================================================
-- TABLE 9 : PLAINTES (Réclamations)
-- ============================================================================

CREATE TABLE public.plaintes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Références
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    order_id UUID REFERENCES public.orders(id),
    
    -- Contenu
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('service', 'driver', 'payment', 'other')),
    
    -- Statut
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Réponse
    response TEXT,
    responded_by UUID REFERENCES public.profiles(id),
    responded_at TIMESTAMPTZ,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plaintes_user ON public.plaintes(user_id);
CREATE INDEX idx_plaintes_order ON public.plaintes(order_id);
CREATE INDEX idx_plaintes_status ON public.plaintes(status);

COMMENT ON TABLE public.plaintes IS 'Réclamations des utilisateurs';

-- ============================================================================
-- ÉTAPE 3 : TRIGGER POUR CRÉATION AUTOMATIQUE DES PROFILS
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
-- ÉTAPE 4 : POLITIQUES RLS (Row Level Security)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaintes ENABLE ROW LEVEL SECURITY;

-- Policies pour PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies pour ORDERS
CREATE POLICY "Clients can view their own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = driver_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clients can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Drivers can update assigned orders" ON public.orders
    FOR UPDATE USING (auth.uid() = driver_id);

-- Policies pour MESSAGES
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- ============================================================================
-- ÉTAPE 5 : VÉRIFICATIONS FINALES
-- ============================================================================

SELECT '=== ✅ TABLES CRÉÉES ===' as info;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '=== ✅ TRIGGERS CRÉÉS ===' as info;
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
ORDER BY trigger_name;

SELECT '=== ✅ POLICIES RLS ===' as info;
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ 9 tables créées (profiles, drivers, driver_vehicles, driver_documents, 
--    orders, conversations, messages, invoices, plaintes)
-- ✅ Trigger handle_new_user configuré
-- ✅ RLS activé sur toutes les tables
-- ✅ Policies de sécurité configurées
-- ✅ Architecture propre et optimisée
-- ============================================================================
