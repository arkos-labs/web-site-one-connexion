-- Add sector and notes columns to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
