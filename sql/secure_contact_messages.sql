-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated select on contact_messages" ON public.contact_messages;

-- Create a restrictive policy for Admins only
CREATE POLICY "Allow admin select on contact_messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM public.admins)
);

-- Ensure update is also restricted (though the previous one was just "authenticated", let's restrict it too)
DROP POLICY IF EXISTS "Allow authenticated update on contact_messages" ON public.contact_messages;

CREATE POLICY "Allow admin update on contact_messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM public.admins)
);
