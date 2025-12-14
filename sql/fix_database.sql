-- ============================================================================
-- 🚨 SCRIPT DE RÉPARATION URGENTE - Database error querying schema
-- ============================================================================
-- Ce script répare les triggers défaillants qui causent l'erreur 500
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : NETTOYAGE COMPLET DES TRIGGERS EXISTANTS
-- ============================================================================

-- Supprimer tous les triggers sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Supprimer les fonctions triggers associées
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_on_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;

-- ============================================================================
-- ÉTAPE 2 : VÉRIFICATION ET CRÉATION DES TABLES NÉCESSAIRES
-- ============================================================================

-- Table profiles (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'client',
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Table drivers (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.drivers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'offline',
    vehicle_type TEXT,
    vehicle_registration TEXT,
    vehicle_capacity TEXT,
    siret TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);

-- ============================================================================
-- ÉTAPE 3 : NOUVEAU TRIGGER UNIFIÉ ET SÉCURISÉ
-- ============================================================================

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
BEGIN
    -- Récupérer les métadonnées de l'utilisateur
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
    user_email := NEW.email;
    user_first_name := NEW.raw_user_meta_data->>'first_name';
    user_last_name := NEW.raw_user_meta_data->>'last_name';
    user_phone := NEW.raw_user_meta_data->>'phone';

    BEGIN
        -- A. Insérer TOUJOURS dans public.profiles
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
            INSERT INTO public.profiles (
                id,
                role,
                email,
                first_name,
                last_name,
                phone
            ) VALUES (
                NEW.id,
                user_role,
                user_email,
                user_first_name,
                user_last_name,
                user_phone
            );
        ELSE
            UPDATE public.profiles SET
                role = user_role,
                email = user_email,
                first_name = user_first_name,
                last_name = user_last_name,
                phone = user_phone,
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
-- ÉTAPE 4 : CRÉATION DU TRIGGER
-- ============================================================================

CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ÉTAPE 5 : RÉPARATION DES UTILISATEURS EXISTANTS SANS PROFIL
-- ============================================================================

-- Créer des profils pour les utilisateurs qui n'en ont pas
INSERT INTO public.profiles (id, role, email)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'role', 'client') as role,
    u.email
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Créer des entrées drivers pour les chauffeurs qui n'en ont pas
INSERT INTO public.drivers (user_id, email, first_name, last_name, status)
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    'offline'
FROM public.profiles p
WHERE p.role IN ('driver', 'chauffeur')
AND NOT EXISTS (
    SELECT 1 FROM public.drivers d WHERE d.user_id = p.id
);

-- ============================================================================
-- ÉTAPE 6 : VÉRIFICATIONS FINALES
-- ============================================================================

SELECT '=== ✅ TRIGGERS ACTIFS ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

SELECT '=== ✅ FONCTION TRIGGER ===' as info;
SELECT 
    routine_name,
    'Fonction existe' as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

SELECT '=== ✅ UTILISATEURS SANS PROFIL ===' as info;
SELECT 
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Tous les utilisateurs ont un profil'
        ELSE '⚠️ ' || COUNT(*) || ' utilisateurs sans profil'
    END as status
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

SELECT '=== ✅ CHAUFFEURS SANS ENTRÉE DRIVERS ===' as info;
SELECT 
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Tous les chauffeurs ont une entrée drivers'
        ELSE '⚠️ ' || COUNT(*) || ' chauffeurs sans entrée drivers'
    END as status
FROM public.profiles p
WHERE p.role IN ('driver', 'chauffeur')
AND NOT EXISTS (
    SELECT 1 FROM public.drivers d WHERE d.user_id = p.id
);

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ Trigger handle_new_user créé sur auth.users
-- ✅ Fonction handle_new_user existe
-- ✅ Tous les utilisateurs ont un profil
-- ✅ Tous les chauffeurs ont une entrée dans drivers
-- ✅ Plus d'erreur 500 au login !
-- ============================================================================
