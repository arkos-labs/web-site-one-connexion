-- ============================================================================
-- SCRIPT FINAL COMPLET - Système Chauffeur
-- ============================================================================
-- Ce script contient TOUT ce dont vous avez besoin pour que le système
-- de création et connexion des chauffeurs fonctionne parfaitement
-- ============================================================================

-- ÉTAPE 1 : Extension pour le cryptage des mots de passe
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ÉTAPE 2 : Fonction RPC pour créer un chauffeur
-- ============================================================================
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text);

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
SECURITY DEFINER -- Permet d'exécuter avec les droits admin
AS $$
DECLARE
  new_user_id uuid;
  fake_email text;
  encrypted_pw text;
BEGIN
  -- Générer un email fictif unique (format standardisé)
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
      'role', 'driver',  -- CRITIQUE : Empêche le trigger de créer un client
      'full_name', first_name || ' ' || last_name,
      'username', username
    ),
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- 2. Créer l'entrée dans public.profiles (si pas géré par trigger)
  INSERT INTO public.profiles (id, role, email)
  VALUES (new_user_id, 'driver', fake_email)
  ON CONFLICT (id) DO UPDATE SET role = 'driver';

  -- 3. Créer l'entrée dans public.drivers
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
    siret
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
    siret
  );

  RETURN new_user_id;
END;
$$;

-- ÉTAPE 3 : Permissions RLS sur la table drivers
-- ============================================================================
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Drivers can view own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own data" ON public.drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;

-- Créer les nouvelles policies
CREATE POLICY "Drivers can view own data"
ON public.drivers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own data"
ON public.drivers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers"
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

CREATE POLICY "Admins can manage drivers"
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

-- ÉTAPE 4 : Nettoyer les chauffeurs mal placés dans la table clients
-- ============================================================================
DELETE FROM public.clients
WHERE user_id IN (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.role = 'driver'
)
OR email LIKE '%@driver.local';

-- ÉTAPE 5 : Corriger les emails avec l'ancien format
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

-- ÉTAPE 6 : Créer un chauffeur de test
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

-- ============================================================================
-- VÉRIFICATIONS FINALES
-- ============================================================================

SELECT '=== ✅ FONCTION CREATE_DRIVER_USER ===' as info;
SELECT 
    routine_name,
    'Fonction existe' as status
FROM information_schema.routines
WHERE routine_name = 'create_driver_user'
AND routine_schema = 'public';

SELECT '=== ✅ POLICIES RLS SUR DRIVERS ===' as info;
SELECT 
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers'
ORDER BY policyname;

SELECT '=== ✅ CHAUFFEURS EXISTANTS ===' as info;
SELECT 
    u.email,
    p.role as profile_role,
    d.first_name,
    d.last_name,
    d.vehicle_type,
    d.status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.drivers d ON u.id = d.user_id
WHERE u.email LIKE '%@driver.local'
ORDER BY u.created_at DESC;

SELECT '=== ✅ VÉRIFICATION : Aucun chauffeur dans clients ===' as info;
SELECT 
    COUNT(*) as chauffeurs_dans_clients,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Aucun chauffeur dans clients'
        ELSE '❌ PROBLÈME - Des chauffeurs sont dans clients'
    END as status
FROM public.clients c
JOIN public.profiles p ON c.user_id = p.id
WHERE p.role = 'driver';

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Fonction create_driver_user existe
-- ✅ 4 policies RLS créées sur drivers
-- ✅ Chauffeur test123 créé
-- ✅ 0 chauffeurs dans la table clients
-- ============================================================================
