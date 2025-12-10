-- Add missing columns to clients table to match the CreateClientModal form
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
