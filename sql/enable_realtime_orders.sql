-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1. Policy for Admins (Full Access)
DROP POLICY IF EXISTS "Admins can do everything on orders" ON orders;
CREATE POLICY "Admins can do everything on orders"
ON orders
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
    OR
    (SELECT (raw_user_meta_data->>'role')::text FROM auth.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
    OR
    (SELECT (raw_user_meta_data->>'role')::text FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- 2. Policy for Drivers (Read Own Orders Only + Update status if needed)
-- Drivers can view orders assigned to them
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON orders;
CREATE POLICY "Drivers can view assigned orders"
ON orders
FOR SELECT
TO authenticated
USING (
    driver_id IN (
        SELECT id FROM drivers WHERE user_id = auth.uid()
    )
);

-- Drivers can update orders assigned to them (e.g. status)
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON orders;
CREATE POLICY "Drivers can update assigned orders"
ON orders
FOR UPDATE
TO authenticated
USING (
    driver_id IN (
        SELECT id FROM drivers WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    driver_id IN (
        SELECT id FROM drivers WHERE user_id = auth.uid()
    )
);

-- 3. Enable Realtime for orders table
-- This allows clients/drivers to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
