-- ============================================================================
-- SCRIPT COMPLET : Préparation et Test du système chauffeur
-- ============================================================================

-- ÉTAPE 1 : Vérifier que la fonction create_driver_user existe
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_driver_user'
    ) THEN
        RAISE EXCEPTION 'ERREUR: La fonction create_driver_user n''existe pas. Exécutez d''abord fix_driver_email_domain.sql';
    END IF;
    RAISE NOTICE '✅ La fonction create_driver_user existe';
END $$;

-- ÉTAPE 2 : Corriger les emails existants (si nécessaire)
-- ============================================================================
UPDATE auth.users
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

UPDATE public.drivers
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

UPDATE public.profiles
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

-- ÉTAPE 3 : Créer un chauffeur de test
-- ============================================================================
DO $$
DECLARE
    v_driver_id UUID;
BEGIN
    -- Supprimer le chauffeur de test s'il existe déjà
    DELETE FROM public.drivers WHERE email = 'test123@driver.local';
    DELETE FROM public.profiles WHERE email = 'test123@driver.local';
    DELETE FROM auth.users WHERE email = 'test123@driver.local';
    
    -- Créer le nouveau chauffeur
    SELECT create_driver_user(
        'test123',              -- username
        'password123',          -- password
        'Jean',                 -- first_name
        'Test',                 -- last_name
        '0612345678',          -- phone
        '123 Rue de Test',     -- address
        '12345678900012',      -- siret
        'Scooter',             -- vehicle_type
        'AB-123-CD',           -- vehicle_registration
        '10 colis'             -- vehicle_capacity
    ) INTO v_driver_id;
    
    RAISE NOTICE '✅ Chauffeur de test créé avec succès !';
    RAISE NOTICE '   ID: %', v_driver_id;
    RAISE NOTICE '   Identifiant: test123';
    RAISE NOTICE '   Mot de passe: password123';
    RAISE NOTICE '   Email: test123@driver.local';
END $$;

-- ÉTAPE 4 : Vérification complète
-- ============================================================================
SELECT 
    '=== VÉRIFICATION CHAUFFEUR DE TEST ===' as info;

-- Vérifier dans auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users
WHERE email = 'test123@driver.local';

-- Vérifier dans public.profiles
SELECT 
    'public.profiles' as table_name,
    id,
    role,
    email,
    created_at
FROM public.profiles
WHERE email = 'test123@driver.local';

-- Vérifier dans public.drivers
SELECT 
    'public.drivers' as table_name,
    user_id,
    first_name,
    last_name,
    email,
    phone,
    vehicle_type,
    vehicle_registration,
    status,
    created_at
FROM public.drivers
WHERE email = 'test123@driver.local';

-- ÉTAPE 5 : Statistiques globales
-- ============================================================================
SELECT 
    '=== STATISTIQUES GLOBALES ===' as info;

SELECT 
    'Total chauffeurs' as metric,
    COUNT(*) as count
FROM public.drivers
UNION ALL
SELECT 
    'Chauffeurs avec @driver.local' as metric,
    COUNT(*) as count
FROM public.drivers
WHERE email LIKE '%@driver.local'
UNION ALL
SELECT 
    'Chauffeurs avec ancien format' as metric,
    COUNT(*) as count
FROM public.drivers
WHERE email LIKE '%@driver.oneconnexion'
UNION ALL
SELECT 
    'Chauffeurs actifs' as metric,
    COUNT(*) as count
FROM public.drivers
WHERE status = 'active'
UNION ALL
SELECT 
    'Chauffeurs hors ligne' as metric,
    COUNT(*) as count
FROM public.drivers
WHERE status = 'offline';

-- ÉTAPE 6 : Vérifier la cohérence des données
-- ============================================================================
SELECT 
    '=== VÉRIFICATION COHÉRENCE ===' as info;

SELECT 
    u.email,
    CASE 
        WHEN p.id IS NULL THEN '❌ Pas de profil'
        WHEN p.role != 'driver' THEN '⚠️ Rôle incorrect: ' || p.role
        ELSE '✅ Profil OK'
    END as profile_status,
    CASE 
        WHEN d.user_id IS NULL THEN '❌ Pas d''entrée driver'
        ELSE '✅ Driver OK'
    END as driver_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email LIKE '%@driver.local';

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Si tout est OK, vous devriez voir :
-- 1. ✅ La fonction create_driver_user existe
-- 2. ✅ Chauffeur de test créé avec succès
-- 3. Une ligne dans auth.users avec email = test123@driver.local
-- 4. Une ligne dans public.profiles avec role = driver
-- 5. Une ligne dans public.drivers avec toutes les infos
-- 6. Aucun chauffeur avec l'ancien format @driver.oneconnexion
-- 7. Tous les chauffeurs ont profile_status = ✅ Profil OK
-- 8. Tous les chauffeurs ont driver_status = ✅ Driver OK
-- ============================================================================
