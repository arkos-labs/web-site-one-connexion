-- ============================================================================
-- DIAGNOSTIC RAPIDE - Pourquoi le chauffeur ne peut pas se connecter ?
-- ============================================================================

-- 1. Vérifier si des chauffeurs existent
-- ============================================================================
SELECT 
    '=== CHAUFFEURS EXISTANTS ===' as info;

SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at,
    p.role as profile_role,
    d.user_id IS NOT NULL as has_driver_entry
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email LIKE '%@driver.%'
ORDER BY u.created_at DESC;

-- 2. Vérifier le format des emails
-- ============================================================================
SELECT 
    '=== FORMAT DES EMAILS ===' as info;

SELECT 
    CASE 
        WHEN email LIKE '%@driver.local' THEN '✅ Format correct (@driver.local)'
        WHEN email LIKE '%@driver.oneconnexion' THEN '❌ Ancien format (@driver.oneconnexion)'
        ELSE '⚠️ Format inconnu'
    END as format_status,
    COUNT(*) as count
FROM auth.users
WHERE email LIKE '%@driver.%'
GROUP BY 
    CASE 
        WHEN email LIKE '%@driver.local' THEN '✅ Format correct (@driver.local)'
        WHEN email LIKE '%@driver.oneconnexion' THEN '❌ Ancien format (@driver.oneconnexion)'
        ELSE '⚠️ Format inconnu'
    END;

-- 3. Vérifier si la fonction create_driver_user existe
-- ============================================================================
SELECT 
    '=== FONCTION CREATE_DRIVER_USER ===' as info;

SELECT 
    routine_name,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ Fonction existe'
        ELSE '❌ Fonction n''existe pas'
    END as status
FROM information_schema.routines
WHERE routine_name = 'create_driver_user'
AND routine_schema = 'public';

-- 4. Tester avec un chauffeur spécifique
-- ============================================================================
SELECT 
    '=== TEST CHAUFFEUR SPÉCIFIQUE ===' as info;

-- Remplacez 'chauffeur1' par l'identifiant que vous utilisez
SELECT 
    u.id,
    u.email,
    u.encrypted_password IS NOT NULL as has_password,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.role as profile_role,
    d.first_name,
    d.last_name,
    d.status as driver_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email IN ('chauffeur1@driver.local', 'test123@driver.local', 'CHAUFF01@driver.local');

-- 5. Vérifier les métadonnées des chauffeurs
-- ============================================================================
SELECT 
    '=== MÉTADONNÉES DES CHAUFFEURS ===' as info;

SELECT 
    u.email,
    u.raw_user_meta_data->>'role' as metadata_role,
    p.role as profile_role,
    CASE 
        WHEN u.raw_user_meta_data->>'role' = 'driver' THEN '✅ Rôle correct'
        WHEN u.raw_user_meta_data->>'role' IS NULL THEN '⚠️ Pas de rôle dans métadonnées'
        ELSE '❌ Rôle incorrect: ' || (u.raw_user_meta_data->>'role')
    END as metadata_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@driver.%'
ORDER BY u.created_at DESC;

-- ============================================================================
-- INTERPRÉTATION DES RÉSULTATS
-- ============================================================================
-- 
-- Si aucun chauffeur n'existe :
--   → Exécutez setup_and_test_driver.sql pour créer un chauffeur de test
--
-- Si format email = @driver.oneconnexion :
--   → Exécutez fix_existing_drivers_email.sql pour corriger
--
-- Si fonction n'existe pas :
--   → Exécutez fix_driver_email_domain.sql pour créer la fonction
--
-- Si has_password = false :
--   → Le mot de passe n'a pas été défini correctement
--
-- Si email_confirmed = false :
--   → Normal pour les chauffeurs créés manuellement
--
-- Si has_driver_entry = false :
--   → Le chauffeur n'a pas d'entrée dans la table drivers
--   → Recréez le chauffeur depuis l'admin
--
-- Si metadata_role != 'driver' :
--   → Le trigger a peut-être créé le chauffeur dans clients
--   → Exécutez verify_no_drivers_in_clients.sql
-- ============================================================================
