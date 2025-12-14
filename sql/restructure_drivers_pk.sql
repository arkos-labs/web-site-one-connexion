-- ============================================================================
-- RESTRUCTURE DRIVERS TABLE FOR PRE-REGISTRATION
-- ============================================================================

BEGIN;

-- 1. Changer la clé primaire de user_id vers id
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_pkey CASCADE;
ALTER TABLE public.drivers ADD PRIMARY KEY (id);

-- 2. Rendre user_id optionnel
ALTER TABLE public.drivers ALTER COLUMN user_id DROP NOT NULL;

-- 3. Mettre à jour la contrainte de clé étrangère
ALTER TABLE public.drivers DROP CONSTRAINT IF EXISTS drivers_user_id_fkey;
ALTER TABLE public.drivers ADD CONSTRAINT drivers_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Mettre à jour le Trigger d'inscription (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    -- Variables
    u_role TEXT;
    u_company TEXT;
    u_fname TEXT;
    u_lname TEXT;
    u_phone TEXT;
    existing_driver_id UUID;
BEGIN
    -- Récupération simple
    u_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    u_company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');
    u_fname := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    u_lname := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    u_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    -- A. INSERTION PROFILES
    INSERT INTO public.profiles (id, email, role, status, first_name, last_name, phone, company_name)
    VALUES (NEW.id, NEW.email, u_role, 'approved', u_fname, u_lname, u_phone, u_company)
    ON CONFLICT (id) DO NOTHING;

    -- B. INSERTION CLIENTS (Si rôle = client)
    IF u_role = 'client' THEN
        INSERT INTO public.clients (id, company_name, email, phone, status, internal_code)
        VALUES (NEW.id, u_company, NEW.email, u_phone, 'active', 'CL-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)))
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- C. GESTION DRIVERS (Si rôle = chauffeur)
    IF u_role = 'chauffeur' OR u_role = 'driver' THEN
        -- Vérifier si un dossier chauffeur existe déjà avec cet email (pré-inscrit par admin)
        SELECT id INTO existing_driver_id FROM public.drivers WHERE email = NEW.email LIMIT 1;

        IF existing_driver_id IS NOT NULL THEN
            -- MISE À JOUR : On lie le compte utilisateur au dossier existant
            UPDATE public.drivers 
            SET user_id = NEW.id,
                status = 'offline' -- On s'assure qu'il est bien initialisé
            WHERE id = existing_driver_id;
        ELSE
            -- CRÉATION : Nouveau dossier
            INSERT INTO public.drivers (id, user_id, first_name, last_name, email, phone, status)
            VALUES (gen_random_uuid(), NEW.id, u_fname, u_lname, NEW.email, u_phone, 'offline');
            -- Note: On ne met pas ON CONFLICT car id est généré
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;


-- 5. Mettre à jour la fonction RPC create_driver_user
CREATE OR REPLACE FUNCTION public.create_driver_user(
    username TEXT, -- Peut être NULL ou vide
    password TEXT, -- Peut être NULL ou vide
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
SET search_path = public, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_driver_id UUID;
    v_email TEXT;
BEGIN
    -- Si username est fourni (cas ancien), on l'utilise comme email
    IF username IS NOT NULL AND username != '' THEN
        IF username ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            v_email := username;
        ELSE
            v_email := username || '@driver.local';
        END IF;
    ELSE
        -- Sinon, on essaie de générer un email technique ou on utilise un placeholder
        v_email := username; 
    END IF;

    -- CAS 1 : CRÉATION COMPLÈTE (Avec mot de passe)
    IF password IS NOT NULL AND password != '' THEN
        -- ... (Code existant pour créer auth.users) ...
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

        -- Profil
        INSERT INTO public.profiles (id, email, role, status, first_name, last_name, phone)
        VALUES (v_user_id, v_email, 'chauffeur', 'approved', first_name, last_name, phone);

        -- Driver lié
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

    -- CAS 2 : PRÉ-INSCRIPTION (Sans mot de passe)
    ELSE
        -- On crée juste le driver, sans user_id
        v_driver_id := gen_random_uuid();
        
        INSERT INTO public.drivers (
            id, user_id, email, first_name, last_name, phone, 
            status, vehicle_type, vehicle_registration, 
            address, siret, username
        )
        VALUES (
            v_driver_id, NULL, v_email, first_name, last_name, phone, 
            'offline', vehicle_type, vehicle_registration, 
            address, siret, username
        );

        RETURN jsonb_build_object('success', true, 'driver_id', v_driver_id, 'message', 'Pre-registration successful');
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
