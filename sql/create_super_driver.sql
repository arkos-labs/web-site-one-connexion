-- Script ULTIME pour créer un chauffeur complet qui fonctionne
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
    target_username text := 'super_chauffeur';
    target_password text := '123456';
    target_email text := 'super_chauffeur@driver.oneconnexion';
    encrypted_pw text;
BEGIN
    -- 1. Hacher le mot de passe (Bcrypt cost 10)
    encrypted_pw := crypt(target_password, gen_salt('bf', 10));

    -- 2. Créer l'utilisateur dans auth.users (avec TOUS les champs nécessaires pour éviter les bugs)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_token,
        email_change_token_new,
        email_change,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        confirmation_token,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        is_sso_user
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        target_email,
        encrypted_pw,
        now(), -- Email confirmé
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object(
            'full_name', 'Super Chauffeur',
            'username', target_username
        ),
        false,
        now(),
        now(),
        NULL,
        NULL,
        '',
        '',
        0,
        NULL,
        '',
        false
    );

    -- 3. Créer le profil (si pas déjà fait par un trigger)
    INSERT INTO public.profiles (id, role, email)
    VALUES (new_user_id, 'driver', target_email)
    ON CONFLICT (id) DO UPDATE SET role = 'driver';

    -- 4. Créer la fiche chauffeur complète
    INSERT INTO public.drivers (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        vehicle_type,
        vehicle_registration,
        vehicle_capacity,
        siret,
        username,
        plain_password
    ) VALUES (
        new_user_id,
        'Super',
        'Chauffeur',
        target_email,
        '0600000000',
        'offline',
        'Scooter',
        'AA-123-BB',
        '5 colis',
        '12345678900000',
        target_username,
        target_password
    );

    RAISE NOTICE 'Chauffeur créé ! Identifiant: % / Mot de passe: %', target_username, target_password;
END $$;
