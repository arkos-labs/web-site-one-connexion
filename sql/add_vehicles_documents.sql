-- ===================================================================
-- MIGRATION: Add Vehicles and Documents Tables
-- Description: Gestion des véhicules et documents des chauffeurs
-- Date: 2025-12-11
-- ===================================================================

-- ===================================================================
-- TABLE: vehicles
-- Stockage des informations sur les véhicules des chauffeurs
-- ===================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  -- Informations du véhicule
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  license_plate VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('moto', 'voiture', 'utilitaire')),
  color VARCHAR(50),
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  
  -- Caractéristiques techniques
  max_weight_kg INTEGER,
  max_volume_m3 DECIMAL(10, 2),
  
  -- Statut et vérification
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);

-- Trigger pour mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicles_updated_at();

-- ===================================================================
-- TABLE: driver_documents
-- Stockage des documents des chauffeurs (permis, assurance, etc.)
-- ===================================================================

CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  
  -- Type et informations du document
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('permis', 'assurance', 'carte_grise', 'kbis', 'autre')),
  document_name VARCHAR(255) NOT NULL,
  
  -- Fichier stocké (Supabase Storage)
  file_url TEXT NOT NULL,
  file_size_kb INTEGER,
  mime_type VARCHAR(100),
  
  -- Dates de validité
  issue_date DATE,
  expiry_date DATE,
  
  -- Vérification et statut
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES admins(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_expiry ON driver_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Trigger pour mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_driver_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_driver_documents_updated_at
  BEFORE UPDATE ON driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_documents_updated_at();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Activer RLS pour les vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Les chauffeurs peuvent voir leurs propres véhicules
CREATE POLICY "Drivers can view their own vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent voir tous les véhicules
CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Les chauffeurs peuvent créer leurs propres véhicules
CREATE POLICY "Drivers can create their own vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les chauffeurs peuvent modifier leurs propres véhicules
CREATE POLICY "Drivers can update their own vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Activer RLS pour les driver_documents
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Les chauffeurs peuvent voir leurs propres documents
CREATE POLICY "Drivers can view their own documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent voir tous les documents
CREATE POLICY "Admins can view all documents"
  ON driver_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Les chauffeurs peuvent uploader leurs propres documents
CREATE POLICY "Drivers can upload their own documents"
  ON driver_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    )
  );

-- Seuls les admins peuvent approuver/rejeter les documents
CREATE POLICY "Admins can update document verification"
  ON driver_documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ===================================================================
-- VUES UTILES
-- ===================================================================

-- Vue: Documents expirant bientôt (30 jours)
CREATE OR REPLACE VIEW v_expiring_documents AS
SELECT 
  dd.id,
  dd.driver_id,
  d.first_name,
  d.last_name,
  d.email,
  dd.document_type,
  dd.document_name,
  dd.expiry_date,
  dd.verification_status,
  (dd.expiry_date - CURRENT_DATE) as days_until_expiry
FROM driver_documents dd
JOIN drivers d ON d.id = dd.driver_id
WHERE dd.expiry_date IS NOT NULL
  AND dd.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND dd.expiry_date >= CURRENT_DATE
  AND dd.verification_status = 'approved'
ORDER BY dd.expiry_date ASC;

-- Vue: Documents en attente de vérification
CREATE OR REPLACE VIEW v_pending_documents AS
SELECT 
  dd.id,
  dd.driver_id,
  d.first_name,
  d.last_name,
  d.email,
  d.phone,
  dd.document_type,
  dd.document_name,
  dd.file_url,
  dd.created_at,
  EXTRACT(DAY FROM (NOW() - dd.created_at)) as days_pending
FROM driver_documents dd
JOIN drivers d ON d.id = dd.driver_id
WHERE dd.verification_status = 'pending'
ORDER BY dd.created_at ASC;

-- Vue: Statistiques véhicules par type
CREATE OR REPLACE VIEW v_vehicles_stats AS
SELECT 
  vehicle_type,
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count
FROM vehicles
GROUP BY vehicle_type, status
ORDER BY vehicle_type, status;

-- ===================================================================
-- GRANTS
-- ===================================================================

GRANT SELECT ON vehicles TO authenticated;
GRANT SELECT ON driver_documents TO authenticated;
GRANT SELECT ON v_expiring_documents TO authenticated;
GRANT SELECT ON v_pending_documents TO authenticated;
GRANT SELECT ON v_vehicles_stats TO authenticated;

-- ===================================================================
-- COMMENTAIRES DE DOCUMENTATION
-- ===================================================================

COMMENT ON TABLE vehicles IS 'Stockage des informations sur les véhicules des chauffeurs';
COMMENT ON TABLE driver_documents IS 'Stockage des documents des chauffeurs (permis, assurance, carte grise, etc.)';
COMMENT ON COLUMN vehicles.status IS 'Statut du véhicule: active (en service), inactive (hors service), maintenance (en réparation)';
COMMENT ON COLUMN driver_documents.verification_status IS 'Statut de vérification: pending (en attente), approved (approuvé), rejected (rejeté)';

-- ===================================================================
-- FIN DE LA MIGRATION: Vehicles and Documents
-- ===================================================================
