-- ===================================================================
-- NETTOYAGE: Supprimer les policies existantes sur vehicles et driver_documents
-- À exécuter AVANT add_vehicles_documents.sql si les tables existent déjà
-- ===================================================================

-- Supprimer les policies de la table vehicles
DROP POLICY IF EXISTS "Chauffeurs peuvent voir leurs véhicules" ON vehicles;
DROP POLICY IF EXISTS "Chauffeurs peuvent ajouter leurs véhicules" ON vehicles;
DROP POLICY IF EXISTS "Chauffeurs peuvent créer leurs véhicules" ON vehicles;
DROP POLICY IF EXISTS "Chauffeurs peuvent modifier leurs véhicules" ON vehicles;
DROP POLICY IF EXISTS "Chauffeurs peuvent supprimer leurs véhicules" ON vehicles;
DROP POLICY IF EXISTS "Admins peuvent tout voir sur vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins peuvent tout modifier sur vehicles" ON vehicles;

-- Supprimer les policies de la table driver_documents
DROP POLICY IF EXISTS "Chauffeurs peuvent voir leurs documents" ON driver_documents;
DROP POLICY IF EXISTS "Chauffeurs peuvent ajouter leurs documents" ON driver_documents;
DROP POLICY IF EXISTS "Chauffeurs peuvent créer leurs documents" ON driver_documents;
DROP POLICY IF EXISTS "Chauffeurs peuvent modifier leurs documents" ON driver_documents;
DROP POLICY IF EXISTS "Chauffeurs peuvent supprimer leurs documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins peuvent tout voir sur documents" ON driver_documents;
DROP POLICY IF EXISTS "Admins peuvent tout modifier sur documents" ON driver_documents;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Policies supprimées avec succès. Vous pouvez maintenant exécuter add_vehicles_documents.sql';
END $$;
