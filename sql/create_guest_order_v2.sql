CREATE OR REPLACE FUNCTION public.create_guest_order_v2(
    p_email_client text,
    p_telephone_client text,
    p_nom_client text,
    p_expediteur jsonb,
    p_destinataire jsonb,
    p_adresse_retrait jsonb,
    p_adresse_livraison jsonb,
    p_pickup_address text,
    p_delivery_address text,
    p_facturation jsonb,
    p_type_colis text,
    p_formule text,
    p_prix numeric,
    p_bons numeric,
    p_instructions_retrait text,
    p_instructions_livraison text,
    p_pickup_lat numeric,
    p_pickup_lng numeric,
    p_delivery_lat numeric,
    p_delivery_lng numeric,
    p_scheduled_pickup_time timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_client_id uuid;
    v_order_id uuid;
    v_reference text;
    v_billing_city text;
    v_billing_zip text;
BEGIN
    -- 1. Gestion du Client (CRM)
    -- On cherche si un client existe déjà avec cet email
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE email = p_email_client
    LIMIT 1;

    -- Si pas de client, on le crée (Profil Invité/CRM)
    IF v_client_id IS NULL THEN
        INSERT INTO public.clients (
            email,
            phone,
            first_name,
            last_name,
            company_name,
            status,
            created_at,
            updated_at
        ) VALUES (
            p_email_client,
            p_telephone_client,
            split_part(p_nom_client, ' ', 1),
            substring(p_nom_client from position(' ' in p_nom_client) + 1),
            p_facturation->>'societe', -- Peut être null
            'guest',
            now(),
            now()
        )
        RETURNING id INTO v_client_id;
    END IF;

    -- 2. Génération de la référence
    -- Format: CMD-YYYYMMDD-XXXX (ex: CMD-20231214-A1B2)
    v_reference := 'CMD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 4));

    -- 3. Création de la commande
    INSERT INTO public.orders (
        client_id,
        user_id, -- NULL pour guest
        reference,
        status,
        
        -- Expéditeur / Contact Retrait
        sender_email,
        pickup_address,
        pickup_contact_name,
        pickup_contact_phone,
        pickup_instructions,
        pickup_lat,
        pickup_lng,
        pickup_time, -- Sera mis à jour lors de l'acceptation/dispatch
        scheduled_pickup_time, -- Pour les commandes différées

        -- Destinataire / Livraison
        delivery_address,
        delivery_contact_name,
        delivery_contact_phone,
        delivery_instructions,
        delivery_lat,
        delivery_lng,

        -- Colis & Service
        package_type,
        package_description,
        formula,
        delivery_type, -- AJOUTÉ : Requis par la table orders
        price,
        
        -- Facturation
        billing_name,
        billing_company,
        billing_address,
        billing_siret,
        
        created_at,
        updated_at
    ) VALUES (
        v_client_id,
        NULL, -- Guest
        v_reference,
        'pending_acceptance', -- Statut initial
        
        p_email_client,
        p_pickup_address,
        p_expediteur->>'nom',
        p_expediteur->>'telephone',
        p_instructions_retrait,
        p_pickup_lat,
        p_pickup_lng,
        NULL,
        p_scheduled_pickup_time,

        p_delivery_address,
        p_destinataire->>'nom',
        p_destinataire->>'telephone',
        p_instructions_livraison,
        p_delivery_lat,
        p_delivery_lng,

        p_type_colis,
        p_type_colis, -- On met la même chose en description pour l'instant
        p_formule,
        p_formule, -- On utilise la formule comme delivery_type (ex: NORMAL, EXPRESS)
        p_prix,

        p_facturation->>'nom',
        p_facturation->>'societe',
        p_facturation->>'adresse',
        p_facturation->>'siret',

        now(),
        now()
    )
    RETURNING id INTO v_order_id;

    -- 4. Retour
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'reference', v_reference,
        'message', 'Commande invitée créée avec succès'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Erreur lors de la création de la commande: ' || SQLERRM
    );
END;
$function$;
