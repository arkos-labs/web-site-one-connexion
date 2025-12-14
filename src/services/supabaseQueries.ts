import { supabase } from '@/lib/supabase';
import { Order, Invoice, Client } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
    drivers?: any; // For joined data
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

export const getUserOrders = async (clientId: string): Promise<OrderWithDriver[]> => {
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

export const getInvoicesByUser = async (clientId: string): Promise<Invoice[]> => {
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
    const fee = (order.status === 'dispatched' || order.status === 'in_progress') ? 8.00 : 0;

    // Annuler la commande
    const { error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancellation_fee: fee,
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

