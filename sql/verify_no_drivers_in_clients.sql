-- ============================================================================
-- VÉRIFICATION ET NETTOYAGE : Chauffeurs dans la table clients
-- ============================================================================
-- Ce script vérifie qu'aucun chauffeur n'a été créé dans la table clients
-- et nettoie les entrées incorrectes si nécessaire
-- ============================================================================

-- ÉTAPE 1 : Vérifier s'il y a des chauffeurs dans la table clients
-- ============================================================================
SELECT 
    '=== VÉRIFICATION : Chauffeurs dans table clients ===' as info;

SELECT 
    c.id as client_id,
    c.user_id,
    c.email,
    c.company_name,
    p.role as profile_role,
    d.user_id IS NOT NULL as is_driver
FROM public.clients c
LEFT JOIN public.profiles p ON c.user_id = p.id
LEFT JOIN public.drivers d ON c.user_id = d.user_id
WHERE p.role = 'driver' OR c.email LIKE '%@driver.local';

-- ÉTAPE 2 : Compter les entrées problématiques
-- ============================================================================
SELECT 
    COUNT(*) as chauffeurs_dans_clients,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun chauffeur dans la table clients'
        ELSE '⚠️ Des chauffeurs ont été créés dans la table clients !'
    END as status
FROM public.clients c
LEFT JOIN public.profiles p ON c.user_id = p.id
WHERE p.role = 'driver' OR c.email LIKE '%@driver.local';

-- ÉTAPE 3 : NETTOYAGE (si nécessaire)
-- ============================================================================
-- Supprimer les entrées de chauffeurs dans la table clients
DELETE FROM public.clients
WHERE user_id IN (
    SELECT p.id 
    FROM public.profiles p 
    WHERE p.role = 'driver'
)
OR email LIKE '%@driver.local';

-- Afficher le résultat du nettoyage
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Table clients nettoyée - Aucun chauffeur présent'
        ELSE '⚠️ Il reste ' || COUNT(*) || ' chauffeurs dans la table clients'
    END as resultat_nettoyage
FROM public.clients c
LEFT JOIN public.profiles p ON c.user_id = p.id
WHERE p.role = 'driver' OR c.email LIKE '%@driver.local';

-- ÉTAPE 4 : Vérification finale - Distribution des rôles
-- ============================================================================
SELECT 
    '=== DISTRIBUTION DES RÔLES ===' as info;

SELECT 
    p.role,
    COUNT(*) as count,
    COUNT(CASE WHEN c.user_id IS NOT NULL THEN 1 END) as dans_clients,
    COUNT(CASE WHEN d.user_id IS NOT NULL THEN 1 END) as dans_drivers,
    COUNT(CASE WHEN a.user_id IS NOT NULL THEN 1 END) as dans_admins
FROM public.profiles p
LEFT JOIN public.clients c ON p.id = c.user_id
LEFT JOIN public.drivers d ON p.id = d.user_id
LEFT JOIN public.admins a ON p.id = a.user_id
GROUP BY p.role
ORDER BY p.role;

-- ÉTAPE 5 : Vérifier la cohérence des données
-- ============================================================================
SELECT 
    '=== VÉRIFICATION COHÉRENCE ===' as info;

-- Chauffeurs qui devraient être UNIQUEMENT dans drivers
SELECT 
    u.email,
    p.role,
    CASE WHEN c.user_id IS NOT NULL THEN '❌ DANS CLIENTS' ELSE '✅ Pas dans clients' END as client_status,
    CASE WHEN d.user_id IS NOT NULL THEN '✅ Dans drivers' ELSE '❌ PAS DANS DRIVERS' END as driver_status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.clients c ON u.id = c.user_id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE p.role = 'driver' OR u.email LIKE '%@driver.local'
ORDER BY u.created_at DESC;

-- Clients qui devraient être UNIQUEMENT dans clients
SELECT 
    u.email,
    p.role,
    CASE WHEN c.user_id IS NOT NULL THEN '✅ Dans clients' ELSE '❌ PAS DANS CLIENTS' END as client_status,
    CASE WHEN d.user_id IS NOT NULL THEN '❌ DANS DRIVERS' ELSE '✅ Pas dans drivers' END as driver_status
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.clients c ON u.id = c.user_id
LEFT JOIN public.drivers d ON u.id = d.user_id
WHERE p.role = 'client'
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Après exécution de ce script, vous devriez voir :
-- 1. ✅ Aucun chauffeur dans la table clients
-- 2. ✅ Table clients nettoyée
-- 3. Distribution des rôles :
--    - role 'driver' : dans_clients = 0, dans_drivers > 0
--    - role 'client' : dans_clients > 0, dans_drivers = 0
--    - role 'admin' : dans_admins > 0
-- 4. Tous les chauffeurs : client_status = ✅ Pas dans clients
-- 5. Tous les chauffeurs : driver_status = ✅ Dans drivers
-- ============================================================================
