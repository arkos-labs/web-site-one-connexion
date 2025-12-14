-- ============================================================================
-- FIX ULTIME : DÉSACTIVATION TEMPORAIRE RLS POUR DEBUG
-- ============================================================================
-- Si malgré tout rien ne s'affiche, c'est que RLS bloque tout.
-- On va désactiver RLS sur les tables critiques pour confirmer.
-- ============================================================================

-- 1. DÉSACTIVER RLS (TEMPORAIREMENT)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- 2. GRANT ALL (Encore une fois pour être sûr)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role, postgres, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, postgres, anon;

RAISE NOTICE '⚠️ RLS DÉSACTIVÉ SUR TOUTES LES TABLES CRITIQUES. SI ÇA MARCHE, C''EST UN PROBLÈME DE POLICY.';
