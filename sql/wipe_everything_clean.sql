-- ==============================================================================
-- ☢️ GRAND NETTOYAGE (RESET TOTAL) ☢️
-- ==============================================================================
-- ATTENTION : Ce script supprime TOUTES les données de l'application.
-- Il remet la base de données à vide (mais garde la structure des tables).
-- ==============================================================================

BEGIN;

-- 1. Vider les tables publiques (l'ordre est important ou utiliser CASCADE)
-- On utilise TRUNCATE ... CASCADE pour être radical et rapide.

TRUNCATE TABLE 
  public.order_events,
  public.invoices,
  public.messages,
  public.plaintes,
  public.contact_messages,
  public.threads,
  public.driver_documents,
  public.driver_vehicles,
  public.orders,
  public.drivers,
  public.clients,
  public.profiles
  CASCADE;

-- 2. Supprimer tous les utilisateurs de l'authentification
DELETE FROM auth.users;

COMMIT;

-- Résultat :
-- Une base de données vide, prête pour de nouveaux tests.
