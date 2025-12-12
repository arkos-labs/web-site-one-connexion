-- Add new fields to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS vehicle_capacity TEXT;

-- Comment on columns
COMMENT ON COLUMN public.drivers.siret IS 'Numéro SIRET du chauffeur (auto-entrepreneur/société)';
COMMENT ON COLUMN public.drivers.vehicle_capacity IS 'Capacité maximale du véhicule (ex: 3m3, 500kg, 10 colis)';
