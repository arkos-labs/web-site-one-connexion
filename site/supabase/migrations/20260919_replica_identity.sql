-- Activer l'identité complète pour la table drivers afin que les filtres temps réel (websockets) fonctionnent correctement
ALTER TABLE public.drivers REPLICA IDENTITY FULL;
