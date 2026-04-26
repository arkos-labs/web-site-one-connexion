// Types pour les événements de commande (historique)

export interface OrderEvent {
    id: string;
    created_at: string;
    order_id: string;
    event_type: OrderEventType;
    description: string;
    metadata?: Record<string, any>;
    actor_id?: string;
    actor_type?: 'admin' | 'client' | 'driver' | 'system';
}

export type OrderEventType =
    | 'created'
    | 'accepted'
    | 'assigned'
    | 'driver_assigned'
    | 'driver_accepted'
    | 'arrived_pickup'
    | 'in_progress'
    | 'delivered'
    | 'cancelled'
    | 'driver_declined'
    | 'driver_changed'
    | 'status_changed'
    | 'note_added';

export const ORDER_EVENT_LABELS: Record<OrderEventType, string> = {
    created: 'Commande créée',
    accepted: 'Commande acceptée',
    assigned: 'Commande assignée',
    driver_assigned: 'Chauffeur assigné',
    driver_accepted: 'Course acceptée par le chauffeur',
    arrived_pickup: 'Chauffeur arrivé au point de retrait',
    in_progress: 'Livraison en cours',
    delivered: 'Commande livrée',
    cancelled: 'Commande annulée',
    driver_declined: 'Course refusée par le chauffeur',
    driver_changed: 'Chauffeur modifié',
    status_changed: 'Statut modifié',
    note_added: 'Note ajoutée',
};

export const ORDER_EVENT_ICONS: Record<OrderEventType, string> = {
    created: '📝',
    accepted: '✅',
    assigned: '🚚',
    driver_assigned: '👤',
    driver_accepted: '🤝',
    arrived_pickup: '📍',
    in_progress: '🏃',
    delivered: '📦',
    cancelled: '❌',
    driver_declined: '🚫',
    driver_changed: '🔄',
    status_changed: '🔔',
    note_added: '💬',
};


