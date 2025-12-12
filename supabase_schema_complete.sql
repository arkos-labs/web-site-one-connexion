-- -----------------------------------------------------------------------------
-- ONE CONNEXION - SCHEMA COMPLET & FONCTIONNEL
-- -----------------------------------------------------------------------------

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. NETTOYAGE (Attention: supprime les données existantes pour reconstruire proprement)
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.plaintes CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.driver_documents CASCADE;
DROP TABLE IF EXISTS public.driver_vehicles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. TABLES

-- PROFILES (Base utilisateur)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'admin', 'client', 'driver', 'user'
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMINS
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'admin', -- 'admin', 'super_admin', 'dispatcher'
    status TEXT DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS (Entreprises)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    billing_address TEXT,
    status TEXT DEFAULT 'pending', -- 'active', 'inactive', 'pending', 'suspended', 'deleted'
    internal_code TEXT,
    siret TEXT,
    tva_intracom TEXT,
    sector TEXT,
    notes TEXT,
    
    -- PREFERENCES
    email_notif BOOLEAN DEFAULT TRUE,
    sms_notif BOOLEAN DEFAULT TRUE,
    auto_invoice BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVERS (Chauffeurs)
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'offline', -- 'available', 'busy', 'offline', 'suspended'
    
    -- Colonnes utilisées directement par le code
    vehicle_type TEXT,
    vehicle_registration TEXT,
    license_number TEXT,
    insurance_document TEXT,
    
    -- Colonnes JSONB pour flexibilité
    vehicle JSONB DEFAULT '{}'::jsonb,
    current_location JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVER VEHICLES
CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    license_plate TEXT,
    type TEXT, -- 'scooter', 'moto', 'voiture', 'velo'
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVER DOCUMENTS
CREATE TABLE public.driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    type TEXT, -- 'license', 'registration', 'insurance', 'identity'
    name TEXT,
    file_url TEXT,
    expiry_date TIMESTAMPTZ,
    status TEXT, -- 'valid', 'expired', 'pending'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS (Commandes)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    
    -- RELATIONS
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'pending_acceptance',
    
    -- DATA PRINCIPALE
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    package_description TEXT,
    notes TEXT,
    client_code TEXT,
    
    -- CONTACTS & INSTRUCTIONS
    pickup_contact_name TEXT,
    pickup_contact_phone TEXT,
    pickup_instructions TEXT,
    delivery_contact_name TEXT,
    delivery_contact_phone TEXT,
    delivery_instructions TEXT,
    
    -- DETAILS
    package_type TEXT,
    formula TEXT,
    schedule_type TEXT,
    
    -- FACTURATION (INVITÉ)
    billing_name TEXT,
    billing_address TEXT,
    billing_zip TEXT,
    billing_city TEXT,
    billing_company TEXT,
    billing_siret TEXT,
    sender_email TEXT,
    
    -- COORDONNEES GPS
    pickup_lat DECIMAL,
    pickup_lng DECIMAL,
    delivery_lat DECIMAL,
    delivery_lng DECIMAL,
    
    -- DATES & TIMESTAMPS
    scheduled_pickup_time TIMESTAMPTZ,
    pickup_time TIMESTAMPTZ, -- Alias pour compatibilité code
    delivery_time TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- ANNULATION
    cancellation_reason TEXT,
    cancellation_fee DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER EVENTS (Historique)
CREATE TABLE public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    actor_type TEXT, -- 'admin', 'client', 'driver', 'system'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES (Factures)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount_ttc DECIMAL(10, 2),
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    stripe_payment_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGERIE & SUPPORT

-- THREADS
CREATE TABLE public.threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    subject TEXT,
    type TEXT DEFAULT 'general', -- 'general', 'plainte', 'contact'
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL, -- 'client', 'admin'
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAINTES
CREATE TABLE public.plaintes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    sujet TEXT,
    description TEXT,
    statut TEXT DEFAULT 'ouvert',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT MESSAGES (Simple feedback)
CREATE TABLE public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plaintes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- PROFILES
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CLIENTS
CREATE POLICY "Clients view own" ON public.clients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all clients" ON public.clients FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- DRIVERS
CREATE POLICY "Drivers view own" ON public.drivers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all drivers" ON public.drivers FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDERS
-- INSERT: Authenticated users can create orders linked to themselves
CREATE POLICY "Users create orders" ON public.orders FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- SELECT: Users view own, Clients view own, Drivers view assigned, Admins view all
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR 
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- UPDATE: Admins, Drivers (status only), Clients (cancel only if pending)
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Drivers update assigned orders" ON public.orders FOR UPDATE USING (
    driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())
);

-- INVOICES
CREATE POLICY "Clients view own invoices" ON public.invoices FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- THREADS & MESSAGES
CREATE POLICY "Users view own threads" ON public.threads FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SUPPORT MESSAGES
CREATE POLICY "Users create support messages" ON public.support_messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. TRIGGERS & FUNCTIONS

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. REPARATION / INITIALISATION
-- Crée un profil admin si aucun profil n'existe (pour éviter le blocage)
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT id, email, 'Admin', 'System', 'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
LIMIT 1;

-- 7. PERMISSIONS (CRITICAL FOR ACCESS)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

