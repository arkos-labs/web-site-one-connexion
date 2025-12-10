-- ===================================================================
-- MIGRATION: Ajout de la table tariff_metadata
-- Description: Configuration dynamique des tarifs
-- Date: 2025-12-07
-- Sécurité: SEULS LES ADMINS peuvent modifier les tarifs
-- ===================================================================

-- Créer la table si elle n'existe pas
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
  ('night_surcharge_percent', '20', 'Majoration de nuit en %'),
  ('weekend_surcharge_percent', '25', 'Majoration week-end en %')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tariff_metadata_key ON tariff_metadata(key);

-- ===================================================================
-- SÉCURITÉ: Row Level Security (RLS)
-- ===================================================================

-- Activer RLS sur la table
ALTER TABLE tariff_metadata ENABLE ROW LEVEL SECURITY;

-- Policy 1: TOUT LE MONDE peut LIRE les tarifs (pour calculer les prix)
CREATE POLICY "Tout le monde peut lire les tarifs"
  ON tariff_metadata
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: SEULS LES ADMINS peuvent MODIFIER les tarifs
CREATE POLICY "Seuls les admins peuvent modifier les tarifs"
  ON tariff_metadata
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.status = 'active'
      AND admins.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.status = 'active'
      AND admins.role IN ('admin', 'super_admin')
    )
  );

-- Policy 3: SEULS LES SUPER ADMINS peuvent INSÉRER de nouveaux paramètres
CREATE POLICY "Seuls les super admins peuvent insérer"
  ON tariff_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.status = 'active'
      AND admins.role = 'super_admin'
    )
  );

-- Policy 4: SEULS LES SUPER ADMINS peuvent SUPPRIMER des paramètres
CREATE POLICY "Seuls les super admins peuvent supprimer"
  ON tariff_metadata
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.status = 'active'
      AND admins.role = 'super_admin'
    )
  );

-- ===================================================================
-- PERMISSIONS (en complément des RLS policies)
-- ===================================================================

-- Tout le monde peut lire
GRANT SELECT ON tariff_metadata TO anon;
GRANT SELECT ON tariff_metadata TO authenticated;

-- Seuls les utilisateurs authentifiés peuvent tenter de modifier
-- (mais RLS vérifiera qu'ils sont admins)
GRANT UPDATE ON tariff_metadata TO authenticated;
GRANT INSERT ON tariff_metadata TO authenticated;
GRANT DELETE ON tariff_metadata TO authenticated;

-- ===================================================================
-- TRIGGER pour mise à jour automatique de updated_at
-- ===================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_tariff_metadata_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_tariff_metadata_timestamp ON tariff_metadata;
CREATE TRIGGER trigger_update_tariff_metadata_timestamp
  BEFORE UPDATE ON tariff_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_tariff_metadata_timestamp();

-- ===================================================================
-- COMMENTAIRES
-- ===================================================================

COMMENT ON TABLE tariff_metadata IS 'Configuration dynamique des tarifs - SEULS LES ADMINS peuvent modifier';
COMMENT ON COLUMN tariff_metadata.key IS 'Clé unique du paramètre';
COMMENT ON COLUMN tariff_metadata.value IS 'Valeur du paramètre (stockée en string)';
COMMENT ON COLUMN tariff_metadata.description IS 'Description du paramètre';
COMMENT ON COLUMN tariff_metadata.updated_at IS 'Date de dernière modification';
