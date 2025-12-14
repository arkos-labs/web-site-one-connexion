-- ============================================================================
-- FIX: Correction des emails des chauffeurs existants
-- Convertir les emails @driver.oneconnexion en @driver.local
-- ============================================================================

-- Mettre à jour les emails dans auth.users
UPDATE auth.users
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

-- Mettre à jour les emails dans public.drivers
UPDATE public.drivers
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

-- Mettre à jour les emails dans public.profiles
UPDATE public.profiles
SET email = REPLACE(email, '@driver.oneconnexion', '@driver.local')
WHERE email LIKE '%@driver.oneconnexion';

-- Afficher le résultat
SELECT 
    'auth.users' as table_name,
    COUNT(*) as drivers_count
FROM auth.users
WHERE email LIKE '%@driver.local'
UNION ALL
SELECT 
    'public.drivers' as table_name,
    COUNT(*) as drivers_count
FROM public.drivers
WHERE email LIKE '%@driver.local'
UNION ALL
SELECT 
    'public.profiles' as table_name,
    COUNT(*) as drivers_count
FROM public.profiles
WHERE email LIKE '%@driver.local';
