-- ============================================================================
-- FIX DRIVER RELATIONSHIPS AND DEFAULTS
-- ============================================================================

BEGIN;

-- 1. Ajouter une valeur par défaut pour drivers.id (sécurité)
ALTER TABLE public.drivers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Ajouter la contrainte FK pour orders.driver_id
-- D'abord, on nettoie les driver_id invalides s'il y en a (optionnel, mais prudent)
UPDATE public.orders SET driver_id = NULL WHERE driver_id NOT IN (SELECT id FROM public.drivers);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;

-- 3. Ajouter la contrainte FK pour driver_vehicles.driver_id
DELETE FROM public.driver_vehicles WHERE driver_id NOT IN (SELECT id FROM public.drivers);

ALTER TABLE public.driver_vehicles DROP CONSTRAINT IF EXISTS driver_vehicles_driver_id_fkey;
ALTER TABLE public.driver_vehicles ADD CONSTRAINT driver_vehicles_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;

-- 4. Ajouter la contrainte FK pour driver_documents.driver_id
DELETE FROM public.driver_documents WHERE driver_id NOT IN (SELECT id FROM public.drivers);

ALTER TABLE public.driver_documents DROP CONSTRAINT IF EXISTS driver_documents_driver_id_fkey;
ALTER TABLE public.driver_documents ADD CONSTRAINT driver_documents_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';

COMMIT;
