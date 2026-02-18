// ============================================
// CONFIGURATION OPTIMISÉE DE REACT QUERY
// ============================================
// Ce fichier configure React Query pour des performances optimales
// avec cache intelligent et refetch strategies

import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { assignOrderToDriver, AssignOrderParams } from '@/services/orderAssignment';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache les données pendant 5 minutes
            staleTime: 5 * 60 * 1000,

            // Garde les données en cache pendant 10 minutes
            gcTime: 10 * 60 * 1000,

            // Refetch automatique quand la fenêtre reprend le focus
            refetchOnWindowFocus: true,

            // Refetch automatique lors de la reconnexion
            refetchOnReconnect: true,

            // Retry 3 fois en cas d'erreur
            retry: 3,

            // Délai exponentiel entre les retries
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            // Retry 1 fois pour les mutations
            retry: 1,

            // Gestion globale des erreurs de mutation
            onError: (error) => {
                console.error('Mutation error:', error);
                // Vous pouvez ajouter un toast ici
            },
        },
    },
});

// ============================================
// HOOKS PERSONNALISÉS POUR LES QUERIES
// ============================================

/**
 * Hook pour récupérer les commandes avec cache intelligent
 */
export function useOrders(status?: string) {
    return useQuery({
        queryKey: ['orders', status],
        queryFn: async () => {
            const query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        // Refetch toutes les 30 secondes pour les données en temps réel
        refetchInterval: 30000,
    });
}

/**
 * Hook pour récupérer les chauffeurs disponibles
 */
export function useAvailableDrivers() {
    return useQuery({
        queryKey: ['drivers', 'available'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('drivers')
                .select('*')
                .in('status', ['online', 'busy'])
                .order('first_name', { ascending: true });

            if (error) throw error;
            return data;
        },
        // Refetch toutes les 10 secondes
        refetchInterval: 10000,
    });
}

/**
 * Hook pour assigner une commande avec optimistic update
 */
export function useAssignOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: AssignOrderParams) => {
            return await assignOrderToDriver(params);
        },
        // Optimistic update : met à jour l'UI immédiatement
        onMutate: async (params) => {
            // Annuler les refetch en cours
            await queryClient.cancelQueries({ queryKey: ['orders'] });

            // Snapshot de l'état actuel
            const previousOrders = queryClient.getQueryData(['orders']);

            // Mise à jour optimiste
            queryClient.setQueryData(['orders'], (old: any) => {
                return old?.map((order: any) =>
                    order.id === params.orderId
                        ? { ...order, driver_id: params.driverUserId, status: 'assigned' }
                        : order
                );
            });

            return { previousOrders };
        },
        // En cas d'erreur, rollback
        onError: (err, params, context) => {
            queryClient.setQueryData(['orders'], context?.previousOrders);
            toast.error('Erreur lors de l\'assignation');
        },
        // En cas de succès, refetch pour être sûr
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            toast.success('Course assignée avec succès');
        },
    });
}
