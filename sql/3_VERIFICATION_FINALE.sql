-- ============================================================================
-- ✅ PHASE 3 : VÉRIFICATION FINALE - Tests complets du système
-- ============================================================================
-- Ce script vérifie que tout fonctionne correctement
-- ============================================================================

-- ============================================================================
-- TEST 1 : STRUCTURE DE LA BASE
-- ============================================================================

SELECT '=== 📊 STRUCTURE DE LA TABLE DRIVERS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'drivers'
ORDER BY ordinal_position;

-- ============================================================================
-- TEST 2 : FONCTION CREATE_DRIVER_USER
-- ============================================================================

SELECT '=== 🔧 FONCTION CREATE_DRIVER_USER ===' as info;

SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN security_type = 'DEFINER' THEN '✅ SECURITY DEFINER OK'
        ELSE '❌ Pas SECURITY DEFINER'
    END as security_check
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_driver_user';

-- ============================================================================
-- TEST 3 : POLICIES RLS
-- ============================================================================

SELECT '=== 🔒 POLICIES RLS SUR DRIVERS ===' as info;

SELECT 
    policyname,
    cmd as operation,
    roles,
    '✅ Policy active' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers'
ORDER BY policyname;

-- Vérifier que RLS est activé
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS activé'
        ELSE '❌ RLS désactivé'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- ============================================================================
-- TEST 4 : DONNÉES DU CHAUFFEUR TEST123
-- ============================================================================

SELECT '=== 🔍 CHAUFFEUR TEST123 - DÉTAILS COMPLETS ===' as info;

-- Dans auth.users
SELECT 
    'auth.users' as source,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.encrypted_password IS NOT NULL as has_password,
    u.raw_user_meta_data->>'role' as metadata_role,
    u.created_at
FROM auth.users u
WHERE u.email = 'test123@driver.local'

UNION ALL

-- Dans public.profiles
SELECT 
    'public.profiles' as source,
    p.id,
    p.role,
    NULL as email_confirmed,
    NULL as has_password,
    NULL as metadata_role,
    p.created_at
FROM public.profiles p
WHERE p.email = 'test123@driver.local'

UNION ALL

-- Dans public.drivers
SELECT 
    'public.drivers' as source,
    d.user_id,
    d.first_name || ' ' || d.last_name as role,
    NULL as email_confirmed,
    NULL as has_password,
    d.vehicle_type as metadata_role,
    d.created_at
FROM public.drivers d
WHERE d.email = 'test123@driver.local';

-- ============================================================================
-- TEST 5 : COHÉRENCE DES DONNÉES
-- ============================================================================

SELECT '=== ✅ COHÉRENCE DES DONNÉES ===' as info;

SELECT 
    u.email,
    p.id IS NOT NULL as has_profile,
    d.user_id IS NOT NULL as has_driver_entry,
    p.role as profile_role,
    d.status as driver_status,
    CASE 
        WHEN p.id IS NOT NULL AND d.user_id IS NOT NULL THEN '✅ Données cohérentes'
        ELSE '❌ Données incohérentes'
    END as coherence_check
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email = 'test123@driver.local';

-- ============================================================================
-- TEST 6 : STATISTIQUES GLOBALES
-- ============================================================================

SELECT '=== 📊 STATISTIQUES GLOBALES ===' as info;

SELECT 
    'Total utilisateurs' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total profils' as metric,
    COUNT(*) as count
FROM public.profiles
UNION ALL
SELECT 
    'Total chauffeurs' as metric,
    COUNT(*) as count
FROM public.drivers
UNION ALL
SELECT 
    'Chauffeurs @driver.local' as metric,
    COUNT(*) as count
FROM auth.users
WHERE email LIKE '%@driver.local'
UNION ALL
SELECT 
    'Profils driver/chauffeur' as metric,
    COUNT(*) as count
FROM public.profiles
WHERE role IN ('driver', 'chauffeur');

-- ============================================================================
-- TEST 7 : TRIGGERS ACTIFS
-- ============================================================================

SELECT '=== ⚡ TRIGGERS SUR AUTH.USERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    '✅ Trigger actif' as status
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================

SELECT '=== 🎯 RÉSUMÉ FINAL ===' as info;

SELECT 
    'Structure table drivers' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'drivers'
        ) THEN '✅ OK'
        ELSE '❌ Manquante'
    END as status
UNION ALL
SELECT 
    'Fonction create_driver_user' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public' AND routine_name = 'create_driver_user'
        ) THEN '✅ OK'
        ELSE '❌ Manquante'
    END as status
UNION ALL
SELECT 
    'Policies RLS' as check_item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drivers') >= 4
        THEN '✅ OK (' || (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drivers') || ' policies)'
        ELSE '❌ Insuffisantes'
    END as status
UNION ALL
SELECT 
    'Chauffeur test123' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN public.profiles p ON u.id = p.id
            JOIN public.drivers d ON u.id = d.user_id
            WHERE u.email = 'test123@driver.local'
        ) THEN '✅ OK (complet)'
        ELSE '❌ Incomplet ou manquant'
    END as status;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Structure table drivers : OK
-- ✅ Fonction create_driver_user : OK
-- ✅ Policies RLS : OK (4 policies)
-- ✅ Chauffeur test123 : OK (complet)
-- ✅ Données cohérentes
-- ✅ Système prêt pour la production !
-- ============================================================================
