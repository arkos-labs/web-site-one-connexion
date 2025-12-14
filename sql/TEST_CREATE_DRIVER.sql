-- ============================================================================
-- SCRIPT DE TEST : Création de Chauffeur
-- ============================================================================
-- Ce script teste la fonction create_driver_user et vérifie que le chauffeur
-- est correctement créé dans les tables profiles et drivers
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : Vérifier que la fonction existe
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'create_driver_user'
    ) THEN
        RAISE EXCEPTION '❌ ERREUR: La fonction create_driver_user n''existe pas. Exécutez d''abord create_driver_rpc.sql';
    END IF;
    RAISE NOTICE '✅ La fonction create_driver_user existe';
END $$;

-- ============================================================================
-- ÉTAPE 2 : Nettoyer les données de test précédentes
-- ============================================================================

DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Trouver l'utilisateur de test
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email = 'test_chauffeur@driver.local';
    
    IF test_user_id IS NOT NULL THEN
        -- Supprimer de drivers
        DELETE FROM public.drivers WHERE user_id = test_user_id;
        
        -- Supprimer de profiles
        DELETE FROM public.profiles WHERE id = test_user_id;
        
        -- Supprimer de auth.users
        DELETE FROM auth.users WHERE id = test_user_id;
        
        RAISE NOTICE '✅ Données de test précédentes nettoyées';
    ELSE
        RAISE NOTICE 'ℹ️  Aucune donnée de test précédente trouvée';
    END IF;
END $$;

-- ============================================================================
-- ÉTAPE 3 : Créer un chauffeur de test
-- ============================================================================

DO $$
DECLARE
    new_driver_id UUID;
BEGIN
    -- Appeler la fonction create_driver_user
    SELECT create_driver_user(
        'test_chauffeur',           -- username
        'password123',              -- password
        'Jean',                     -- first_name
        'Dupont',                   -- last_name
        '0612345678',              -- phone
        '123 Rue de Paris',        -- address
        '12345678900012',          -- siret
        'Scooter',                 -- vehicle_type
        'AB-123-CD',               -- vehicle_registration
        '10 colis'                 -- vehicle_capacity
    ) INTO new_driver_id;
    
    RAISE NOTICE '✅ Chauffeur créé avec ID: %', new_driver_id;
END $$;

-- ============================================================================
-- ÉTAPE 4 : Vérifier la création dans auth.users
-- ============================================================================

SELECT '=== 🔍 VÉRIFICATION auth.users ===' as info;

SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'username' as username,
    raw_user_meta_data->>'first_name' as first_name,
    raw_user_meta_data->>'last_name' as last_name,
    created_at
FROM auth.users
WHERE email = 'test_chauffeur@driver.local';

-- ============================================================================
-- ÉTAPE 5 : Vérifier la création dans public.profiles
-- ============================================================================

SELECT '=== 🔍 VÉRIFICATION public.profiles ===' as info;

SELECT 
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    status,
    driver_id,
    created_at
FROM public.profiles
WHERE email = 'test_chauffeur@driver.local';

-- ============================================================================
-- ÉTAPE 6 : Vérifier la création dans public.drivers
-- ============================================================================

SELECT '=== 🔍 VÉRIFICATION public.drivers ===' as info;

SELECT 
    d.user_id,
    d.status,
    d.vehicle_type,
    d.vehicle_registration,
    d.vehicle_capacity,
    d.total_deliveries,
    d.rating,
    d.created_at,
    p.first_name || ' ' || p.last_name as driver_name
FROM public.drivers d
JOIN public.profiles p ON p.id = d.user_id
WHERE p.email = 'test_chauffeur@driver.local';

-- ============================================================================
-- ÉTAPE 7 : Vérifier la jointure complète
-- ============================================================================

SELECT '=== 🔍 VÉRIFICATION JOINTURE COMPLÈTE ===' as info;

SELECT 
    u.email as auth_email,
    p.email as profile_email,
    p.first_name,
    p.last_name,
    p.phone,
    p.role,
    p.status,
    p.driver_id,
    d.vehicle_type,
    d.vehicle_registration,
    d.vehicle_capacity,
    d.status as driver_status
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
JOIN public.drivers d ON d.user_id = p.id
WHERE u.email = 'test_chauffeur@driver.local';

-- ============================================================================
-- ÉTAPE 8 : Résumé des vérifications
-- ============================================================================

DO $$
DECLARE
    has_auth_user BOOLEAN;
    has_profile BOOLEAN;
    has_driver BOOLEAN;
    test_user_id UUID;
BEGIN
    -- Vérifier auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'test_chauffeur@driver.local'
    ) INTO has_auth_user;
    
    -- Vérifier profiles
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email = 'test_chauffeur@driver.local';
    
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = test_user_id
    ) INTO has_profile;
    
    -- Vérifier drivers
    SELECT EXISTS (
        SELECT 1 FROM public.drivers WHERE user_id = test_user_id
    ) INTO has_driver;
    
    -- Afficher le résumé
    RAISE NOTICE '=== 📊 RÉSUMÉ DES VÉRIFICATIONS ===';
    
    IF has_auth_user THEN
        RAISE NOTICE '✅ Utilisateur créé dans auth.users';
    ELSE
        RAISE NOTICE '❌ Utilisateur MANQUANT dans auth.users';
    END IF;
    
    IF has_profile THEN
        RAISE NOTICE '✅ Profil créé dans public.profiles';
    ELSE
        RAISE NOTICE '❌ Profil MANQUANT dans public.profiles';
    END IF;
    
    IF has_driver THEN
        RAISE NOTICE '✅ Chauffeur créé dans public.drivers';
    ELSE
        RAISE NOTICE '❌ Chauffeur MANQUANT dans public.drivers';
    END IF;
    
    IF has_auth_user AND has_profile AND has_driver THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 SUCCÈS TOTAL ! Le chauffeur a été créé correctement dans toutes les tables.';
        RAISE NOTICE '';
        RAISE NOTICE '🔐 Identifiants de connexion :';
        RAISE NOTICE '   Identifiant : test_chauffeur';
        RAISE NOTICE '   Mot de passe : password123';
        RAISE NOTICE '';
    ELSE
        RAISE EXCEPTION '❌ ÉCHEC : Le chauffeur n''a pas été créé correctement dans toutes les tables';
    END IF;
END $$;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Fonction create_driver_user existe
-- ✅ Chauffeur créé avec ID: [UUID]
-- ✅ Utilisateur créé dans auth.users
-- ✅ Profil créé dans public.profiles
-- ✅ Chauffeur créé dans public.drivers
-- 🎉 SUCCÈS TOTAL !
-- ============================================================================
