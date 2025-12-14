-- ============================================================================
-- 🔍 DIAGNOSTIC RAPIDE - Pourquoi le chauffeur ne se crée pas ?
-- ============================================================================

SELECT '=== 🔍 DIAGNOSTIC RAPIDE ===' as info;

-- 1. Vérifier que la table profiles existe
SELECT 
    '1. Table profiles' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
        THEN '✅ EXISTE'
        ELSE '❌ MANQUANTE - Exécuter RESET_DATABASE.sql'
    END as status;

-- 2. Vérifier que la table drivers existe
SELECT 
    '2. Table drivers' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drivers')
        THEN '✅ EXISTE'
        ELSE '❌ MANQUANTE - Exécuter RESET_DATABASE.sql'
    END as status;

-- 3. Vérifier que le trigger handle_new_user existe
SELECT 
    '3. Trigger handle_new_user' as check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_schema = 'auth' 
            AND event_object_table = 'users'
            AND trigger_name = 'handle_new_user'
        )
        THEN '✅ EXISTE'
        ELSE '❌ MANQUANT - Exécuter RESET_DATABASE.sql'
    END as status;

-- 4. Vérifier que la fonction create_driver_user existe
SELECT 
    '4. Fonction create_driver_user' as check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'create_driver_user'
        )
        THEN '✅ EXISTE'
        ELSE '❌ MANQUANTE - Exécuter create_driver_rpc.sql'
    END as status;

-- 5. Voir la structure de la table profiles (si elle existe)
SELECT '=== 📋 Structure de profiles ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Voir la structure de la table drivers (si elle existe)
SELECT '=== 🚗 Structure de drivers ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'drivers'
ORDER BY ordinal_position;

-- 7. Compter les chauffeurs existants
SELECT '=== 📊 Chauffeurs existants ===' as info;

SELECT 
    COUNT(*) as total_chauffeurs,
    COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending
FROM public.profiles p
WHERE p.role = 'chauffeur';

-- 8. Voir les chauffeurs avec leurs infos
SELECT '=== 👥 Liste des chauffeurs ===' as info;

SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.status,
    p.driver_id,
    CASE 
        WHEN d.user_id IS NOT NULL THEN '✅ Entrée drivers existe'
        ELSE '❌ Entrée drivers MANQUANTE'
    END as driver_entry_status
FROM public.profiles p
LEFT JOIN public.drivers d ON d.user_id = p.id
WHERE p.role = 'chauffeur'
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================================================
-- RÉSUMÉ ET RECOMMANDATIONS
-- ============================================================================

SELECT '=== 💡 RECOMMANDATION ===' as info;

DO $$
DECLARE
    has_profiles BOOLEAN;
    has_drivers BOOLEAN;
    has_trigger BOOLEAN;
    has_function BOOLEAN;
BEGIN
    -- Vérifier l'existence des éléments
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') INTO has_profiles;
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drivers') INTO has_drivers;
    SELECT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_schema = 'auth' AND trigger_name = 'handle_new_user') INTO has_trigger;
    SELECT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'create_driver_user') INTO has_function;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 🎯 DIAGNOSTIC COMPLET ===';
    RAISE NOTICE '';
    
    IF NOT has_profiles THEN
        RAISE NOTICE '❌ Table profiles MANQUANTE';
        RAISE NOTICE '   → Exécuter: RESET_DATABASE.sql';
    ELSE
        RAISE NOTICE '✅ Table profiles existe';
    END IF;
    
    IF NOT has_drivers THEN
        RAISE NOTICE '❌ Table drivers MANQUANTE';
        RAISE NOTICE '   → Exécuter: RESET_DATABASE.sql';
    ELSE
        RAISE NOTICE '✅ Table drivers existe';
    END IF;
    
    IF NOT has_trigger THEN
        RAISE NOTICE '❌ Trigger handle_new_user MANQUANT';
        RAISE NOTICE '   → Exécuter: RESET_DATABASE.sql';
    ELSE
        RAISE NOTICE '✅ Trigger handle_new_user existe';
    END IF;
    
    IF NOT has_function THEN
        RAISE NOTICE '❌ Fonction create_driver_user MANQUANTE';
        RAISE NOTICE '   → Exécuter: create_driver_rpc.sql';
    ELSE
        RAISE NOTICE '✅ Fonction create_driver_user existe';
    END IF;
    
    RAISE NOTICE '';
    
    IF has_profiles AND has_drivers AND has_trigger AND has_function THEN
        RAISE NOTICE '🎉 TOUT EST OK ! Si le problème persiste:';
        RAISE NOTICE '   1. Vérifier les logs Supabase';
        RAISE NOTICE '   2. Tester avec TEST_CREATE_DRIVER.sql';
    ELSIF NOT has_profiles OR NOT has_drivers OR NOT has_trigger THEN
        RAISE NOTICE '⚠️  ACTION REQUISE:';
        RAISE NOTICE '   1. Exécuter RESET_DATABASE.sql';
        RAISE NOTICE '   2. Exécuter create_driver_rpc.sql';
        RAISE NOTICE '   3. Tester avec TEST_CREATE_DRIVER.sql';
    ELSIF NOT has_function THEN
        RAISE NOTICE '⚠️  ACTION REQUISE:';
        RAISE NOTICE '   1. Exécuter create_driver_rpc.sql';
        RAISE NOTICE '   2. Tester avec TEST_CREATE_DRIVER.sql';
    END IF;
    
    RAISE NOTICE '';
END $$;
