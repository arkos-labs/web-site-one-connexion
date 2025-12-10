-- Vérification : Tester si la fonction create_guest_order_v2 accepte scheduled_pickup_time
-- Date: 2025-12-06

-- 1. Vérifier la signature de la fonction
SELECT 
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_guest_order_v2'
AND n.nspname = 'public';

-- 2. Vérifier si la colonne scheduled_pickup_time existe dans orders
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'scheduled_pickup_time';

-- 3. Tester la fonction avec scheduled_pickup_time
SELECT create_guest_order_v2(
    'test@example.com',
    '0612345678',
    'Test User',
    '{"nom": "Test", "telephone": "0612345678", "email": "test@example.com"}'::jsonb,
    '{"nom": "Dest", "telephone": "0698765432"}'::jsonb,
    '{"adresse": "1 Rue Test", "details": "", "ville": "Paris"}'::jsonb,
    '{"adresse": "2 Rue Dest", "details": "", "ville": "Paris"}'::jsonb,
    '1 Rue Test, Paris',
    '2 Rue Dest, Paris',
    '{"nom": "Test", "email": "test@example.com", "telephone": "0612345678"}'::jsonb,
    'document',
    'NORMAL',
    66.00,
    12.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2025-12-13 10:00:00+01'::timestamptz  -- ✅ Test avec scheduled_pickup_time
);
