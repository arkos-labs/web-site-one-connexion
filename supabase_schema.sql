-- -----------------------------------------------------------------------------
-- ONE CONNEXION - SCHEMA DE BASE DE DONNEES (RECONSTRUCTION & SECURITE RLS)
-- Généré par Antigravity - Expert Supabase
-- Date: 2025-12-12
-- -----------------------------------------------------------------------------

-- 1. NETTOYAGE (DROP)
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.plaintes CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.driver_documents CASCADE;
DROP TABLE IF EXISTS public.driver_vehicles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Types
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.driver_status CASCADE;
DROP TYPE IF EXISTS public.vehicle_type CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.document_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.thread_type CASCADE;
DROP TYPE IF EXISTS public.thread_status CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'client', 'driver', 'user');
CREATE TYPE public.order_status AS ENUM ('pending_acceptance', 'accepted', 'dispatched', 'in_progress', 'delivered', 'cancelled');
CREATE TYPE public.driver_status AS ENUM ('online', 'offline', 'on_delivery', 'on_break', 'on_vacation', 'busy', 'available', 'suspended');
CREATE TYPE public.vehicle_type AS ENUM ('scooter', 'moto', 'voiture', 'utilitaire', 'velo');
CREATE TYPE public.document_type AS ENUM ('license', 'registration', 'insurance', 'identity', 'kbis', 'autre');
CREATE TYPE public.document_status AS ENUM ('valid', 'expired', 'pending', 'rejected');
CREATE TYPE public.thread_type AS ENUM ('general', 'plainte', 'contact');
CREATE TYPE public.thread_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'new', 'read', 'replied', 'archived');

-- 4. TABLES

-- PROFILES (Base utilisateur)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role DEFAULT 'user',
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS (Entités Business)
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Lien vers le user (propriétaire)
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    siret TEXT,
    vat_number TEXT,
    internal_code TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
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
    status public.driver_status DEFAULT 'offline',
    current_location JSONB,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS (Commandes)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    
    -- RELATIONS
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- LE USER QUI COMMANDE (AUTH.UID)
    company_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- L'ENTREPRISE RATTACHÉE (Optionnel)
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    status public.order_status DEFAULT 'pending_acceptance',
    
    -- Adresses
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    delivery_lat DOUBLE PRECISION,
    delivery_lng DOUBLE PRECISION,
    
    -- Détails
    delivery_type TEXT NOT NULL,
    package_description TEXT,
    notes TEXT,
    
    -- Prix
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Guest Info (si client_id est null)
    email_client TEXT,
    phone_client TEXT,
    nom_client TEXT,
    facturation JSONB,
    
    -- Dates
    scheduled_pickup_time TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancellation_fee DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVER VEHICLES
CREATE TABLE public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    type public.vehicle_type NOT NULL,
    color TEXT,
    year INTEGER,
    status TEXT DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVER DOCUMENTS
CREATE TABLE public.driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    type public.document_type NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT,
    expiry_date DATE,
    status public.document_status DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER EVENTS
CREATE TABLE public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    actor_id UUID,
    actor_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL, -- Facture liée à l'entreprise
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    amount_ht DECIMAL(10, 2) NOT NULL,
    amount_ttc DECIMAL(10, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 20.0,
    status TEXT DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGING
CREATE TABLE public.threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    type public.thread_type DEFAULT 'general',
    status public.thread_status DEFAULT 'open',
    source TEXT DEFAULT 'app',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.plaintes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    sujet TEXT NOT NULL,
    description TEXT NOT NULL,
    statut TEXT DEFAULT 'ouvert',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUTOMATISATION (TRIGGERS)

-- Trigger création profil automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  -- Optionnel : Créer une entrée client si le rôle est client
  IF (new.raw_user_meta_data->>'role') = 'client' THEN
      INSERT INTO public.clients (user_id, email, company_name, status)
      VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'company_name', 'Nouvelle Entreprise'), 'active');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (Ajouter pour les autres tables si nécessaire)

-- 6. SECURITE (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ORDERS (CRITIQUE)
-- 1. INSERT : Les clients authentifiés peuvent créer des commandes pour eux-mêmes
CREATE POLICY "Clients can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- 2. SELECT : Voir ses propres commandes (Client ou Chauffeur)
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. UPDATE : Admin ou Système
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CLIENTS
CREATE POLICY "Clients view own data" ON public.clients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all clients" ON public.clients FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DRIVERS
CREATE POLICY "Drivers view own data" ON public.drivers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all drivers" ON public.drivers FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ADMIN BYPASS (Simplifié)
-- Note: Supabase Admin (service role) bypass toujours RLS.
-- Ici on donne accès aux users avec role='admin' dans profiles.
