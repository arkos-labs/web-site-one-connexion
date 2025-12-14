-- ============================================================================
-- FIX CLIENTS : AJOUT DES COLONNES MANQUANTES (First Name, Last Name, etc.)
-- ============================================================================
-- L'erreur "Could not find the 'first_name' column of 'clients'" indique que
-- la table 'clients' a été recréée sans ces colonnes lors du reset.
-- Ce script les rajoute.
-- ============================================================================

BEGIN;

-- 1. Ajout des colonnes d'identité
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Ajout des colonnes d'adresse (souvent utilisées avec)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT; -- Au cas où 'billing_address' ne suffise pas

-- 3. Ajout de colonnes de statut/métier potentielles
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tva_intracom TEXT;

-- 4. Rechargement du cache de schéma
NOTIFY pgrst, 'reload schema';

COMMIT;

RAISE NOTICE '✅ Colonnes first_name, last_name et adresse ajoutées à la table clients.';
