-- Secure threads table
DROP POLICY IF EXISTS "Allow All" ON public.threads;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.threads;

CREATE POLICY "Users can view their own threads"
ON public.threads
FOR SELECT
TO authenticated
USING (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Users can insert their own threads"
ON public.threads
FOR INSERT
TO authenticated
WITH CHECK (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Users can update their own threads"
ON public.threads
FOR UPDATE
TO authenticated
USING (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);

-- Secure messages table
DROP POLICY IF EXISTS "Allow All" ON public.messages;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.messages;

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Users can insert their own messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
    client_id = auth.uid() OR 
    auth.uid() IN (SELECT user_id FROM public.admins)
);
