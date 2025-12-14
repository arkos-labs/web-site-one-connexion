-- ============================================================================
-- FIX RLS : TABLE ORDERS (ERREUR 42501)
-- ============================================================================

-- 1. Vérification de la table ORDERS et de la colonne client_id
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending_acceptance',
    reference TEXT,
    pickup_address TEXT,
    delivery_address TEXT,
    price DECIMAL(10,2)
);

-- Ajouter client_id si manquant
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'client_id') THEN
        ALTER TABLE public.orders ADD COLUMN client_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Colonne client_id ajoutée à orders';
    END IF;
END $$;

-- 2. Activer RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Nettoyer les anciennes policies pour éviter les conflits
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- 4. Créer les nouvelles policies

-- A. INSERT : Un client peut créer une commande pour lui-même
CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = client_id);

-- B. SELECT : Un client peut voir ses propres commandes
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = client_id);

-- C. UPDATE : Un client peut modifier ses propres commandes (ex: annuler)
CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = client_id);

-- D. ADMIN : Les admins voient tout et gèrent tout
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

RAISE NOTICE '✅ RLS Policies pour ORDERS appliquées avec succès.';
