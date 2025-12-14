-- ============================================================================
-- 🏗️ PHASE 2 : RECONSTRUCTION PROPRE - Système chauffeur optimal
-- ============================================================================
-- Ce script reconstruit le système chauffeur avec la bonne architecture
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : EXTENSION POUR LE CRYPTAGE
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ÉTAPE 2 : FONCTION CREATE_DRIVER_USER
-- ============================================================================

CREATE OR REPLACE FUNCTION create_driver_user(
    username text,
    password text,
    first_name text,
    last_name text,
    phone text,
    address text,
    siret text,
    vehicle_type text,
    vehicle_registration text,
    vehicle_capacity text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    fake_email text;
    encrypted_pw text;
BEGIN
    -- Générer l'email au format standardisé
    fake_email := username || '@driver.local';
    
    -- Vérifier si l'utilisateur existe déjà
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = fake_email) THEN
        RAISE EXCEPTION 'Cet identifiant est déjà utilisé.';
    END IF;

    -- Hacher le mot de passe
    encrypted_pw := crypt(password, gen_salt('bf'));
    
    -- 1. Créer l'utilisateur dans auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        fake_email,
        encrypted_pw,
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
            'role', 'driver',  -- CRITIQUE : empêche création dans clients
            'full_name', first_name || ' ' || last_name,
            'username', username
        ),
        now(),
        now(),
        '',
        ''
    ) RETURNING id INTO new_user_id;

    -- 2. Créer le profil
    INSERT INTO public.profiles (id, role, email, first_name, last_name, phone)
    VALUES (new_user_id, 'driver', fake_email, first_name, last_name, phone);

    -- 3. Créer l'entrée driver
    INSERT INTO public.drivers (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        vehicle_type,
        vehicle_registration,
        vehicle_capacity,
        siret,
        address
    ) VALUES (
        new_user_id,
        first_name,
        last_name,
        fake_email,
        phone,
        'offline',
        vehicle_type,
        vehicle_registration,
        vehicle_capacity,
        siret,
        address
    );

    RETURN new_user_id;
END;
$$;

-- ============================================================================
-- ÉTAPE 3 : POLICIES RLS PERMISSIVES
-- ============================================================================

-- Activer RLS sur drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Les chauffeurs peuvent lire leurs propres données
CREATE POLICY "drivers_select_own"
ON public.drivers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2 : Les chauffeurs peuvent mettre à jour leurs propres données
CREATE POLICY "drivers_update_own"
ON public.drivers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3 : Les admins peuvent tout lire
CREATE POLICY "admins_select_all"
ON public.drivers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy 4 : Les admins peuvent tout gérer
CREATE POLICY "admins_all"
ON public.drivers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- ÉTAPE 4 : CRÉER UN CHAUFFEUR DE TEST
-- ============================================================================

DO $$
DECLARE
    v_driver_id UUID;
BEGIN
    -- Créer le chauffeur de test
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

-- ============================================================================
-- ÉTAPE 5 : VÉRIFICATIONS
-- ============================================================================

SELECT '=== ✅ FONCTION CREATE_DRIVER_USER ===' as info;

SELECT 
    routine_name,
    security_type,
    '✅ Fonction créée' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_driver_user';

SELECT '=== ✅ POLICIES RLS ===' as info;

SELECT 
    policyname,
    cmd as operation,
    '✅ Policy créée' as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers'
ORDER BY policyname;

SELECT '=== ✅ CHAUFFEUR TEST123 ===' as info;

SELECT 
    u.email,
    p.role as profile_role,
    d.first_name,
    d.last_name,
    d.vehicle_type,
    d.status,
    '✅ Chauffeur complet' as status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.drivers d ON u.id = d.user_id
WHERE u.email = 'test123@driver.local';

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Fonction create_driver_user créée avec SECURITY DEFINER
-- ✅ 4 policies RLS créées
-- ✅ Chauffeur test123 créé dans les 3 tables
-- ✅ Système prêt à l'emploi !
-- ============================================================================
