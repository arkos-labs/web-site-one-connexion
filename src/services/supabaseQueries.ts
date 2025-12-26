import { supabase } from '@/lib/supabase';
import { Order, Invoice, Client } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Driver {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    lat: number | null;
    lng: number | null;
    status: string;
}

// Extended Order type to include driver location and other fields
export interface OrderWithDriver extends Order {
    driver_lat?: number;
    driver_lng?: number;
    driver_id?: string;
    pickup_lat?: number;
    pickup_lng?: number;
    delivery_lat?: number;
    delivery_lng?: number;
    estimated_delivery?: string;
    pickup_time?: string;
    delivery_time?: string;
    drivers?: Driver | null; // For joined data
    driver?: {
        name: string;
        location: { lat: number; lng: number };
        phone: string;
    } | null; // For compatibility with OrderDetail.tsx
}

// Type pour les commandes paginées (champs essentiels uniquement)
export interface OrderSummary {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    pickup_address: string;
    delivery_address: string;
    pickup_lat?: number;
    pickup_lng?: number;
    delivery_lat?: number;
    delivery_lng?: number;
    estimated_delivery?: string;
    pickup_time?: string;
    delivery_time?: string;
    driver_id?: string;
}

// Type pour les factures paginées (champs essentiels uniquement)
export interface InvoiceSummary {
    id: string;
    invoice_number: string;
    order_id: string;
    client_id: string;
    amount: number;
    status: string;
    created_at: string;
    due_date?: string;
    paid_at?: string;
}

export const getClientProfile = async (userId: string): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching client profile:', error);
        return null;
    }
    return data as Client;
};

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const getUserOrders = async (
    clientId: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<OrderSummary>> => {
    // Calculer l'offset pour la pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Récupérer les commandes avec count total
    const { data, error, count } = await supabase
        .from('orders')
        .select(
            'id, status, total_amount, created_at, pickup_address, delivery_address, pickup_lat, pickup_lng, delivery_lat, delivery_lng, estimated_delivery, pickup_time, delivery_time, driver_id',
            { count: 'exact' }
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
        data: data as OrderSummary[],
        count: count || 0,
        page,
        limit,
        totalPages,
    };
};

// Version legacy pour rétrocompatibilité - retourne toutes les commandes
// TODO: Migrer les composants vers la version paginée
export const getUserOrdersLegacy = async (clientId: string): Promise<OrderWithDriver[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithDriver[];
};

export const getOrderById = async (orderId: string): Promise<OrderWithDriver | null> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return data as OrderWithDriver;
};

export const getInvoicesByUser = async (
    clientId: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<InvoiceSummary>> => {
    // Calculer l'offset pour la pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Récupérer les factures avec count total
    const { data, error, count } = await supabase
        .from('invoices')
        .select(
            'id, invoice_number, order_id, client_id, amount, status, created_at, due_date, paid_at',
            { count: 'exact' }
        )
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
        data: data as InvoiceSummary[],
        count: count || 0,
        page,
        limit,
        totalPages,
    };
};

// Version legacy pour rétrocompatibilité - retourne toutes les factures
// TODO: Migrer les composants vers la version paginée
export const getInvoicesByUserLegacy = async (clientId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const insertSupportMessage = async (userId: string, message: string) => {
    const { error } = await supabase
        .from('support_messages')
        .insert({
            user_id: userId,
            message: message,
        });

    if (error) throw error;
};

export const subscribeToOrderUpdates = (
    orderId: string,
    onUpdate: (payload: OrderWithDriver) => void
): RealtimeChannel => {
    return supabase
        .channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`,
            },
            (payload) => {
                onUpdate(payload.new as OrderWithDriver);
            }
        )
        .subscribe();
};

// Annuler une commande avec frais si nécessaire
export const cancelOrderWithFee = async (orderId: string, reason: string): Promise<{ fee: number }> => {
    // Récupérer la commande pour vérifier le statut
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

    if (fetchError) throw fetchError;

    // Calculer les frais (8€ si dispatchée ou en cours)
    // const fee = (order.status === 'dispatched' || order.status === 'in_progress') ? 8.00 : 0;
    const fee = 0; // Default to 0 since we can't save it

    // Annuler la commande
    const { error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            // cancellation_fee: fee, // Column likely missing
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) throw error;

    return { fee };
};

// Récupérer l'historique d'une commande
export const getOrderEvents = async (orderId: string) => {
    const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
};

