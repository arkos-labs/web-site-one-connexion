-- ============================================================================
-- REPAIR DATABASE COMPLETE - ONE CONNEXION
-- ============================================================================
-- Ce script regroupe tous les correctifs pour réparer la base de données :
-- 1. RLS Infinite Recursion (Boucle infinie sur les profils)
-- 2. Colonnes manquantes dans 'clients' (CRM)
-- 3. Configuration ID et FK de 'clients'
-- 4. Colonnes manquantes dans 'drivers' (Géolocalisation)
-- 5. Fonction RPC 'create_driver_user' pour la création de chauffeurs
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FIX INFINITE RECURSION (RLS)
-- ============================================================================

-- Création de la fonction de vérification sécurisée (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
$$;

-- Nettoyage et recréation des policies sur 'profiles'
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies 'profiles'
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id OR public.is_admin());

-- Policies Admin globales
DROP POLICY IF EXISTS "Admins have full access" ON public.clients;
CREATE POLICY "Admins have full access" ON public.clients FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.orders;
CREATE POLICY "Admins have full access" ON public.orders FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.drivers;
CREATE POLICY "Admins have full access" ON public.drivers FOR ALL TO authenticated USING (public.is_admin());


-- ============================================================================
-- 2. FIX CLIENTS TABLE (CRM & MISSING COLUMNS)
-- ============================================================================

-- Ajout des colonnes manquantes
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tva_intracom TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Configuration ID et Contraintes
ALTER TABLE public.clients ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.clients ALTER COLUMN internal_code DROP NOT NULL;

-- Suppression de la FK stricte vers auth.users pour permettre les clients CRM sans compte
DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.clients'::regclass
        AND contype = 'f'
        AND confrelid = 'auth.users'::regclass
    LOOP
        EXECUTE 'ALTER TABLE public.clients DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;


-- ============================================================================
-- 3. FIX DRIVERS TABLE & RPC
-- ============================================================================

-- Ajout colonnes géolocalisation
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,8);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11,8);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Fonction RPC pour créer un chauffeur (Admin Dashboard)
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
    -- A. Créer l'utilisateur Auth
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


-- ============================================================================
-- 4. FIX ORDERS RELATIONS
-- ============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders
    ADD CONSTRAINT orders_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


-- ============================================================================
-- 5. FINALISATION
-- ============================================================================

NOTIFY pgrst, 'reload schema';

COMMIT;

RAISE NOTICE '✅ BASE DE DONNÉES ENTIÈREMENT RÉPARÉE.';
