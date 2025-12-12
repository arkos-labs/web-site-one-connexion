-- Script pour transformer un utilisateur Auth existant en Chauffeur
DO $$
DECLARE
    target_email TEXT := 'chauffeur_test@driver.oneconnexion'; -- L'email existant
    target_username TEXT := 'chauffeur_test'; -- L'identifiant correspondant
    target_password TEXT := 'password123'; -- Le mot de passe (juste pour l'affichage admin)
    target_user_id UUID;
BEGIN
    -- 1. Récupérer l'ID de l'utilisateur qu'on vient de créer
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec l''email %. Avez-vous bien créé l''utilisateur dans Auth > Users ?', target_email;
    END IF;

    -- 2. Créer ou mettre à jour le profil
    INSERT INTO public.profiles (id, role, email)
    VALUES (target_user_id, 'driver', target_email)
    ON CONFLICT (id) DO UPDATE SET role = 'driver';

    -- 3. Créer la fiche chauffeur
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
    )
    VALUES (
        target_user_id,
        'Chauffeur',
        'Test',
        target_email,
        '0600000000',
        'offline',
        'Scooter',
        'AA-123-BB',
        'Small',
        '12345678900000',
        target_username,
        target_password
    )
    ON CONFLICT (user_id) DO UPDATE SET 
        username = target_username,
        plain_password = target_password;

    RAISE NOTICE 'Chauffeur créé avec succès pour %', target_email;
END $$;
