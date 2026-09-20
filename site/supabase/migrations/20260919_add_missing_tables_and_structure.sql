-- ============================================================================
-- MIGRATION: Ajouter tables manquantes et compléter le schéma
-- Date: 2026-09-19
-- Description: Ajoute les 9 tables manquantes pour fonctionnalité complète
-- ============================================================================

-- 1. Ajouter colonnes manquantes aux tables existantes
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_recipient TEXT,
ADD COLUMN IF NOT EXISTS delivery_department TEXT,
ADD COLUMN IF NOT EXISTS delivery_comment TEXT,
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;

ALTER TABLE navettes
ADD COLUMN IF NOT EXISTS last_dispatch_date DATE,
ADD COLUMN IF NOT EXISTS last_dispatch_driver_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;

-- 2. TABLE: CLIENTS (Données métier client)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  siret TEXT UNIQUE NOT NULL,
  billing_address TEXT NOT NULL,
  billing_postal_code TEXT NOT NULL,
  billing_city TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name_secondary TEXT,
  contact_phone_secondary TEXT,
  contact_email_secondary TEXT,
  tax_id TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT siret_format CHECK (siret ~ '^\d{14}$'),
  CONSTRAINT email_format CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_siret ON clients(siret);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

-- 3. TABLE: ORDER_STOPS (Arrêts multiples d'une course)
CREATE TABLE IF NOT EXISTS order_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stop_sequence INTEGER NOT NULL,
  stop_type TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  package_volume_m3 DECIMAL(8, 3),
  package_weight_kg DECIMAL(8, 2),
  package_description TEXT,
  actual_arrival_at TIMESTAMP WITH TIME ZONE,
  actual_departure_at TIMESTAMP WITH TIME ZONE,
  recipient_name TEXT,
  proof_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_order_sequence UNIQUE(order_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_order_stops_order ON order_stops(order_id);

-- 4. TABLE: NAVETTE_STOPS (Arrêts template d'une navette)
CREATE TABLE IF NOT EXISTS navette_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navette_id UUID NOT NULL REFERENCES navettes(id) ON DELETE CASCADE,
  stop_sequence INTEGER NOT NULL,
  stop_type TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_navette_sequence UNIQUE(navette_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_navette_stops_navette ON navette_stops(navette_id);

-- 5. TABLE: NAVETTE_EXECUTIONS (Exécutions réelles jour J)
CREATE TABLE IF NOT EXISTS navette_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navette_id UUID NOT NULL REFERENCES navettes(id) ON DELETE RESTRICT,
  execution_date DATE NOT NULL,
  assigned_driver_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  actual_start_at TIMESTAMP WITH TIME ZONE,
  actual_end_at TIMESTAMP WITH TIME ZONE,
  vehicle_id UUID,
  route_distance_km DECIMAL(8, 2),
  notes TEXT,
  point_progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_navette_date UNIQUE(navette_id, execution_date)
);

CREATE INDEX IF NOT EXISTS idx_navette_executions_navette ON navette_executions(navette_id);
CREATE INDEX IF NOT EXISTS idx_navette_executions_date ON navette_executions(execution_date);
CREATE INDEX IF NOT EXISTS idx_navette_executions_driver ON navette_executions(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_navette_executions_status ON navette_executions(status);

-- 6. TABLE: NAVETTE_EXECUTION_PROOFS (Preuves de livraison par point)
CREATE TABLE IF NOT EXISTS navette_execution_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  navette_execution_id UUID NOT NULL REFERENCES navette_executions(id) ON DELETE CASCADE,
  stop_sequence INTEGER NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  recipient_name TEXT,
  recipient_department TEXT,
  delivery_comment TEXT,
  proof_photo_url TEXT,
  actual_arrival_at TIMESTAMP WITH TIME ZONE,
  actual_departure_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_stop_proof UNIQUE(navette_execution_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_execution_proofs_execution ON navette_execution_proofs(navette_execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_proofs_status ON navette_execution_proofs(delivery_status);

-- 7. TABLE: VEHICLES (Parc de véhicules)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  max_volume_m3 DECIMAL(8, 3),
  max_weight_kg DECIMAL(8, 2),
  insurance_policy TEXT,
  insurance_expiry_date DATE,
  technical_inspection_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);

-- 8. TABLE: INVOICES (Factures mensuelles)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT UNIQUE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  payment_date DATE,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 9. TABLE: INVOICE_ITEMS (Lignes de facture)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  navette_execution_id UUID REFERENCES navette_executions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT one_reference CHECK (
    (order_id IS NOT NULL AND navette_execution_id IS NULL) OR
    (order_id IS NULL AND navette_execution_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_order ON invoice_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_navette ON invoice_items(navette_execution_id);

-- 10. TABLE: ANALYTICS_DAILY (Analytics pré-calculées)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  orders_count INTEGER DEFAULT 0,
  navettes_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_distance_km DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_client ON analytics_daily(client_id);

-- 11. FONCTIONS
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_month TEXT;
  v_sequence INTEGER;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  v_month := TO_CHAR(CURRENT_DATE, 'MM');

  SELECT COUNT(*) + 1 INTO v_sequence
  FROM invoices
  WHERE invoice_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE;

  RETURN v_year || v_month || LPAD(v_sequence::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGERS pour updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_stops_updated_at ON order_stops;
CREATE TRIGGER update_order_stops_updated_at BEFORE UPDATE ON order_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_navette_stops_updated_at ON navette_stops;
CREATE TRIGGER update_navette_stops_updated_at BEFORE UPDATE ON navette_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_navette_executions_updated_at ON navette_executions;
CREATE TRIGGER update_navette_executions_updated_at BEFORE UPDATE ON navette_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_daily_updated_at ON analytics_daily;
CREATE TRIGGER update_analytics_daily_updated_at BEFORE UPDATE ON analytics_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. ROW LEVEL SECURITY
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE navette_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE navette_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE navette_execution_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS CLIENTS
DROP POLICY IF EXISTS clients_read_own ON clients;
CREATE POLICY clients_read_own ON clients FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS clients_read_admin ON clients;
CREATE POLICY clients_read_admin ON clients FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- RLS ORDER_STOPS
DROP POLICY IF EXISTS order_stops_read ON order_stops;
CREATE POLICY order_stops_read ON order_stops FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM orders o
    WHERE o.id = order_stops.order_id
    AND (o.user_id = auth.uid() OR o.driver_id = auth.uid() OR EXISTS(
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  ));

-- RLS NAVETTE_STOPS
DROP POLICY IF EXISTS navette_stops_read ON navette_stops;
CREATE POLICY navette_stops_read ON navette_stops FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM navettes n
    WHERE n.id = navette_stops.navette_id
    AND (n.user_id = auth.uid() OR EXISTS(
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  ));

-- RLS NAVETTE_EXECUTIONS
DROP POLICY IF EXISTS navette_executions_read ON navette_executions;
CREATE POLICY navette_executions_read ON navette_executions FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM navettes n
    WHERE n.id = navette_executions.navette_id
    AND (n.user_id = auth.uid() OR navette_executions.assigned_driver_id = auth.uid() OR EXISTS(
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  ));

-- RLS NAVETTE_EXECUTION_PROOFS
DROP POLICY IF EXISTS navette_execution_proofs_read ON navette_execution_proofs;
CREATE POLICY navette_execution_proofs_read ON navette_execution_proofs FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM navette_executions ne
    JOIN navettes n ON n.id = ne.navette_id
    WHERE ne.id = navette_execution_proofs.navette_execution_id
    AND (n.user_id = auth.uid() OR ne.assigned_driver_id = auth.uid() OR EXISTS(
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  ));

-- RLS INVOICES
DROP POLICY IF EXISTS invoices_read ON invoices;
CREATE POLICY invoices_read ON invoices FOR SELECT
  USING (client_id = auth.uid() OR EXISTS(
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- RLS INVOICE_ITEMS
DROP POLICY IF EXISTS invoice_items_read ON invoice_items;
CREATE POLICY invoice_items_read ON invoice_items FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_items.invoice_id
    AND (i.client_id = auth.uid() OR EXISTS(
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    ))
  ));

-- RLS VEHICLES
DROP POLICY IF EXISTS vehicles_read_admin ON vehicles;
CREATE POLICY vehicles_read_admin ON vehicles FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- RLS ANALYTICS_DAILY
DROP POLICY IF EXISTS analytics_read_own ON analytics_daily;
CREATE POLICY analytics_read_own ON analytics_daily FOR SELECT
  USING (client_id = auth.uid() OR EXISTS(
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'driver')
  ));
