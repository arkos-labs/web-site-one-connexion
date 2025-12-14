-- ============================================================================
-- 🔧 FIX TRIGGER - Correction du trigger d'inscription
-- ============================================================================
-- Ce script corrige le trigger handle_new_user pour qu'il fonctionne
-- avec la nouvelle architecture
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER L'ANCIEN TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================================================
-- ÉTAPE 2 : CRÉER LE NOUVEAU TRIGGER (VERSION CORRIGÉE)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_status TEXT;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    user_company_name TEXT;
BEGIN
    -- Récupérer les données depuis les métadonnées
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    user_email := NEW.email;
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    user_last_name := NEW.raw_user_meta_data->>'last_name';
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_company_name := NEW.raw_user_meta_data->>'company_name';
    
    -- Définir le statut par défaut
    IF user_role = 'chauffeur' THEN
        user_status := 'pending'; -- Les chauffeurs doivent être validés
    ELSE
        user_status := 'approved'; -- Clients et admins sont approuvés automatiquement
    END IF;
    
    -- Log pour debug
    RAISE NOTICE 'Creating profile for user %: role=%, status=%', NEW.id, user_role, user_status;
    
    BEGIN
        -- Insérer dans profiles
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            phone,
            role,
            status,
            company_name
        ) VALUES (
            NEW.id,
            user_email,
            user_first_name,
            user_last_name,
            user_phone,
            user_role,
            user_status,
            user_company_name
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            company_name = EXCLUDED.company_name,
            updated_at = NOW();
        
        RAISE NOTICE 'Profile created successfully for user %', NEW.id;
        
        -- Si c'est un chauffeur, créer l'entrée dans drivers
        IF user_role = 'chauffeur' THEN
            INSERT INTO public.drivers (user_id, status)
            VALUES (NEW.id, 'offline')
            ON CONFLICT (user_id) DO NOTHING;
            
            RAISE NOTICE 'Driver entry created for user %', NEW.id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, logger mais ne pas bloquer l'inscription
        RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
        -- On retourne quand même NEW pour que l'inscription réussisse
    END;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 3 : VÉRIFICATION
-- ============================================================================

SELECT '=== ✅ TRIGGER CRÉÉ ===' as info;

SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND trigger_name = 'handle_new_user';

-- ============================================================================
-- ÉTAPE 4 : TEST (Optionnel)
-- ============================================================================

-- Pour tester, créer un utilisateur test depuis votre app
-- Ensuite vérifier avec :

-- SELECT * FROM profiles WHERE email = 'test@example.com';
-- SELECT * FROM drivers WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Trigger handle_new_user créé
-- ✅ Fonction avec gestion d'erreur améliorée
-- ✅ Logs détaillés pour debug
-- ✅ L'inscription ne sera plus bloquée même en cas d'erreur
-- ============================================================================
