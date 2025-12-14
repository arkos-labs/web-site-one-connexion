-- ============================================================================
-- AUDIT COMPLET DE LA BASE DE DONNÉES
-- ============================================================================
-- Ce script ne modifie rien. Il affiche l'état actuel de la base pour diagnostic.
-- Exécutez-le et analysez les résultats (plusieurs onglets de résultats en bas).
-- ============================================================================

-- 1. ÉTAT RLS (Row Level Security) PAR TABLE
-- Vérifie si la sécurité est activée (true) ou désactivée (false)
SELECT 
    relname AS table_name, 
    relrowsecurity AS rls_enabled
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_namespace.nspname = 'public' 
AND relkind = 'r'
ORDER BY relname;

-- 2. LISTE DES POLITIQUES (POLICIES) EXISTANTES
-- Permet de détecter les doublons ou les règles conflictuelles
SELECT 
    tablename, 
    policyname, 
    cmd AS operation, 
    roles, 
    qual AS condition_using, 
    with_check AS condition_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VÉRIFICATION DES COLONNES CRITIQUES
-- Vérifie la présence des colonnes mentionnées (lat/lng, id, noms...)
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('drivers', 'admins', 'profiles', 'clients', 'orders')
ORDER BY table_name, column_name;

-- 4. LISTE DES CLÉS ÉTRANGÈRES (FOREIGN KEYS)
-- Vérifie les liens entre les tables
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. FONCTIONS SECURITY DEFINER (RISQUE DE BOUCLE)
-- Liste les fonctions qui s'exécutent avec les droits admin
SELECT 
    p.proname AS function_name, 
    p.prosecdef AS is_security_definer,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true;

-- 6. CONTRÔLE D'INTÉGRITÉ DES DONNÉES
-- Vérifie s'il y a des anomalies (NULLs interdits, orphelins...)
SELECT 'Admins sans user_id (Grave)' as anomaly, count(*) as count FROM public.admins WHERE user_id IS NULL
UNION ALL
SELECT 'Drivers sans ID (Grave)', count(*) FROM public.drivers WHERE id IS NULL
UNION ALL
SELECT 'Drivers ID dupliqués', count(*) FROM (SELECT id FROM public.drivers GROUP BY id HAVING count(*) > 1) sub
UNION ALL
SELECT 'Profils orphelins (Sans User Auth)', count(*) FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users)
UNION ALL
SELECT 'Clients orphelins (Sans Profil)', count(*) FROM public.clients WHERE id NOT IN (SELECT id FROM public.profiles);
