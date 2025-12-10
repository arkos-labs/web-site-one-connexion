// Types pour la gestion des chauffeurs

import { DriverStatus } from './orders';

export interface DriverVehicle {
    brand: string;
    model: string;
    plate_number: string;
    type: 'scooter' | 'moto' | 'voiture' | 'velo';
    color?: string;
}

export interface DriverDocument {
    id: string;
    type: 'license' | 'registration' | 'insurance' | 'identity';
    name: string;
    file_url?: string;
    expiry_date?: string;
    uploaded_at: string;
    status: 'valid' | 'expired' | 'pending';
}

export interface DriverLocation {
    latitude: number;
    longitude: number;
    updated_at: string;
}

export interface DriverStats {
    total_deliveries: number;
    completed_deliveries: number;
    cancelled_deliveries: number;
    pending_deliveries: number;
    total_earnings: number;
    average_rating: number;
    total_distance_km: number;
}

export interface DriverOrder {
    id: string;
    reference: string;
    status: string;
    pickup_address: string;
    delivery_address: string;
    price: number;
    created_at: string;
    delivered_at?: string;
    cancelled_at?: string;
    client_name?: string;
}

export interface Driver {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: DriverStatus;
    avatar_url?: string;
    vehicle?: DriverVehicle;
    documents: DriverDocument[];
    current_location?: DriverLocation;
    stats: DriverStats;
    created_at: string;
    updated_at: string;
}

export interface DriversMapFilter {
    online: boolean;
    offline: boolean;
    on_break: boolean;
    on_vacation: boolean;
    on_delivery: boolean;
}

// Helper functions
export const getDocumentTypeLabel = (type: DriverDocument['type']): string => {
    const labels: Record<DriverDocument['type'], string> = {
        license: 'Permis de conduire',
        registration: 'Carte grise',
        insurance: 'Assurance',
        identity: 'Pièce d\'identité'
    };
    return labels[type];
};

export const getDocumentStatusColor = (status: DriverDocument['status']): string => {
    const colors: Record<DriverDocument['status'], string> = {
        valid: 'bg-success',
        expired: 'bg-destructive',
        pending: 'bg-warning'
    };
    return colors[status];
};

export const getDocumentStatusLabel = (status: DriverDocument['status']): string => {
    const labels: Record<DriverDocument['status'], string> = {
        valid: 'Valide',
        expired: 'Expiré',
        pending: 'En attente'
    };
    return labels[status];
};

export const getVehicleTypeLabel = (type: DriverVehicle['type']): string => {
    const labels: Record<DriverVehicle['type'], string> = {
        scooter: 'Scooter',
        moto: 'Moto',
        voiture: 'Voiture',
        velo: 'Vélo'
    };
    return labels[type];
};

export const getVehicleIcon = (type: DriverVehicle['type']): string => {
    const icons: Record<DriverVehicle['type'], string> = {
        scooter: '🛵',
        moto: '🏍️',
        voiture: '🚗',
        velo: '🚴'
    };
    return icons[type];
};

export const isDocumentExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

export const isDocumentExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry < now;
};
