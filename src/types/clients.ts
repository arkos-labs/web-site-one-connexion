// Types pour la gestion des clients

export type ClientStatus = 'active' | 'inactive' | 'suspended';

export interface ClientContact {
    name: string;
    email: string;
    phone: string;
    position?: string;
}

export interface ClientAddress {
    street: string;
    city: string;
    postal_code: string;
    country: string;
}

export interface ClientBilling {
    total_invoiced: number;
    total_paid: number;
    total_unpaid: number;
    payment_method?: string;
    payment_terms?: number; // jours
}

export interface ClientMessage {
    id: string;
    subject: string;
    content: string;
    created_at: string;
    status: 'unread' | 'read' | 'replied';
    replied_at?: string;
}

export interface ClientInvoice {
    id: string;
    reference: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    created_at: string;
    due_date: string;
    paid_at?: string;
}

export interface ClientComplaint {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    resolved_at?: string;
    order_id?: string;
}

export interface ClientStats {
    total_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    pending_orders: number;
    in_progress_orders: number;
    total_spent: number;
    average_order_value: number;
}

export interface Client {
    id: string;
    internal_code: string;
    company_name: string;
    sector: string;
    email: string;
    phone: string;
    status: ClientStatus;
    siret?: string;
    vat_number?: string;
    address?: ClientAddress;
    contact?: ClientContact;
    billing: ClientBilling;
    stats: ClientStats;
    created_at: string;
    updated_at: string;
    suspended_at?: string;
    suspension_reason?: string;
    notes?: string;
}

// Helper functions
export const getClientStatusLabel = (status: ClientStatus): string => {
    const labels: Record<ClientStatus, string> = {
        active: 'Actif',
        inactive: 'Inactif',
        suspended: 'Suspendu'
    };
    return labels[status];
};

export const getClientStatusColor = (status: ClientStatus): string => {
    const colors: Record<ClientStatus, string> = {
        active: 'bg-success',
        inactive: 'bg-gray-500',
        suspended: 'bg-destructive'
    };
    return colors[status];
};

export const getComplaintStatusLabel = (status: ClientComplaint['status']): string => {
    const labels: Record<ClientComplaint['status'], string> = {
        open: 'Ouvert',
        in_progress: 'En cours',
        resolved: 'Résolu',
        closed: 'Fermé'
    };
    return labels[status];
};

export const getComplaintStatusColor = (status: ClientComplaint['status']): string => {
    const colors: Record<ClientComplaint['status'], string> = {
        open: 'bg-warning',
        in_progress: 'bg-info',
        resolved: 'bg-success',
        closed: 'bg-gray-500'
    };
    return colors[status];
};

export const getComplaintPriorityLabel = (priority: ClientComplaint['priority']): string => {
    const labels: Record<ClientComplaint['priority'], string> = {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Haute',
        urgent: 'Urgente'
    };
    return labels[priority];
};

export const getComplaintPriorityColor = (priority: ClientComplaint['priority']): string => {
    const colors: Record<ClientComplaint['priority'], string> = {
        low: 'bg-gray-500',
        medium: 'bg-blue-500',
        high: 'bg-warning',
        urgent: 'bg-destructive'
    };
    return colors[priority];
};

export const getInvoiceStatusLabel = (status: ClientInvoice['status']): string => {
    const labels: Record<ClientInvoice['status'], string> = {
        paid: 'Payée',
        pending: 'En attente',
        overdue: 'En retard'
    };
    return labels[status];
};

export const getInvoiceStatusColor = (status: ClientInvoice['status']): string => {
    const colors: Record<ClientInvoice['status'], string> = {
        paid: 'bg-success',
        pending: 'bg-warning',
        overdue: 'bg-destructive'
    };
    return colors[status];
};

export const getMessageStatusLabel = (status: ClientMessage['status']): string => {
    const labels: Record<ClientMessage['status'], string> = {
        unread: 'Non lu',
        read: 'Lu',
        replied: 'Répondu'
    };
    return labels[status];
};

export const getMessageStatusColor = (status: ClientMessage['status']): string => {
    const colors: Record<ClientMessage['status'], string> = {
        unread: 'bg-warning',
        read: 'bg-info',
        replied: 'bg-success'
    };
    return colors[status];
};
