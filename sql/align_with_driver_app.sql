-- ============================================
-- ALIGNEMENT AVEC L'APP CHAUFFEUR
-- ============================================
-- Ce script met à jour la base de données pour correspondre exactement
-- à la logique de l'application chauffeur mobile
--
-- IMPORTANT: driver_id dans la table orders stocke l'ID Auth (user_id)
-- et non l'ID de la table drivers (UUID)
-- ============================================

-- 1. MISE À JOUR DES CONTRAINTES DE STATUT
-- ============================================

-- Supprimer l'ancienne contrainte sur orders.status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_order_status;

-- Créer la nouvelle contrainte avec les statuts alignés
ALTER TABLE orders ADD CONSTRAINT valid_order_status 
CHECK (status IN (
    'pending_acceptance',  -- En attente d'acceptation
    'accepted',            -- Acceptée par admin
    'assigned',            -- Assignée à un chauffeur (remplace 'dispatched')
    'driver_accepted',     -- Chauffeur a accepté
    'driver_refused',      -- Chauffeur a refusé
    'in_progress',         -- En cours de livraison
    'delivered',           -- Livrée
    'cancelled'            -- Annulée
));

-- Supprimer l'ancienne contrainte sur drivers.status
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS valid_driver_status;

-- Créer la nouvelle contrainte avec les statuts unifiés
ALTER TABLE drivers ADD CONSTRAINT valid_driver_status 
CHECK (status IN (
    'online',     -- En ligne (disponible)
    'busy',       -- Occupé (en course)
    'offline',    -- Hors ligne
    'suspended'   -- Suspendu
));

-- 2. MIGRATION DES DONNÉES EXISTANTES
-- ============================================

-- Migrer 'dispatched' vers 'assigned'
UPDATE orders 
SET status = 'assigned', 
    updated_at = NOW()
WHERE status = 'dispatched';

-- Migrer les anciens statuts de chauffeur vers les nouveaux
UPDATE drivers 
SET status = 'online', 
    updated_at = NOW()
WHERE status IN ('available', 'on_break');

UPDATE drivers 
SET status = 'busy', 
    updated_at = NOW()
WHERE status IN ('on_delivery', 'on_vacation');

-- 3. RLS POLICIES POUR L'ADMIN
-- ============================================

-- Permettre à l'admin de modifier les commandes ET les chauffeurs
-- Ceci est essentiel pour la fonction assignOrderToDriver

-- Policy pour que l'admin puisse UPDATE les commandes
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders"
ON orders
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy pour que l'admin puisse UPDATE les chauffeurs
DROP POLICY IF EXISTS "Admin can update drivers" ON drivers;
CREATE POLICY "Admin can update drivers"
ON drivers
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 4. RLS POLICIES POUR LES CHAUFFEURS
-- ============================================

-- Les chauffeurs peuvent voir leurs propres commandes assignées
-- IMPORTANT: driver_id contient l'ID Auth (user_id), pas l'ID de la table drivers
DROP POLICY IF EXISTS "Drivers can view their assigned orders" ON orders;
CREATE POLICY "Drivers can view their assigned orders"
ON orders
FOR SELECT
TO authenticated
USING (
    driver_id = auth.uid() -- ✅ driver_id contient l'ID Auth
    AND EXISTS (
        SELECT 1 FROM drivers
        WHERE drivers.user_id = auth.uid()
    )
);

-- Les chauffeurs peuvent UPDATE leurs propres commandes (accepter, refuser, démarrer, terminer)
DROP POLICY IF EXISTS "Drivers can update their assigned orders" ON orders;
CREATE POLICY "Drivers can update their assigned orders"
ON orders
FOR UPDATE
TO authenticated
USING (
    driver_id = auth.uid() -- ✅ driver_id contient l'ID Auth
    AND EXISTS (
        SELECT 1 FROM drivers
        WHERE drivers.user_id = auth.uid()
    )
)
WITH CHECK (
    driver_id = auth.uid() OR driver_id IS NULL -- Permet de mettre driver_id à NULL lors du refus
);

-- Les chauffeurs peuvent UPDATE leur propre profil
DROP POLICY IF EXISTS "Drivers can update their own profile" ON drivers;
CREATE POLICY "Drivers can update their own profile"
ON drivers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. REALTIME POUR LES CHAUFFEURS
-- ============================================

-- Activer Realtime sur la table orders (déjà activé, ligne commentée pour éviter l'erreur 42718)
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Les chauffeurs ne reçoivent que les updates de LEURS commandes
-- Ceci est géré automatiquement par les RLS policies ci-dessus

-- 6. AJOUT DES COLONNES DE TRACKING DES REFUS (si elles n'existent pas)
-- ============================================

-- Ajouter refusal_count si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'refusal_count'
    ) THEN
        ALTER TABLE orders ADD COLUMN refusal_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ajouter last_refused_by si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'last_refused_by'
    ) THEN
        ALTER TABLE orders ADD COLUMN last_refused_by TEXT;
    END IF;
END $$;

-- 7. INDEX POUR OPTIMISER LES PERFORMANCES
-- ============================================

-- Index sur driver_id pour les requêtes des chauffeurs
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);

-- Index sur status pour les filtres de dispatch
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_orders_driver_status ON orders(driver_id, status);

-- Index sur user_id pour les drivers
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON COLUMN orders.driver_id IS 'ID Auth du chauffeur (user_id), pas l''ID de la table drivers';
COMMENT ON COLUMN orders.status IS 'Statut de la commande: pending_acceptance, accepted, assigned, driver_accepted, driver_refused, in_progress, delivered, cancelled';
COMMENT ON COLUMN orders.refusal_count IS 'Nombre de fois que la commande a été refusée par des chauffeurs';
COMMENT ON COLUMN orders.last_refused_by IS 'Nom du dernier chauffeur ayant refusé la commande';

COMMENT ON COLUMN drivers.status IS 'Statut du chauffeur: online, busy, offline, suspended';
COMMENT ON COLUMN drivers.user_id IS 'ID Auth du chauffeur (lien avec auth.users)';

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier que les contraintes sont bien en place
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND conname IN ('valid_order_status');

SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'drivers'::regclass
AND conname IN ('valid_driver_status');

-- Vérifier les RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('orders', 'drivers')
ORDER BY tablename, policyname;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Ce script garantit que:
-- 1. ✅ driver_id stocke l'ID Auth (user_id) pour correspondre à l'App Chauffeur
-- 2. ✅ Les statuts sont alignés (assigned au lieu de dispatched, busy au lieu de on_delivery)
-- 3. ✅ Les RLS policies permettent à l'admin de modifier les statuts
-- 4. ✅ Les chauffeurs peuvent voir et modifier leurs propres commandes
-- 5. ✅ Le tracking des refus est en place
-- 6. ✅ Les performances sont optimisées avec des index appropriés
