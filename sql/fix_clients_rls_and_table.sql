-- ============================================================================
-- FIX CRITIQUE : TABLE CLIENTS & RLS (ERREUR 406)
-- ============================================================================

-- 1. S'assurer que la table CLIENTS existe avec la bonne structure
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    
    -- Champs métier
    internal_code TEXT,
    sector TEXT DEFAULT 'Autre',
    status TEXT DEFAULT 'active',
    
    -- Facturation
    siret TEXT,
    vat_number TEXT,
    payment_method TEXT DEFAULT 'Virement bancaire',
    payment_terms INTEGER DEFAULT 30,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.clients;
DROP POLICY IF EXISTS "Users can select their own profile" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.clients;
DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;
DROP POLICY IF EXISTS "Clients view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients update own profile" ON public.clients;

-- 4. Créer les politiques RLS obligatoires

-- A. INSERT : Un utilisateur authentifié peut créer sa propre fiche client
CREATE POLICY "Users can insert their own profile" ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- B. SELECT : Un utilisateur peut voir sa propre fiche
CREATE POLICY "Users can select their own profile" ON public.clients
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- C. UPDATE : Un utilisateur peut modifier sa propre fiche
CREATE POLICY "Users can update their own profile" ON public.clients
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- D. ADMIN : Les admins peuvent tout faire (basé sur la table profiles)
CREATE POLICY "Admins manage clients" ON public.clients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 5. Vérification et création de la table PROFILES (dépendance)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'client',
    status TEXT DEFAULT 'approved',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles (minimales pour que ça marche)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

RAISE NOTICE '✅ Table CLIENTS et Policies RLS configurées avec succès.';
