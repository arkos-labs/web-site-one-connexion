-- ============================================================================
-- MIGRATION: Ajouter le rôle 'courier' pour les chauffeurs
-- Date: 2026-09-20
-- ============================================================================

-- Modifier la contrainte de rôle pour accepter 'courier'
ALTER TABLE profiles
DROP CONSTRAINT profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'admin', 'courier'));

-- Confirmer la modification
SELECT COUNT(*) as total_profiles FROM profiles;
