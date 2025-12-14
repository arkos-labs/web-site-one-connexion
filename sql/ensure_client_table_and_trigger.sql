-- ============================================================================
-- SCRIPT DE RÉPARATION : TABLE CLIENTS ET TRIGGER D'INSCRIPTION
-- ============================================================================
-- Ce script s'assure que :
-- 1. La table 'clients' existe avec toutes les colonnes nécessaires
-- 2. Le trigger d'inscription crée AUTOMATIQUEMENT une entrée dans 'clients'
--    pour tout nouvel utilisateur ayant le rôle 'client'.
-- ============================================================================

-- 1. Création/Mise à jour de la table CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    
    -- Champs métier
    internal_code TEXT, -- Ex: CL-1234
    sector TEXT DEFAULT 'Autre',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'deleted')),
    
    -- Facturation
    siret TEXT,
    vat_number TEXT,
    payment_method TEXT DEFAULT 'Virement bancaire',
    payment_terms INTEGER DEFAULT 30,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Activer RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies RLS pour clients
DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;
CREATE POLICY "Admins manage clients" ON public.clients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Clients view own profile" ON public.clients;
CREATE POLICY "Clients view own profile" ON public.clients
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
    );

DROP POLICY IF EXISTS "Clients update own profile" ON public.clients;
CREATE POLICY "Clients update own profile" ON public.clients
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid()
    );

-- 2. Mise à jour du Trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    user_company TEXT;
BEGIN
    -- Récupérer les métadonnées
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    user_email := NEW.email;
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    user_last_name := NEW.raw_user_meta_data->>'last_name';
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');

    -- A. Insérer dans PROFILES (Toujours)
    INSERT INTO public.profiles (
        id,
        role,
        email,
        first_name,
        last_name,
        phone,
        company_name,
        status
    ) VALUES (
        NEW.id,
        user_role,
        user_email,
        user_first_name,
        user_last_name,
        user_phone,
        user_company,
        CASE WHEN user_role = 'chauffeur' THEN 'pending' ELSE 'approved' END
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        company_name = EXCLUDED.company_name,
        updated_at = NOW();

    -- B. Si c'est un CLIENT, insérer dans CLIENTS
    IF user_role = 'client' THEN
        INSERT INTO public.clients (
            id,
            company_name,
            email,
            phone,
            status,
            internal_code
        ) VALUES (
            NEW.id,
            user_company,
            user_email,
            user_phone,
            'active',
            'CL-' || UPPER(SUBSTRING(NEW.id::text, 1, 8))
        )
        ON CONFLICT (id) DO UPDATE SET
            company_name = EXCLUDED.company_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = NOW();
    END IF;

    -- C. Si c'est un CHAUFFEUR, insérer dans DRIVERS
    IF user_role = 'chauffeur' OR user_role = 'driver' THEN
        INSERT INTO public.drivers (
            user_id,
            first_name,
            last_name,
            email,
            phone,
            status
        ) VALUES (
            NEW.id,
            user_first_name,
            user_last_name,
            user_email,
            user_phone,
            'offline'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = NOW();
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas l'inscription auth
    RAISE WARNING 'Erreur handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Réparer les clients existants (qui sont dans profiles mais pas dans clients)
INSERT INTO public.clients (id, company_name, email, phone, status, internal_code)
SELECT 
    p.id, 
    COALESCE(p.company_name, 'Client Sans Nom'), 
    p.email, 
    p.phone, 
    'active',
    'CL-' || UPPER(SUBSTRING(p.id::text, 1, 8))
FROM public.profiles p
WHERE p.role = 'client'
AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = p.id);

SELECT '=== ✅ CONFIGURATION CLIENTS TERMINÉE ===' as status;
