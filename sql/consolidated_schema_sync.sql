-- ==============================================================================
-- ONE CONNEXION - SCRIPT DE SYNCHRONISATION ET RÉPARATION (NON-DESTRUCTIF)
-- ==============================================================================
-- Ce script s'assure que la structure de la base de données est correcte.
-- Il crée les tables manquantes, ajoute les colonnes manquantes,
-- et met à jour les fonctions et politiques de sécurité (RLS).
-- IL NE SUPPRIME PAS LES DONNÉES EXISTANTES.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS (Types énumérés)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'client', 'driver', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending_acceptance', 'accepted', 'dispatched', 'in_progress', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.driver_status AS ENUM ('online', 'offline', 'on_delivery', 'on_break', 'on_vacation', 'busy', 'available', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.vehicle_type AS ENUM ('scooter', 'moto', 'voiture', 'utilitaire', 'velo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.document_type AS ENUM ('license', 'registration', 'insurance', 'identity', 'kbis', 'autre', 'permis', 'carte_grise'); -- Fusion des types
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.document_status AS ENUM ('valid', 'expired', 'pending', 'rejected', 'approved'); -- Fusion des status
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.thread_type AS ENUM ('general', 'plainte', 'contact');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.thread_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'new', 'read', 'replied', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES & COLONNES (Idempotent)

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Ajout colonnes manquantes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS internal_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name TEXT;

-- DRIVERS
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS status public.driver_status DEFAULT 'offline';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS current_location JSONB;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_type TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_registration TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS vehicle_capacity TEXT;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS siret TEXT;

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Colonnes Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status public.order_status DEFAULT 'pending_acceptance';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_lat DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pickup_lng DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_lat DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_lng DOUBLE PRECISION;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_type TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS package_description TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS nom_client TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS facturation JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheduled_pickup_time TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10, 2) DEFAULT 0;

-- DRIVER VEHICLES
CREATE TABLE IF NOT EXISTS public.driver_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS license_plate TEXT;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS type public.vehicle_type;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS max_weight_kg INTEGER;
ALTER TABLE public.driver_vehicles ADD COLUMN IF NOT EXISTS max_volume_m3 DECIMAL(10, 2);

-- DRIVER DOCUMENTS
CREATE TABLE IF NOT EXISTS public.driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS type public.document_type;
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS status public.document_status DEFAULT 'pending';
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS document_type VARCHAR(50); -- Compatibilité
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255); -- Compatibilité
ALTER TABLE public.driver_documents ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'; -- Compatibilité

-- INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_ht DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2) DEFAULT 20.0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- MESSAGING (Threads, Messages, Plaintes, Contact)
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS type public.thread_type DEFAULT 'general';
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS status public.thread_status DEFAULT 'open';
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app';

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.plaintes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.plaintes ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.plaintes ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;
ALTER TABLE public.plaintes ADD COLUMN IF NOT EXISTS sujet TEXT;
ALTER TABLE public.plaintes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.plaintes ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'ouvert';

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- 4. FONCTIONS & TRIGGERS

-- Trigger handle_new_user
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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
    
  -- Création automatique Client si role=client
  IF (new.raw_user_meta_data->>'role') = 'client' THEN
      INSERT INTO public.clients (user_id, email, company_name, status)
      VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'company_name', 'Nouvelle Entreprise'), 'active')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction create_driver_user (RPC)
CREATE OR REPLACE FUNCTION create_driver_user(
  username text,
  password text,
  first_name text,
  last_name text,
  phone text,
  address text,
  siret text,
  vehicle_type text,
  vehicle_registration text,
  vehicle_capacity text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  fake_email text;
  encrypted_pw text;
BEGIN
  fake_email := username || '@driver.oneconnexion';
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = fake_email) THEN
    RAISE EXCEPTION 'Cet identifiant est déjà utilisé.';
  END IF;

  encrypted_pw := crypt(password, gen_salt('bf'));
  
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    fake_email, encrypted_pw, now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', first_name || ' ' || last_name, 'username', username, 'role', 'driver'),
    now(), now()
  ) RETURNING id INTO new_user_id;

  -- Le trigger handle_new_user s'occupe de créer le profile
  -- On attend un peu ou on force l'update si besoin, mais le trigger est synchrone.
  
  -- Créer l'entrée dans public.drivers
  INSERT INTO public.drivers (
    user_id, first_name, last_name, email, phone, status,
    vehicle_type, vehicle_registration, vehicle_capacity, siret
  ) VALUES (
    new_user_id, first_name, last_name, fake_email, phone, 'offline',
    vehicle_type, vehicle_registration, vehicle_capacity, siret
  );

  RETURN new_user_id;
END;
$$;

-- 5. SECURITE (RLS)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- Nettoyage anciennes policies (pour éviter les doublons)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Clients can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Clients view own data" ON public.clients;
DROP POLICY IF EXISTS "Admins view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;
DROP POLICY IF EXISTS "Drivers view own data" ON public.drivers;
DROP POLICY IF EXISTS "Admins view all drivers" ON public.drivers;

-- POLICIES RECRÉÉES

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ORDERS
CREATE POLICY "Clients can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CLIENTS
CREATE POLICY "Clients view own data" ON public.clients FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DRIVERS
CREATE POLICY "Drivers view own data" ON public.drivers FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage drivers" ON public.drivers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DRIVER VEHICLES
CREATE POLICY "Drivers manage own vehicles" ON public.driver_vehicles FOR ALL TO authenticated
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all vehicles" ON public.driver_vehicles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- DRIVER DOCUMENTS
CREATE POLICY "Drivers manage own documents" ON public.driver_documents FOR ALL TO authenticated
USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all documents" ON public.driver_documents FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. VUES (Optionnel mais utile)
CREATE OR REPLACE VIEW v_vehicles_stats AS
SELECT 
  type as vehicle_type,
  status,
  COUNT(*) as count
FROM driver_vehicles
GROUP BY type, status;

