import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseAutoRefreshOptions {
    enabled?: boolean;
    interval?: number; // en millisecondes
    useRealtime?: boolean;
    tableName?: string;
    onRefresh: () => void | Promise<void>;
}

/**
 * Hook personnalisé pour auto-refresh des données admin
 * Supporte à la fois le polling et Supabase Realtime
 */
export const useAutoRefresh = ({
    enabled = true,
    interval = 2000, // 2 secondes par défaut
    useRealtime = false,
    tableName,
    onRefresh,
}: UseAutoRefreshOptions) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const channelRef = useRef<any>(null);
    const isRefreshingRef = useRef(false);

    // Fonction de refresh avec protection contre les appels multiples
    const refresh = useCallback(async () => {
        if (isRefreshingRef.current) return;

        try {
            isRefreshingRef.current = true;
            await onRefresh();
        } catch (error) {
            console.error('Error during auto-refresh:', error);
        } finally {
            isRefreshingRef.current = false;
        }
    }, [onRefresh]);

    useEffect(() => {
        if (!enabled) return;

        if (useRealtime && tableName) {
            // Mode Realtime
            channelRef.current = supabase
                .channel(`admin-${tableName}-refresh`)
                .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
                    refresh();
                })
                .subscribe();
        } else {
            // Mode Polling
            intervalRef.current = setInterval(refresh, interval);
        }

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [enabled, interval, useRealtime, tableName, refresh]);

    // Fonction pour forcer un refresh manuel
    const forceRefresh = useCallback(() => {
        refresh();
    }, [refresh]);

    return { forceRefresh };
};
