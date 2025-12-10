-- Migration: Ajouter support scheduled_pickup_time à la table orders et create_guest_order_v2
-- Date: 2025-12-06
-- Description: Permet aux commandes invitées d'avoir un horaire planifié

-- ÉTAPE 1: Ajouter la colonne scheduled_pickup_time à la table orders (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'scheduled_pickup_time'
    ) THEN
        ALTER TABLE orders 
        ADD COLUMN scheduled_pickup_time TIMESTAMPTZ DEFAULT NULL;
        
        RAISE NOTICE 'Colonne scheduled_pickup_time ajoutée à la table orders';
    ELSE
        RAISE NOTICE 'Colonne scheduled_pickup_time existe déjà';
    END IF;
END $$;

-- ÉTAPE 2: Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS create_guest_order_v2(
    p_email_client TEXT,
    p_telephone_client TEXT,
    p_nom_client TEXT,
    p_expediteur JSONB,
    p_destinataire JSONB,
    p_adresse_retrait JSONB,
    p_adresse_livraison JSONB,
    p_pickup_address TEXT,
    p_delivery_address TEXT,
    p_facturation JSONB,
    p_type_colis TEXT,
    p_formule TEXT,
    p_prix NUMERIC,
    p_bons NUMERIC,
    p_instructions_retrait TEXT,
    p_instructions_livraison TEXT,
    p_pickup_lat NUMERIC,
    p_pickup_lng NUMERIC,
    p_delivery_lat NUMERIC,
    p_delivery_lng NUMERIC
);

-- ÉTAPE 3: Créer la nouvelle version avec scheduled_pickup_time
CREATE OR REPLACE FUNCTION create_guest_order_v2(
    p_email_client TEXT,
    p_telephone_client TEXT,
    p_nom_client TEXT,
    p_expediteur JSONB,
    p_destinataire JSONB,
    p_adresse_retrait JSONB,
    p_adresse_livraison JSONB,
    p_pickup_address TEXT,
    p_delivery_address TEXT,
    p_facturation JSONB,
    p_type_colis TEXT,
    p_formule TEXT,
    p_prix NUMERIC,
    p_bons NUMERIC,
    p_instructions_retrait TEXT DEFAULT NULL,
    p_instructions_livraison TEXT DEFAULT NULL,
    p_pickup_lat NUMERIC DEFAULT NULL,
    p_pickup_lng NUMERIC DEFAULT NULL,
    p_delivery_lat NUMERIC DEFAULT NULL,
    p_delivery_lng NUMERIC DEFAULT NULL,
    p_scheduled_pickup_time TIMESTAMPTZ DEFAULT NULL  -- ✅ NOUVEAU PARAMÈTRE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_reference TEXT;
    v_date_str TEXT;
    v_random_suffix TEXT;
BEGIN
    -- Générer une référence unique
    v_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    v_random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    v_reference := 'CMD-' || v_date_str || '-' || v_random_suffix;

    -- Insérer la commande
    INSERT INTO orders (
        reference,
        email_client,
        telephone_client,
        nom_client,
        expediteur,
        destinataire,
        adresse_retrait,
        adresse_livraison,
        pickup_address,
        delivery_address,
        facturation,
        delivery_type,
        formule,
        price,
        bons,
        status,
        instructions_retrait,
        instructions_livraison,
        pickup_lat,
        pickup_lng,
        delivery_lat,
        delivery_lng,
        scheduled_pickup_time,  -- ✅ NOUVEAU CHAMP
        user_id,
        client_id,
        created_at
    ) VALUES (
        v_reference,
        p_email_client,
        p_telephone_client,
        p_nom_client,
        p_expediteur,
        p_destinataire,
        p_adresse_retrait,
        p_adresse_livraison,
        p_pickup_address,
        p_delivery_address,
        p_facturation,
        p_type_colis,
        p_formule,
        p_prix,
        p_bons,
        'pending_acceptance',
        p_instructions_retrait,
        p_instructions_livraison,
        p_pickup_lat,
        p_pickup_lng,
        p_delivery_lat,
        p_delivery_lng,
        p_scheduled_pickup_time,  -- ✅ NOUVEAU CHAMP
        NULL,  -- user_id = NULL pour commande invitée
        NULL,  -- client_id = NULL pour commande invitée
        NOW()
    )
    RETURNING id INTO v_order_id;

    -- Créer un événement de création
    INSERT INTO order_events (
        order_id,
        event_type,
        description,
        metadata
    ) VALUES (
        v_order_id,
        'order_created',
        'Commande créée par un client invité',
        jsonb_build_object(
            'email', p_email_client,
            'is_guest', true,
            'scheduled', p_scheduled_pickup_time IS NOT NULL
        )
    );

    -- Retourner le résultat
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'reference', v_reference,
        'message', 'Commande créée avec succès'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la création de la commande'
        );
END;
$$;

-- Commentaire
COMMENT ON FUNCTION create_guest_order_v2 IS 'Crée une commande pour un utilisateur non connecté (invité) avec support des horaires planifiés';

-- Vérification
DO $$
BEGIN
    RAISE NOTICE '✅ Migration terminée avec succès';
    RAISE NOTICE '✅ Colonne scheduled_pickup_time disponible dans orders';
    RAISE NOTICE '✅ Fonction create_guest_order_v2 mise à jour';
END $$;
