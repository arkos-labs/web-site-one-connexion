-- ===================================================================
-- CORRECTIF POLICIES MESSAGERIE (V2) - SECURITY DEFINER
-- ===================================================================

-- 1. Créer une fonction sécurisée pour vérifier le rôle admin
-- Cette fonction s'exécute avec les droits du créateur (SECURITY DEFINER)
-- ce qui permet de lire auth.users même si l'utilisateur courant ne peut pas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Mettre à jour les policies de la table THREADS
DROP POLICY IF EXISTS "Admins can view all threads" ON public.threads;
DROP POLICY IF EXISTS "Admins can insert threads" ON public.threads;
DROP POLICY IF EXISTS "Admins can update threads" ON public.threads;

CREATE POLICY "Admins can view all threads" ON public.threads
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert threads" ON public.threads
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update threads" ON public.threads
    FOR UPDATE USING (public.is_admin());


-- 3. Mettre à jour les policies de la table PLAINTES
DROP POLICY IF EXISTS "Admins can view all plaintes" ON public.plaintes;
DROP POLICY IF EXISTS "Admins can update plaintes" ON public.plaintes;

CREATE POLICY "Admins can view all plaintes" ON public.plaintes
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update plaintes" ON public.plaintes
    FOR UPDATE USING (public.is_admin());


-- 4. Mettre à jour les policies de la table CONTACT_MESSAGES
DROP POLICY IF EXISTS "Admins view contact" ON public.contact_messages;

CREATE POLICY "Admins view contact" ON public.contact_messages
    FOR SELECT USING (public.is_admin());


-- 5. Vérifier les policies CLIENTS (elles ne doivent pas utiliser auth.users directement)
-- Les policies clients utilisent "user_id = auth.uid()" ce qui est sûr.
-- On s'assure qu'elles sont bien là.

DROP POLICY IF EXISTS "Clients can view own threads" ON public.threads;
DROP POLICY IF EXISTS "Clients can insert threads" ON public.threads;
DROP POLICY IF EXISTS "Clients can update own threads" ON public.threads;

CREATE POLICY "Clients can view own threads" ON public.threads
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can insert threads" ON public.threads
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can update own threads" ON public.threads
    FOR UPDATE USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );
