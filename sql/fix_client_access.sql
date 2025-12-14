-- ============================================================================
-- SCRIPT DE RÉPARATION ROBUSTE : FIX CLIENT ACCESS & SCHEMA
-- ============================================================================
-- Ce script corrige d'abord la structure de la table 'profiles' (colonne manquante)
-- puis répare l'utilisateur bloqué.
-- ============================================================================

-- 1. CORRECTION DU SCHÉMA (Ajout des colonnes manquantes)
DO $$
BEGIN
    -- Ajouter la colonne 'status' si elle manque
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'approved';
        RAISE NOTICE '✅ Colonne status ajoutée à profiles';
    END IF;

    -- Ajouter 'first_name' si elle manque
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
        RAISE NOTICE '✅ Colonne first_name ajoutée à profiles';
    END IF;

    -- Ajouter 'last_name' si elle manque
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
        RAISE NOTICE '✅ Colonne last_name ajoutée à profiles';
    END IF;
END $$;

-- 2. RÉPARATION DES DONNÉES UTILISATEUR
DO $$
DECLARE
    target_email TEXT := 'loxeunehelleu-3252@yopmail.com';
    target_user_id UUID;
    user_record RECORD;
BEGIN
    -- Récupérer l'ID de l'utilisateur cible
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- S'assurer qu'il est dans PROFILES
        INSERT INTO public.profiles (id, email, role, status, first_name, last_name)
        VALUES (
            target_user_id, 
            target_email, 
            'client', 
            'approved',
            'Utilisateur', 
            'Client'
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'client',
            status = 'approved';
            
        -- S'assurer qu'il est dans CLIENTS
        -- (On vérifie d'abord que la table clients existe, sinon on la crée)
        CREATE TABLE IF NOT EXISTS public.clients (
            id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
            company_name TEXT,
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'active',
            internal_code TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        INSERT INTO public.clients (id, email, status, company_name, internal_code)
        VALUES (
            target_user_id, 
            target_email, 
            'active',
            'Mon Entreprise', 
            'CL-' || UPPER(SUBSTRING(target_user_id::text, 1, 8))
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '✅ Réparation effectuée pour %', target_email;
    END IF;

    -- Réparation GÉNÉRIQUE pour tous les autres
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data 
        FROM auth.users u
        WHERE (u.raw_user_meta_data->>'role' = 'client' OR u.raw_user_meta_data->>'role' IS NULL)
        AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = u.id)
    LOOP
        -- Créer profil si manquant
        INSERT INTO public.profiles (id, email, role, status)
        VALUES (user_record.id, user_record.email, 'client', 'approved')
        ON CONFLICT (id) DO NOTHING;

        -- Créer fiche client
        INSERT INTO public.clients (id, email, status, company_name, internal_code)
        VALUES (
            user_record.id, 
            user_record.email, 
            'active',
            COALESCE(user_record.raw_user_meta_data->>'company_name', 'Client Sans Nom'),
            'CL-' || UPPER(SUBSTRING(user_record.id::text, 1, 8))
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

END $$;
