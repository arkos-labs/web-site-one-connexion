-- Fix RLS policies for tariff_metadata to allow admin updates
DROP POLICY IF EXISTS "Allow public read tariff metadata" ON public.tariff_metadata;
DROP POLICY IF EXISTS "Allow admin all tariff metadata" ON public.tariff_metadata;

-- Allow everyone to read (needed for public order forms)
CREATE POLICY "Allow public read tariff metadata"
ON public.tariff_metadata
FOR SELECT
TO public
USING (true);

-- Allow admins to do everything (update, insert)
CREATE POLICY "Allow admin full access tariff metadata"
ON public.tariff_metadata
FOR ALL
TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM public.admins)
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.admins)
);
