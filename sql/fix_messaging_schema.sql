-- ===================================================================
-- CORRECTIF MESSAGERIE : CRÉATION DES TABLES MANQUANTES
-- ===================================================================

-- 1. TABLE: threads (Conversations)
CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    type TEXT CHECK (type IN ('general', 'plainte', 'contact')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'new', 'read', 'replied', 'archived'))
);

-- RLS pour threads
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all threads" ON public.threads
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Admins can insert threads" ON public.threads
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Admins can update threads" ON public.threads
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Clients can view own threads" ON public.threads
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can insert threads" ON public.threads
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can update own threads" ON public.threads
    FOR UPDATE USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );


-- 2. TABLE: plaintes (Détails des réclamations)
CREATE TABLE IF NOT EXISTS public.plaintes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    sujet TEXT NOT NULL,
    description TEXT NOT NULL,
    statut TEXT DEFAULT 'ouvert'
);

-- RLS pour plaintes
ALTER TABLE public.plaintes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all plaintes" ON public.plaintes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Admins can update plaintes" ON public.plaintes
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    );

CREATE POLICY "Clients can view own plaintes" ON public.plaintes
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Clients can insert plaintes" ON public.plaintes
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );


-- 3. MISE À JOUR TABLE: messages (Lier aux threads)
-- La table messages existait peut-être déjà mais sans thread_id
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;

-- Mettre à jour les policies messages pour inclure thread_id si nécessaire
-- (Les policies existantes basées sur client_id fonctionnent toujours, mais on ajoute l'accès admin global)

