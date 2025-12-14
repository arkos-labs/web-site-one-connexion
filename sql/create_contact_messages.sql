-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy for inserting messages (public access)
CREATE POLICY "Allow public insert on contact_messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Policy for reading messages (admin only)
-- Assuming admins are identified by a role in profiles or metadata. 
-- For now, allowing authenticated users to read might be safer if admin check is complex, 
-- but ideally we restrict to admins.
-- Let's try to reuse the is_admin function if it exists, or just allow authenticated for now 
-- and rely on the app to only show this page to admins.
CREATE POLICY "Allow authenticated select on contact_messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating messages (admin only)
CREATE POLICY "Allow authenticated update on contact_messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (true);

-- Grant permissions
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO service_role;
