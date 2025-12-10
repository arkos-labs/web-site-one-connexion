-- ===================================================================
-- POLICIES RLS POUR LES ADMINISTRATEURS
-- One Connexion - Correctif Modal Nouvelle Commande
-- ===================================================================

-- 1. Fonction helper pour vérifier si l'utilisateur est admin
-- Cette fonction vérifie le rôle dans les métadonnées de l'utilisateur
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- POLICIES POUR LA TABLE CLIENTS
-- ===================================================================

-- Les admins peuvent voir tous les clients
CREATE POLICY "Admins can view all clients" ON public.clients
    FOR SELECT USING (is_admin());

-- Les admins peuvent créer des clients
CREATE POLICY "Admins can insert clients" ON public.clients
    FOR INSERT WITH CHECK (is_admin());

-- Les admins peuvent modifier tous les clients
CREATE POLICY "Admins can update all clients" ON public.clients
    FOR UPDATE USING (is_admin());

-- Les admins peuvent supprimer des clients
CREATE POLICY "Admins can delete clients" ON public.clients
    FOR DELETE USING (is_admin());

-- ===================================================================
-- POLICIES POUR LA TABLE ORDERS
-- ===================================================================

-- Les admins peuvent voir toutes les commandes
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (is_admin());

-- Les admins peuvent créer des commandes
CREATE POLICY "Admins can insert orders" ON public.orders
    FOR INSERT WITH CHECK (is_admin());

-- Les admins peuvent modifier toutes les commandes
CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (is_admin());

-- Les admins peuvent supprimer des commandes
CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE USING (is_admin());

-- ===================================================================
-- POLICIES POUR LA TABLE DRIVERS
-- ===================================================================

-- Les admins peuvent voir tous les chauffeurs
CREATE POLICY "Admins can view all drivers" ON public.drivers
    FOR SELECT USING (is_admin());

-- Les admins peuvent créer des chauffeurs
CREATE POLICY "Admins can insert drivers" ON public.drivers
    FOR INSERT WITH CHECK (is_admin());

-- Les admins peuvent modifier tous les chauffeurs
CREATE POLICY "Admins can update all drivers" ON public.drivers
    FOR UPDATE USING (is_admin());

-- Les admins peuvent supprimer des chauffeurs
CREATE POLICY "Admins can delete drivers" ON public.drivers
    FOR DELETE USING (is_admin());

-- ===================================================================
-- POLICIES POUR LA TABLE INVOICES
-- ===================================================================

-- Les admins peuvent voir toutes les factures
CREATE POLICY "Admins can view all invoices" ON public.invoices
    FOR SELECT USING (is_admin());

-- Les admins peuvent créer des factures
CREATE POLICY "Admins can insert invoices" ON public.invoices
    FOR INSERT WITH CHECK (is_admin());

-- Les admins peuvent modifier toutes les factures
CREATE POLICY "Admins can update all invoices" ON public.invoices
    FOR UPDATE USING (is_admin());

-- ===================================================================
-- POLICIES POUR LA TABLE MESSAGES
-- ===================================================================

-- Les admins peuvent voir tous les messages
CREATE POLICY "Admins can view all messages" ON public.messages
    FOR SELECT USING (is_admin());

-- Les admins peuvent créer des messages
CREATE POLICY "Admins can insert messages" ON public.messages
    FOR INSERT WITH CHECK (is_admin());

-- Les admins peuvent modifier tous les messages
CREATE POLICY "Admins can update all messages" ON public.messages
    FOR UPDATE USING (is_admin());

-- ===================================================================
-- POLICIES POUR LA TABLE COMPLAINTS
-- ===================================================================

-- Les admins peuvent voir toutes les réclamations
CREATE POLICY "Admins can view all complaints" ON public.complaints
    FOR SELECT USING (is_admin());

-- Les admins peuvent modifier toutes les réclamations
CREATE POLICY "Admins can update all complaints" ON public.complaints
    FOR UPDATE USING (is_admin());

-- ===================================================================
-- VÉRIFICATION
-- ===================================================================

-- Pour vérifier que les policies sont bien créées :
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ===================================================================
-- FIN DU SCRIPT
-- ===================================================================
