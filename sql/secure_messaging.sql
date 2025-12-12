-- -----------------------------------------------------------------------------
-- SECURE MESSAGING (RLS)
-- -----------------------------------------------------------------------------

-- 1. CONTACT MESSAGES (Formulaire de contact)
-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Admins view all contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users view own contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public create contact messages" ON public.contact_messages;

-- Policy: Public can INSERT (send message)
CREATE POLICY "Public create contact messages" ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Admins can VIEW ALL
CREATE POLICY "Admins view all contact messages" ON public.contact_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Policy: Users can VIEW OWN (based on Email)
CREATE POLICY "Users view own contact messages" ON public.contact_messages
FOR SELECT
TO authenticated
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);


-- 2. THREADS (Messagerie interne)
-- Enable RLS
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users view own threads" ON public.threads;
DROP POLICY IF EXISTS "Admins view all threads" ON public.threads;

-- Policy: Users view own threads (linked by client_id)
CREATE POLICY "Users view own threads" ON public.threads
FOR SELECT
TO authenticated
USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Policy: Users can insert threads (if they are the client)
CREATE POLICY "Users create threads" ON public.threads
FOR INSERT
TO authenticated
WITH CHECK (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);


-- 3. MESSAGES (Contenu des discussions)
-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins view all messages" ON public.messages;

-- Policy: Users view messages of threads they have access to
-- (We reuse the logic: if you can see the thread, you can see the messages)
CREATE POLICY "Users view own messages" ON public.messages
FOR SELECT
TO authenticated
USING (
    thread_id IN (
        SELECT id FROM public.threads 
        WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Policy: Users can insert messages
CREATE POLICY "Users create messages" ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    -- Must be linked to a thread they own
    thread_id IN (
        SELECT id FROM public.threads 
        WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    )
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- 4. GRANT PERMISSIONS
GRANT ALL ON public.contact_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.threads TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.messages TO postgres, anon, authenticated, service_role;
