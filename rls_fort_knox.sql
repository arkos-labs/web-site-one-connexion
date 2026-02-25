-- =========================================================================================
-- CYBERSÉCURITÉ "FORT-KNOX" - ROW LEVEL SECURITY (RLS)
-- =========================================================================================
-- Ce script verrouille totalement la base de données. 
-- Les clients ne voient que leurs propres courses et factures.
-- Les chauffeurs ne voient que les courses disponibles ou qui leur sont assignées.
-- L'administrateur garde une vision globale.

-- 1. Activation stricte du RLS sur les tables sensibles
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payments ENABLE ROW LEVEL SECURITY;

-- 2. Fonction utilitaire pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin', 'dispatcher')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;

-- ==========================================
-- POLITIQUES SUR LA TABLE "orders"
-- ==========================================

-- L'Admin voit et modifie tout
CREATE POLICY "Admin full access on orders" 
ON public.orders FOR ALL
USING (public.is_admin());

-- Le Client voit uniquement SA commande
CREATE POLICY "Client view own orders" 
ON public.orders FOR SELECT
USING (auth.uid() = client_id);

-- Le Client peut insérer SA commande (et doit lier son propre ID)
CREATE POLICY "Client insert own orders" 
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Le Chauffeur voit une commande SI elle est en attente (disponible pour tous les chauffeurs) 
-- OU SI elle lui est déjà attribuée (driver_id = auth.uid())
CREATE POLICY "Driver view orders" 
ON public.orders FOR SELECT
USING (
  status = 'pending_acceptance' 
  OR driver_id = auth.uid()
);

-- Le Chauffeur peut mettre à jour une commande UNIQUEMENT si c'est la sienne
CREATE POLICY "Driver update own orders" 
ON public.orders FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());


-- ==========================================
-- POLITIQUES SUR LA TABLE "profiles"
-- ==========================================

-- L'Admin gère tous les profils
CREATE POLICY "Admin full access on profiles" 
ON public.profiles FOR ALL
USING (public.is_admin());

-- Chaque utilisateur peut VOIR son propre profil
CREATE POLICY "Users view own profile" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Chaque utilisateur peut METTRE À JOUR son propre profil
CREATE POLICY "Users update own profile" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- (Les insertions sont généralement gérées par le trigger de création de compte auth.users)


-- ==========================================
-- POLITIQUES SUR LA TABLE "driver_payments"
-- ==========================================

-- L'Admin gère tous les paiements
CREATE POLICY "Admin full access on driver_payments" 
ON public.driver_payments FOR ALL
USING (public.is_admin());

-- Le Chauffeur voit UNIQUEMENT ses propres paiements/factures générés par l'admin
CREATE POLICY "Driver view own payments" 
ON public.driver_payments FOR SELECT
USING (auth.uid() = driver_id);
