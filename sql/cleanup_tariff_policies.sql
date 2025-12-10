-- ===================================================================
-- NETTOYAGE: Supprimer les policies existantes sur tariff_metadata
-- À exécuter AVANT add_tariff_metadata.sql si la table existe déjà
-- ===================================================================

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Tout le monde peut lire les tarifs" ON tariff_metadata;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les tarifs" ON tariff_metadata;
DROP POLICY IF EXISTS "Seuls les super admins peuvent insérer" ON tariff_metadata;
DROP POLICY IF EXISTS "Seuls les super admins peuvent supprimer" ON tariff_metadata;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Policies supprimées avec succès. Vous pouvez maintenant exécuter add_tariff_metadata.sql';
END $$;
