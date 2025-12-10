-- ===================================================================
-- SOLUTION RADICALE : DÉSACTIVATION TEMPORAIRE SÉCURITÉ
-- ===================================================================
-- Ce script désactive la sécurité sur la table contact_messages
-- pour confirmer si le problème vient des "Policies".

-- 1. Désactiver Row Level Security sur la table
ALTER TABLE public.contact_messages DISABLE ROW LEVEL SECURITY;

-- 2. Donner tous les droits à tout le monde (pour le test)
GRANT ALL ON public.contact_messages TO anon, authenticated, service_role;

-- 3. S'assurer que la fonction is_admin est valide et sécurisée
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Accepter admin OU super_admin
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'super_admin')
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recharger la configuration
NOTIFY pgrst, 'reload config';
