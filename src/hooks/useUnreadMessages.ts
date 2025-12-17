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
                    // Mode Admin : Messages venant des clients (tous)
                    query = query
                        .eq('sender_type', 'client');
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
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    fetchUnreadCount();
                }
            );

        // Subscribe to contact_messages for admins
        if (userType === 'admin') {
            channel.on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'contact_messages',
                },
                () => {
                    fetchUnreadCount();
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
