-- Allow admins to create drivers
CREATE POLICY "Admins create drivers" ON public.drivers FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to update drivers
CREATE POLICY "Admins update drivers" ON public.drivers FOR UPDATE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to delete drivers
CREATE POLICY "Admins delete drivers" ON public.drivers FOR DELETE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
