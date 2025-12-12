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
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_user_id uuid;
  fake_email text;
  encrypted_pw text;
BEGIN
  -- Générer un email fictif unique
  fake_email := username || '@driver.oneconnexion';
  
  -- Vérifier si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = fake_email) THEN
    RAISE EXCEPTION 'Cet identifiant est déjà utilisé.';
  END IF;

  -- Hacher le mot de passe (Bcrypt avec coût 10)
  encrypted_pw := crypt(password, gen_salt('bf', 10));
  new_user_id := gen_random_uuid();

  -- 1. Créer l'utilisateur dans auth.users
  -- On ne met QUE les champs obligatoires et on laisse les triggers faire le reste
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
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    fake_email,
    encrypted_pw,
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'full_name', first_name || ' ' || last_name,
      'username', username
    ),
    now(),
    now(),
    false
  );

  -- 2. ON NE TOUCHE PAS A PUBLIC.PROFILES
  -- Si un trigger existe, il créera le profil.
  -- Si on essaie de le créer ici, ça peut faire un conflit "Duplicate Key".
  
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
    siret,
    username,
    plain_password
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
    username,
    password
  );

  RETURN new_user_id;
END;
$$;
