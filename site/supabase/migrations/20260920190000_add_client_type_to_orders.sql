-- Add client_type and source columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS client_type TEXT,
ADD COLUMN IF NOT EXISTS source TEXT;
