import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface NewOrderNotification {
    orderId: string;
    reference: string;
    pickupAddress: string;
    deliveryAddress: string;
}

export const useNewOrderNotifications = (onNewOrder?: (order: NewOrderNotification) => void) => {
    const { role, isLoading } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'dispatcher';
    const lastOrderIdRef = useRef<string | null>(null);
    const notificationSoundRef = useRef<any>(null);
    const activeToastRef = useRef<string | number | null>(null);

    // Initialize notification sound
    useEffect(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const createNotificationSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            // Increased volume to 0.8 for louder sound
            gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        };

        notificationSoundRef.current = {
            play: () => {
                try {
                    createNotificationSound();
                    setTimeout(createNotificationSound, 200);
                } catch (error) {
                    console.error('Error playing notification sound:', error);
                }
            }
        };

        return () => {
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, []);

    const showNotification = useCallback((order: NewOrderNotification) => {
        notificationSoundRef.current?.play();

        if (activeToastRef.current) {
            toast.dismiss(activeToastRef.current);
        }

        const message = `🚨 Nouvelle commande: ${order.reference}\n📍 ${order.pickupAddress} → ${order.deliveryAddress}`;

        const toastId = toast(message, {
            duration: 20000,
            position: 'top-right',
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: '2px solid white',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'pre-line',
            },
            action: {
                label: 'Voir',
                onClick: () => {
                    if (onNewOrder) {
                        onNewOrder(order);
                    }
                    toast.dismiss(toastId);
                }
            }
        });

        activeToastRef.current = toastId;

        setTimeout(() => {
            if (activeToastRef.current === toastId) {
                activeToastRef.current = null;
            }
        }, 20000);
    }, [onNewOrder]);

    const checkForNewOrders = useCallback(async () => {
        if (!isAdmin) return; // Double check inside function

        try {
            const { data: latestOrder, error } = await supabase
                .from('orders')
                .select('id, reference, pickup_address, delivery_address, created_at')
                .eq('status', 'pending_acceptance')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (latestOrder && latestOrder.id !== lastOrderIdRef.current) {
                const orderAge = Date.now() - new Date(latestOrder.created_at).getTime();
                if (orderAge < 30000) {
                    lastOrderIdRef.current = latestOrder.id;

                    showNotification({
                        orderId: latestOrder.id,
                        reference: latestOrder.reference,
                        pickupAddress: latestOrder.pickup_address,
                        deliveryAddress: latestOrder.delivery_address,
                    });
                } else {
                    lastOrderIdRef.current = latestOrder.id;
                }
            }
        } catch (error) {
            console.error('Error checking for new orders:', error);
        }
    }, [showNotification, isAdmin]);

    useEffect(() => {
        if (isLoading || !isAdmin) return;

        checkForNewOrders();

        const interval = setInterval(checkForNewOrders, 2000);

        const channel = supabase
            .channel('new-orders-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: 'status=eq.pending_acceptance'
                },
                (payload) => {
                    const newOrder = payload.new as any;
                    lastOrderIdRef.current = newOrder.id;

                    showNotification({
                        orderId: newOrder.id,
                        reference: newOrder.reference,
                        pickupAddress: newOrder.pickup_address,
                        deliveryAddress: newOrder.delivery_address,
                    });
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
            if (activeToastRef.current) {
                toast.dismiss(activeToastRef.current);
            }
        };
    }, [checkForNewOrders, showNotification, isAdmin, isLoading]);

    return null;
};
