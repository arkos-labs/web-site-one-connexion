-- ===================================================================
-- CORRECTIF FINAL POLICIES MESSAGERIE (V3) - HYBRIDE
-- ===================================================================

-- 1. Redéfinir la fonction is_admin pour qu'elle vérifie :
--    SOIT les métadonnées (raw_user_meta_data->>'role' = 'admin')
--    SOIT la table public.admins (si elle existe et contient l'utilisateur)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier d'abord les métadonnées (rapide)
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Sinon vérifier la table admins (si elle existe)
  -- On utilise une requête dynamique ou une vérification simple si on est sûr que la table existe.
  -- Ici, on suppose que la table 'admins' existe comme vu dans le code useAuth.ts
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Réappliquer les policies pour être sûr qu'elles utilisent la nouvelle fonction
-- (Normalement pas nécessaire si la signature de la fonction ne change pas, mais par sécurité)

-- THREADS
DROP POLICY IF EXISTS "Admins can view all threads" ON public.threads;
CREATE POLICY "Admins can view all threads" ON public.threads FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert threads" ON public.threads;
CREATE POLICY "Admins can insert threads" ON public.threads FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update threads" ON public.threads;
CREATE POLICY "Admins can update threads" ON public.threads FOR UPDATE USING (public.is_admin());

-- PLAINTES
DROP POLICY IF EXISTS "Admins can view all plaintes" ON public.plaintes;
CREATE POLICY "Admins can view all plaintes" ON public.plaintes FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update plaintes" ON public.plaintes;
CREATE POLICY "Admins can update plaintes" ON public.plaintes FOR UPDATE USING (public.is_admin());

-- CONTACT MESSAGES
DROP POLICY IF EXISTS "Admins view contact" ON public.contact_messages;
CREATE POLICY "Admins view contact" ON public.contact_messages FOR SELECT USING (public.is_admin());

-- 3. S'assurer que la table admins a des policies (si elle n'en a pas, personne ne peut la lire sauf le service role)
-- Le useAuth lit la table admins, donc elle doit être lisible par l'utilisateur lui-même ou par tout le monde authentifié ?
-- Généralement, un user doit pouvoir lire sa propre ligne dans admins.
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own admin profile" ON public.admins
    FOR SELECT USING (user_id = auth.uid());
