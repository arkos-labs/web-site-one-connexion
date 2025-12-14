-- ============================================================================
-- SCRIPT DE RÉPARATION : CRÉATION/RÉINITIALISATION DE L'ADMINISTRATEUR
-- ============================================================================
-- Ce script va :
-- 1. Supprimer l'utilisateur 'cherkinicolas@gmail.com' s'il existe (pour nettoyer)
-- 2. Le recréer avec le mot de passe 'admin123'
-- 3. S'assurer que son profil est bien créé dans public.profiles
-- ============================================================================

DO $$
DECLARE
    new_user_id UUID := 'c64cd4c2-3950-4b3a-a376-4f2734624a8a';
    user_email TEXT := 'cherkinicolas@gmail.com';
    user_password TEXT := 'admin123';
    encrypted_pw TEXT;
BEGIN
    -- 1. Générer le mot de passe crypté
    -- Note: pgcrypto doit être activé. Si ce n'est pas le cas, décommentez la ligne suivante :
    -- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    encrypted_pw := crypt(user_password, gen_salt('bf'));

    -- 2. Supprimer l'utilisateur existant pour repartir sur une base propre
    DELETE FROM auth.users WHERE email = user_email;

    -- 3. Insérer le nouvel utilisateur
    -- On gère le cas où la colonne instance_id existe ou non (dépend de la version Supabase)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'instance_id') THEN
        INSERT INTO auth.users (
            id, 
            instance_id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            raw_user_meta_data, 
            created_at, 
            updated_at, 
            aud, 
            role
        ) VALUES (
            new_user_id, 
            '00000000-0000-0000-0000-000000000000', 
            user_email, 
            encrypted_pw, 
            now(), 
            '{"role": "admin", "full_name": "Nicolas Cherki"}'::jsonb, 
            now(), 
            now(), 
            'authenticated', 
            'authenticated'
        );
    ELSE
        INSERT INTO auth.users (
            id, 
            email, 
            encrypted_password, 
            email_confirmed_at, 
            raw_user_meta_data, 
            created_at, 
            updated_at, 
            aud, 
            role
        ) VALUES (
            new_user_id, 
            user_email, 
            encrypted_pw, 
            now(), 
            '{"role": "admin", "full_name": "Nicolas Cherki"}'::jsonb, 
            now(), 
            now(), 
            'authenticated', 
            'authenticated'
        );
    END IF;

    -- 4. Forcer la création du profil (au cas où le trigger échouerait)
    INSERT INTO public.profiles (id, role, email, first_name, last_name)
    VALUES (new_user_id, 'admin', user_email, 'Nicolas', 'Cherki')
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        email = EXCLUDED.email,
        first_name = 'Nicolas',
        last_name = 'Cherki';

    RAISE NOTICE 'Utilisateur Admin recréé avec succès : % (Mot de passe : %)', user_email, user_password;

END $$;
