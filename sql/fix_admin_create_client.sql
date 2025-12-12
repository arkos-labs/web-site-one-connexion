-- -----------------------------------------------------------------------------
-- FIX ADMIN CREATE CLIENT PERMISSIONS
-- -----------------------------------------------------------------------------

-- 1. Ensure Admins can INSERT into clients table
-- The existing policy "Admins view all clients" is only for SELECT.
-- We need a policy for INSERT and UPDATE.

DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;

CREATE POLICY "Admins manage clients" ON public.clients
FOR ALL -- SELECT, INSERT, UPDATE, DELETE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Ensure RLS is enabled (it should be, but good to check)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. Grant explicit permissions to authenticated role just in case
GRANT ALL ON public.clients TO authenticated;
