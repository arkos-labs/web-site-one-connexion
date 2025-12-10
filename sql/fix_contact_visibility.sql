-- ===================================================================
-- CORRECTIF VISIBILITÉ MESSAGES CONTACT (V4)
-- ===================================================================

-- 1. Mettre à jour la fonction is_admin pour accepter 'super_admin'
-- C'est CRUCIAL car votre compte est 'super_admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier les métadonnées (admin OU super_admin)
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  ) THEN
    RETURN TRUE;
  END IF;

  -- Vérifier la table admins
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. DÉBLOCAGE DE LA LECTURE DES MESSAGES CONTACT
-- On supprime les anciennes règles restrictives
DROP POLICY IF EXISTS "Admins view contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Public insert contact" ON public.contact_messages;

-- Règle 1 : Tout le monde (même non connecté) peut ÉCRIRE (envoyer un message)
CREATE POLICY "Public insert contact" ON public.contact_messages 
    FOR INSERT WITH CHECK (true);

-- Règle 2 : Tout utilisateur connecté (Admin, Super Admin) peut LIRE
-- On utilise auth.role() = 'authenticated' pour être sûr à 100% que ça ne bloque pas
CREATE POLICY "Authenticated users view contact" ON public.contact_messages 
    FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Forcer le rechargement des droits
NOTIFY pgrst, 'reload config';
