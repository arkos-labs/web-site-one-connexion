-- ===================================================================
-- MIGRATION: Add Tariff Metadata Table
-- Description: Stockage des constantes et métadonnées de tarification
-- Date: 2025-12-11
-- ===================================================================

-- Cette table existe déjà dans supabase_schema.sql
-- Vérifier qu'elle est bien créée avec:

CREATE TABLE IF NOT EXISTS tariff_metadata (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(500) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les valeurs par défaut
INSERT INTO tariff_metadata (key, value, description) VALUES
  ('bon_value_eur', '5.5', 'Valeur d''un bon en EUR'),
  ('supplement_per_km_bons', '0.1', 'Supplément en bons par km (hors Paris)'),
  ('company_name', 'One Connexion', 'Nom de l''entreprise'),
  ('version', '1.0', 'Version du tarif')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tariff_metadata_key ON tariff_metadata(key);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================================

ALTER TABLE tariff_metadata ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read tariff metadata"
  ON tariff_metadata FOR SELECT
  TO authenticated
  USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update tariff metadata"
  ON tariff_metadata FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ===================================================================
-- GRANTS
-- ===================================================================

-- Accès en lecture pour les utilisateurs anonymes (pour calculateur public)
GRANT SELECT ON tariff_metadata TO anon;
GRANT SELECT ON tariff_metadata TO authenticated;

-- ===================================================================
-- FIN DE LA MIGRATION: Tariff Metadata
-- ===================================================================
