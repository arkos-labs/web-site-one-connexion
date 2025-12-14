-- ============================================================================
-- FINAL REPAIR KIT : LE SCRIPT DE LA DERNIÈRE CHANCE
-- ============================================================================
-- Ce script regroupe TOUS les correctifs précédents en un seul bloc.
-- Il doit être exécuté en entier pour réparer la base de données.
-- ============================================================================

BEGIN; -- Début de la transaction

-- 1. RESTAURER LA FONCTION RPC MANQUANTE (Erreur 404)
CREATE OR REPLACE FUNCTION public.create_missing_client_profile(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_company_name TEXT,
    p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_client_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RETURN jsonb_build_object('error', 'Non authentifié'); END IF;

    -- Profiles
    INSERT INTO public.profiles (id, email, role, status, first_name, last_name, company_name, phone)
    VALUES (v_user_id, p_email, 'client', 'approved', p_first_name, p_last_name, p_company_name, p_phone)
    ON CONFLICT (id) DO UPDATE SET role = 'client', status = 'approved';

    -- Clients
    INSERT INTO public.clients (id, email, status, company_name, phone, internal_code)
    VALUES (v_user_id, p_email, 'active', p_company_name, p_phone, 'CL-' || UPPER(SUBSTRING(v_user_id::text, 1, 8)))
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_client_id;

    IF v_client_id IS NULL THEN SELECT id INTO v_client_id FROM public.clients WHERE id = v_user_id; END IF;

    RETURN jsonb_build_object('success', true, 'client_id', v_client_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_missing_client_profile TO authenticated;


-- 2. CORRIGER LA TABLE DRIVERS (Erreur 'column drivers.id does not exist')
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS id UUID;
UPDATE public.drivers SET id = user_id WHERE id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS drivers_id_idx ON public.drivers(id);


-- 3. RECRÉER LES TABLES MANQUANTES (Erreurs 404 / PGRST205)

-- A. Tariff Metadata
CREATE TABLE IF NOT EXISTS public.tariff_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    base_price DECIMAL(10,2) DEFAULT 10.00,
    price_per_km DECIMAL(10,2) DEFAULT 1.50,
    multiplier DECIMAL(10,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.tariff_metadata (name) VALUES ('Standard') ON CONFLICT DO NOTHING;

-- B. Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES public.drivers(user_id) ON DELETE CASCADE,
    type TEXT,
    brand TEXT,
    model TEXT,
    plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    reference TEXT,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Threads & Messages
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    subject TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    content TEXT,
    sender_type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. RÉPARER LES RELATIONS (Foreign Keys)
-- Orders -> Clients
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE public.orders
    ADD CONSTRAINT orders_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Orders -> Drivers (si colonne existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'driver_id') THEN
        ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_driver_id_fkey
            FOREIGN KEY (driver_id) REFERENCES public.drivers(user_id) ON DELETE SET NULL;
    END IF;
END $$;


-- 5. PERMISSIONS & RLS (Ouverture Totale pour Debug)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariff_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Création de policies "Allow All" si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All Invoices') THEN CREATE POLICY "Allow All Invoices" ON public.invoices FOR ALL USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All Threads') THEN CREATE POLICY "Allow All Threads" ON public.threads FOR ALL USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All Messages') THEN CREATE POLICY "Allow All Messages" ON public.messages FOR ALL USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All Tariffs') THEN CREATE POLICY "Allow All Tariffs" ON public.tariff_metadata FOR ALL USING (true); END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All Vehicles') THEN CREATE POLICY "Allow All Vehicles" ON public.vehicles FOR ALL USING (true); END IF;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;


-- 6. RECHARGEMENT DU SCHEMA
NOTIFY pgrst, 'reload schema';

COMMIT; -- Valider la transaction

RAISE NOTICE '✅ FINAL REPAIR KIT EXÉCUTÉ AVEC SUCCÈS. TOUT DEVRAIT FONCTIONNER.';
