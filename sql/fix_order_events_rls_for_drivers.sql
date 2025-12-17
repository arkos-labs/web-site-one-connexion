-- =====================================================
-- DEBUG: Vérifier la structure de order_events et tester l'insertion
-- =====================================================

-- 1. Voir la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_events';

-- 2. Lister toutes les politiques RLS sur order_events
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'order_events';

-- 3. Supprimer les anciennes politiques et en créer une plus simple
DROP POLICY IF EXISTS "Drivers can insert their own events" ON order_events;
DROP POLICY IF EXISTS "System can insert events" ON order_events;

-- 4. Créer une politique plus permissive pour les utilisateurs authentifiés
-- Permet à tout utilisateur authentifié d'insérer des événements
CREATE POLICY "Authenticated users can insert events"
ON order_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Créer une politique pour lire les événements (admin et drivers)
DROP POLICY IF EXISTS "Drivers can read events for their orders" ON order_events;

CREATE POLICY "Authenticated users can read events"
ON order_events
FOR SELECT
TO authenticated
USING (true);
