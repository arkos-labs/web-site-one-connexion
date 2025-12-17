import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { subscribeToOrderUpdates } from '@/services/supabaseQueries';

export interface OrderTracking {
    orderId: string;
    status: 'pending_acceptance' | 'accepted' | 'dispatched' | 'in_progress' | 'delivered' | 'cancelled';
    driver: {
        id: string;
        name: string;
        phone: string;
        location: {
            lat: number;
            lng: number;
            timestamp: string;
        } | null;
    } | null;
    pickup: {
        address: string;
        lat: number;
        lng: number;
    };
    delivery: {
        address: string;
        lat: number;
        lng: number;
    };
    eta: string | null;
    progress: number;
    created_at: string;
    updated_at?: string;
    pickup_time: string | null;
    delivery_time: string | null;
    accepted_at: string | null;
    dispatched_at: string | null;
}

// Hook pour récupérer et rafraîchir les données de suivi via Realtime
export const useOrderTracking = (orderId: string | null) => {
    const [tracking, setTracking] = useState<OrderTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ref pour accéder au dernier état dans le setInterval
    const trackingRef = useRef<OrderTracking | null>(null);
    useEffect(() => {
        trackingRef.current = tracking;
    }, [tracking]);

    const updateTrackingState = useCallback((order: any) => {
        // Construire l'objet de suivi
        const driverData = order.drivers ? {
            id: order.drivers.id,
            name: `${order.drivers.first_name} ${order.drivers.last_name}`,
            phone: order.drivers.phone,
            location: (order.driver_lat && order.driver_lng) ? {
                lat: order.driver_lat,
                lng: order.driver_lng,
                timestamp: new Date().toISOString(),
            } : null
        } : null;

        // Calculer la progression
        let progress = 0;
        switch (order.status) {
            case 'pending_acceptance': progress = 10; break;
            case 'accepted': progress = 20; break;
            case 'dispatched': progress = 30; break;
            case 'assigned': progress = 40; break;
            case 'pickup': progress = 50; break;
            case 'in_progress': progress = 75; break;
            case 'delivered': progress = 100; break;
            default: progress = 0;
        }

        const trackingData: OrderTracking = {
            orderId: order.reference,
            status: order.status as any,
            driver: driverData,
            pickup: {
                address: order.pickup_address,
                lat: order.pickup_lat || 48.8566,
                lng: order.pickup_lng || 2.3522,
            },
            delivery: {
                address: order.delivery_address,
                lat: order.delivery_lat || 48.8566,
                lng: order.delivery_lng || 2.3522,
            },
            eta: order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            progress: progress,
            created_at: order.created_at,
            updated_at: order.updated_at,
            pickup_time: order.pickup_time,
            delivery_time: order.delivery_time,
            accepted_at: order.accepted_at,
            dispatched_at: order.dispatched_at,
        };

        setTracking(trackingData);
        setError(null);
    }, []);

    const fetchTracking = useCallback(async (isSilent = false) => {
        if (!orderId) return;
        try {
            if (!isSilent) setLoading(true);

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select(`
                    *,
                    drivers:driver_id (
                        id,
                        first_name,
                        last_name,
                        phone
                    )
                `)
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;
            if (!order) throw new Error('Commande non trouvée');

            updateTrackingState(order);

        } catch (err: any) {
            console.error('Error fetching tracking data:', err);
            if (!isSilent) setError('Impossible de récupérer les données de suivi');
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [orderId, updateTrackingState]);

    // Initial load & Realtime subscription
    useEffect(() => {
        if (!orderId) {
            setTracking(null);
            setLoading(false);
            return;
        }

        // Chargement initial
        fetchTracking(false);

        // Abonnement Realtime
        const channel = subscribeToOrderUpdates(orderId, () => {
            // Recharger silencieusement lors d'une notif realtime
            fetchTracking(true);
        });

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [orderId, fetchTracking]);

    // Polling rapide (1s) pour les commandes actives
    useEffect(() => {
        if (!orderId) return;

        const interval = setInterval(() => {
            const status = trackingRef.current?.status;
            // Rafraîchir si la commande est active
            if (status && ['accepted', 'dispatched', 'in_progress'].includes(status)) {
                fetchTracking(true);
            }
        }, 1000); // Rafraîchissement toutes les secondes

        return () => clearInterval(interval);
    }, [orderId, fetchTracking]);

    return { tracking, loading, error };
};

// Hook pour récupérer les commandes actives
export const useActiveOrders = (clientId?: string) => {
    const [orders, setOrders] = useState<Array<{ id: string; status: string; reference: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        const fetchActiveOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, status, reference, delivered_at, updated_at')
                    .eq('client_id', clientId)
                    .neq('status', 'cancelled')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                const filteredOrders = data?.filter(order => {
                    // Garder les commandes non livrées (en cours, etc.)
                    if (order.status !== 'delivered') return true;

                    // Pour les commandes livrées, garder seulement si < 2 heures
                    const deliveryTime = order.delivered_at || order.updated_at;
                    if (!deliveryTime) return false;

                    const deliveryDate = new Date(deliveryTime);
                    const now = new Date();
                    const diffInHours = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60);

                    return diffInHours <= 2;
                }) || [];

                setOrders(filteredOrders.map(o => ({ id: o.id, status: o.status, reference: o.reference })));
            } catch (err) {
                console.error('Error fetching active orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveOrders();
    }, [clientId]);

    return { orders, loading };
};
