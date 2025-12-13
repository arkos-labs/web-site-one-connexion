-- Script de création des 3 utilisateurs (Admin, Client, Chauffeur)
-- Mot de passe commun : 25031997

DO $$
DECLARE
    common_password text := '25031997';
    encrypted_pw text;
    
    -- IDs
    admin_id uuid := gen_random_uuid();
    client_id uuid := gen_random_uuid();
    driver_id uuid := gen_random_uuid();
    
    -- Driver info
    driver_username text := 'rewetreuffibra-4903';
    driver_auth_email text := 'rewetreuffibra-4903@driver.oneconnexion'; -- Email système pour le login username
    driver_contact_email text := 'rewetreuffibra-4903@yopmail.com'; -- Vrai email de contact
BEGIN
    -- Hacher le mot de passe
    encrypted_pw := crypt(common_password, gen_salt('bf', 10));

    ---------------------------------------------------------------------------
    -- 1. ADMIN : cherkinicolas@gmail.com
    ---------------------------------------------------------------------------
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 
        'cherkinicolas@gmail.com', encrypted_pw, now(),
        '{"provider": "email", "providers": ["email"]}', 
        jsonb_build_object('full_name', 'Nicolas Cherki', 'role', 'admin'),
        now(), now(), false
    );

    INSERT INTO public.profiles (id, role, email)
    VALUES (admin_id, 'admin', 'cherkinicolas@gmail.com')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

    ---------------------------------------------------------------------------
    -- 2. CLIENT : keisha.khotothinu@gmail.com
    ---------------------------------------------------------------------------
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', client_id, 'authenticated', 'authenticated', 
        'keisha.khotothinu@gmail.com', encrypted_pw, now(),
        '{"provider": "email", "providers": ["email"]}', 
        jsonb_build_object('full_name', 'Keisha Khotothinu', 'role', 'client'),
        now(), now(), false
    );

    INSERT INTO public.profiles (id, role, email)
    VALUES (client_id, 'client', 'keisha.khotothinu@gmail.com')
    ON CONFLICT (id) DO UPDATE SET role = 'client';

    -- Création d'une entrée client basique (si la table existe et est requise)
    -- INSERT INTO public.clients (user_id, ...) VALUES ... (optionnel selon votre schéma)

    ---------------------------------------------------------------------------
    -- 3. CHAUFFEUR : rewetreuffibra-4903@yopmail.com
    ---------------------------------------------------------------------------
    -- Note : On utilise un email système pour permettre le login par "Identifiant"
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', driver_id, 'authenticated', 'authenticated', 
        driver_auth_email, encrypted_pw, now(),
        '{"provider": "email", "providers": ["email"]}', 
        jsonb_build_object('full_name', 'Chauffeur Yopmail', 'username', driver_username),
        now(), now(), false
    );

    INSERT INTO public.profiles (id, role, email)
    VALUES (driver_id, 'driver', driver_auth_email)
    ON CONFLICT (id) DO UPDATE SET role = 'driver';

    -- Fiche chauffeur complète
    INSERT INTO public.drivers (
        user_id,
        first_name,
        last_name,
        email, -- Ici on met le VRAI email de contact
        phone,
        status,
        vehicle_type,
        vehicle_registration,
        vehicle_capacity,
        siret,
        username,
        plain_password
    ) VALUES (
        driver_id,
        'Rewetreuffibra',
        '4903',
        driver_contact_email, -- rewetreuffibra-4903@yopmail.com
        '0612345678',
        'offline',
        'Van',
        'XX-999-YY',
        'Large',
        '98765432100000',
        driver_username,
        common_password
    );

    RAISE NOTICE 'Utilisateurs créés avec succès !';
END $$;
