-- Migration complète : Ajouter les champs détaillés ET migrer les données existantes
-- Date: 2025-12-06
-- Description: Ajoute les nouveaux champs et migre les données depuis les JSONB existants

-- ============================================================================
-- ÉTAPE 1 : Ajouter les nouveaux champs à la table orders
-- ============================================================================

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pickup_contact_name TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS pickup_instructions TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS package_type TEXT,
ADD COLUMN IF NOT EXISTS formula TEXT,
ADD COLUMN IF NOT EXISTS schedule_type TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS billing_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_zip TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_company TEXT,
ADD COLUMN IF NOT EXISTS billing_siret TEXT,
ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- ============================================================================
-- ÉTAPE 2 : Migrer les données existantes depuis les champs JSONB
-- ============================================================================

-- Migrer les informations d'enlèvement depuis expediteur
UPDATE orders
SET 
    pickup_contact_name = expediteur->>'nom',
    pickup_contact_phone = expediteur->>'telephone',
    pickup_instructions = instructions_retrait
WHERE expediteur IS NOT NULL;

-- Migrer les informations de livraison depuis destinataire
UPDATE orders
SET 
    delivery_contact_name = destinataire->>'nom',
    delivery_contact_phone = destinataire->>'telephone',
    delivery_instructions = instructions_livraison
WHERE destinataire IS NOT NULL;

-- Migrer les informations de facturation depuis facturation
UPDATE orders
SET 
    billing_company = facturation->>'societe',
    billing_siret = facturation->>'siret',
    billing_name = facturation->>'nom',
    billing_address = facturation->>'adresse',
    sender_email = COALESCE(email_client, facturation->>'email')
WHERE facturation IS NOT NULL;

-- Migrer le type de colis et la formule
UPDATE orders
SET 
    package_type = delivery_type,
    formula = formule,
    schedule_type = CASE 
        WHEN scheduled_pickup_time IS NOT NULL THEN 'slot'
        ELSE 'asap'
    END
WHERE delivery_type IS NOT NULL OR formule IS NOT NULL;

-- ============================================================================
-- ÉTAPE 3 : Mettre à jour la fonction create_guest_order_v2
-- ============================================================================

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
    p_delivery_lng NUMERIC,
    p_scheduled_pickup_time TIMESTAMPTZ
);

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
    p_scheduled_pickup_time TIMESTAMPTZ DEFAULT NULL
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
    v_pickup_contact_name TEXT;
    v_pickup_contact_phone TEXT;
    v_delivery_contact_name TEXT;
    v_delivery_contact_phone TEXT;
    v_billing_company TEXT;
    v_billing_siret TEXT;
    v_billing_name TEXT;
    v_billing_address TEXT;
    v_billing_zip TEXT;
    v_billing_city TEXT;
    v_schedule_type TEXT;
BEGIN
    -- Générer une référence unique
    v_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    v_random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    v_reference := 'CMD-' || v_date_str || '-' || v_random_suffix;

    -- Extraire les informations de contact depuis les JSONB
    v_pickup_contact_name := p_expediteur->>'nom';
    v_pickup_contact_phone := p_expediteur->>'telephone';
    v_delivery_contact_name := p_destinataire->>'nom';
    v_delivery_contact_phone := p_destinataire->>'telephone';
    
    -- Extraire les informations de facturation
    v_billing_company := p_facturation->>'societe';
    v_billing_siret := p_facturation->>'siret';
    v_billing_name := p_facturation->>'nom';
    v_billing_address := p_facturation->>'adresse';
    
    -- Extraire zip et city de l'adresse de facturation si possible
    -- Format attendu: "adresse, code_postal ville"
    IF v_billing_address IS NOT NULL AND v_billing_address LIKE '%,%' THEN
        -- Essayer d'extraire le code postal et la ville
        v_billing_zip := SPLIT_PART(SPLIT_PART(v_billing_address, ',', 2), ' ', 2);
        v_billing_city := SPLIT_PART(SPLIT_PART(v_billing_address, ',', 2), ' ', 3);
    END IF;
    
    -- Déterminer le type de planification
    IF p_scheduled_pickup_time IS NOT NULL THEN
        v_schedule_type := 'slot';
    ELSE
        v_schedule_type := 'asap';
    END IF;

    -- Insérer la commande avec tous les champs
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
        scheduled_pickup_time,
        -- Nouveaux champs
        pickup_contact_name,
        pickup_contact_phone,
        pickup_instructions,
        delivery_contact_name,
        delivery_contact_phone,
        delivery_instructions,
        package_type,
        formula,
        schedule_type,
        notes,
        billing_name,
        billing_address,
        billing_zip,
        billing_city,
        billing_company,
        billing_siret,
        sender_email,
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
        p_scheduled_pickup_time,
        -- Nouveaux champs
        v_pickup_contact_name,
        v_pickup_contact_phone,
        p_instructions_retrait,
        v_delivery_contact_name,
        v_delivery_contact_phone,
        p_instructions_livraison,
        p_type_colis,
        p_formule,
        v_schedule_type,
        NULL, -- notes (peut être ajouté plus tard)
        v_billing_name,
        v_billing_address,
        v_billing_zip,
        v_billing_city,
        v_billing_company,
        v_billing_siret,
        p_email_client,
        NULL,  -- user_id = NULL pour commande invitée
        NULL,  -- client_id = NULL pour commande invitée
        NOW()
    )
    RETURNING id INTO v_order_id;

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

-- ============================================================================
-- ÉTAPE 4 : Vérification
-- ============================================================================

-- Afficher un échantillon de données migrées
DO $$
DECLARE
    v_count INTEGER;
    v_with_data INTEGER;
BEGIN
    -- Compter le nombre total de commandes
    SELECT COUNT(*) INTO v_count FROM orders;
    
    -- Compter le nombre de commandes avec les nouvelles données
    SELECT COUNT(*) INTO v_with_data 
    FROM orders 
    WHERE pickup_contact_name IS NOT NULL 
       OR delivery_contact_name IS NOT NULL 
       OR billing_company IS NOT NULL;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Migration terminée avec succès !';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de commandes : %', v_count;
    RAISE NOTICE 'Commandes avec données migrées : %', v_with_data;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Nouveaux champs ajoutés :';
    RAISE NOTICE '  - pickup_contact_name, pickup_contact_phone, pickup_instructions';
    RAISE NOTICE '  - delivery_contact_name, delivery_contact_phone, delivery_instructions';
    RAISE NOTICE '  - package_type, formula, schedule_type, notes';
    RAISE NOTICE '  - billing_name, billing_address, billing_zip, billing_city';
    RAISE NOTICE '  - billing_company, billing_siret, sender_email';
    RAISE NOTICE '============================================';
END $$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION create_guest_order_v2 IS 'Crée une commande pour un utilisateur non connecté (invité) avec toutes les informations détaillées (enlèvement, livraison, facturation)';
