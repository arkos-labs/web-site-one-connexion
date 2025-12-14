-- ============================================================================
-- 🔍 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES
-- ============================================================================
-- Ce script vérifie l'état de santé de toute la base de données
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFICATION DES TABLES EXISTANTES
-- ============================================================================
SELECT '=== 📊 TABLES EXISTANTES ===' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'drivers', 'clients', 'admins') THEN '✅'
        ELSE '⚠️'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'drivers', 'clients', 'admins', 'orders')
ORDER BY table_name;

-- ============================================================================
-- 2. STRUCTURE DE LA TABLE PROFILES
-- ============================================================================
SELECT '=== 📋 STRUCTURE TABLE PROFILES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Vérifier les contraintes sur profiles
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'profiles';

-- ============================================================================
-- 3. STRUCTURE DE LA TABLE DRIVERS
-- ============================================================================
SELECT '=== 🚗 STRUCTURE TABLE DRIVERS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'drivers'
ORDER BY ordinal_position;

-- Vérifier les contraintes sur drivers
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'drivers';

-- ============================================================================
-- 4. TRIGGERS ACTIFS SUR AUTH.USERS
-- ============================================================================
SELECT '=== ⚡ TRIGGERS SUR AUTH.USERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement as function_call
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================================================
-- 5. FONCTIONS TRIGGERS EXISTANTES
-- ============================================================================
SELECT '=== 🔧 FONCTIONS TRIGGERS ===' as info;

SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%'
OR routine_name LIKE '%trigger%'
ORDER BY routine_name;

-- ============================================================================
-- 6. FONCTION CREATE_DRIVER_USER
-- ============================================================================
SELECT '=== 🚀 FONCTION CREATE_DRIVER_USER ===' as info;

SELECT 
    routine_name,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ Fonction existe'
        ELSE '❌ Fonction manquante'
    END as status,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_driver_user';

-- ============================================================================
-- 7. PERMISSIONS RLS SUR DRIVERS
-- ============================================================================
SELECT '=== 🔒 PERMISSIONS RLS SUR DRIVERS ===' as info;

-- Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- Lister les policies
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'Pas de USING'
    END as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers'
ORDER BY policyname;

-- ============================================================================
-- 8. UTILISATEURS DANS AUTH.USERS
-- ============================================================================
SELECT '=== 👥 UTILISATEURS DANS AUTH.USERS ===' as info;

SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    raw_user_meta_data->>'role' as metadata_role,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 9. PROFILS DANS PUBLIC.PROFILES
-- ============================================================================
SELECT '=== 📝 PROFILS DANS PUBLIC.PROFILES ===' as info;

SELECT 
    id,
    role,
    email,
    first_name,
    last_name,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 10. CHAUFFEURS DANS PUBLIC.DRIVERS
-- ============================================================================
SELECT '=== 🚗 CHAUFFEURS DANS PUBLIC.DRIVERS ===' as info;

SELECT 
    user_id,
    first_name,
    last_name,
    email,
    status,
    vehicle_type,
    created_at
FROM public.drivers
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 11. COHÉRENCE DES DONNÉES
-- ============================================================================
SELECT '=== ✅ COHÉRENCE DES DONNÉES ===' as info;

-- Utilisateurs sans profil
SELECT 
    'Utilisateurs sans profil' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END as status
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Chauffeurs sans entrée drivers
SELECT 
    'Chauffeurs sans entrée drivers' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END as status
FROM public.profiles p
WHERE p.role IN ('driver', 'chauffeur')
AND NOT EXISTS (
    SELECT 1 FROM public.drivers d WHERE d.user_id = p.id
);

-- Chauffeurs dans table clients
SELECT 
    'Chauffeurs dans table clients' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END as status
FROM public.clients c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.role IN ('driver', 'chauffeur');

-- ============================================================================
-- 12. FORMAT DES EMAILS CHAUFFEURS
-- ============================================================================
SELECT '=== 📧 FORMAT DES EMAILS CHAUFFEURS ===' as info;

SELECT 
    email,
    CASE 
        WHEN email LIKE '%@driver.local' THEN '✅ Format correct'
        WHEN email LIKE '%@driver.oneconnexion' THEN '❌ Ancien format'
        ELSE '⚠️ Format inconnu'
    END as format_status
FROM auth.users
WHERE email LIKE '%@driver.%'
ORDER BY email;

-- ============================================================================
-- 13. DÉTAIL DU CHAUFFEUR TEST123
-- ============================================================================
SELECT '=== 🔍 DÉTAIL CHAUFFEUR TEST123 ===' as info;

SELECT 
    'auth.users' as source,
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as confirmed,
    u.encrypted_password IS NOT NULL as has_password,
    u.raw_user_meta_data->>'role' as metadata_role
FROM auth.users u
WHERE u.email = 'test123@driver.local'

UNION ALL

SELECT 
    'public.profiles' as source,
    p.id,
    p.email,
    NULL as confirmed,
    NULL as has_password,
    p.role as metadata_role
FROM public.profiles p
WHERE p.email = 'test123@driver.local'

UNION ALL

SELECT 
    'public.drivers' as source,
    d.user_id as id,
    d.email,
    NULL as confirmed,
    NULL as has_password,
    NULL as metadata_role
FROM public.drivers d
WHERE d.email = 'test123@driver.local';

-- ============================================================================
-- 14. ERREURS POTENTIELLES
-- ============================================================================
SELECT '=== ⚠️ PROBLÈMES DÉTECTÉS ===' as info;

-- Vérifier les doublons d'email
SELECT 
    'Doublons email dans auth.users' as probleme,
    email,
    COUNT(*) as count
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Vérifier les profils orphelins
SELECT 
    'Profils sans utilisateur auth' as probleme,
    p.email,
    p.role
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
)
LIMIT 5;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================
SELECT '=== 📊 RÉSUMÉ FINAL ===' as info;

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
WHERE email LIKE '%@driver.local';

-- ============================================================================
-- FIN DU DIAGNOSTIC
-- ============================================================================
