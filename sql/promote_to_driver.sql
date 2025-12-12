-- Transformer un utilisateur existant en chauffeur
DO $$
DECLARE
    target_email TEXT := 'cherkinicolas38@gmail.com';
    target_user_id UUID;
BEGIN
    -- 1. Récupérer l'ID de l'utilisateur
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec l''email %', target_email;
    END IF;

    -- 2. Mettre à jour le rôle dans public.profiles (si la table existe et est utilisée pour le rôle)
    -- Note: Si vous utilisez une autre méthode pour les rôles, adaptez ici.
    UPDATE public.profiles 
    SET role = 'driver' 
    WHERE id = target_user_id;

    -- 3. Créer l'entrée dans la table public.drivers
    INSERT INTO public.drivers (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        status,
        vehicle_type,
        vehicle_registration,
        created_at,
        updated_at
    )
    VALUES (
        target_user_id,
        'Voiture',   -- Prénom du screenshot
        'fw852035',  -- Nom du screenshot
        target_email,
        '+33666020258', -- Téléphone du screenshot
        'offline',
        'Scooter',      -- Valeur par défaut (à modifier plus tard dans l'app)
        'XX-999-ZZ',    -- Valeur par défaut (à modifier plus tard dans l'app)
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING; -- Évite l'erreur si déjà chauffeur

    RAISE NOTICE 'Utilisateur % transformé en chauffeur avec succès.', target_email;
END $$;
