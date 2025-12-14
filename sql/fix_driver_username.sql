-- ============================================================================
-- FIX DRIVER USERNAME COLUMN
-- ============================================================================

BEGIN;

-- 1. Ajout de la colonne 'username' manquante dans la table 'drivers'
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Mise à jour de la fonction RPC pour insérer le username dans la table drivers
CREATE OR REPLACE FUNCTION public.create_driver_user(
    username TEXT,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    siret TEXT,
    vehicle_type TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    -- Génération de l'email d'authentification
    IF username ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        v_email := username;
    ELSE
        v_email := username || '@driver.local';
    END IF;

    -- A. Créer l'utilisateur Auth
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', v_email,
        crypt(password, gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
            'role', 'chauffeur', 
            'first_name', first_name, 
            'last_name', last_name,
            'username', username
        ),
        now(), now()
    ) RETURNING id INTO v_user_id;

    -- B. Créer le profil
    INSERT INTO public.profiles (id, email, role, status, first_name, last_name, phone)
    VALUES (v_user_id, v_email, 'chauffeur', 'approved', first_name, last_name, phone);

    -- C. Créer le driver (AVEC USERNAME)
    INSERT INTO public.drivers (
        id, user_id, email, first_name, last_name, phone, 
        status, vehicle_type, vehicle_registration, 
        address, siret, username
    )
    VALUES (
        v_user_id, v_user_id, v_email, first_name, last_name, phone, 
        'offline', vehicle_type, vehicle_registration, 
        address, siret, username
    );

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'email', v_email);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_driver_user TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
