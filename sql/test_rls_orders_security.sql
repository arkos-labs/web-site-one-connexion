-- ============================================
-- TESTS DE SÉCURITÉ RLS - TABLE ORDERS
-- ============================================
-- Ce script contient des tests pour valider que le RLS
-- fonctionne correctement sur la table orders
--
-- ⚠️ IMPORTANT: Exécutez ces tests avec différents comptes utilisateurs
-- pour vérifier que les permissions sont correctement appliquées
-- ============================================

-- ============================================
-- PRÉPARATION DES TESTS
-- ============================================

-- Créer des utilisateurs de test (à faire via Supabase Auth UI)
-- 1. Client Test: test-client@example.com (role: client)
-- 2. Chauffeur Test: test-driver@example.com (role: driver)
-- 3. Admin Test: test-admin@example.com (role: admin)
-- 4. Dispatcher Test: test-dispatcher@example.com (role: dispatcher)

-- Vérifier que RLS est bien activé
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE tablename = 'orders';
    
    IF NOT rls_enabled THEN
        RAISE EXCEPTION '❌ RLS n''est PAS activé sur la table orders !';
    ELSE
        RAISE NOTICE '✅ RLS est activé sur la table orders';
    END IF;
END $$;

-- ============================================
-- TEST 1: VÉRIFICATION DES POLICIES
-- ============================================

-- Lister toutes les policies actives
SELECT 
    '📋 POLICIES ACTIVES' AS test_section,
    policyname,
    cmd AS operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING clause définie'
        ELSE 'Pas de USING clause'
    END AS using_status,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK définie'
        ELSE 'Pas de WITH CHECK'
    END AS with_check_status
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY cmd, policyname;

-- Vérifier qu'on a au moins 9 policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'orders';
    
    IF policy_count < 9 THEN
        RAISE WARNING '⚠️  Seulement % policies trouvées (attendu: au moins 9)', policy_count;
    ELSE
        RAISE NOTICE '✅ % policies trouvées', policy_count;
    END IF;
END $$;

-- ============================================
-- TEST 2: VÉRIFICATION DES TRIGGERS
-- ============================================

SELECT 
    '🔧 TRIGGERS DE SÉCURITÉ' AS test_section,
    trigger_name,
    event_manipulation AS event,
    action_timing AS timing,
    CASE 
        WHEN trigger_name = 'trigger_enforce_client_id' THEN '✅ Présent'
        WHEN trigger_name = 'trigger_prevent_client_id_modification' THEN '✅ Présent'
        ELSE '⚠️  Trigger inconnu'
    END AS status
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name IN ('trigger_enforce_client_id', 'trigger_prevent_client_id_modification');

-- ============================================
-- TEST 3: VÉRIFICATION DE LA FONCTION HELPER
-- ============================================

-- Tester que la fonction existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'is_admin_or_dispatcher'
    ) THEN
        RAISE EXCEPTION '❌ La fonction is_admin_or_dispatcher() n''existe pas !';
    ELSE
        RAISE NOTICE '✅ La fonction is_admin_or_dispatcher() existe';
    END IF;
END $$;

-- Tester la fonction (résultat dépend de l'utilisateur connecté)
SELECT 
    '🔍 TEST FONCTION HELPER' AS test_section,
    auth.uid() AS current_user_id,
    is_admin_or_dispatcher() AS is_admin_or_dispatcher,
    CASE 
        WHEN is_admin_or_dispatcher() THEN '✅ Utilisateur est admin/dispatcher'
        ELSE 'ℹ️  Utilisateur n''est pas admin/dispatcher'
    END AS status;

-- ============================================
-- TEST 4: SIMULATION D'ACCÈS CLIENT
-- ============================================

-- Ce test doit être exécuté en tant que CLIENT
-- Il vérifie que le client ne voit que ses propres commandes

-- Créer une commande de test pour le client actuel
-- (Décommentez et adaptez selon vos besoins)
/*
INSERT INTO orders (
    reference,
    pickup_address,
    delivery_address,
    price,
    delivery_type,
    status
) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'Adresse de test pickup',
    'Adresse de test delivery',
    25.00,
    'express',
    'pending_acceptance'
) RETURNING id, client_id, reference;
*/

-- Vérifier que le client ne voit que ses commandes
SELECT 
    '👤 TEST ACCÈS CLIENT' AS test_section,
    COUNT(*) AS total_orders_visible,
    COUNT(DISTINCT client_id) AS distinct_clients,
    CASE 
        WHEN COUNT(DISTINCT client_id) = 1 AND MIN(client_id) = auth.uid() THEN '✅ Client voit uniquement ses commandes'
        WHEN COUNT(DISTINCT client_id) > 1 THEN '❌ SÉCURITÉ COMPROMISE: Client voit des commandes d''autres clients !'
        WHEN COUNT(*) = 0 THEN 'ℹ️  Aucune commande visible (normal si pas de commandes)'
        ELSE '⚠️  Situation inattendue'
    END AS security_status
FROM orders;

-- ============================================
-- TEST 5: TENTATIVE DE MODIFICATION DU client_id
-- ============================================

-- Ce test doit ÉCHOUER pour un client non-admin
-- (Décommentez pour tester - doit générer une erreur)
/*
DO $$
DECLARE
    test_order_id UUID;
    fake_client_id UUID := gen_random_uuid();
BEGIN
    -- Récupérer une commande du client actuel
    SELECT id INTO test_order_id
    FROM orders
    WHERE client_id = auth.uid()
    LIMIT 1;
    
    IF test_order_id IS NULL THEN
        RAISE NOTICE 'ℹ️  Aucune commande à tester';
        RETURN;
    END IF;
    
    -- Tenter de modifier le client_id (doit échouer)
    UPDATE orders
    SET client_id = fake_client_id
    WHERE id = test_order_id;
    
    RAISE EXCEPTION '❌ SÉCURITÉ COMPROMISE: La modification du client_id a réussi !';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%ne pouvez pas modifier le client_id%' THEN
            RAISE NOTICE '✅ Protection du client_id fonctionne correctement';
        ELSE
            RAISE NOTICE '⚠️  Erreur inattendue: %', SQLERRM;
        END IF;
END $$;
*/

-- ============================================
-- TEST 6: VÉRIFICATION DU FORÇAGE DU client_id
-- ============================================

-- Ce test vérifie que le client_id est bien forcé lors de l'insertion
-- (Décommentez pour tester)
/*
DO $$
DECLARE
    fake_client_id UUID := gen_random_uuid();
    inserted_order_id UUID;
    actual_client_id UUID;
BEGIN
    -- Tenter d'insérer une commande avec un client_id différent
    INSERT INTO orders (
        reference,
        client_id,  -- On essaie de forcer un autre client_id
        pickup_address,
        delivery_address,
        price,
        delivery_type,
        status
    ) VALUES (
        'TEST-FORCE-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        fake_client_id,  -- ⚠️ Tentative de fraude
        'Test pickup',
        'Test delivery',
        10.00,
        'standard',
        'pending_acceptance'
    ) RETURNING id, client_id INTO inserted_order_id, actual_client_id;
    
    -- Vérifier que le client_id a été forcé à auth.uid()
    IF actual_client_id = auth.uid() THEN
        RAISE NOTICE '✅ Le client_id a été correctement forcé à auth.uid()';
        -- Nettoyer la commande de test
        DELETE FROM orders WHERE id = inserted_order_id;
    ELSE
        RAISE EXCEPTION '❌ SÉCURITÉ COMPROMISE: Le client_id n''a pas été forcé !';
    END IF;
END $$;
*/

-- ============================================
-- TEST 7: ACCÈS ADMIN (À exécuter en tant qu'admin)
-- ============================================

-- Vérifier que l'admin peut voir toutes les commandes
SELECT 
    '👑 TEST ACCÈS ADMIN' AS test_section,
    COUNT(*) AS total_orders,
    COUNT(DISTINCT client_id) AS distinct_clients,
    CASE 
        WHEN is_admin_or_dispatcher() THEN '✅ Utilisateur est admin/dispatcher'
        ELSE '⚠️  Ce test doit être exécuté en tant qu''admin'
    END AS admin_status;

-- ============================================
-- TEST 8: ACCÈS CHAUFFEUR (À exécuter en tant que chauffeur)
-- ============================================

-- Vérifier que le chauffeur ne voit que ses commandes assignées
SELECT 
    '🚗 TEST ACCÈS CHAUFFEUR' AS test_section,
    COUNT(*) AS orders_visible,
    COUNT(DISTINCT driver_id) AS distinct_drivers,
    CASE 
        WHEN COUNT(*) > 0 AND COUNT(DISTINCT driver_id) = 1 AND MIN(driver_id) = auth.uid() 
            THEN '✅ Chauffeur voit uniquement ses commandes'
        WHEN COUNT(*) = 0 
            THEN 'ℹ️  Aucune commande assignée (normal)'
        WHEN COUNT(DISTINCT driver_id) > 1 
            THEN '❌ SÉCURITÉ COMPROMISE: Chauffeur voit des commandes d''autres chauffeurs !'
        ELSE '⚠️  Situation inattendue'
    END AS security_status
FROM orders
WHERE driver_id IS NOT NULL;

-- ============================================
-- TEST 9: VÉRIFICATION DES PERMISSIONS DE SUPPRESSION
-- ============================================

-- Vérifier que seuls les admins peuvent supprimer
SELECT 
    '🗑️  TEST PERMISSIONS SUPPRESSION' AS test_section,
    policyname,
    CASE 
        WHEN policyname LIKE '%admin%delete%' THEN '✅ Policy de suppression pour admin existe'
        ELSE '⚠️  Policy inattendue'
    END AS status
FROM pg_policies
WHERE tablename = 'orders'
AND cmd = 'DELETE';

-- ============================================
-- TEST 10: RÉSUMÉ DES TESTS
-- ============================================

SELECT 
    '📊 RÉSUMÉ DE LA SÉCURITÉ' AS section,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'orders') AS total_policies,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'orders') AS total_triggers,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'orders') AS rls_enabled,
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'orders') 
            AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'orders') >= 9
            AND (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'orders') >= 2
        THEN '✅ SÉCURITÉ COMPLÈTE'
        ELSE '⚠️  CONFIGURATION INCOMPLÈTE'
    END AS security_status;

-- ============================================
-- RECOMMANDATIONS FINALES
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '📋 RECOMMANDATIONS POUR LES TESTS';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '1. ✅ Exécutez ce script en tant que CLIENT';
    RAISE NOTICE '   → Vérifiez que vous ne voyez que vos commandes';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✅ Exécutez ce script en tant que CHAUFFEUR';
    RAISE NOTICE '   → Vérifiez que vous ne voyez que vos commandes assignées';
    RAISE NOTICE '';
    RAISE NOTICE '3. ✅ Exécutez ce script en tant qu''ADMIN';
    RAISE NOTICE '   → Vérifiez que vous voyez toutes les commandes';
    RAISE NOTICE '';
    RAISE NOTICE '4. ✅ Décommentez les tests de modification';
    RAISE NOTICE '   → Vérifiez que les protections fonctionnent';
    RAISE NOTICE '';
    RAISE NOTICE '5. ✅ Testez l''insertion de commandes';
    RAISE NOTICE '   → Vérifiez que le client_id est forcé';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
