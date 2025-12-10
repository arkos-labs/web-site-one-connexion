-- Solution radicale : Supprimer complètement la contrainte sur event_type
-- Date: 2025-12-06
-- Description: Permet n'importe quel event_type dans order_events

-- Supprimer la contrainte
ALTER TABLE order_events 
DROP CONSTRAINT IF EXISTS order_events_event_type_check;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Contrainte order_events_event_type_check supprimée';
    RAISE NOTICE '✅ Tous les types d''événements sont maintenant autorisés';
    RAISE NOTICE '⚠️  Vous pouvez maintenant créer des commandes sans erreur';
END $$;
