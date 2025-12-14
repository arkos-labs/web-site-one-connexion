-- ============================================================================
-- FIX: Mise à jour de la fonction create_driver_user
-- Problème: Le domaine email ne correspondait pas entre création et connexion
-- Solution: Utiliser @driver.local au lieu de @driver.oneconnexion
-- ============================================================================

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text);

-- Extension nécessaire pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fonction sécurisée pour créer un chauffeur avec identifiant/mot de passe
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
  -- Générer un email fictif unique (format compatible avec AuthPage.tsx)
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
      'role', 'driver',
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
