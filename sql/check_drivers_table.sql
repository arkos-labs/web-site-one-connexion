-- ============================================================================
-- VÉRIFICATION STRUCTURE TABLE DRIVERS
-- ============================================================================

-- 1. Voir la structure de la table drivers
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'drivers'
ORDER BY ordinal_position;

-- 2. Voir les données du chauffeur test123
SELECT * FROM public.drivers WHERE email = 'test123@driver.local';

-- 3. Vérifier les permissions RLS sur la table drivers
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- 4. Voir les policies RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers';
