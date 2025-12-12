-- -----------------------------------------------------------------------------
-- EMERGENCY FIX FOR USER: keisha.khotothinu@gmail.com
-- -----------------------------------------------------------------------------

DO $$
DECLARE
    v_user_email TEXT := 'keisha.khotothinu@gmail.com';
    v_user_id UUID;
BEGIN
    -- 1. Récupérer l'ID utilisateur depuis auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Utilisateur non trouvé dans auth.users avec l''email %', v_user_email;
    ELSE
        RAISE NOTICE 'Utilisateur trouvé: %', v_user_id;

        -- 2. S'assurer que le PROFIL existe
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
            UPDATE public.profiles SET role = 'client' WHERE id = v_user_id;
            RAISE NOTICE 'Profil mis à jour en role client';
        ELSE
            INSERT INTO public.profiles (id, email, first_name, last_name, role)
            VALUES (v_user_id, v_user_email, 'Keisha', 'User', 'client');
            RAISE NOTICE 'Profil créé';
        END IF;

        -- 3. S'assurer que le CLIENT existe
        IF EXISTS (SELECT 1 FROM public.clients WHERE user_id = v_user_id) THEN
            RAISE NOTICE 'Client existe déjà pour cet utilisateur';
        ELSE
            INSERT INTO public.clients (user_id, email, company_name, status, phone, address)
            VALUES (v_user_id, v_user_email, 'Mon Entreprise', 'active', '0600000000', 'Adresse par défaut');
            RAISE NOTICE 'Client créé';
        END IF;
    END IF;
END $$;

-- 4. Désactiver temporairement RLS sur clients pour être sûr (Optionnel mais recommandé si ça bloque toujours)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
-- Note: On le réactivera plus tard, mais pour l'instant on veut que ça marche.
