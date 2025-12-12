-- -----------------------------------------------------------------------------
-- FIX ADMIN CREATE ORDER PERMISSIONS
-- -----------------------------------------------------------------------------

-- 1. Allow Admins to INSERT into orders table
-- The existing policy "Users create orders" restricts INSERT to own user_id.
-- We need a policy that allows Admins to insert ANY order (for any client).

DROP POLICY IF EXISTS "Admins create orders" ON public.orders;

CREATE POLICY "Admins create orders" ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 2. Allow Admins to UPDATE orders (already exists but let's reinforce/ensure it covers everything)
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;

CREATE POLICY "Admins update orders" ON public.orders
FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 3. Allow Admins to DELETE orders (if needed)
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;

CREATE POLICY "Admins delete orders" ON public.orders
FOR DELETE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 4. Grant permissions
GRANT ALL ON public.orders TO authenticated;
