-- ============================================
-- SÉCURISATION COMPLÈTE DE LA TABLE ORDERS
-- Row Level Security (RLS) Configuration
-- ============================================
-- Ce script active et configure le RLS sur la table orders
-- pour garantir que les utilisateurs ne peuvent accéder qu'à leurs propres données
-- et que seuls les admins/dispatchers ont un accès complet.
--
-- RÈGLES DE SÉCURITÉ:
-- 1. Les clients ne voient que leurs propres commandes (client_id = auth.uid())
-- 2. Les admins/dispatchers peuvent tout voir et tout modifier
-- 3. Les chauffeurs peuvent voir leurs commandes assignées
-- 4. Les insertions forcent le client_id à l'utilisateur authentifié
-- ============================================

-- ============================================
-- ÉTAPE 1: ACTIVER RLS SUR LA TABLE ORDERS
-- ============================================

-- Activer Row Level Security sur la table orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est activé
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS n''est pas activé sur la table orders';
    END IF;
    RAISE NOTICE 'RLS activé avec succès sur la table orders';
END $$;

-- ============================================
-- ÉTAPE 2: SUPPRIMER LES ANCIENNES POLICIES
-- ============================================

-- Nettoyer toutes les anciennes policies pour repartir sur une base saine
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
DROP POLICY IF EXISTS "Drivers can view their assigned orders" ON orders;
DROP POLICY IF EXISTS "Drivers can update their assigned orders" ON orders;
DROP POLICY IF EXISTS "Clients can view their own orders" ON orders;
DROP POLICY IF EXISTS "Clients can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
DROP POLICY IF EXISTS "Dispatchers can view all orders" ON orders;
DROP POLICY IF EXISTS "Dispatchers can update orders" ON orders;

-- ============================================
-- ÉTAPE 3: CRÉER UNE FONCTION HELPER POUR VÉRIFIER LES RÔLES ADMIN/DISPATCHER
-- ============================================

-- Fonction pour vérifier si l'utilisateur est admin ou dispatcher
CREATE OR REPLACE FUNCTION is_admin_or_dispatcher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'dispatcher')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Ajouter un commentaire pour la documentation
COMMENT ON FUNCTION is_admin_or_dispatcher() IS 
'Vérifie si l''utilisateur authentifié a le rôle admin ou dispatcher dans la table profiles';

-- ============================================
-- ÉTAPE 4: POLICIES DE LECTURE (SELECT)
-- ============================================

-- Policy 1: Les admins/dispatchers peuvent tout voir
CREATE POLICY "Admins and dispatchers can view all orders"
ON orders
FOR SELECT
TO authenticated
USING (is_admin_or_dispatcher());

-- Policy 2: Les clients peuvent voir uniquement leurs propres commandes
CREATE POLICY "Clients can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (
    client_id = auth.uid()
    AND NOT is_admin_or_dispatcher() -- Éviter les conflits avec la policy admin
);

-- Policy 3: Les chauffeurs peuvent voir leurs commandes assignées
CREATE POLICY "Drivers can view their assigned orders"
ON orders
FOR SELECT
TO authenticated
USING (
    driver_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM drivers
        WHERE drivers.user_id = auth.uid()
    )
    AND NOT is_admin_or_dispatcher() -- Éviter les conflits avec la policy admin
);

-- ============================================
-- ÉTAPE 5: POLICIES D'INSERTION (INSERT)
-- ============================================

-- Policy 4: Les admins/dispatchers peuvent créer des commandes pour n'importe quel client
CREATE POLICY "Admins and dispatchers can insert orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_dispatcher());

-- Policy 5: Les clients authentifiés peuvent créer des commandes
-- SÉCURITÉ CRITIQUE: Le client_id est FORCÉ à auth.uid() via un trigger
CREATE POLICY "Clients can insert their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
    client_id = auth.uid()
    AND NOT is_admin_or_dispatcher() -- Les admins utilisent leur propre policy
);

-- ============================================
-- ÉTAPE 6: POLICIES DE MODIFICATION (UPDATE)
-- ============================================

-- Policy 6: Les admins/dispatchers peuvent tout modifier
CREATE POLICY "Admins and dispatchers can update all orders"
ON orders
FOR UPDATE
TO authenticated
USING (is_admin_or_dispatcher())
WITH CHECK (is_admin_or_dispatcher());

-- Policy 7: Les chauffeurs peuvent modifier leurs commandes assignées
-- (accepter, refuser, démarrer, terminer)
CREATE POLICY "Drivers can update their assigned orders"
ON orders
FOR UPDATE
TO authenticated
USING (
    driver_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM drivers
        WHERE drivers.user_id = auth.uid()
    )
    AND NOT is_admin_or_dispatcher()
)
WITH CHECK (
    -- Permet de mettre driver_id à NULL lors du refus
    (driver_id = auth.uid() OR driver_id IS NULL)
    AND NOT is_admin_or_dispatcher()
);

-- Policy 8: Les clients peuvent modifier leurs commandes
-- UNIQUEMENT si elles sont en attente d'acceptation (pour annulation)
CREATE POLICY "Clients can update their pending orders"
ON orders
FOR UPDATE
TO authenticated
USING (
    client_id = auth.uid()
    AND status = 'pending_acceptance'
    AND NOT is_admin_or_dispatcher()
)
WITH CHECK (
    client_id = auth.uid()
    AND NOT is_admin_or_dispatcher()
);

-- ============================================
-- ÉTAPE 7: POLICIES DE SUPPRESSION (DELETE)
-- ============================================

-- Policy 9: Seuls les admins peuvent supprimer des commandes
CREATE POLICY "Only admins can delete orders"
ON orders
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- ÉTAPE 8: TRIGGER POUR FORCER LE client_id À auth.uid()
-- ============================================

-- Fonction trigger pour forcer le client_id lors de l'insertion
CREATE OR REPLACE FUNCTION enforce_client_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Si l'utilisateur n'est pas admin/dispatcher, forcer le client_id à auth.uid()
    IF NOT is_admin_or_dispatcher() THEN
        NEW.client_id := auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_enforce_client_id ON orders;

-- Créer le trigger
CREATE TRIGGER trigger_enforce_client_id
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_client_id_on_insert();

COMMENT ON FUNCTION enforce_client_id_on_insert() IS 
'Force le client_id à auth.uid() lors de l''insertion pour les utilisateurs non-admin';

-- ============================================
-- ÉTAPE 9: TRIGGER POUR EMPÊCHER LA MODIFICATION DU client_id
-- ============================================

-- Fonction trigger pour empêcher la modification du client_id
CREATE OR REPLACE FUNCTION prevent_client_id_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Si l'utilisateur n'est pas admin/dispatcher, empêcher la modification du client_id
    IF NOT is_admin_or_dispatcher() AND OLD.client_id != NEW.client_id THEN
        RAISE EXCEPTION 'Vous ne pouvez pas modifier le client_id d''une commande';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_prevent_client_id_modification ON orders;

-- Créer le trigger
CREATE TRIGGER trigger_prevent_client_id_modification
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_client_id_modification();

COMMENT ON FUNCTION prevent_client_id_modification() IS 
'Empêche la modification du client_id pour les utilisateurs non-admin';

-- ============================================
-- ÉTAPE 10: VÉRIFICATIONS ET TESTS
-- ============================================

-- Vérifier que RLS est bien activé
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'orders';

-- Lister toutes les policies actives sur la table orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS operation,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Vérifier les triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name IN ('trigger_enforce_client_id', 'trigger_prevent_client_id_modification');

-- ============================================
-- ÉTAPE 11: TESTS DE SÉCURITÉ (À EXÉCUTER MANUELLEMENT)
-- ============================================

-- TEST 1: Vérifier qu'un utilisateur ne peut pas voir les commandes d'un autre
-- Exécuter en tant que client:
-- SELECT * FROM orders WHERE client_id != auth.uid();
-- Résultat attendu: 0 lignes

-- TEST 2: Vérifier qu'un client peut voir ses propres commandes
-- Exécuter en tant que client:
-- SELECT * FROM orders WHERE client_id = auth.uid();
-- Résultat attendu: Ses commandes uniquement

-- TEST 3: Vérifier qu'un admin peut tout voir
-- Exécuter en tant qu'admin:
-- SELECT * FROM orders;
-- Résultat attendu: Toutes les commandes

-- TEST 4: Vérifier que le client_id est forcé lors de l'insertion
-- Exécuter en tant que client:
-- INSERT INTO orders (client_id, pickup_address, delivery_address, ...) 
-- VALUES ('autre-user-id', 'Adresse A', 'Adresse B', ...);
-- Résultat attendu: Le client_id sera forcé à auth.uid()

-- TEST 5: Vérifier qu'un client ne peut pas modifier le client_id
-- Exécuter en tant que client:
-- UPDATE orders SET client_id = 'autre-user-id' WHERE id = 'mon-order-id';
-- Résultat attendu: Erreur "Vous ne pouvez pas modifier le client_id"

-- ============================================
-- DOCUMENTATION FINALE
-- ============================================

COMMENT ON TABLE orders IS 
'Table des commandes avec RLS activé. Les clients ne voient que leurs propres commandes, les admins/dispatchers ont un accès complet.';

-- ============================================
-- RÉSUMÉ DES SÉCURITÉS MISES EN PLACE
-- ============================================

-- ✅ RLS activé sur la table orders
-- ✅ Les clients ne peuvent voir que leurs propres commandes (client_id = auth.uid())
-- ✅ Les admins/dispatchers peuvent tout voir et tout modifier
-- ✅ Les chauffeurs peuvent voir leurs commandes assignées
-- ✅ Le client_id est forcé à auth.uid() lors de l'insertion (sauf pour les admins)
-- ✅ Le client_id ne peut pas être modifié après création (sauf par les admins)
-- ✅ Les clients ne peuvent modifier que leurs commandes en attente
-- ✅ Seuls les admins peuvent supprimer des commandes
-- ✅ Fonction helper is_admin_or_dispatcher() pour simplifier les policies
-- ✅ Triggers de sécurité pour protéger le client_id

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Pour appliquer ce script:
-- 1. Connectez-vous à votre projet Supabase
-- 2. Allez dans SQL Editor
-- 3. Copiez-collez ce script
-- 4. Exécutez-le
-- 5. Vérifiez les résultats des requêtes de vérification
-- 6. Testez avec différents rôles d'utilisateurs

RAISE NOTICE '✅ Configuration RLS terminée avec succès !';
RAISE NOTICE '⚠️  N''oubliez pas de tester avec différents rôles d''utilisateurs';
RAISE NOTICE '📚 Consultez les commentaires pour la documentation complète';
