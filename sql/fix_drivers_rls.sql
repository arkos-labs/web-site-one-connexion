-- ============================================================================
-- FIX: Permissions RLS pour la table drivers
-- ============================================================================
-- Permet aux chauffeurs de lire leurs propres données
-- ============================================================================

-- 1. Activer RLS sur la table drivers (si pas déjà fait)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies (pour éviter les conflits)
DROP POLICY IF EXISTS "Drivers can view own data" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own data" ON public.drivers;
DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Public read access for drivers" ON public.drivers;

-- 3. Créer les nouvelles policies

-- Policy 1: Les chauffeurs peuvent lire leurs propres données
CREATE POLICY "Drivers can view own data"
ON public.drivers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Les chauffeurs peuvent mettre à jour leurs propres données
CREATE POLICY "Drivers can update own data"
ON public.drivers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Les admins peuvent tout voir
CREATE POLICY "Admins can view all drivers"
ON public.drivers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy 4: Les admins peuvent tout gérer
CREATE POLICY "Admins can manage drivers"
ON public.drivers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 4. Vérifier que les policies sont bien créées
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'drivers';

-- 5. Tester la requête en tant que chauffeur
-- Cette requête simule ce que fait l'application
SELECT 
    d.*
FROM public.drivers d
WHERE d.user_id = (
    SELECT id FROM auth.users WHERE email = 'test123@driver.local'
);

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- Vous devriez voir 4 policies créées :
-- 1. Drivers can view own data (SELECT)
-- 2. Drivers can update own data (UPDATE)
-- 3. Admins can view all drivers (SELECT)
-- 4. Admins can manage drivers (ALL)
--
-- La requête de test devrait retourner les données du chauffeur test123
-- ============================================================================
