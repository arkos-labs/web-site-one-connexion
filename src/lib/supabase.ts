// Configuration Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('⚠️ Supabase environment variables are missing or use placeholders. Authentication will not work.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

console.log('Supabase initialized for:', supabaseUrl?.split('//')[1]?.split('.')[0] || 'Unknown Project');

supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth State Change:', event, session?.user?.email);
});

// Export des types
export type { Admin } from '@/types/admin';

export interface Order {
    id: string;
    reference: string;
    client_id: string;
    client_code: string;
    pickup_address: string;
    delivery_address: string;
    delivery_type: string;
    price: number;
    status: 'pending_acceptance' | 'accepted' | 'dispatched' | 'driver_accepted' | 'in_progress' | 'delivered' | 'cancelled';
    created_at: string;
    updated_at: string;
    driver_id?: string;
    accepted_at?: string;
    dispatched_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    cancellation_fee?: number;
    pickup_lat?: number;
    pickup_lng?: number;
    delivery_lat?: number;
    delivery_lng?: number;
    pickup_time?: string;
    user_id?: string;

    // Informations d'enlèvement
    pickup_contact_name?: string;
    pickup_contact_phone?: string;
    pickup_instructions?: string;

    // Informations de livraison
    delivery_contact_name?: string;
    delivery_contact_phone?: string;
    delivery_instructions?: string;

    // Détails de la commande
    package_type?: string;
    formula?: string;
    schedule_type?: string;
    notes?: string;

    // Informations de facturation (pour les commandes sans compte)
    billing_name?: string;
    billing_address?: string;
    billing_zip?: string;
    billing_city?: string;
    billing_company?: string;
    billing_siret?: string;
    sender_email?: string;
}

export interface Invoice {
    id: string;
    reference: string;
    created_at: string;
    amount_ht: number;
    amount_tva: number;
    amount_ttc: number;
    status: 'paid' | 'pending' | 'overdue';
    month: number;
    year: number;
    pdf_url?: string;
    stripe_payment_link?: string;
    client_id: string;
    due_date?: string;
    paid_date?: string;
    clients?: {
        id: string;
        company_name: string;
        email: string;
    };
}

export interface Client {
    id: string;
    created_at: string;
    company_name: string;
    internal_code?: string;
    siret?: string;
    email: string;
    phone?: string;
    address?: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    billing_address?: string;
    tva_number?: string;
    iban?: string;
    email_notif?: boolean;
    sms_notif?: boolean;
    auto_invoice?: boolean;
    status?: 'active' | 'suspended' | 'deleted' | 'pending';
    sector?: string;
    notes?: string;
    is_suspended?: boolean;
    suspended_at?: string;
    suspension_reason?: string;
}

// Fonction pour récupérer toutes les commandes d'un client
export const getClientOrders = async (clientId: string): Promise<Order[]> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return data as Order[] || [];
    } catch (error) {
        console.error('Error in getClientOrders:', error);
        return [];
    }
};

// Fonction pour récupérer une commande par son ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) throw error;
        return data as Order;
    } catch (error) {
        console.error('Error in getOrderById:', error);
        return null;
    }
};

export const getClientInvoices = async (clientId: string): Promise<Invoice[]> => {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invoices:', error);
            return [];
        }

        return data as Invoice[] || [];
    } catch (error) {
        console.error('Error in getClientInvoices:', error);
        return [];
    }
};
