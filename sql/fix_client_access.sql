-- -----------------------------------------------------------------------------
-- FIX CLIENT ACCESS & RLS (THE "NUCLEAR" FIX)
-- -----------------------------------------------------------------------------

-- 1. Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. RESET Client Policies (Delete old ones to avoid conflicts)
DROP POLICY IF EXISTS "Clients view own" ON public.clients;
DROP POLICY IF EXISTS "Clients update own" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client profile" ON public.clients;

-- 3. Create "View Own" Policy (CRITICAL)
CREATE POLICY "Clients view own" ON public.clients
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- 4. Create "Update Own" Policy
CREATE POLICY "Clients update own" ON public.clients
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
);

-- 5. Grant Permissions
GRANT SELECT, UPDATE, INSERT ON public.clients TO authenticated;

-- 6. SPECIFIC REPAIR FOR KEISHA (Again, to be absolutely sure)
DO $$
DECLARE
    v_email TEXT := 'keisha.khotothinu@gmail.com';
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NOT NULL THEN
        -- Ensure Profile is Client
        UPDATE public.profiles SET role = 'client' WHERE id = v_user_id;
        
        -- Ensure Client Entry Exists
        IF NOT EXISTS (SELECT 1 FROM public.clients WHERE user_id = v_user_id) THEN
            INSERT INTO public.clients (user_id, email, company_name, status, phone)
            VALUES (v_user_id, v_email, 'Keisha Corp', 'active', '0600000000');
        ELSE
            -- Ensure it's linked correctly
            UPDATE public.clients SET status = 'active' WHERE user_id = v_user_id;
        END IF;
    END IF;
END $$;
