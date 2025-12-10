-- ===================================================================
-- MIGRATION: Ajout des tables véhicules et documents chauffeurs
-- Description: Gestion des véhicules et documents des chauffeurs
-- Date: 2025-12-07
-- ===================================================================

-- ===================================================================
-- TABLE: vehicles (Véhicules)
-- ===================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  -- Informations du véhicule
  brand VARCHAR(100) NOT NULL,                    -- Marque (ex: Peugeot)
  model VARCHAR(100) NOT NULL,                    -- Modèle (ex: Partner)
  license_plate VARCHAR(20) NOT NULL UNIQUE,      -- Plaque d'immatriculation
  vehicle_type VARCHAR(50) NOT NULL,              -- Type: 'moto', 'voiture', 'utilitaire'
  color VARCHAR(50),                              -- Couleur
  year INTEGER,                                   -- Année de mise en circulation
  
  -- Capacité
  max_weight_kg INTEGER,                          -- Poids max en kg
  max_volume_m3 DECIMAL(10, 2),                   -- Volume max en m³
  
  -- Statut
  status VARCHAR(20) DEFAULT 'active',            -- 'active', 'inactive', 'maintenance'
  is_verified BOOLEAN DEFAULT false,              -- Véhicule vérifié par admin
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- ===================================================================
-- TABLE: driver_documents (Documents des chauffeurs)
-- ===================================================================

CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  -- Type de document
  document_type VARCHAR(50) NOT NULL,             -- 'permis', 'assurance', 'carte_grise', 'kbis', 'autre'
  
  -- Informations du document
  document_name VARCHAR(255) NOT NULL,            -- Nom du document
  file_url TEXT NOT NULL,                         -- URL du fichier (Supabase Storage)
  file_size_kb INTEGER,                           -- Taille du fichier en KB
  mime_type VARCHAR(100),                         -- Type MIME (image/jpeg, application/pdf, etc.)
  
  -- Dates de validité
  issue_date DATE,                                -- Date d'émission
  expiry_date DATE,                               -- Date d'expiration
  
  -- Statut de vérification
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  verified_by UUID REFERENCES admins(id),         -- Admin qui a vérifié
  verified_at TIMESTAMP,                          -- Date de vérification
  rejection_reason TEXT,                          -- Raison du rejet (si rejeté)
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_expiry ON driver_documents(expiry_date);

-- ===================================================================
-- TRIGGERS pour updated_at
-- ===================================================================

-- Trigger pour vehicles
CREATE OR REPLACE FUNCTION update_vehicles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vehicles_timestamp ON vehicles;
CREATE TRIGGER trigger_update_vehicles_timestamp
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicles_timestamp();

-- Trigger pour driver_documents
CREATE OR REPLACE FUNCTION update_driver_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_driver_documents_timestamp ON driver_documents;
CREATE TRIGGER trigger_update_driver_documents_timestamp
  BEFORE UPDATE ON driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_documents_timestamp();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Activer RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Policies pour vehicles
-- Les chauffeurs peuvent voir et gérer leurs propres véhicules
DROP POLICY IF EXISTS "Chauffeurs peuvent voir leurs véhicules" ON vehicles;
CREATE POLICY "Chauffeurs peuvent voir leurs véhicules"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent créer leurs véhicules" ON vehicles;
CREATE POLICY "Chauffeurs peuvent créer leurs véhicules"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent modifier leurs véhicules" ON vehicles;
CREATE POLICY "Chauffeurs peuvent modifier leurs véhicules"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent supprimer leurs véhicules" ON vehicles;
CREATE POLICY "Chauffeurs peuvent supprimer leurs véhicules"
  ON vehicles FOR DELETE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent tout voir et gérer
DROP POLICY IF EXISTS "Admins peuvent tout voir (vehicles)" ON vehicles;
CREATE POLICY "Admins peuvent tout voir (vehicles)"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins peuvent tout modifier (vehicles)" ON vehicles;
CREATE POLICY "Admins peuvent tout modifier (vehicles)"
  ON vehicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('admin', 'super_admin')
    )
  );

-- Policies pour driver_documents
-- Les chauffeurs peuvent voir et gérer leurs propres documents
DROP POLICY IF EXISTS "Chauffeurs peuvent voir leurs documents" ON driver_documents;
CREATE POLICY "Chauffeurs peuvent voir leurs documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent créer leurs documents" ON driver_documents;
CREATE POLICY "Chauffeurs peuvent créer leurs documents"
  ON driver_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent modifier leurs documents" ON driver_documents;
CREATE POLICY "Chauffeurs peuvent modifier leurs documents"
  ON driver_documents FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chauffeurs peuvent supprimer leurs documents" ON driver_documents;
CREATE POLICY "Chauffeurs peuvent supprimer leurs documents"
  ON driver_documents FOR DELETE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent tout voir et tout modifier
DROP POLICY IF EXISTS "Admins peuvent tout voir (documents)" ON driver_documents;
CREATE POLICY "Admins peuvent tout voir (documents)"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins peuvent tout modifier (documents)" ON driver_documents;
CREATE POLICY "Admins peuvent tout modifier (documents)"
  ON driver_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('admin', 'super_admin')
    )
  );

-- ===================================================================
-- PERMISSIONS
-- ===================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON driver_documents TO authenticated;

-- ===================================================================
-- COMMENTAIRES
-- ===================================================================

COMMENT ON TABLE vehicles IS 'Véhicules des chauffeurs';
COMMENT ON TABLE driver_documents IS 'Documents des chauffeurs (permis, assurance, etc.)';

COMMENT ON COLUMN vehicles.vehicle_type IS 'Type de véhicule: moto, voiture, utilitaire';
COMMENT ON COLUMN vehicles.status IS 'Statut: active, inactive, maintenance';
COMMENT ON COLUMN driver_documents.document_type IS 'Type: permis, assurance, carte_grise, kbis, autre';
COMMENT ON COLUMN driver_documents.verification_status IS 'Statut: pending, approved, rejected';
