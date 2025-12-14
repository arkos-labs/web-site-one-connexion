-- ============================================================================
-- 🚀 MISE À JOUR : Système d'inscription Chauffeur (Modèle Uber)
-- ============================================================================
-- Ce script ajoute les champs nécessaires pour le flux d'inscription par email
-- avec validation administrative
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : MODIFICATION DE LA TABLE PROFILES
-- ============================================================================

-- Ajouter le champ 'status' pour la validation administrative
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Ajouter le champ 'driver_id' pour l'identifiant unique du chauffeur
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS driver_id TEXT UNIQUE;

-- Ajouter le champ 'phone' s'il n'existe pas déjà
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_driver_id ON public.profiles(driver_id);

-- Commentaires pour la documentation
COMMENT ON COLUMN public.profiles.status IS 'Statut du compte: pending (en attente), approved (validé), rejected (rejeté)';
COMMENT ON COLUMN public.profiles.driver_id IS 'Identifiant unique du chauffeur, généré par l''admin après validation';
COMMENT ON COLUMN public.profiles.phone IS 'Numéro de téléphone de l''utilisateur';

-- ============================================================================
-- ÉTAPE 2 : MISE À JOUR DU TRIGGER handle_new_user
-- ============================================================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Créer la nouvelle fonction avec gestion du status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Permet d'exécuter avec les droits système
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    user_status TEXT;
BEGIN
    -- Récupérer les métadonnées de l'utilisateur
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    user_email := NEW.email;
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    user_last_name := NEW.raw_user_meta_data->>'last_name';
    user_phone := NEW.raw_user_meta_data->>'phone';
    
    -- Définir le statut par défaut
    -- Les chauffeurs sont en 'pending' par défaut, les autres sont 'approved'
    IF user_role IN ('driver', 'chauffeur') THEN
        user_status := 'pending';
    ELSE
        user_status := 'approved';
    END IF;

    BEGIN
        -- A. Insérer TOUJOURS dans public.profiles
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
            INSERT INTO public.profiles (
                id,
                role,
                email,
                first_name,
                last_name,
                phone,
                status,
                driver_id
            ) VALUES (
                NEW.id,
                user_role,
                user_email,
                user_first_name,
                user_last_name,
                user_phone,
                user_status,
                NULL  -- driver_id sera généré par l'admin lors de la validation
            );
        ELSE
            UPDATE public.profiles SET
                role = user_role,
                email = user_email,
                first_name = user_first_name,
                last_name = user_last_name,
                phone = user_phone,
                status = user_status,
                updated_at = NOW()
            WHERE id = NEW.id;
        END IF;

        -- B. Si le rôle est 'driver' ou 'chauffeur', insérer dans drivers
        IF user_role IN ('driver', 'chauffeur') THEN
            IF NOT EXISTS (SELECT 1 FROM public.drivers WHERE user_id = NEW.id) THEN
                INSERT INTO public.drivers (
                    user_id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    status
                ) VALUES (
                    NEW.id,
                    user_first_name,
                    user_last_name,
                    user_email,
                    user_phone,
                    'offline'
                );
            ELSE
                UPDATE public.drivers SET
                    first_name = user_first_name,
                    last_name = user_last_name,
                    email = user_email,
                    phone = user_phone,
                    updated_at = NOW()
                WHERE user_id = NEW.id;
            END IF;
        END IF;

        -- C. Si le rôle est 'client', insérer dans clients (si la table existe)
        IF user_role = 'client' THEN
            -- Vérifier si la table clients existe
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'clients'
            ) THEN
                IF NOT EXISTS (SELECT 1 FROM public.clients WHERE user_id = NEW.id) THEN
                    INSERT INTO public.clients (
                        user_id,
                        first_name,
                        last_name,
                        email,
                        phone,
                        company_name,
                        status
                    ) VALUES (
                        NEW.id,
                        user_first_name,
                        user_last_name,
                        user_email,
                        user_phone,
                        COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise'),
                        'active'
                    );
                ELSE
                    UPDATE public.clients SET
                        first_name = user_first_name,
                        last_name = user_last_name,
                        email = user_email,
                        phone = user_phone,
                        updated_at = NOW()
                    WHERE user_id = NEW.id;
                END IF;
            END IF;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, on log mais on ne fait PAS planter le login
        RAISE WARNING 'Erreur dans handle_new_user pour user %: %', NEW.id, SQLERRM;
        -- On retourne quand même NEW pour que l'insertion dans auth.users réussisse
    END;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- ÉTAPE 3 : CRÉATION DU NOUVEAU TRIGGER
-- ============================================================================

CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 4 : MISE À JOUR DES DONNÉES EXISTANTES
-- ============================================================================

-- Mettre à jour le statut des utilisateurs existants
-- Les clients et admins sont automatiquement approuvés
UPDATE public.profiles
SET status = 'approved'
WHERE role IN ('client', 'admin')
AND (status IS NULL OR status = 'pending');

-- Les chauffeurs existants sans driver_id restent en pending
-- (ils devront être validés par l'admin)
UPDATE public.profiles
SET status = COALESCE(status, 'pending')
WHERE role IN ('driver', 'chauffeur')
AND driver_id IS NULL;

-- ============================================================================
-- ÉTAPE 5 : VÉRIFICATIONS FINALES
-- ============================================================================

SELECT '=== ✅ COLONNES AJOUTÉES ===' as info;
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('status', 'driver_id', 'phone');

SELECT '=== ✅ INDEX CRÉÉS ===' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'profiles'
AND indexname IN ('idx_profiles_status', 'idx_profiles_driver_id');

SELECT '=== ✅ TRIGGER ACTIF ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'handle_new_user';

SELECT '=== ✅ FONCTION TRIGGER ===' as info;
SELECT 
    routine_name,
    'Fonction existe et mise à jour' as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

SELECT '=== ✅ STATUTS DES PROFILS ===' as info;
SELECT 
    role,
    status,
    COUNT(*) as count
FROM public.profiles
GROUP BY role, status
ORDER BY role, status;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Colonne 'status' ajoutée à profiles (default: 'pending')
-- ✅ Colonne 'driver_id' ajoutée à profiles (nullable, unique)
-- ✅ Colonne 'phone' ajoutée à profiles
-- ✅ Trigger handle_new_user mis à jour avec gestion du status
-- ✅ Les nouveaux chauffeurs seront en 'pending' par défaut
-- ✅ Les clients seront en 'approved' par défaut
-- ============================================================================
