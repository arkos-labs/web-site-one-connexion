-- Mise à jour de la contrainte de statut pour inclure TOUS les statuts utilisés
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_order_status;

ALTER TABLE orders
ADD CONSTRAINT valid_order_status 
CHECK (status IN (
    'pending', 
    'pending_acceptance', -- Requis par le système legacy si réutilisé
    'paid',
    'accepted', 
    'assigned', 
    'dispatched', -- Notre nouvelle valeur
    'driver_accepted',
    'in_progress', 
    'delivered', 
    'cancelled',
    'returned'
));
