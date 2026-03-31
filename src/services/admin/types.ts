import { Order, Client } from '@/lib/supabase';

export interface Driver {
    id: string;
    user_id?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    vehicle_type?: string;
    vehicle_registration?: string;
    license_number?: string;
    insurance_document?: string;
    license_expiry?: string;
    insurance_expiry?: string;
    license_document_url?: string;
    insurance_document_url?: string;
    is_online?: boolean;
    last_location_update?: string;
    status: 'available' | 'busy' | 'offline' | 'suspended';
    siret?: string;
    vehicle_capacity?: string;
    created_at: string;
    updated_at?: string;
}

export interface OrderWithDetails extends Order {
    clients?: Client;
    drivers?: Driver;
    user_id?: string | null;
    email_client?: string;
    nom_client?: string;
    facturation?: {
        societe?: string;
        nom?: string;
        adresse?: string;
        siret?: string;
        email?: string;
        telephone?: string;
    };
    distance_km?: number;
}

export interface MessageData {
    id?: string;
    client_id: string;
    sender_type: 'admin' | 'client';
    subject?: string;
    message: string;
    is_read: boolean;
    created_at?: string;
    thread_id?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
