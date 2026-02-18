export const ORDER_STATUS = {
    PENDING_ACCEPTANCE: 'pending_acceptance',
    ACCEPTED: 'accepted',
    DISPATCHED: 'dispatched',
    DRIVER_ACCEPTED: 'driver_accepted',
    IN_PROGRESS: 'in_progress',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
    'pending_acceptance': 'En attente',
    'accepted': 'Acceptée',
    'dispatched': 'Dispatchée',
    'driver_accepted': 'Chauffeur a accepté',
    'in_progress': 'En cours',
    'delivered': 'Livrée',
    'cancelled': 'Annulée',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
    'pending_acceptance': 'bg-orange-500',
    'accepted': 'bg-blue-500',
    'dispatched': 'bg-purple-500',
    'driver_accepted': 'bg-teal-500',
    'in_progress': 'bg-indigo-500',
    'delivered': 'bg-green-500',
    'cancelled': 'bg-red-500',
};

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
