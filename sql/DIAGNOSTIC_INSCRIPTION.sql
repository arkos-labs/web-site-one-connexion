-- ============================================================================
-- 🔍 DIAGNOSTIC - Vérifier pourquoi l'inscription échoue
-- ============================================================================
-- Ce script permet de diagnostiquer les problèmes d'inscription
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFIER QUE LA TABLE PROFILES EXISTE
-- ============================================================================

SELECT '=== 📋 TABLE PROFILES ===' as check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        THEN '✅ Table profiles existe'
        ELSE '❌ Table profiles MANQUANTE !'
    END as table_check;

-- Voir la structure de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. VÉRIFIER QUE LA TABLE DRIVERS EXISTE
-- ============================================================================

SELECT '=== 🚗 TABLE DRIVERS ===' as check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers')
        THEN '✅ Table drivers existe'
        ELSE '❌ Table drivers MANQUANTE !'
    END as table_check;

-- Voir la structure de la table drivers
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. VÉRIFIER LE TRIGGER
-- ============================================================================

SELECT '=== ⚙️ TRIGGER ===' as check;

SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Vérifier la fonction du trigger
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ============================================================================
-- 4. VÉRIFIER LES CONTRAINTES DE LA TABLE PROFILES
-- ============================================================================

SELECT '=== 🔒 CONTRAINTES PROFILES ===' as check;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- ============================================================================
-- 5. VÉRIFIER LES POLICIES RLS
-- ============================================================================

SELECT '=== 🛡️ POLICIES RLS ===' as check;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('profiles', 'drivers')
ORDER BY tablename, policyname;

-- ============================================================================
-- 6. TESTER L'INSERTION MANUELLE DANS PROFILES
-- ============================================================================

SELECT '=== 🧪 TEST INSERTION ===' as check;

-- Test 1: Essayer d'insérer un profil test
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            role,
            status
        ) VALUES (
            test_id,
            'test@example.com',
            'Test',
            'User',
            '+33612345678',
            'chauffeur',
            'pending'
        );
        
        RAISE NOTICE '✅ Insertion dans profiles réussie';
        
        -- Nettoyer
        DELETE FROM public.profiles WHERE id = test_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur insertion profiles: % - %', SQLERRM, SQLSTATE;
    END;
END $$;

-- ============================================================================
-- 7. VÉRIFIER LES PERMISSIONS
-- ============================================================================

SELECT '=== 👤 PERMISSIONS ===' as check;

SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('profiles', 'drivers')
AND grantee != 'postgres'
ORDER BY table_name, grantee;

-- ============================================================================
-- 8. VOIR LES DERNIÈRES ERREURS (si disponibles)
-- ============================================================================

SELECT '=== ⚠️ LOGS RÉCENTS ===' as check;

-- Note: Cette requête peut ne pas fonctionner selon votre configuration
-- Elle est là pour information

-- ============================================================================
-- 9. RÉSUMÉ DU DIAGNOSTIC
-- ============================================================================

SELECT '=== 📊 RÉSUMÉ ===' as check;

SELECT 
    'Tables' as categorie,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drivers')
        THEN '✅ OK'
        ELSE '❌ MANQUANTES'
    END as status
UNION ALL
SELECT 
    'Trigger' as categorie,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN '✅ OK'
        ELSE '❌ MANQUANT'
    END as status
UNION ALL
SELECT 
    'Fonction' as categorie,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
        THEN '✅ OK'
        ELSE '❌ MANQUANTE'
    END as status;

-- ============================================================================
-- 10. RECOMMANDATIONS
-- ============================================================================

SELECT '=== 💡 RECOMMANDATIONS ===' as check;

SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        THEN '❌ URGENT: Exécuter RESET_DATABASE.sql pour créer les tables'
        
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN '❌ URGENT: Exécuter FIX_TRIGGER_INSCRIPTION.sql pour créer le trigger'
        
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
        AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN '✅ Configuration OK - Si l''erreur persiste, vérifier les logs Supabase'
        
        ELSE '⚠️ Vérifier les résultats ci-dessus pour identifier le problème'
    END as recommandation;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Ce script vous dira exactement ce qui manque ou ne fonctionne pas
-- ============================================================================
