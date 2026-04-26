import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
        }
    }, []);

    const subscribeUser = useCallback(async () => {
        if (!isSupported) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);

            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                setSubscription(existingSubscription);
                return existingSubscription;
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error('Les notifications sont désactivées. Vous ne recevrez pas les alertes de mission.');
                return;
            }

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            };

            const newSubscription = await registration.pushManager.subscribe(subscribeOptions);
            setSubscription(newSubscription);

            // Save to Supabase
            const { p256dh, auth } = JSON.parse(JSON.stringify(newSubscription)).keys;

            const { error } = await supabase.from('push_subscriptions').insert({
                user_id: user.id,
                endpoint: newSubscription.endpoint,
                p256dh: p256dh,
                auth: auth
            });

            if (error) {
                console.error('Error saving subscription to Supabase:', error);
                toast.error('Erreur lors de l’activation des notifications.');
            } else {
                toast.success('Notifications activées avec succès !');
            }

            return newSubscription;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            toast.error('Impossible d’activer les notifications sur ce navigateur.');
        }
    }, [isSupported]);

    return { subscribeUser, subscription, isSupported };
};
