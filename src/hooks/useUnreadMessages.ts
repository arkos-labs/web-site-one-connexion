import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useUnreadMessages = (userType: 'admin' | 'client', clientId?: string) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Si mode client mais pas d'ID (chargement du profil), on attend
        if (userType === 'client' && !clientId) {
            setLoading(true);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                let query = supabase
                    .from('messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('is_read', false);

                if (userType === 'client') {
                    // Mode Client : Messages venant de l'admin pour ce client
                    query = query
                        .eq('client_id', clientId)
                        .eq('sender_type', 'admin');
                } else {
                    // Mode Admin : Messages venant des clients OU chauffeurs
                    // We can't use .in() properly with the current fluent chaining if we had previous filters? 
                    // Let's rely on the fact that for admin, we want everything NOT from admin.
                    query = query.neq('sender_type', 'admin');
                }

                const { count: messagesCount, error } = await query;

                if (error) throw error;

                let totalCount = messagesCount || 0;

                // If Admin, also count unread contact messages
                if (userType === 'admin') {
                    const { count: contactCount, error: contactError } = await supabase
                        .from('contact_messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('status', 'new');

                    if (!contactError) {
                        totalCount += (contactCount || 0);
                    }
                }

                setUnreadCount(totalCount);
            } catch (error) {
                console.error('Error fetching unread messages count:', error);
                setUnreadCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUnreadCount();

        // S'abonner aux changements
        const channel = supabase
            .channel('unread_messages_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    fetchUnreadCount();
                    // Play sound and alert if we are admin and it's an incoming message
                    const newMsg = payload.new as any;
                    if (userType === 'admin' && newMsg.sender_type !== 'admin') {
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(e => console.error("Audio play failed", e));
                            // We could also show a toast here if we imported it, but the Sidebar doesn't typically show toasts for messages, 
                            // usually it just updates the badge. However the user requested "alerte message sonore des 2 cote".
                        } catch (e) {
                            console.error("Audio error", e);
                        }
                    }
                }
            );

        // Subscribe to contact_messages for admins
        if (userType === 'admin') {
            channel.on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'contact_messages',
                },
                () => {
                    fetchUnreadCount();
                    if (userType === 'admin') {
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(e => console.error("Audio play failed", e));
                        } catch (e) {
                            console.error("Audio error", e);
                        }
                    }
                }
            );
        }

        const subscription = channel.subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userType, clientId]);

    return { unreadCount, loading };
};
