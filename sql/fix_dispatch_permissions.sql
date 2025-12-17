-- Fix 406 Error: Allow Admins/Auth users to update orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users (Admins, Drivers, Clients) to read/write orders
-- You can refine this later to restrict Clients to only their own orders
DROP POLICY IF EXISTS "Authenticated users can do everything on orders" ON orders;

CREATE POLICY "Authenticated users can do everything on orders"
ON orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix Drivers table too
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can do everything on drivers" ON drivers;

CREATE POLICY "Authenticated users can do everything on drivers"
ON drivers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
