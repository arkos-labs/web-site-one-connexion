import { supabase } from '@/lib/supabase';

export interface AssignOrderParams {
    orderId: string;
    driverId: string;      // ID de la table drivers (UUID) pour la relation FK
    driverUserId: string;  // user_id (Auth ID) pour les notifications et real-time
    adminId: string;
}

/**
 * Assigne une commande à un chauffeur
 */
export async function assignOrderToDriver(params: AssignOrderParams) {
    const { orderId, driverId, driverUserId, adminId } = params;

    try {
        // 1. Mettre à jour la commande
        // Tentative standard avec retour de données
        // IMPORTANT: driver_id doit être l'ID de la table drivers (UUID) pour la FK, pas le user_id (Auth)
        let { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                driver_id: driverId, // ✅ UUID de la table drivers pour respecter la FK
                status: 'dispatched',
                dispatched_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        // Workaround: Si erreur 406 (RLS policy often blocks 'select' return on update), on réessaie SANS le .select()
        if (orderError && (orderError.code === '406' || orderError.message?.includes('406'))) {
            console.warn('⚠️ Erreur 406 détectée, tentative de mise à jour sans retour de données...');
            const { error: retryError } = await supabase
                .from('orders')
                .update({
                    driver_id: driverId, // ✅ UUID de la table drivers pour respecter la FK
                    status: 'dispatched',
                    dispatched_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (retryError) {
                orderError = retryError; // L'erreur persiste
            } else {
                orderError = null; // Succès !
                // On récupère l'ordre manuellement après coup pour l'interface
                const { data: refetchedOrders } = await supabase.from('orders').select('*').eq('id', orderId).limit(1);
                order = refetchedOrders?.[0] || null;
            }
        }

        if (orderError) {
            console.error('Erreur assignation commande:', orderError);
            return { success: false, error: orderError };
        }

        // 2. Mettre à jour le statut du chauffeur à 'busy'
        // On essaie d'abord par id (UUID de la table drivers), puis par user_id si nécessaire
        let { error: driverError } = await supabase
            .from('drivers')
            .update({
                status: 'busy',
                updated_at: new Date().toISOString()
            })
            .eq('id', driverId); // ✅ Utiliser l'ID de la table drivers

        // Fallback: si l'update par id échoue, essayer par user_id
        if (driverError) {
            console.warn('Update par id échoué, tentative par user_id...');
            const { error: retryDriverError } = await supabase
                .from('drivers')
                .update({
                    status: 'busy',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', driverUserId);

            if (retryDriverError) {
                console.warn('Erreur mise à jour statut chauffeur:', retryDriverError);
            }
        }

        // 3. Créer une notification pour le chauffeur (si la table existe)
        try {
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: driverUserId, // ✅ Utiliser user_id (Auth ID)
                    title: '🚚 Nouvelle course assignée',
                    message: `Une nouvelle course vous a été assignée. Référence: ${order?.reference || orderId}`,
                    type: 'info',
                    link: `/order/${orderId}`,
                    is_read: false
                });

            if (notifError) {
                console.warn('Erreur création notification:', notifError);
            }
        } catch (notifError) {
            console.warn('Impossible de créer la notification:', notifError);
        }

        // 4. Créer un événement dans l'historique de la commande
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'assigned',
                    description: `Course assignée au chauffeur`,
                    actor_type: 'admin',
                    metadata: {
                        driver_id: driverId,
                        admin_id: adminId,
                        assigned_at: new Date().toISOString()
                    }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }

        console.log('✅ Commande assignée avec succès:', order);
        return { success: true, data: order };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}

/**
 * Récupère les commandes en attente d'assignation (status = 'accepted')
 */
export async function getPendingOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'accepted')
            .order('scheduled_pickup_time', { ascending: true, nullsFirst: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Erreur récupération commandes:', error);
            return { success: false, error, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error, data: [] };
    }
}

/**
 * Récupère les chauffeurs en ligne (status = 'online')
 */
export async function getOnlineDrivers() {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('status', 'online');

        if (error) {
            console.error('Erreur récupération chauffeurs:', error);
            return { success: false, error, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error, data: [] };
    }
}

/**
 * Récupère les chauffeurs disponibles (online ou available)
 */
export async function getAvailableDrivers() {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .in('status', ['online', 'available']);

        if (error) {
            console.error('Erreur récupération chauffeurs disponibles:', error);
            return { success: false, error, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error, data: [] };
    }
}

/**
 * Annule l'assignation d'une commande
 */
export async function unassignOrder(orderId: string, reason?: string) {
    try {
        // Récupérer l'ID du chauffeur avant de désassigner
        const { data: orders } = await supabase
            .from('orders')
            .select('driver_id')
            .eq('id', orderId)
            .limit(1);

        const order = orders?.[0];

        // Mettre à jour la commande
        const { error: orderError } = await supabase
            .from('orders')
            .update({
                driver_id: null,
                status: 'accepted',
                dispatched_at: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (orderError) {
            console.error('Erreur désassignation commande:', orderError);
            return { success: false, error: orderError };
        }

        // Remettre le chauffeur en ligne si c'était le seul ordre assigné
        if (order?.driver_id) {
            const { data: otherOrders } = await supabase
                .from('orders')
                .select('id')
                .eq('driver_id', order.driver_id)
                .in('status', ['assigned', 'dispatched', 'driver_accepted', 'in_progress'])
                .limit(1);

            if (!otherOrders || otherOrders.length === 0) {
                // Essayer de mettre à jour par id (UUID de drivers)
                const { error: updateError } = await supabase
                    .from('drivers')
                    .update({
                        status: 'online',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', order.driver_id); // ✅ driver_id est maintenant l'ID de la table drivers

                // Fallback par user_id si nécessaire (anciens enregistrements)
                if (updateError) {
                    await supabase
                        .from('drivers')
                        .update({
                            status: 'online',
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', order.driver_id);
                }
            }
        }

        // Créer un événement
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'unassigned',
                    description: reason || 'Course désassignée',
                    actor_type: 'admin',
                    metadata: {
                        reason,
                        unassigned_at: new Date().toISOString()
                    }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }

        console.log('✅ Commande désassignée avec succès');
        return { success: true };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}
