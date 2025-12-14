-- ============================================================================
-- FIX INFINITE RECURSION (ERREUR 42P17)
-- ============================================================================
-- L'erreur "infinite recursion detected in policy for relation profiles" est critique.
-- Elle survient quand une Policy RLS sur 'profiles' essaie de lire 'profiles' pour vérifier les droits,
-- ce qui crée une boucle infinie.
--
-- SOLUTION : Utiliser une fonction SECURITY DEFINER pour vérifier le rôle admin
-- sans déclencher les RLS de la table profiles.
-- ============================================================================

-- 1. CRÉER UNE FONCTION DE VÉRIFICATION SANS RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Exécute avec les droits système (contourne RLS)
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
$$;

-- 2. NETTOYER LES POLICIES QUI POSENT PROBLÈME
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY; -- Désactiver temporairement pour nettoyer
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow All Profiles" ON public.profiles; -- Ancienne policy de debug

-- 3. RECRÉER DES POLICIES PROPRES ET SANS BOUCLE

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- A. Lecture : Tout le monde peut lire son propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- B. Lecture Admin : Les admins peuvent tout lire (via la fonction is_admin())
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- C. Écriture : Chacun modifie le sien
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- D. Écriture Admin : Les admins peuvent tout modifier
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (public.is_admin());

-- E. Insertion : Admin ou Soi-même
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR public.is_admin());


-- 4. APPLIQUER LA MÊME LOGIQUE AUX AUTRES TABLES (Pour éviter d'autres boucles)

-- Clients
DROP POLICY IF EXISTS "Admins have full access" ON public.clients;
CREATE POLICY "Admins have full access" ON public.clients
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins have full access" ON public.orders;
CREATE POLICY "Admins have full access" ON public.orders
    FOR ALL TO authenticated
    USING (public.is_admin());

-- Drivers
DROP POLICY IF EXISTS "Admins have full access" ON public.drivers;
CREATE POLICY "Admins have full access" ON public.drivers
    FOR ALL TO authenticated
    USING (public.is_admin());

RAISE NOTICE '✅ Boucle infinie RLS corrigée avec la fonction is_admin().';
