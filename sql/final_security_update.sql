-- ===================================================================
-- SCRIPT COMPLET DE MISE À JOUR DE SÉCURITÉ ET SCHÉMA
-- One Connexion - Finalisation
-- ===================================================================

-- 1. TABLE: contact_messages (Manquante dans le schéma initial)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived'))
);

-- RLS pour contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Tout le monde (même non connecté) peut insérer un message
CREATE POLICY "Public can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Seuls les admins peuvent voir les messages
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Seuls les admins peuvent modifier les messages
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );


-- 2. MISE À JOUR TABLE: orders (Ajout des colonnes manquantes pour Guest Order)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS telephone_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS nom_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS expediteur JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS destinataire JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS adresse_retrait JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS adresse_livraison JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS facturation JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS formule TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS bons NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS instructions_retrait TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS instructions_livraison TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_pickup_time TIMESTAMPTZ;


-- 3. MISE À JOUR TABLE: clients (Ajout des colonnes manquantes pour Stats)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;


-- 4. FONCTION: create_guest_order_v2 (Version simple sans contraintes d'événements)
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
        scheduled_pickup_time,
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


-- 5. FONCTION HELPER: is_admin (Si pas déjà créée)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. POLICIES ADMIN (Rappel de sécurité)
-- On supprime les anciennes policies pour éviter les doublons si elles existent
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;

-- Recréation des policies Admin Clients
CREATE POLICY "Admins can view all clients" ON public.clients FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update all clients" ON public.clients FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE USING (is_admin());

-- Policies Admin Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
CREATE POLICY "Admins can insert orders" ON public.orders FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE USING (is_admin());

