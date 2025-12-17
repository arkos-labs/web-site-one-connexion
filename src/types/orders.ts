// Types pour la gestion des commandes

export type OrderStatus =
    | 'pending_acceptance'    // En attente d'acceptation
    | 'accepted'              // Acceptée
    | 'assigned'              // Assignée à un chauffeur
    | 'driver_accepted'       // Chauffeur a accepté
    | 'driver_refused'        // Chauffeur a refusé
    | 'in_progress'           // En cours de livraison
    | 'delivered'             // Livrée
    | 'cancelled';            // Annulée

export type DriverStatus =
    | 'online'                // En ligne (disponible)
    | 'busy'                  // Occupé (en course)
    | 'offline'               // Hors ligne
    | 'suspended';            // Suspendu

export interface OrderDriver {
    id: string;
    first_name: string;
    last_name: string;
    status: DriverStatus;
    phone?: string;
    current_location?: {
        latitude: number;
        longitude: number;
    };
}

export interface OrderClient {
    id: string;
    name: string;
    sector?: string;
    internal_code?: string;
    phone?: string;
    email?: string;
}

export interface Order {
    id: string;
    reference: string;
    status: OrderStatus;
    pickup_address: string;
    delivery_address: string;
    pickup_location?: {
        latitude: number;
        longitude: number;
    };
    delivery_location?: {
        latitude: number;
        longitude: number;
    };
    price: number;
    delivery_type: string;
    clients: OrderClient | null;
    drivers: OrderDriver | null;
    driver_id?: string | null;
    client_id: string;
    created_at: string;
    updated_at: string;
    accepted_at?: string | null;
    dispatched_at?: string | null;
    delivered_at?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    // Tracking des refus
    refusal_count?: number;
    last_refused_by?: string | null;
}

export interface AvailableDriver extends OrderDriver {
    rating: number;
    total_deliveries: number;
    distance_to_pickup?: number;  // en km
    estimated_time?: number;       // en minutes
    current_orders_count: number;
}

// Fonction helper pour vérifier si un chauffeur est disponible
export const isDriverAvailable = (driver: OrderDriver | AvailableDriver): boolean => {
    return driver.status === 'online';
};

// Fonction helper pour vérifier si une commande peut être dispatchée
export const canDispatchOrder = (order: Order): boolean => {
    return order.status === 'accepted';
};

// Fonction helper pour vérifier si une commande peut être acceptée
export const canAcceptOrder = (order: Order): boolean => {
    return order.status === 'pending_acceptance';
};

// Fonction helper pour vérifier si une commande peut être annulée
export const canCancelOrder = (order: Order): boolean => {
    return order.status !== 'delivered';
};

// Fonction helper pour obtenir le libellé du statut
export const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
        pending_acceptance: 'En attente d\'acceptation',
        accepted: 'Acceptée',
        assigned: 'Assignée',
        driver_accepted: 'Chauffeur a accepté',
        driver_refused: 'Chauffeur a refusé',
        in_progress: 'En cours',
        delivered: 'Livrée',
        cancelled: 'Annulée'
    };
    return labels[status];
};

// Fonction helper pour obtenir le libellé du statut chauffeur
export const getDriverStatusLabel = (status: DriverStatus): string => {
    const labels: Record<DriverStatus, string> = {
        online: 'En ligne',
        busy: 'Occupé',
        offline: 'Hors ligne',
        suspended: 'Suspendu'
    };
    return labels[status];
};

// Fonction helper pour obtenir la couleur du badge de statut
export const getStatusBadgeColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
        pending_acceptance: 'bg-warning',
        accepted: 'bg-info',
        assigned: 'bg-blue-500',
        driver_accepted: 'bg-teal-500',
        driver_refused: 'bg-red-500',
        in_progress: 'bg-purple-500',
        delivered: 'bg-success',
        cancelled: 'bg-destructive'
    };
    return colors[status];
};

// Fonction helper pour obtenir la couleur du badge de statut chauffeur
export const getDriverStatusBadgeColor = (status: DriverStatus): string => {
    const colors: Record<DriverStatus, string> = {
        online: 'bg-success',
        busy: 'bg-blue-500',
        offline: 'bg-gray-500',
        suspended: 'bg-red-500'
    };
    return colors[status];
};
