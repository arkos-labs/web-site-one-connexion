-- Script de NETTOYAGE COMPLET des utilisateurs
-- ATTENTION : Supprime TOUS les utilisateurs, profils et chauffeurs !

BEGIN;

-- 1. Supprimer les données dépendantes (pour éviter les erreurs de clé étrangère)
DELETE FROM public.drivers;
DELETE FROM public.profiles;
-- Ajoutez d'autres tables si nécessaire (ex: orders, vehicles...) si elles bloquent

-- 2. Supprimer les utilisateurs de l'authentification
DELETE FROM auth.users;

COMMIT;

-- 3. (Optionnel) Recréer immédiatement le Super Chauffeur pour tester
-- Décommenter la ligne suivante si vous voulez recréer le chauffeur tout de suite
-- SELECT create_driver_user('super_chauffeur', '123456', 'Super', 'Chauffeur', '0600000000', 'Paris', '12345678900000', 'Scooter', 'AA-123-BB', 'Small');
