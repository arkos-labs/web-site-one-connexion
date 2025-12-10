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

                const { count, error } = await query;

                if (error) throw error;

                setUnreadCount(count || 0);
            } catch (error) {
                console.error('Error fetching unread messages count:', error);
                setUnreadCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchUnreadCount();

        // S'abonner aux changements
        const subscription = supabase
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
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userType, clientId]);

    return { unreadCount, loading };
};
