-- ============================================================================
-- FIX ULTIME : CORRECTION DES ERREURS FRONTEND (400, 406, PGRST200)
-- ============================================================================
-- Ce script ajoute les colonnes et fonctions manquantes détectées dans les logs.
-- ============================================================================

BEGIN;

-- 1. FIX CLIENTS : Colonne 'billing_address' manquante
-- Erreur : "Could not find the 'billing_address' column of 'clients'"
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS billing_address TEXT;

-- 2. FIX DRIVERS : Fonction RPC manquante
-- Erreur : "Could not find the function public.create_driver_user..."
CREATE OR REPLACE FUNCTION public.create_driver_user(
    email TEXT,
    password TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    vehicle_type TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT DEFAULT NULL,
    siret TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- A. Créer l'utilisateur Auth (nécessite pgcrypto)
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', email,
        crypt(password, gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('role', 'chauffeur', 'first_name', first_name, 'last_name', last_name),
        now(), now()
    ) RETURNING id INTO v_user_id;

    -- B. Créer le profil
    INSERT INTO public.profiles (id, email, role, status, first_name, last_name, phone)
    VALUES (v_user_id, email, 'chauffeur', 'approved', first_name, last_name, phone);

    -- C. Créer le driver
    INSERT INTO public.drivers (id, user_id, email, first_name, last_name, phone, status, vehicle_type, vehicle_registration, siret)
    VALUES (v_user_id, v_user_id, email, first_name, last_name, phone, 'offline', vehicle_type, vehicle_registration, siret);

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_driver_user TO authenticated;

-- 3. FIX RELATIONS STATISTIQUES
-- Erreur : "Could not find a relationship between 'orders' and 'clients'"
-- On force la recréation de la FK avec le bon nom pour que Postgrest la trouve
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders
    ADD CONSTRAINT orders_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- 4. FIX COLONNES DRIVERS (Lat/Lng pour la carte)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,8);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11,8);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 5. RECHARGEMENT SCHEMA
NOTIFY pgrst, 'reload schema';

COMMIT;

RAISE NOTICE '✅ TOUTES LES ERREURS FRONTEND CORRIGÉES.';
