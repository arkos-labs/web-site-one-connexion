-- ============================================================================
-- FIX RELATIONSHIPS (ERREUR SCHEMA CACHE)
-- ============================================================================
-- L'erreur "Could not find a relationship" survient car nous avons recréé la table 'clients'
-- mais la table 'orders' (qui n'a pas été supprimée) a perdu son lien (Foreign Key) vers elle.
-- Ce script rétablit les liens physiques entre les tables.
-- ============================================================================

-- 1. Réparer la relation ORDERS -> CLIENTS
-- On s'assure que orders.client_id pointe bien vers public.clients.id
ALTER TABLE public.orders
    DROP CONSTRAINT IF EXISTS orders_client_id_fkey;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_client_id_fkey
    FOREIGN KEY (client_id)
    REFERENCES public.clients(id)
    ON DELETE CASCADE;

-- 2. Réparer la relation ORDERS -> DRIVERS (Préventif)
-- On s'assure que orders.driver_id pointe bien vers public.drivers.user_id
DO $$
BEGIN
    -- On ne touche que si la colonne driver_id existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'driver_id') THEN
        ALTER TABLE public.orders
            DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;

        ALTER TABLE public.orders
            ADD CONSTRAINT orders_driver_id_fkey
            FOREIGN KEY (driver_id)
            REFERENCES public.drivers(user_id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Forcer le rechargement du cache de schéma Supabase (Vital !)
NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Relations (Foreign Keys) réparées et Schéma rechargé.';
