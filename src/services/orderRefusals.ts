import { supabase } from '@/lib/supabase';

export interface OrderRefusalInfo {
    orderId: string;
    refusalCount: number;
    refusedBy: Array<{
        driverId: string;
        driverName: string;
        refusedAt: string;
    }>;
}

/**
 * Récupère l'historique des refus pour une commande
 */
export async function getOrderRefusals(orderId: string): Promise<OrderRefusalInfo> {
    try {
        // Récupérer tous les événements de refus pour cette commande
        const { data: events, error } = await supabase
            .from('order_events')
            .select('*, metadata, actor_id, created_at')
            .eq('order_id', orderId)
            .eq('event_type', 'driver_declined')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching order refusals:', error);
            return {
                orderId,
                refusalCount: 0,
                refusedBy: []
            };
        }

        // Récupérer les informations des chauffeurs qui ont refusé
        const driverIds = events?.map(e => e.actor_id).filter(Boolean) || [];
        const uniqueDriverIds = [...new Set(driverIds)];

        let driverNames: Record<string, string> = {};

        if (uniqueDriverIds.length > 0) {
            const { data: drivers } = await supabase
                .from('drivers')
                .select('id, first_name, last_name')
                .in('id', uniqueDriverIds);

            if (drivers) {
                driverNames = drivers.reduce((acc, d) => {
                    acc[d.id] = `${d.first_name} ${d.last_name}`;
                    return acc;
                }, {} as Record<string, string>);
            }
        }

        const refusedBy = events?.map(event => ({
            driverId: event.actor_id || 'unknown',
            driverName: driverNames[event.actor_id] || 'Chauffeur inconnu',
            refusedAt: event.created_at
        })) || [];

        return {
            orderId,
            refusalCount: events?.length || 0,
            refusedBy
        };
    } catch (error) {
        console.error('Unexpected error fetching refusals:', error);
        return {
            orderId,
            refusalCount: 0,
            refusedBy: []
        };
    }
}

/**
 * Récupère les refus pour plusieurs commandes en une seule requête
 */
export async function getMultipleOrderRefusals(orderIds: string[]): Promise<Map<string, OrderRefusalInfo>> {
    if (orderIds.length === 0) {
        return new Map();
    }

    try {
        // Récupérer tous les événements de refus pour ces commandes
        const { data: events, error } = await supabase
            .from('order_events')
            .select('*, metadata, actor_id, created_at, order_id')
            .in('order_id', orderIds)
            .eq('event_type', 'driver_declined')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching multiple order refusals:', error);
            return new Map();
        }

        // Récupérer les informations des chauffeurs
        const driverIds = events?.map(e => e.actor_id).filter(Boolean) || [];
        const uniqueDriverIds = [...new Set(driverIds)];

        let driverNames: Record<string, string> = {};

        if (uniqueDriverIds.length > 0) {
            const { data: drivers } = await supabase
                .from('drivers')
                .select('id, first_name, last_name')
                .in('id', uniqueDriverIds);

            if (drivers) {
                driverNames = drivers.reduce((acc, d) => {
                    acc[d.id] = `${d.first_name} ${d.last_name}`;
                    return acc;
                }, {} as Record<string, string>);
            }
        }

        // Grouper par order_id
        const refusalsByOrder = new Map<string, OrderRefusalInfo>();

        orderIds.forEach(orderId => {
            const orderEvents = events?.filter(e => e.order_id === orderId) || [];

            const refusedBy = orderEvents.map(event => ({
                driverId: event.actor_id || 'unknown',
                driverName: driverNames[event.actor_id] || 'Chauffeur inconnu',
                refusedAt: event.created_at
            }));

            refusalsByOrder.set(orderId, {
                orderId,
                refusalCount: orderEvents.length,
                refusedBy
            });
        });

        return refusalsByOrder;
    } catch (error) {
        console.error('Unexpected error fetching multiple refusals:', error);
        return new Map();
    }
}
