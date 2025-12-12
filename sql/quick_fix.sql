-- -----------------------------------------------------------------------------
-- QUICK FIX: PERMISSIONS & DATA REPAIR
-- -----------------------------------------------------------------------------

-- 1. GRANT PERMISSIONS (Fixes 403 Forbidden)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. ENSURE RLS POLICIES EXIST
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients view own" ON public.clients;
CREATE POLICY "Clients view own" ON public.clients FOR SELECT USING (user_id = auth.uid());

-- 3. REPAIR DATA (Fixes "Profil introuvable")
-- Create profiles for users who don't have one
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT id, email, 'Utilisateur', 'Récupéré', 'client'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Create client entries for client profiles who don't have one
INSERT INTO public.clients (user_id, email, company_name, status)
SELECT id, email, 'Mon Entreprise', 'active'
FROM public.profiles
WHERE role = 'client' AND id NOT IN (SELECT user_id FROM public.clients);
