-- ============================================================================
-- 🗑️ PHASE 1 : NETTOYAGE COMPLET - Suppression de tout le système chauffeur
-- ============================================================================
-- Ce script supprime TOUT ce qui concerne les chauffeurs pour repartir de zéro
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER LES TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER LES FONCTIONS
-- ============================================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_on_signup() CASCADE;
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text) CASCADE;

-- ============================================================================
-- ÉTAPE 3 : SUPPRIMER LES POLICIES RLS SUR DRIVERS
-- ============================================================================
DROP POLICY IF EXISTS "Drivers can view own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own data" ON public.drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.drivers;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select_own" ON public.drivers;
DROP POLICY IF EXISTS "admins_all" ON public.drivers;

-- ============================================================================
-- ÉTAPE 4 : SUPPRIMER LES DONNÉES CHAUFFEURS
-- ============================================================================

-- Supprimer de la table drivers
DELETE FROM public.drivers WHERE email LIKE '%@driver.%';

-- Supprimer les profils chauffeurs
DELETE FROM public.profiles WHERE role IN ('driver', 'chauffeur');

-- Supprimer les utilisateurs chauffeurs de auth.users
DELETE FROM auth.users WHERE email LIKE '%@driver.%';

-- ============================================================================
-- ÉTAPE 5 : RECRÉER LA TABLE DRIVERS PROPREMENT
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

-- Créer les index pour les performances
CREATE INDEX idx_drivers_email ON public.drivers(email);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_user_id ON public.drivers(user_id);

-- ============================================================================
-- ÉTAPE 6 : VÉRIFICATION DU NETTOYAGE
-- ============================================================================

SELECT '=== ✅ VÉRIFICATION DU NETTOYAGE ===' as info;

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
FROM public.drivers;

-- Vérifier qu'il n'y a plus de triggers
SELECT 
    '=== ⚡ TRIGGERS RESTANTS ===' as info;

SELECT 
    trigger_name,
    event_object_table,
    'Trigger encore présent' as status
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Vérifier qu'il n'y a plus de policies sur drivers
SELECT 
    '=== 🔒 POLICIES RESTANTES ===' as info;

SELECT 
    policyname,
    'Policy encore présente' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ 0 chauffeurs dans auth.users
-- ✅ 0 profils chauffeurs
-- ✅ 0 entrées dans drivers
-- ✅ 0 triggers sur auth.users
-- ✅ 0 policies sur drivers
-- ✅ Table drivers recréée proprement
-- ============================================================================
