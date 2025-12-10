-- ============================================
-- TRIGGER : Synchronisation automatique de l'email
-- Met à jour l'email dans la table 'clients' quand il change dans 'auth.users'
-- ============================================

-- 1. Créer la fonction qui synchronise l'email
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email a changé
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    -- Mettre à jour l'email dans la table clients
    UPDATE public.clients
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE user_id = NEW.id;
    
    RAISE NOTICE 'Email mis à jour pour l''utilisateur % : % -> %', NEW.id, OLD.email, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;

-- 3. Créer le trigger qui s'exécute après la mise à jour d'un utilisateur
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_change();

-- 4. Vérifier que le trigger a été créé
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_email_changed';

-- ============================================
-- COMMENT ÇA FONCTIONNE
-- ============================================
-- 1. L'utilisateur change son email dans les Paramètres
-- 2. Supabase envoie un email de confirmation à la NOUVELLE adresse
-- 3. L'utilisateur clique sur le lien de confirmation
-- 4. Supabase met à jour l'email dans auth.users
-- 5. Le trigger se déclenche automatiquement
-- 6. L'email est mis à jour dans la table clients
-- 7. L'utilisateur voit le nouvel email partout dans l'application
-- ============================================
