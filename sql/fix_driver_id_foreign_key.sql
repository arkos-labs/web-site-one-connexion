-- ============================================
-- FIX FOREIGN KEY CONSTRAINT POUR driver_id
-- ============================================
-- Ce script corrige la contrainte FK pour que driver_id
-- pointe vers drivers.user_id au lieu de drivers.id
-- ============================================

-- 1. SUPPRIMER L'ANCIENNE CONTRAINTE FK
-- ============================================

ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;

-- 2. S'ASSURER QUE user_id EST UNIQUE DANS drivers
-- ============================================

-- Créer un index unique sur user_id si ce n'est pas déjà fait
CREATE UNIQUE INDEX IF NOT EXISTS drivers_user_id_unique ON drivers(user_id);

-- 3. CRÉER LA NOUVELLE CONTRAINTE FK
-- ============================================

-- driver_id dans orders pointe maintenant vers user_id dans drivers
ALTER TABLE orders
ADD CONSTRAINT orders_driver_id_fkey 
FOREIGN KEY (driver_id) 
REFERENCES drivers(user_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4. VÉRIFICATION
-- ============================================

-- Vérifier que la contrainte est bien en place
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'driver_id';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- constraint_name: orders_driver_id_fkey
-- table_name: orders
-- column_name: driver_id
-- foreign_table_name: drivers
-- foreign_column_name: user_id ✅
-- ============================================

COMMENT ON CONSTRAINT orders_driver_id_fkey ON orders IS 
'FK vers drivers.user_id (ID Auth) pour correspondre à l''App Chauffeur';
