-- ============================================================================
-- FIX PERMISSIONS ADMIN : ACCÈS TOTAL
-- ============================================================================
-- Ce script désactive temporairement les restrictions RLS pour les admins
-- et force l'accès à toutes les données.
-- ============================================================================

-- 1. DÉVERROUILLAGE DES TABLES (Policies "Open Bar" pour les Admins)

-- Table: CLIENTS
DROP POLICY IF EXISTS "Admins have full access" ON public.clients;
CREATE POLICY "Admins have full access" ON public.clients
    FOR ALL
    TO authenticated
    USING (
        -- Si l'utilisateur est dans la table admins OU a le rôle admin dans profiles
        EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Table: DRIVERS
DROP POLICY IF EXISTS "Admins have full access" ON public.drivers;
CREATE POLICY "Admins have full access" ON public.drivers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Table: ORDERS
DROP POLICY IF EXISTS "Admins have full access" ON public.orders;
CREATE POLICY "Admins have full access" ON public.orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Table: PROFILES
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. DÉVERROUILLAGE DE LA TABLE ADMINS ELLE-MÊME
-- Important : Les admins doivent pouvoir SE LIRE eux-mêmes pour que les autres policies fonctionnent !
DROP POLICY IF EXISTS "Admins read access" ON public.admins;
CREATE POLICY "Admins read access" ON public.admins
    FOR SELECT
    TO authenticated
    USING (true); -- Tout le monde connecté peut vérifier qui est admin (nécessaire pour le frontend)

-- 3. GRANT PERMISSIONS (Couche SQL bas niveau)
-- Parfois RLS est OK mais les droits SQL manquent
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

RAISE NOTICE '✅ Permissions Admin débloquées sur toutes les tables.';
