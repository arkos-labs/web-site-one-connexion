-- ============================================================================
-- FIX CLIENTS : ID AUTO-GÉNÉRÉ (CRÉATION CRM)
-- ============================================================================
-- L'erreur "null value in column id" signifie que la base attend un ID
-- mais que le frontend n'en envoie pas.
-- Ce script configure la table pour générer automatiquement un ID unique.
-- ============================================================================

BEGIN;

-- 1. Activer la génération automatique d'ID (UUID)
ALTER TABLE public.clients ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Rendre le code interne optionnel (pour éviter une autre erreur)
ALTER TABLE public.clients ALTER COLUMN internal_code DROP NOT NULL;

-- 3. Assouplir la liaison avec auth.users
-- Cela permet de créer des "Clients CRM" (fiches contacts) qui n'ont pas encore de compte utilisateur.
DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.clients'::regclass
        AND contype = 'f'
        AND confrelid = 'auth.users'::regclass
    LOOP
        EXECUTE 'ALTER TABLE public.clients DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 4. Rechargement du cache
NOTIFY pgrst, 'reload schema';

COMMIT;

RAISE NOTICE '✅ Table clients configurée pour la création automatique (ID auto-généré).';
