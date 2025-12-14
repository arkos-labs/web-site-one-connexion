-- ============================================================================
-- SOLUTION ULTIME : FONCTION RPC "SECURITY DEFINER"
-- ============================================================================
-- Cette fonction permet de créer le profil et le client en contournant les RLS.
-- C'est la méthode la plus robuste pour l'auto-création de compte.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_missing_client_profile(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_company_name TEXT,
    p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- ⚠️ C'est la clé : exécute avec les droits admin
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_client_id UUID;
BEGIN
    -- 1. Récupérer l'ID de l'utilisateur connecté
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'Non authentifié');
    END IF;

    -- 2. S'assurer que la table PROFILES a l'entrée
    INSERT INTO public.profiles (
        id, email, role, status, first_name, last_name, company_name, phone
    ) VALUES (
        v_user_id,
        p_email,
        'client',
        'approved',
        p_first_name,
        p_last_name,
        p_company_name,
        p_phone
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'client',
        status = 'approved',
        company_name = EXCLUDED.company_name;

    -- 3. S'assurer que la table CLIENTS a l'entrée
    -- (On vérifie d'abord si la table existe, juste au cas où)
    CREATE TABLE IF NOT EXISTS public.clients (
        id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
        company_name TEXT, email TEXT, phone TEXT, status TEXT DEFAULT 'active', internal_code TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO public.clients (
        id, email, status, company_name, phone, internal_code
    ) VALUES (
        v_user_id,
        p_email,
        'active',
        p_company_name,
        p_phone,
        'CL-' || UPPER(SUBSTRING(v_user_id::text, 1, 8))
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_client_id;

    -- Si on n'a rien inséré (car existait déjà), on récupère l'ID
    IF v_client_id IS NULL THEN
        SELECT id INTO v_client_id FROM public.clients WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'client_id', v_client_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Accorder l'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.create_missing_client_profile TO authenticated;

RAISE NOTICE '✅ Fonction RPC create_missing_client_profile créée avec succès.';
