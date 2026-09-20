-- Migration : Ajout de la colonne point_index à la table mission_anomalies
ALTER TABLE public.mission_anomalies 
ADD COLUMN IF NOT EXISTS point_index integer;

-- Commentaire pour la documentation
COMMENT ON COLUMN public.mission_anomalies.point_index IS 'Index du point de la navette (0-based) concerné par l''anomalie, si applicable.';
