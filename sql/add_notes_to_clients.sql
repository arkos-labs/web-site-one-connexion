-- ============================================================================
-- FIX CLIENTS : AJOUT COLONNE NOTES
-- ============================================================================
-- L'erreur "Could not find the 'notes' column of 'clients'" indique qu'il manque
-- la colonne 'notes' dans la table clients.
-- ============================================================================

BEGIN;

-- Ajout de la colonne notes
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rechargement du cache de schéma
NOTIFY pgrst, 'reload schema';

COMMIT;

RAISE NOTICE '✅ Colonne notes ajoutée à la table clients.';
