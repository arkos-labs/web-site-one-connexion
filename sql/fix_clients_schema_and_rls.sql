-- -----------------------------------------------------------------------------
-- FIX CLIENTS TABLE COLUMNS & RLS
-- -----------------------------------------------------------------------------

-- 1. Add missing columns expected by the Frontend (CreateClientModal)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Fix RLS Policy for Admins
-- We need to ensure Admins can INSERT new rows. 
-- "USING" checks existing rows (SELECT/UPDATE/DELETE).
-- "WITH CHECK" checks new rows (INSERT/UPDATE).

DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;

CREATE POLICY "Admins manage clients" ON public.clients
FOR ALL
TO authenticated
USING (
    -- Can perform actions on existing rows if admin
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    -- Can insert new rows if admin
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Grant permissions again to be safe
GRANT ALL ON public.clients TO authenticated;
