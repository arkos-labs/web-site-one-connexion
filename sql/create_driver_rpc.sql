-- ============================================================================
-- FONCTION : create_driver_user
-- ============================================================================
-- Crée un chauffeur avec identifiant/mot de passe pour l'application chauffeur
-- Compatible avec la nouvelle architecture (profiles + drivers)
-- ============================================================================

-- Extension nécessaire pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS create_driver_user(text, text, text, text, text, text, text, text, text, text);

-- Créer la nouvelle fonction
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
SET search_path = public
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
      'role', 'chauffeur',
      'first_name', first_name,
      'last_name', last_name,
      'phone', phone,
      'username', username
    ),
    now(),
    now(),
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- 2. Créer l'entrée dans public.profiles
  -- Note: Le trigger handle_new_user devrait le faire automatiquement,
  -- mais on le fait ici aussi pour être sûr (ON CONFLICT DO UPDATE)
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    status,
    driver_id
  ) VALUES (
    new_user_id,
    fake_email,
    first_name,
    last_name,
    phone,
    'chauffeur',
    'approved', -- Les chauffeurs créés par admin sont approuvés directement
    username    -- L'identifiant devient le driver_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    driver_id = EXCLUDED.driver_id,
    updated_at = NOW();

  -- 3. Créer l'entrée dans public.drivers
  -- Note: Le trigger handle_new_user devrait créer une entrée basique,
  -- mais on la met à jour ici avec toutes les informations
  INSERT INTO public.drivers (
    user_id,
    status,
    vehicle_type,
    vehicle_registration,
    vehicle_capacity
  ) VALUES (
    new_user_id,
    'offline',
    vehicle_type,
    vehicle_registration,
    vehicle_capacity
  )
  ON CONFLICT (user_id) DO UPDATE SET
    vehicle_type = EXCLUDED.vehicle_type,
    vehicle_registration = EXCLUDED.vehicle_registration,
    vehicle_capacity = EXCLUDED.vehicle_capacity,
    updated_at = NOW();

  RETURN new_user_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erreur dans create_driver_user: %', SQLERRM;
  RAISE;
END;
$$;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================
COMMENT ON FUNCTION create_driver_user IS 
'Crée un chauffeur avec identifiant/mot de passe. 
Insère dans auth.users, public.profiles (avec role=chauffeur) et public.drivers.
Compatible avec la nouvelle architecture centralisée.';

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
SELECT '✅ Fonction create_driver_user créée avec succès' as info;
