-- ==============================================================================
-- DANGER : SCRIPT DE SUPPRESSION TOTALE DES UTILISATEURS
-- ==============================================================================
-- Ce script supprime TOUS les comptes utilisateurs de l'authentification.
-- Grâce aux "ON DELETE CASCADE", cela supprimera automatiquement :
-- 1. Les entrées dans public.profiles
-- 2. Les entrées dans public.drivers (et leurs véhicules/documents)
--
-- NOTE : Les tables 'clients' et 'orders' sont configurées en 'SET NULL'.
-- Cela signifie que les clients et commandes resteront en base, mais
-- le champ 'user_id' ou 'client_id' deviendra NULL.
-- ==============================================================================

BEGIN;

-- Suppression de tous les utilisateurs
DELETE FROM auth.users;

COMMIT;

-- Résultat attendu :
-- auth.users : VIDE
-- public.profiles : VIDE
-- public.drivers : VIDE
-- public.clients : CONSERVÉS (mais déliés)
-- public.orders : CONSERVÉES (mais déliées)
