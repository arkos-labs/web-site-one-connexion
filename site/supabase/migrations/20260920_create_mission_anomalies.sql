-- Création de la table mission_anomalies (qui manquait totalement)
CREATE TABLE IF NOT EXISTS public.mission_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL,
  mission_type TEXT NOT NULL,
  step TEXT NOT NULL,
  type TEXT NOT NULL,
  comment TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  point_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.mission_anomalies ENABLE ROW LEVEL SECURITY;

-- Ajout d'une politique de sécurité de base pour autoriser les utilisateurs authentifiés à lire et écrire
CREATE POLICY "Allow all operations for authenticated users" 
ON public.mission_anomalies 
FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_mission_anomalies_mission_id ON public.mission_anomalies(mission_id);
