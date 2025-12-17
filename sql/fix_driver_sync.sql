-- Script de diagnostic et nettoyage pour résoudre les problèmes de synchronisation

-- 1. Vérifier les chauffeurs avec statut 'busy' mais sans commande active
SELECT 
    d.id,
    d.first_name,
    d.last_name,
    d.status as driver_status,
    d.user_id,
    COUNT(o.id) as active_orders
FROM drivers d
LEFT JOIN orders o ON o.driver_id = d.user_id 
    AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
WHERE d.status = 'busy'
GROUP BY d.id, d.first_name, d.last_name, d.status, d.user_id
HAVING COUNT(o.id) = 0;

-- 2. Corriger les chauffeurs bloqués (remettre à 'online')
UPDATE drivers
SET 
    status = 'online',
    updated_at = NOW()
WHERE id IN (
    SELECT d.id
    FROM drivers d
    LEFT JOIN orders o ON o.driver_id = d.user_id 
        AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
    WHERE d.status = 'busy'
    GROUP BY d.id
    HAVING COUNT(o.id) = 0
);

-- 3. Vérifier les commandes avec driver_id mais chauffeur inexistant
SELECT 
    o.id,
    o.reference,
    o.status,
    o.driver_id,
    d.id as driver_exists
FROM orders o
LEFT JOIN drivers d ON d.user_id = o.driver_id
WHERE o.driver_id IS NOT NULL
    AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
    AND d.id IS NULL;

-- 4. Nettoyer les commandes orphelines (driver_id invalide)
UPDATE orders
SET 
    driver_id = NULL,
    status = 'accepted',
    updated_at = NOW()
WHERE id IN (
    SELECT o.id
    FROM orders o
    LEFT JOIN drivers d ON d.user_id = o.driver_id
    WHERE o.driver_id IS NOT NULL
        AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
        AND d.id IS NULL
);

-- 5. Afficher l'état final
SELECT 
    d.first_name,
    d.last_name,
    d.status,
    COUNT(o.id) as active_orders,
    STRING_AGG(o.reference, ', ') as order_references
FROM drivers d
LEFT JOIN orders o ON o.driver_id = d.user_id 
    AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
GROUP BY d.id, d.first_name, d.last_name, d.status
ORDER BY d.status DESC, d.first_name;
