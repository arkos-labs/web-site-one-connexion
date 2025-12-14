-- ============================================================================
-- SETUP SUPER-ADMIN PRIVILEGES
-- ============================================================================

-- 1. PROMOTION DE L'UTILISATEUR (DATA)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'cherkinicolas@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- Update auth.users metadata
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
        WHERE id = v_user_id;

        -- Update/Insert Profile
        INSERT INTO public.profiles (id, email, role, status, first_name, last_name)
        VALUES (v_user_id, 'cherkinicolas@gmail.com', 'admin', 'approved', 'Nicolas', 'Cherki')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'approved';

        -- Ensure Client entry (for frontend compatibility)
        -- Cela évite les bugs si le dashboard admin essaie de charger les infos "client" de l'admin
        INSERT INTO public.clients (id, email, status, company_name, internal_code)
        VALUES (v_user_id, 'cherkinicolas@gmail.com', 'active', 'ADMINISTRATION', 'ADMIN-01')
        ON CONFLICT (id) DO UPDATE SET company_name = 'ADMINISTRATION';
    END IF;
END $$;

-- 2. SUPER-ADMIN POLICIES (RLS)
-- Ces politiques donnent un accès TOTAL aux admins sur toutes les tables critiques

-- Table: PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Table: CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access" ON public.clients;
CREATE POLICY "Admins have full access" ON public.clients FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Table: ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access" ON public.orders;
CREATE POLICY "Admins have full access" ON public.orders FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Table: DRIVERS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access" ON public.drivers;
CREATE POLICY "Admins have full access" ON public.drivers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. RÉPARATION DES PERMISSIONS (SCHEMA)
-- Vital pour éviter les erreurs "Database error querying schema" ou 403
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;
