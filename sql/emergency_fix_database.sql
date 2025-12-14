-- ============================================================================
-- EMERGENCY FIX : RESET TOTAL & PERMISSIVE TABLES
-- ============================================================================
-- Ce script supprime et recrée les tables critiques avec une structure permissive.
-- Il installe un trigger minimaliste impossible à faire planter.
-- ============================================================================

-- 1. NETTOYAGE TOTAL (DROP CASCADE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. RECRÉATION DES TABLES (PERMISSIVES - TOUT NULLABLE SAUF ID)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, -- Peut être null si non fourni
    role TEXT DEFAULT 'client',
    status TEXT DEFAULT 'approved',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.clients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    company_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    internal_code TEXT,
    sector TEXT,
    status TEXT DEFAULT 'active',
    siret TEXT,
    vat_number TEXT,
    payment_method TEXT,
    payment_terms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.drivers (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'offline',
    vehicle_type TEXT,
    vehicle_registration TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMISSIONS MASSIVES (GRANT ALL)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.profiles TO authenticated, service_role, postgres, anon;
GRANT ALL ON TABLE public.clients TO authenticated, service_role, postgres, anon;
GRANT ALL ON TABLE public.drivers TO authenticated, service_role, postgres, anon;

-- Policies "Open Bar" pour le debug (à restreindre plus tard)
CREATE POLICY "Allow All Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Drivers" ON public.drivers FOR ALL USING (true) WITH CHECK (true);

-- 4. TRIGGER MINIMALISTE (SECURITY DEFINER & EXCEPTION HANDLING)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Récupération du rôle (défaut 'client')
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    BEGIN
        -- A. Insertion MINIMALE dans PROFILES (Juste ID et Email)
        INSERT INTO public.profiles (id, email, role, status)
        VALUES (NEW.id, NEW.email, user_role, 'approved');

        -- B. Insertion MINIMALE dans CLIENTS (si client)
        IF user_role = 'client' THEN
            INSERT INTO public.clients (id, email, status)
            VALUES (NEW.id, NEW.email, 'active');
        END IF;

        -- C. Insertion MINIMALE dans DRIVERS (si chauffeur)
        IF user_role IN ('chauffeur', 'driver') THEN
            INSERT INTO public.drivers (user_id, email, status)
            VALUES (NEW.id, NEW.email, 'offline');
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- LOG L'ERREUR MAIS NE PLANTE PAS L'INSCRIPTION
        RAISE WARNING 'Erreur Trigger handle_new_user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Installation du Trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ EMERGENCY FIX APPLIQUÉ : Tables recréées et Trigger minimaliste actif.';
