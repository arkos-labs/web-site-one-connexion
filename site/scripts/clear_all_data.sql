-- ============================================================================
-- SCRIPT: Supprimer tous les clients, commandes, navettes et chauffeurs
-- ATTENTION: Cette action est IRRÉVERSIBLE
-- ============================================================================

-- Désactiver les triggers pour éviter les contraintes pendant la suppression
ALTER TABLE navette_executions DISABLE TRIGGER ALL;
ALTER TABLE navette_stops DISABLE TRIGGER ALL;
ALTER TABLE order_stops DISABLE TRIGGER ALL;
ALTER TABLE navettes DISABLE TRIGGER ALL;
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE clients DISABLE TRIGGER ALL;
ALTER TABLE profiles DISABLE TRIGGER ALL;

-- Supprimer les données en cascade (dans l'ordre des dépendances)
DELETE FROM navette_executions;
DELETE FROM navette_stops;
DELETE FROM order_stops;
DELETE FROM navettes;
DELETE FROM orders;
DELETE FROM clients;

-- Supprimer tous les profils sauf l'admin (role = 'admin')
DELETE FROM profiles
WHERE role != 'admin' OR role IS NULL;

-- Réactiver les triggers
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE clients ENABLE TRIGGER ALL;
ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE navettes ENABLE TRIGGER ALL;
ALTER TABLE order_stops ENABLE TRIGGER ALL;
ALTER TABLE navette_stops ENABLE TRIGGER ALL;
ALTER TABLE navette_executions ENABLE TRIGGER ALL;

-- Confirmer la suppression
SELECT
  (SELECT COUNT(*) FROM clients) as clients_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM navettes) as navettes_count,
  (SELECT COUNT(*) FROM profiles WHERE role != 'admin') as non_admin_profiles_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_profiles_count;
