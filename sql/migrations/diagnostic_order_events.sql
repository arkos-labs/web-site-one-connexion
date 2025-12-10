-- Script de diagnostic : Vérifier les triggers et contraintes sur order_events
-- Date: 2025-12-06

-- 1. Lister tous les triggers sur la table orders
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Vérifier la contrainte actuelle sur order_events
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'order_events_event_type_check'
AND conrelid = 'order_events'::regclass;

-- 3. Lister les event_type distincts actuellement dans order_events
SELECT DISTINCT event_type, COUNT(*) as count
FROM order_events
GROUP BY event_type
ORDER BY event_type;
