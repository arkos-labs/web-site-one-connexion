-- ============================================================================
-- SCRIPT DE SÉCURISATION RLS POUR LA TABLE ORDERS
-- ============================================================================
-- Ce script active Row Level Security (RLS) sur la table orders et configure
-- des politiques granulaires pour protéger les données.
--
-- RÔLES SUPPORTÉS :
-- - client : Peut voir et créer uniquement ses propres commandes
-- - admin, super_admin, dispatcher : Accès complet (lecture/écriture)
-- - driver : Peut voir les commandes qui lui sont assignées
--
-- AUTEUR : Expert Sécurité Supabase
-- DATE : 2025-12-19
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : ACTIVER RLS SUR LA TABLE ORDERS
-- ============================================================================

-- Activer RLS sur la table orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER LES ANCIENNES POLITIQUES (SI ELLES EXISTENT)
-- ============================================================================

-- Nettoyer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

-- Politiques spécifiques par rôle (anciennes versions)
DROP POLICY IF EXISTS "clients_can_view_own_orders" ON orders;
DROP POLICY IF EXISTS "clients_can_create_orders" ON orders;
DROP POLICY IF EXISTS "admins_can_view_all_orders" ON orders;
DROP POLICY IF EXISTS "admins_can_modify_all_orders" ON orders;
DROP POLICY IF EXISTS "drivers_can_view_assigned_orders" ON orders;
DROP POLICY IF EXISTS "drivers_can_update_assigned_orders" ON orders;

-- ============================================================================
-- ÉTAPE 3 : CRÉER UNE FONCTION HELPER POUR VÉRIFIER LES RÔLES ADMIN
-- ============================================================================

-- Cette fonction vérifie si l'utilisateur connecté est un admin/dispatcher
CREATE OR REPLACE FUNCTION is_admin_or_dispatcher()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier dans la table admins si l'utilisateur a un rôle admin
  RETURN EXISTS (
    SELECT 1 
    FROM admins 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'dispatcher')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 4 : CRÉER UNE FONCTION HELPER POUR VÉRIFIER LES RÔLES DRIVER
-- ============================================================================

-- Cette fonction vérifie si l'utilisateur connecté est un chauffeur actif
CREATE OR REPLACE FUNCTION is_active_driver()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM drivers 
    WHERE id = auth.uid() 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ÉTAPE 5 : POLITIQUES DE LECTURE (SELECT)
-- ============================================================================

-- Politique 1 : Les clients peuvent voir leurs propres commandes
CREATE POLICY "clients_can_view_own_orders"
ON orders
FOR SELECT
TO authenticated
USING (
  -- L'utilisateur peut voir la commande si :
  -- 1. Il est le client propriétaire de la commande
  auth.uid() = client_id
  OR
  -- 2. Il est un admin/dispatcher
  is_admin_or_dispatcher()
  OR
  -- 3. Il est le chauffeur assigné à cette commande
  (auth.uid() = driver_id AND is_active_driver())
);

-- ============================================================================
-- ÉTAPE 6 : POLITIQUES D'INSERTION (INSERT)
-- ============================================================================

-- Politique 2 : Les utilisateurs authentifiés peuvent créer des commandes
-- MAIS le client_id sera forcé à leur propre ID
CREATE POLICY "authenticated_users_can_create_orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  -- L'utilisateur peut créer une commande si :
  -- 1. Il est un client et le client_id correspond à son auth.uid()
  (auth.uid() = client_id)
  OR
  -- 2. Il est un admin/dispatcher (peut créer pour n'importe quel client)
  is_admin_or_dispatcher()
);

-- ============================================================================
-- ÉTAPE 7 : POLITIQUES DE MISE À JOUR (UPDATE)
-- ============================================================================

-- Politique 3 : Les admins/dispatchers peuvent tout modifier
CREATE POLICY "admins_can_update_all_orders"
ON orders
FOR UPDATE
TO authenticated
USING (is_admin_or_dispatcher())
WITH CHECK (is_admin_or_dispatcher());

-- Politique 4 : Les chauffeurs peuvent mettre à jour leurs commandes assignées
-- (uniquement certains champs comme le statut, la position, etc.)
CREATE POLICY "drivers_can_update_assigned_orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = driver_id 
  AND is_active_driver()
)
WITH CHECK (
  auth.uid() = driver_id 
  AND is_active_driver()
  -- Note : Pour restreindre les champs modifiables par les drivers,
  -- utilisez des triggers ou des contraintes au niveau application
);

-- Politique 5 : Les clients peuvent annuler leurs propres commandes
-- (uniquement si le statut le permet)
CREATE POLICY "clients_can_cancel_own_orders"
ON orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = client_id
  AND status IN ('pending', 'pending_acceptance', 'accepted')
)
WITH CHECK (
  auth.uid() = client_id
  AND status IN ('cancelled')
);

-- ============================================================================
-- ÉTAPE 8 : POLITIQUES DE SUPPRESSION (DELETE)
-- ============================================================================

-- Politique 6 : Seuls les super_admins peuvent supprimer des commandes
CREATE POLICY "only_super_admins_can_delete_orders"
ON orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM admins 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
    AND status = 'active'
  )
);

-- ============================================================================
-- ÉTAPE 9 : CRÉER UN TRIGGER POUR FORCER LE CLIENT_ID À L'INSERTION
-- ============================================================================

-- Cette fonction force le client_id à auth.uid() pour les clients normaux
CREATE OR REPLACE FUNCTION enforce_client_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur n'est pas admin/dispatcher, forcer le client_id
  IF NOT is_admin_or_dispatcher() THEN
    NEW.client_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS enforce_client_id_trigger ON orders;
CREATE TRIGGER enforce_client_id_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_client_id_on_insert();

-- ============================================================================
-- ÉTAPE 10 : CRÉER UN TRIGGER POUR EMPÊCHER LA MODIFICATION DU CLIENT_ID
-- ============================================================================

-- Cette fonction empêche la modification du client_id après création
CREATE OR REPLACE FUNCTION prevent_client_id_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Seuls les super_admins peuvent modifier le client_id
  IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Vous ne pouvez pas modifier le client_id d''une commande';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS prevent_client_id_modification_trigger ON orders;
CREATE TRIGGER prevent_client_id_modification_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_client_id_modification();

-- ============================================================================
-- ÉTAPE 11 : ACTIVER REALTIME AVEC RLS
-- ============================================================================

-- Activer Realtime sur la table orders (si pas déjà fait)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Note : Les événements Realtime respecteront automatiquement les politiques RLS
-- Les clients ne recevront que les mises à jour des commandes qu'ils peuvent voir

-- ============================================================================
-- ÉTAPE 12 : VÉRIFICATION ET TESTS
-- ============================================================================

-- Afficher toutes les politiques actives sur la table orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- ============================================================================
-- NOTES IMPORTANTES POUR LES DÉVELOPPEURS
-- ============================================================================

/*
1. SÉCURITÉ FRONTEND :
   - Le frontend ne doit JAMAIS faire confiance aux données utilisateur
   - Toujours utiliser auth.uid() côté serveur pour identifier l'utilisateur
   - Ne jamais envoyer client_id depuis le frontend pour les clients normaux

2. CRÉATION DE COMMANDES (Frontend) :
   Pour les clients :
   ```typescript
   const { data, error } = await supabase
     .from('orders')
     .insert({
       // NE PAS INCLURE client_id, il sera automatiquement défini
       pickup_address: '...',
       delivery_address: '...',
       // ... autres champs
     });
   ```
   
   Pour les admins :
   ```typescript
   const { data, error } = await supabase
     .from('orders')
     .insert({
       client_id: 'uuid-du-client', // Autorisé pour les admins
       pickup_address: '...',
       // ... autres champs
     });
   ```

3. LECTURE DE COMMANDES :
   Les requêtes SELECT retourneront automatiquement uniquement les commandes
   que l'utilisateur est autorisé à voir selon son rôle.

4. MODIFICATION DE COMMANDES :
   - Clients : Peuvent uniquement annuler leurs commandes (statut → cancelled)
   - Drivers : Peuvent mettre à jour les commandes assignées
   - Admins : Peuvent tout modifier

5. SUPPRESSION :
   Seuls les super_admins peuvent supprimer des commandes.
   Préférez marquer les commandes comme 'cancelled' plutôt que de les supprimer.

6. TESTS RECOMMANDÉS :
   - Tester avec un compte client (doit voir uniquement ses commandes)
   - Tester avec un compte driver (doit voir ses commandes assignées)
   - Tester avec un compte admin (doit tout voir)
   - Tester les tentatives de modification non autorisées
   - Vérifier que client_id ne peut pas être modifié

7. MONITORING :
   - Surveiller les logs Supabase pour détecter les tentatives d'accès non autorisées
   - Activer l'audit logging pour les opérations sensibles

8. PERFORMANCE :
   - Les fonctions is_admin_or_dispatcher() et is_active_driver() sont en SECURITY DEFINER
   - Elles sont optimisées avec des index sur les colonnes id et status
   - Assurez-vous que ces index existent :
     CREATE INDEX IF NOT EXISTS idx_admins_id_role_status ON admins(id, role, status);
     CREATE INDEX IF NOT EXISTS idx_drivers_id_status ON drivers(id, status);
*/

-- ============================================================================
-- COMMANDES DE VÉRIFICATION POST-INSTALLATION
-- ============================================================================

-- Vérifier que RLS est bien activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';
-- Résultat attendu : rowsecurity = true

-- Compter le nombre de politiques actives
SELECT COUNT(*) as nombre_politiques 
FROM pg_policies 
WHERE tablename = 'orders';
-- Résultat attendu : 6 politiques

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ RLS activé et configuré avec succès sur la table orders';
  RAISE NOTICE '✅ 6 politiques de sécurité créées';
  RAISE NOTICE '✅ 2 fonctions helper créées';
  RAISE NOTICE '✅ 2 triggers de protection créés';
  RAISE NOTICE '📖 Consultez les commentaires du script pour les bonnes pratiques';
END $$;
