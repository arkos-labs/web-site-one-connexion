-- ===================================================================
-- SCRIPT DE VÉRIFICATION - Base de données One Connexion
-- Description: Vérifie que toutes les tables et données sont correctes
-- Date: 2025-12-07
-- ===================================================================

-- ===================================================================
-- 1. VÉRIFICATION DES TABLES
-- ===================================================================

-- Liste toutes les tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Résultat attendu:
-- ✓ admins
-- ✓ clients
-- ✓ driver_documents
-- ✓ drivers
-- ✓ invoices
-- ✓ messages
-- ✓ orders
-- ✓ tariff_metadata
-- ✓ vehicles

-- ===================================================================
-- 2. VÉRIFICATION DES DONNÉES ESSENTIELLES
-- ===================================================================

-- Compter les enregistrements dans chaque table
SELECT 'admins' as table_name, COUNT(*) as count FROM admins
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'driver_documents', COUNT(*) FROM driver_documents
UNION ALL
SELECT 'tariff_metadata', COUNT(*) FROM tariff_metadata
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
ORDER BY table_name;

-- ===================================================================
-- 3. VÉRIFICATION DES TARIFS DYNAMIQUES
-- ===================================================================

-- Vérifier que les 4 paramètres de tarification existent
SELECT 
    key,
    value,
    description,
    updated_at
FROM tariff_metadata
ORDER BY key;

-- Résultat attendu: 4 lignes
-- ✓ bon_value_eur
-- ✓ night_surcharge_percent
-- ✓ supplement_per_km_bons
-- ✓ weekend_surcharge_percent

-- ===================================================================
-- 4. VÉRIFICATION DES POLICIES RLS
-- ===================================================================

-- Vérifier que RLS est activé sur les tables sensibles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('tariff_metadata', 'vehicles', 'driver_documents', 'orders', 'invoices')
ORDER BY tablename;

-- Résultat attendu: rowsecurity = true pour toutes

-- Compter les policies par table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ===================================================================
-- 5. VÉRIFICATION DES INDEX
-- ===================================================================

-- Lister tous les index
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'  -- Exclure les primary keys
ORDER BY tablename, indexname;

-- ===================================================================
-- 6. VÉRIFICATION DES TRIGGERS
-- ===================================================================

-- Lister tous les triggers
SELECT 
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Résultat attendu: Triggers updated_at sur:
-- ✓ tariff_metadata
-- ✓ vehicles
-- ✓ driver_documents

-- ===================================================================
-- 7. VÉRIFICATION DES VÉHICULES
-- ===================================================================

-- Statistiques des véhicules
SELECT 
    vehicle_type,
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN is_verified THEN 1 END) as verified_count
FROM vehicles
GROUP BY vehicle_type, status
ORDER BY vehicle_type, status;

-- ===================================================================
-- 8. VÉRIFICATION DES DOCUMENTS
-- ===================================================================

-- Statistiques des documents
SELECT 
    document_type,
    verification_status,
    COUNT(*) as count
FROM driver_documents
GROUP BY document_type, verification_status
ORDER BY document_type, verification_status;

-- Documents expirés ou expirant bientôt (30 jours)
SELECT 
    dd.document_type,
    dd.expiry_date,
    d.first_name || ' ' || d.last_name as driver_name,
    d.email,
    CASE 
        WHEN dd.expiry_date < CURRENT_DATE THEN 'EXPIRÉ'
        WHEN dd.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRE BIENTÔT'
        ELSE 'VALIDE'
    END as status
FROM driver_documents dd
JOIN drivers d ON d.id = dd.driver_id
WHERE dd.expiry_date IS NOT NULL
    AND dd.verification_status = 'approved'
    AND dd.expiry_date < CURRENT_DATE + INTERVAL '30 days'
ORDER BY dd.expiry_date;

-- ===================================================================
-- 9. VÉRIFICATION DES COMMANDES
-- ===================================================================

-- Statistiques des commandes par statut
SELECT 
    status,
    COUNT(*) as count,
    SUM(price) as total_revenue,
    AVG(price) as avg_price
FROM orders
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'delivered' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'dispatched' THEN 3
        WHEN 'pending' THEN 4
        WHEN 'cancelled' THEN 5
        ELSE 6
    END;

-- Commandes sans chauffeur assigné
SELECT 
    COUNT(*) as orders_without_driver
FROM orders
WHERE driver_id IS NULL
    AND status IN ('pending', 'dispatched');

-- ===================================================================
-- 10. VÉRIFICATION DES CHAUFFEURS
-- ===================================================================

-- Statistiques des chauffeurs
SELECT 
    status,
    COUNT(*) as count
FROM drivers
GROUP BY status
ORDER BY status;

-- Chauffeurs avec véhicules
SELECT 
    d.first_name || ' ' || d.last_name as driver_name,
    COUNT(v.id) as vehicle_count,
    COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_vehicles
FROM drivers d
LEFT JOIN vehicles v ON v.driver_id = d.id
GROUP BY d.id, d.first_name, d.last_name
ORDER BY vehicle_count DESC;

-- Chauffeurs avec documents complets
SELECT 
    d.first_name || ' ' || d.last_name as driver_name,
    COUNT(dd.id) as total_documents,
    COUNT(CASE WHEN dd.verification_status = 'approved' THEN 1 END) as approved_documents,
    COUNT(CASE WHEN dd.document_type = 'permis' AND dd.verification_status = 'approved' THEN 1 END) as has_license,
    COUNT(CASE WHEN dd.document_type = 'assurance' AND dd.verification_status = 'approved' THEN 1 END) as has_insurance,
    COUNT(CASE WHEN dd.document_type = 'carte_grise' AND dd.verification_status = 'approved' THEN 1 END) as has_registration
FROM drivers d
LEFT JOIN driver_documents dd ON dd.driver_id = d.id
GROUP BY d.id, d.first_name, d.last_name
ORDER BY approved_documents DESC;

-- ===================================================================
-- 11. VÉRIFICATION DE L'INTÉGRITÉ DES DONNÉES
-- ===================================================================

-- Vérifier les clés étrangères orphelines
-- Commandes avec driver_id invalide
SELECT COUNT(*) as invalid_driver_orders
FROM orders
WHERE driver_id IS NOT NULL
    AND driver_id NOT IN (SELECT id FROM drivers);

-- Véhicules avec driver_id invalide
SELECT COUNT(*) as invalid_driver_vehicles
FROM vehicles
WHERE driver_id NOT IN (SELECT id FROM drivers);

-- Documents avec driver_id invalide
SELECT COUNT(*) as invalid_driver_documents
FROM driver_documents
WHERE driver_id NOT IN (SELECT id FROM drivers);

-- ===================================================================
-- 12. RÉSUMÉ GLOBAL
-- ===================================================================

SELECT 
    'Total Admins' as metric, COUNT(*)::text as value FROM admins
UNION ALL
SELECT 'Total Clients', COUNT(*)::text FROM clients
UNION ALL
SELECT 'Total Chauffeurs', COUNT(*)::text FROM drivers
UNION ALL
SELECT 'Total Commandes', COUNT(*)::text FROM orders
UNION ALL
SELECT 'Total Véhicules', COUNT(*)::text FROM vehicles
UNION ALL
SELECT 'Total Documents', COUNT(*)::text FROM driver_documents
UNION ALL
SELECT 'Commandes Livrées', COUNT(*)::text FROM orders WHERE status = 'delivered'
UNION ALL
SELECT 'Commandes En Cours', COUNT(*)::text FROM orders WHERE status IN ('pending', 'dispatched', 'in_progress')
UNION ALL
SELECT 'Véhicules Actifs', COUNT(*)::text FROM vehicles WHERE status = 'active'
UNION ALL
SELECT 'Documents Approuvés', COUNT(*)::text FROM driver_documents WHERE verification_status = 'approved'
UNION ALL
SELECT 'Revenus Total (€)', COALESCE(SUM(price), 0)::text FROM orders WHERE status = 'delivered';

-- ===================================================================
-- FIN DU SCRIPT DE VÉRIFICATION
-- ===================================================================

-- Si toutes les requêtes s'exécutent sans erreur, la base est OK ! ✅
