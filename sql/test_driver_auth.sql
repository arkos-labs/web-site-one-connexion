-- ============================================================================
-- TEST: Vérification complète du système d'authentification des chauffeurs
-- ============================================================================

-- 1. Vérifier la fonction create_driver_user existe et est à jour
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_driver_user'
AND routine_schema = 'public';

-- 2. Lister tous les chauffeurs avec leurs emails
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.role as profile_role,
    d.first_name,
    d.last_name,
    d.status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE u.email LIKE '%@driver.%'
ORDER BY u.created_at DESC;

-- 3. Vérifier qu'il n'y a pas d'emails avec l'ancien format
SELECT 
    COUNT(*) as old_format_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun chauffeur avec ancien format'
        ELSE '⚠️ Des chauffeurs utilisent encore l''ancien format'
    END as status
FROM auth.users
WHERE email LIKE '%@driver.oneconnexion';

-- 4. Vérifier la cohérence entre les tables
SELECT 
    'Incohérences détectées' as check_type,
    COUNT(*) as count
FROM auth.users u
WHERE u.email LIKE '%@driver.local'
AND (
    NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id AND p.role = 'driver')
    OR NOT EXISTS (SELECT 1 FROM public.drivers d WHERE d.user_id = u.id)
);

-- 5. Statistiques globales
SELECT 
    'Total chauffeurs' as metric,
    COUNT(*) as value
FROM public.drivers
UNION ALL
SELECT 
    'Chauffeurs actifs' as metric,
    COUNT(*) as value
FROM public.drivers
WHERE status = 'active'
UNION ALL
SELECT 
    'Chauffeurs hors ligne' as metric,
    COUNT(*) as value
FROM public.drivers
WHERE status = 'offline';
