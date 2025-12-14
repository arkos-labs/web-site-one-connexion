-- ============================================================================
-- 🗑️ NETTOYAGE COMPLET - TOUTES LES DONNÉES CHAUFFEURS
-- ============================================================================
-- Ce script supprime TOUTES les données liées aux chauffeurs dans TOUTES les tables
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : IDENTIFIER TOUS LES CHAUFFEURS À SUPPRIMER
-- ============================================================================

-- Créer une table temporaire avec les IDs des chauffeurs
CREATE TEMP TABLE chauffeurs_a_supprimer AS
SELECT DISTINCT id
FROM auth.users
WHERE email LIKE '%@driver.%';

-- Afficher les chauffeurs qui vont être supprimés
SELECT 
    '=== 🚨 CHAUFFEURS QUI VONT ÊTRE SUPPRIMÉS ===' as info;

SELECT 
    u.id,
    u.email,
    p.role,
    d.first_name,
    d.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.id IN (SELECT id FROM chauffeurs_a_supprimer);

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER LES DONNÉES DANS LES TABLES LIÉES
-- ============================================================================

-- Supprimer les commandes (orders) des chauffeurs
DELETE FROM public.orders 
WHERE driver_id IN (SELECT id FROM chauffeurs_a_supprimer);

-- Supprimer les véhicules (vehicles) si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'vehicles'
    ) THEN
        DELETE FROM public.vehicles 
        WHERE driver_id IN (SELECT id FROM chauffeurs_a_supprimer);
    END IF;
END $$;

-- Supprimer les documents (driver_documents) si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'driver_documents'
    ) THEN
        DELETE FROM public.driver_documents 
        WHERE driver_id IN (SELECT id FROM chauffeurs_a_supprimer);
    END IF;
END $$;

-- Supprimer les positions GPS si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'driver_positions'
    ) THEN
        DELETE FROM public.driver_positions 
        WHERE driver_id IN (SELECT id FROM chauffeurs_a_supprimer);
    END IF;
END $$;

-- Supprimer les revenus/paiements si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'driver_earnings'
    ) THEN
        DELETE FROM public.driver_earnings 
        WHERE driver_id IN (SELECT id FROM chauffeurs_a_supprimer);
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : SUPPRIMER LES TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- ============================================================================
-- ÉTAPE 4 : SUPPRIMER LES FONCTIONS
-- ============================================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_on_signup() CASCADE;
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text) CASCADE;

-- ============================================================================
-- ÉTAPE 5 : SUPPRIMER LES POLICIES RLS
-- ============================================================================
DROP POLICY IF EXISTS "Drivers can view own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own data" ON public.drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.drivers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_own" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update_own" ON public.drivers;
DROP POLICY IF EXISTS "admins_select_all" ON public.drivers;
DROP POLICY IF EXISTS "admins_all" ON public.drivers;

-- ============================================================================
-- ÉTAPE 6 : SUPPRIMER LES DONNÉES CHAUFFEURS DES TABLES PRINCIPALES
-- ============================================================================

-- Supprimer de la table drivers
DELETE FROM public.drivers 
WHERE user_id IN (SELECT id FROM chauffeurs_a_supprimer);

-- Supprimer les profils chauffeurs
DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM chauffeurs_a_supprimer);

-- Supprimer les utilisateurs chauffeurs de auth.users
DELETE FROM auth.users 
WHERE id IN (SELECT id FROM chauffeurs_a_supprimer);

-- ============================================================================
-- ÉTAPE 7 : RECRÉER LA TABLE DRIVERS PROPREMENT
-- ============================================================================

-- Supprimer la table existante
DROP TABLE IF EXISTS public.drivers CASCADE;

-- Créer la nouvelle table avec structure optimale
CREATE TABLE public.drivers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'offline',
    vehicle_type TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT,
    siret TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index
CREATE INDEX idx_drivers_email ON public.drivers(email);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);

-- ============================================================================
-- ÉTAPE 8 : VÉRIFICATION COMPLÈTE
-- ============================================================================

SELECT '=== ✅ VÉRIFICATION COMPLÈTE ===' as info;

-- Vérifier qu'il n'y a plus de chauffeurs
SELECT 
    'Chauffeurs dans auth.users' as table_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Nettoyé'
        ELSE '❌ Il reste ' || COUNT(*) || ' chauffeurs'
    END as status
FROM auth.users
WHERE email LIKE '%@driver.%'

UNION ALL

SELECT 
    'Profils chauffeurs' as table_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Nettoyé'
        ELSE '❌ Il reste ' || COUNT(*) || ' profils'
    END as status
FROM public.profiles
WHERE role IN ('driver', 'chauffeur')

UNION ALL

SELECT 
    'Entrées dans drivers' as table_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Nettoyé'
        ELSE '❌ Il reste ' || COUNT(*) || ' entrées'
    END as status
FROM public.drivers

UNION ALL

SELECT 
    'Commandes de chauffeurs' as table_name,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Nettoyé'
        ELSE '⚠️ Il reste ' || COUNT(*) || ' commandes'
    END as status
FROM public.orders
WHERE driver_id IN (SELECT id FROM auth.users WHERE email LIKE '%@driver.%');

-- Vérifier les triggers
SELECT 
    '=== ⚡ TRIGGERS RESTANTS ===' as info;

SELECT 
    COALESCE(COUNT(*), 0) as trigger_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun trigger'
        ELSE '⚠️ ' || COUNT(*) || ' triggers restants'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Vérifier les policies
SELECT 
    '=== 🔒 POLICIES RESTANTES ===' as info;

SELECT 
    COALESCE(COUNT(*), 0) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucune policy'
        ELSE '⚠️ ' || COUNT(*) || ' policies restantes'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- Nettoyer la table temporaire
DROP TABLE IF EXISTS chauffeurs_a_supprimer;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ 0 chauffeurs dans toutes les tables
-- ✅ 0 commandes de chauffeurs
-- ✅ 0 triggers
-- ✅ 0 policies
-- ✅ Table drivers recréée proprement
-- ✅ Base de données complètement nettoyée !
-- ============================================================================
