-- ============================================================================
-- AUTOMATISATION : TRIGGER CRÉATION PROFIL & CLIENT
-- ============================================================================

-- 1. FONCTION DU TRIGGER
-- Cette fonction est appelée automatiquement à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les droits admin
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_company TEXT;
BEGIN
    -- Récupérer les métadonnées (ou valeurs par défaut)
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    user_company := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise');

    -- A. Insérer dans PROFILES (Table pivot obligatoire)
    INSERT INTO public.profiles (
        id, email, role, status, first_name, last_name, phone, company_name
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role,
        CASE WHEN user_role = 'chauffeur' THEN 'pending' ELSE 'approved' END,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Nouveau'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Utilisateur'),
        NEW.raw_user_meta_data->>'phone',
        user_company
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role;

    -- B. Si c'est un CLIENT, insérer dans CLIENTS
    IF user_role = 'client' THEN
        INSERT INTO public.clients (
            id, company_name, email, phone, status, internal_code
        ) VALUES (
            NEW.id,
            user_company,
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            'active',
            'CL-' || UPPER(SUBSTRING(NEW.id::text, 1, 8))
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- C. Si c'est un CHAUFFEUR, insérer dans DRIVERS
    IF user_role = 'chauffeur' OR user_role = 'driver' THEN
        INSERT INTO public.drivers (
            user_id, first_name, last_name, email, phone, status
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'Chauffeur'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', 'Inconnu'),
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            'offline'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- 2. CRÉATION DU TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. SÉCURITÉ RLS SUR CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Politique : Voir son propre profil
DROP POLICY IF EXISTS "Users can view own client profile" ON public.clients;
CREATE POLICY "Users can view own client profile" ON public.clients
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Politique : Modifier son propre profil
DROP POLICY IF EXISTS "Users can update own client profile" ON public.clients;
CREATE POLICY "Users can update own client profile" ON public.clients
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Politique : Créer son propre profil (au cas où le trigger échoue)
DROP POLICY IF EXISTS "Users can insert own client profile" ON public.clients;
CREATE POLICY "Users can insert own client profile" ON public.clients
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

RAISE NOTICE '✅ Trigger automatique et RLS configurés avec succès.';
