-- 20260915_fix_driver_dispatch.sql
-- Fix: le dispatch admin stockait drivers.id dans orders.driver_id,
-- mais l'app chauffeur cherche par auth.uid(). On ajoute auth_id
-- aux drivers et on corrige les orders existantes.

-- 1. Ajouter auth_id sur drivers (lien vers auth.users)
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE;

-- 2. Supprimer les FK qui lient orders.driver_id et navettes.driver_id à drivers(id)
--    car driver_id va maintenant stocker l'auth user ID, pas le drivers table ID
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT conname, conrelid::regclass AS tbl
    FROM pg_constraint
    WHERE confrelid = 'public.drivers'::regclass AND contype = 'f'
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    RAISE NOTICE 'Dropped FK % on %', r.conname, r.tbl;
  END LOOP;
END $$;

-- 4. Lier les drivers existants à leur compte auth (profiles.role = 'courier')
-- Ahmed Chauffeur a déjà le même ID dans drivers et profiles
UPDATE public.drivers d
SET auth_id = p.id
FROM public.profiles p
WHERE p.role = 'courier'
  AND LOWER(TRIM(p.full_name)) = LOWER(TRIM(d.name))
  AND d.auth_id IS NULL;

-- 3. Corriger les orders existantes : remplacer drivers.id par auth_id
UPDATE public.orders o
SET driver_id = d.auth_id
FROM public.drivers d
WHERE o.driver_id = d.id
  AND d.auth_id IS NOT NULL;

-- 4. Corriger les navettes existantes
UPDATE public.navettes n
SET driver_id = d.auth_id
FROM public.drivers d
WHERE n.driver_id = d.id
  AND d.auth_id IS NOT NULL;

-- 5. RLS : les chauffeurs peuvent lire leur propre fiche driver
DROP POLICY IF EXISTS "Drivers read own record" ON public.drivers;
CREATE POLICY "Drivers read own record" ON public.drivers
  FOR SELECT USING (auth_id = auth.uid());

-- 6. RLS : les chauffeurs voient les orders qui leur sont assignées
DROP POLICY IF EXISTS "Drivers see own orders" ON public.orders;
CREATE POLICY "Drivers see own orders" ON public.orders
  FOR SELECT USING (driver_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Drivers update own orders" ON public.orders;
CREATE POLICY "Drivers update own orders" ON public.orders
  FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- 7. RLS : les chauffeurs voient les navettes qui leur sont assignées
DROP POLICY IF EXISTS "Drivers see own navettes" ON public.navettes;
CREATE POLICY "Drivers see own navettes" ON public.navettes
  FOR SELECT USING (driver_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Drivers update own navettes" ON public.navettes;
CREATE POLICY "Drivers update own navettes" ON public.navettes
  FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Vérification
SELECT d.name, d.id AS driver_table_id, d.auth_id, p.full_name AS profile_name
FROM public.drivers d
LEFT JOIN public.profiles p ON p.id = d.auth_id
ORDER BY d.name;
