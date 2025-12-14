-- ============================================================================
-- FIX GLOBAL : SCHÉMA, RELATIONS ET TABLES MANQUANTES
-- ============================================================================
-- Ce script corrige toutes les erreurs 400/404/406 remontées par le frontend.
-- ============================================================================

-- 1. FIX TABLE DRIVERS (Manque la colonne 'id')
-- Le frontend demande 'id', mais la table a 'user_id'. On ajoute 'id' comme alias de 'user_id'.
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS id UUID;
UPDATE public.drivers SET id = user_id WHERE id IS NULL;
-- On s'assure que id est unique (c'est une copie de la PK)
CREATE UNIQUE INDEX IF NOT EXISTS drivers_id_idx ON public.drivers(id);

-- 2. FIX RELATIONS (Foreign Keys brisées par le reset)

-- A. INVOICES -> CLIENTS
-- Vérifier si la table invoices existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id),
    reference TEXT,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Réparer le lien FK
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- B. THREADS -> CLIENTS
-- Vérifier si la table threads existe
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id),
    subject TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Réparer le lien FK
ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS threads_client_id_fkey;
ALTER TABLE public.threads
    ADD CONSTRAINT threads_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- C. MESSAGES (Dépendance de threads)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    content TEXT,
    sender_type TEXT, -- 'client', 'admin', 'system'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRÉATION DES TABLES MANQUANTES (Erreurs 404)

-- A. TARIFF_METADATA
CREATE TABLE IF NOT EXISTS public.tariff_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    base_price DECIMAL(10,2) DEFAULT 0,
    price_per_km DECIMAL(10,2) DEFAULT 0,
    multiplier DECIMAL(10,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insérer une donnée par défaut pour éviter tableau vide
INSERT INTO public.tariff_metadata (name, base_price, price_per_km)
VALUES ('Standard', 10.00, 1.50)
ON CONFLICT DO NOTHING;

-- B. VEHICLES (Le frontend cherche 'vehicles', pas 'driver_vehicles')
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES public.drivers(user_id) ON DELETE CASCADE,
    type TEXT,
    brand TEXT,
    model TEXT,
    plate TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERMISSIONS & RLS (Ouverture pour debug)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariff_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policies permissives (TEMPORAIRE)
CREATE POLICY "Allow All Invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow All Threads" ON public.threads FOR ALL USING (true);
CREATE POLICY "Allow All Messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow All Tariffs" ON public.tariff_metadata FOR ALL USING (true);
CREATE POLICY "Allow All Vehicles" ON public.vehicles FOR ALL USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;

-- 5. RECHARGEMENT DU SCHEMA
NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Schéma réparé : Drivers(id), FKs restaurées, Tables manquantes créées.';
