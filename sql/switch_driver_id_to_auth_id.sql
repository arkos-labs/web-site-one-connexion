-- MODIFICATION IMPORTANTE : PASSAGE À L'AUTH_ID POUR LES ASSIGNATIONS
-- L'application chauffeur attend que 'driver_id' corresponde à 'auth.uid()'.
-- Nous devons donc autoriser 'driver_id' à contenir un Auth ID (et non plus le Driver Profile ID).
-- Cela nécessite de supprimer la contrainte de clé étrangère qui lie 'driver_id' à 'drivers.id'.

-- 1. Supprimer la contrainte de clé étrangère
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;

-- 2. (Optionnel) Ajouter un index pour les perfs si on cherche souvent par driver_id
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- Note: Désormais "orders.driver_id" contiendra le "user_id" (Auth ID) du chauffeur.
