-- ============================================================================
-- SCRIPT D'OPTIMISATION : INDEX POUR RLS ET PERFORMANCE
-- ============================================================================
-- Ce script crée les index nécessaires pour optimiser les performances
-- des politiques RLS et des requêtes fréquentes sur la table orders.
--
-- OBJECTIFS :
-- 1. Accélérer les vérifications RLS (is_admin_or_dispatcher, is_active_driver)
-- 2. Optimiser les requêtes de lecture par client_id et driver_id
-- 3. Améliorer les performances des tris par date
--
-- AUTEUR : Expert Sécurité Supabase
-- DATE : 2025-12-19
-- ============================================================================

-- ============================================================================
-- INDEX POUR LA TABLE ADMINS
-- ============================================================================

-- Index composite pour la fonction is_admin_or_dispatcher()
-- Utilisé dans les politiques RLS pour vérifier le rôle admin
CREATE INDEX IF NOT EXISTS idx_admins_id_role_status 
ON admins(id, role, status)
WHERE status = 'active';

-- Index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_admins_email 
ON admins(email);

-- ============================================================================
-- INDEX POUR LA TABLE DRIVERS
-- ============================================================================

-- Index composite pour la fonction is_active_driver()
-- Utilisé dans les politiques RLS pour vérifier le statut driver
CREATE INDEX IF NOT EXISTS idx_drivers_id_status 
ON drivers(id, status)
WHERE status = 'active';

-- Index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_drivers_email 
ON drivers(email);

-- ============================================================================
-- INDEX POUR LA TABLE CLIENTS
-- ============================================================================

-- Index sur l'ID pour les jointures rapides
CREATE INDEX IF NOT EXISTS idx_clients_id 
ON clients(id);

-- Index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_clients_email 
ON clients(email);

-- Index sur le statut pour filtrer les clients actifs
CREATE INDEX IF NOT EXISTS idx_clients_status 
ON clients(status);

-- ============================================================================
-- INDEX POUR LA TABLE ORDERS (CRITIQUES POUR RLS)
-- ============================================================================

-- Index sur client_id (CRITIQUE pour RLS)
-- Utilisé dans la politique "clients_can_view_own_orders"
CREATE INDEX IF NOT EXISTS idx_orders_client_id 
ON orders(client_id);

-- Index sur driver_id (CRITIQUE pour RLS)
-- Utilisé dans la politique pour les drivers
CREATE INDEX IF NOT EXISTS idx_orders_driver_id 
ON orders(driver_id)
WHERE driver_id IS NOT NULL;

-- Index composite client_id + created_at pour les listes paginées
-- Optimise les requêtes du type : WHERE client_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_client_created 
ON orders(client_id, created_at DESC);

-- Index composite driver_id + created_at pour les listes paginées
-- Optimise les requêtes du type : WHERE driver_id = X ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_driver_created 
ON orders(driver_id, created_at DESC)
WHERE driver_id IS NOT NULL;

-- Index sur le statut pour les filtres fréquents
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Index composite statut + created_at pour les dashboards
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

-- Index sur created_at pour les tris chronologiques
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Index sur updated_at pour les synchronisations
CREATE INDEX IF NOT EXISTS idx_orders_updated_at 
ON orders(updated_at DESC);

-- Index composite pour les commandes en attente d'attribution
-- Optimise la recherche de commandes à dispatcher
CREATE INDEX IF NOT EXISTS idx_orders_pending_dispatch 
ON orders(status, created_at)
WHERE status IN ('pending', 'pending_acceptance', 'accepted') 
AND driver_id IS NULL;

-- Index composite pour les commandes actives d'un driver
-- Optimise l'affichage des commandes en cours pour un chauffeur
CREATE INDEX IF NOT EXISTS idx_orders_driver_active 
ON orders(driver_id, status, created_at DESC)
WHERE status IN ('dispatched', 'in_progress', 'driver_accepted');

-- ============================================================================
-- INDEX POUR LA TABLE INVOICES
-- ============================================================================

-- Index sur client_id pour les requêtes paginées
CREATE INDEX IF NOT EXISTS idx_invoices_client_id 
ON invoices(client_id);

-- Index composite client_id + created_at
CREATE INDEX IF NOT EXISTS idx_invoices_client_created 
ON invoices(client_id, created_at DESC);

-- Index sur order_id pour les jointures
CREATE INDEX IF NOT EXISTS idx_invoices_order_id 
ON invoices(order_id);

-- Index sur le statut pour les filtres
CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(status);

-- ============================================================================
-- INDEX POUR LA TABLE ORDER_EVENTS (AUDIT)
-- ============================================================================

-- Index sur order_id pour récupérer l'historique d'une commande
CREATE INDEX IF NOT EXISTS idx_order_events_order_id 
ON order_events(order_id, created_at DESC);

-- Index sur event_type pour les analyses
CREATE INDEX IF NOT EXISTS idx_order_events_type 
ON order_events(event_type);

-- ============================================================================
-- STATISTIQUES ET ANALYSE
-- ============================================================================

-- Mettre à jour les statistiques pour l'optimiseur de requêtes
ANALYZE admins;
ANALYZE drivers;
ANALYZE clients;
ANALYZE orders;
ANALYZE invoices;
ANALYZE order_events;

-- ============================================================================
-- VÉRIFICATION DES INDEX CRÉÉS
-- ============================================================================

-- Afficher tous les index sur la table orders
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'orders'
ORDER BY indexname;

-- Afficher la taille des index
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('orders', 'admins', 'drivers', 'clients', 'invoices')
ORDER BY tablename, indexname;

-- ============================================================================
-- MONITORING DES PERFORMANCES
-- ============================================================================

-- Requête pour identifier les index inutilisés (à exécuter après quelques jours)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('orders', 'admins', 'drivers', 'clients', 'invoices')
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- NOTES DE PERFORMANCE
-- ============================================================================

/*
1. IMPACT DES INDEX :
   - Les index WHERE partiels (filtered indexes) sont plus petits et plus rapides
   - Ils ne stockent que les lignes qui correspondent à la condition
   - Exemple : idx_drivers_id_status WHERE status = 'active'

2. INDEX COMPOSITES :
   - L'ordre des colonnes est important : (client_id, created_at)
   - Utilisable pour : WHERE client_id = X ORDER BY created_at
   - Non utilisable pour : WHERE created_at = X (première colonne manquante)

3. MAINTENANCE :
   - PostgreSQL met à jour automatiquement les index
   - VACUUM et ANALYZE sont exécutés automatiquement par Supabase
   - Surveillez la taille des index avec pg_stat_user_indexes

4. MONITORING :
   - Utilisez pg_stat_statements pour identifier les requêtes lentes
   - Activez auto_explain pour logger les plans d'exécution
   - Surveillez idx_scan pour détecter les index inutilisés

5. OPTIMISATION RLS :
   - Les fonctions is_admin_or_dispatcher() et is_active_driver() 
     bénéficient directement de idx_admins_id_role_status et idx_drivers_id_status
   - Ces index sont CRITIQUES pour les performances RLS
   - Sans eux, chaque requête ferait un full table scan sur admins/drivers

6. TAILLE ESTIMÉE :
   - Pour 10,000 commandes :
     * idx_orders_client_id : ~200 KB
     * idx_orders_driver_id : ~150 KB
     * idx_orders_client_created : ~300 KB
   - Total estimé pour tous les index : ~2-3 MB

7. QUAND RECRÉER LES INDEX :
   - Après une migration massive de données
   - Si les performances se dégradent
   - Commande : REINDEX TABLE orders;
*/

-- ============================================================================
-- REQUÊTES D'EXEMPLE OPTIMISÉES
-- ============================================================================

/*
-- Exemple 1 : Récupérer les commandes d'un client (utilisera idx_orders_client_created)
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE client_id = 'uuid-du-client' 
ORDER BY created_at DESC 
LIMIT 10;

-- Exemple 2 : Récupérer les commandes actives d'un driver (utilisera idx_orders_driver_active)
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE driver_id = 'uuid-du-driver' 
AND status IN ('dispatched', 'in_progress') 
ORDER BY created_at DESC;

-- Exemple 3 : Vérifier si un utilisateur est admin (utilisera idx_admins_id_role_status)
EXPLAIN ANALYZE
SELECT EXISTS (
  SELECT 1 FROM admins 
  WHERE id = 'uuid-utilisateur' 
  AND role IN ('admin', 'super_admin', 'dispatcher') 
  AND status = 'active'
);

-- Exemple 4 : Récupérer les commandes à dispatcher (utilisera idx_orders_pending_dispatch)
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE status IN ('pending', 'pending_acceptance', 'accepted') 
AND driver_id IS NULL 
ORDER BY created_at ASC 
LIMIT 20;
*/

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    -- Compter les index créés sur orders
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'orders'
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '✅ Script d''optimisation exécuté avec succès';
    RAISE NOTICE '✅ % index créés sur la table orders', index_count;
    RAISE NOTICE '✅ Index créés sur admins, drivers, clients, invoices';
    RAISE NOTICE '📊 Exécutez ANALYZE pour mettre à jour les statistiques';
    RAISE NOTICE '📖 Consultez les commentaires pour les bonnes pratiques';
END $$;
