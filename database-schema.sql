-- ============================================
-- SCRIPT DE CRÉATION DE BASE DE DONNÉES
-- One Connexion - Plateforme de Livraison
-- ============================================

-- 1. TABLE: clients
-- Stocke les informations des clients (entreprises)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations entreprise
    company_name TEXT NOT NULL,
    internal_code TEXT UNIQUE, -- Code interne (ex: CL-0001)
    
    -- Contact
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Informations personnelles
    first_name TEXT,
    last_name TEXT,
    
    -- Adresses
    address TEXT,
    billing_address TEXT,
    
    -- Préférences
    email_notif BOOLEAN DEFAULT true,
    sms_notif BOOLEAN DEFAULT false,
    auto_invoice BOOLEAN DEFAULT false,
    
    -- Statut
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    
    CONSTRAINT clients_email_unique UNIQUE (email)
);

-- 2. TABLE: drivers
-- Stocke les informations des chauffeurs/livreurs
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    
    -- Véhicule
    vehicle_type TEXT, -- ex: "Moto", "Voiture", "Camionnette"
    vehicle_plate TEXT,
    
    -- Statut
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'suspended')),
    
    -- Position GPS (pour le suivi en temps réel)
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    last_position_update TIMESTAMPTZ
);

-- 3. TABLE: orders
-- Stocke toutes les commandes de livraison
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Référence unique
    reference TEXT UNIQUE NOT NULL, -- ex: CMD-2024-1234
    
    -- Relations
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    -- Code client (dénormalisé pour performance)
    client_code TEXT,
    
    -- Adresses
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    
    -- Coordonnées GPS
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),
    
    -- Type et tarif
    delivery_type TEXT NOT NULL, -- ex: "Standard", "Express", "Flash Express"
    price DECIMAL(10, 2) DEFAULT 0,
    
    -- Statut
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')),
    
    -- Informations complémentaires
    notes TEXT,
    package_description TEXT,
    
    -- Dates importantes
    pickup_time TIMESTAMPTZ,
    delivery_time TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ
);

-- 4. TABLE: invoices
-- Stocke les factures des clients
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Référence unique
    reference TEXT UNIQUE NOT NULL, -- ex: FACT-2024-11-001
    
    -- Relation client
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Montants
    amount_ht DECIMAL(10, 2) DEFAULT 0,
    amount_tva DECIMAL(10, 2) DEFAULT 0,
    amount_ttc DECIMAL(10, 2) NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Dates
    due_date DATE,
    paid_date DATE,
    
    -- Fichiers et paiement
    pdf_url TEXT,
    stripe_payment_link TEXT
);

-- 5. TABLE: messages
-- Stocke les messages entre clients et administrateurs
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relations
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Contenu
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Métadonnées
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
    is_read BOOLEAN DEFAULT false,
    
    -- Réponse (optionnel)
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL
);

-- 6. TABLE: complaints
-- Stocke les réclamations des clients
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relations
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    
    -- Contenu
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Résolution
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEX POUR PERFORMANCE
-- ============================================

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_internal_code ON public.clients(internal_code);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Drivers
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_reference ON public.invoices(reference);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON public.messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Complaints
CREATE INDEX IF NOT EXISTS idx_complaints_client_id ON public.complaints(client_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order_id ON public.complaints(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Policies pour CLIENTS
-- Les clients peuvent voir uniquement leurs propres données
CREATE POLICY "Clients can view own data" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clients can update own data" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour ORDERS
-- Les clients peuvent voir uniquement leurs propres commandes
CREATE POLICY "Clients can view own orders" ON public.orders
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can create orders" ON public.orders
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- Policies pour INVOICES
-- Les clients peuvent voir uniquement leurs propres factures
CREATE POLICY "Clients can view own invoices" ON public.invoices
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- Policies pour MESSAGES
-- Les clients peuvent voir uniquement leurs propres messages
CREATE POLICY "Clients can view own messages" ON public.messages
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can create messages" ON public.messages
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- Policies pour COMPLAINTS
-- Les clients peuvent voir uniquement leurs propres réclamations
CREATE POLICY "Clients can view own complaints" ON public.complaints
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- ============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Insérer un client de test
-- Note: Vous devrez d'abord créer un utilisateur dans Supabase Auth
-- et remplacer 'YOUR_USER_ID' par l'ID réel

-- INSERT INTO public.clients (user_id, company_name, internal_code, email, phone, first_name, last_name)
-- VALUES (
--     'YOUR_USER_ID',
--     'Entreprise Test',
--     'CL-0001',
--     'test@example.com',
--     '+33612345678',
--     'Jean',
--     'Dupont'
-- );

-- ============================================
-- FIN DU SCRIPT
-- ============================================
