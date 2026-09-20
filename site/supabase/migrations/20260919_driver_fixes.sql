-- 1. Ajouter la colonne updated_at qui manque à la table drivers et qui fait planter la mise à jour
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Autoriser les utilisateurs connectés à faire des mises à jour sur la table drivers
GRANT UPDATE (status, updated_at) ON public.drivers TO authenticated;

-- 3. Ajouter la règle (policy) permettant au chauffeur de modifier son propre statut
DROP POLICY IF EXISTS "Drivers update own status" ON public.drivers;
CREATE POLICY "Drivers update own status" ON public.drivers
  FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- 4. Activer l'identité complète pour que les websockets reçoivent toutes les données (obligatoire pour le filtre temps réel)
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
