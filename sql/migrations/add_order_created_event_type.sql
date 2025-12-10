-- Migration: Ajouter 'order_created' aux types d'événements autorisés
-- Date: 2025-12-06
-- Description: Permet d'utiliser 'order_created' dans order_events

-- ÉTAPE 1: Supprimer l'ancienne contrainte
ALTER TABLE order_events 
DROP CONSTRAINT IF EXISTS order_events_event_type_check;

-- ÉTAPE 2: Vérifier les event_type existants
DO $$
DECLARE
    existing_types TEXT;
BEGIN
    SELECT string_agg(DISTINCT event_type, ', ') INTO existing_types
    FROM order_events;
    
    RAISE NOTICE 'Types d''événements existants dans la table: %', COALESCE(existing_types, 'aucun');
END $$;

-- ÉTAPE 3: Mettre à jour les event_type invalides (si nécessaire)
-- Remplacer les types inconnus par 'status_changed'
UPDATE order_events
SET event_type = 'status_changed'
WHERE event_type NOT IN (
    'order_created',
    'order_accepted',
    'order_dispatched',
    'order_picked_up',
    'order_in_transit',
    'order_delivered',
    'order_cancelled',
    'driver_assigned',
    'driver_unassigned',
    'status_changed',
    'payment_received',
    'payment_failed',
    'note_added'
);

-- ÉTAPE 4: Créer la nouvelle contrainte avec tous les types autorisés
ALTER TABLE order_events
ADD CONSTRAINT order_events_event_type_check 
CHECK (event_type IN (
    'order_created',
    'order_accepted',
    'order_dispatched',
    'order_picked_up',
    'order_in_transit',
    'order_delivered',
    'order_cancelled',
    'driver_assigned',
    'driver_unassigned',
    'status_changed',
    'payment_received',
    'payment_failed',
    'note_added'
));

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Contrainte order_events_event_type_check mise à jour';
    RAISE NOTICE '✅ Type "order_created" ajouté aux événements autorisés';
    RAISE NOTICE '✅ Types invalides convertis en "status_changed"';
END $$;
