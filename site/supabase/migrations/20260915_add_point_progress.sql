-- Ajouter une colonne point_progress aux tables orders et navettes
-- pour suivre l'état de chaque point d'une course/navette en temps réel
-- Format: { "0": { "pickedUpAt": "ISO", "deliveredAt": "ISO", "photoUrl": "URL" } }

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS point_progress JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.navettes ADD COLUMN IF NOT EXISTS point_progress JSONB DEFAULT '{}'::jsonb;
