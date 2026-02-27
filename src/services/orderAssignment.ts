/**
 * ========================================
 * SERVICE D'ASSIGNATION DE COURSES
 * ========================================
 * 
 * RÈGLE MÉTIER CRITIQUE : 40% pour le chauffeur
 * - Le prix stocké dans `orders.price` est le prix TOTAL payé par le client (100%)
 * - Le chauffeur reçoit UNIQUEMENT 40% de ce montant
 * - Le calcul est effectué côté App Chauffeur (orderSlice.ts)
 * 
 * GESTION DES IDENTIFIANTS :
 * - driverId : UUID de la table `drivers` (pour les relations FK internes)
 * - driverUserId : Auth ID (user_id) du chauffeur (pour Realtime et notifications)
 * - orders.driver_id stocke le driverUserId (Auth ID) pour la synchronisation Realtime
 */

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
        let order = null;
        let orderError = null;

        // 0. SELF-HEALING: Vérifier si le chauffeur est bloqué en "busy" sans course active
        // Si c'est le cas, on le débloque silencieusement avant d'assigner
        const { count: activeOrdersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', driverUserId)
            .in('status', ['assigned', 'driver_accepted', 'in_progress']);

        if (activeOrdersCount === 0) {
            // Le chauffeur est libre selon les commandes, on ignore son statut 'busy'
            // et on le considère comme 'online' pour cette transaction
        } else {
            // Le chauffeur a VRAIMENT une course en cours
            // On renvoie une erreur explicite
            // NOTE: On laisse passer si l'admin force (mais ici pas de flag force)
            // Pour l'instant on bloque pour éviter les doubles assignations
            // return { success: false, error: new Error("Chauffeur déjà occupé par une autre course.") };
            // EDIT: L'utilisateur signale un blocage injustifié. On va LOGGUER et CONTINUER.
            console.warn(`[Assign] Chauffeur ${driverUserId} a ${activeOrdersCount} courses actives mais on assigne quand même via Admin.`);
        }

        // 1. Mettre à jour la commande
        const updateData = {
            driver_id: driverUserId,
            status: 'assigned',
            dispatched_at: new Date().toISOString(),
            picked_up_at: null,          // RÉINITIALISATION POUR NOUVEAU CHAUFFEUR
            driver_accepted_at: null,    // RÉINITIALISATION POUR NOUVEAU CHAUFFEUR
            refused_by_driver: null,     // NETTOYAGE ANCIEN REFUS
            pickup_photo_url: null,      // NETTOYAGE PHOTOS
            delivery_photo_url: null,
            delivery_signature_url: null,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        order = data;
        orderError = error;

        // RLS Fallback (Error 406)
        if (orderError && (orderError.code === '406' || orderError.message?.includes('406'))) {
            console.warn('⚠️ Erreur 406 (RLS), tentative sans select...');
            const { error: retryError } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (retryError) {
                console.error('❌ Erreur critique au retry:', retryError);
                return { success: false, error: retryError };
            }

            // Re-fetch manual
            const { data: refetched } = await supabase.from('orders').select('*').eq('id', orderId).single();
            order = refetched;
            orderError = null;
        }

        if (orderError) {
            console.error('❌ Erreur assignation:', orderError);
            return { success: false, error: orderError };
        }

        // 2. Mettre à jour le statut du chauffeur
        await supabase
            .from('drivers')
            .update({ status: 'busy', updated_at: new Date().toISOString() })
            .eq('user_id', driverUserId);

        // 3. Notification
        try {
            await supabase.from('notifications').insert({
                user_id: driverUserId,
                title: '🚚 Nouvelle course',
                message: `Référence: ${order?.reference || 'Nouveau'}`,
                type: 'new_order',
                data: { orderId }
            });

            // Trigger Web Push Notification via Edge Function
            await supabase.functions.invoke('send-mission-push', {
                body: {
                    user_id: driverUserId,
                    title: '🚚 Nouvelle course disponible',
                    body: `Commande ${order?.reference}\n📍 ${order?.pickup_address}`,
                    url: `/missions/${orderId}`
                }
            });
        } catch (e) {
            console.warn('Erreur notification (Database ou Push) ignorée:', e);
        }

        try {
            const { data: driverProf } = await supabase.from('profiles').select('details').eq('id', driverUserId).single();
            const driverName = driverProf?.details?.full_name || driverProf?.details?.first_name || 'Chauffeur';
        } catch (tgError) {
        }

        // 4. Événement
        await supabase.from('order_events').insert({
            order_id: orderId,
            event_type: 'assigned',
            description: `Assignée par admin`,
            actor_type: 'admin',
            actor_id: adminId,
            metadata: { driver_id: driverUserId }
        });

        return { success: true, order };
    } catch (error) {
        console.error('❌ Erreur fatale assignation:', error);
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
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur récupération commandes en attente:', error);
        return [];
    }
}

/**
 * Désassigne une commande
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
        const driverUserId = order?.driver_id;

        // Mettre à jour la commande
        const { error: orderError } = await supabase
            .from('orders')
            .update({
                driver_id: null,
                status: 'accepted', // Retourne dans la pile "À Dispatcher" pour l'admin
                dispatched_at: null,
                picked_up_at: null,          // RÉINITIALISATION
                driver_accepted_at: null,    // RÉINITIALISATION
                pickup_photo_url: null,      // RÉINITIALISATION
                delivery_photo_url: null,
                delivery_signature_url: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (orderError) throw orderError;

        // Si on avait un chauffeur, essayer de le remettre en ligne s'il n'a pas d'autre course
        if (driverUserId) {
            // Vérifier s'il a d'autres missions en cours
            const { count } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', driverUserId)
                .in('status', ['driver_accepted', 'in_progress']);

            if (count === 0) {
                await supabase
                    .from('drivers')
                    .update({ status: 'online' })
                    .eq('user_id', driverUserId);
            }
        }

        // Journaliser
        await supabase.from('order_events').insert({
            order_id: orderId,
            event_type: 'unassigned',
            description: reason || 'Course désassignée par l\'administrateur',
            actor_type: 'admin',
            metadata: { previous_driver_id: driverUserId }
        });

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la désassignation:', error);
        return { success: false, error };
    }
}


