import { supabase } from '@/lib/supabase';

/**
 * Le chauffeur accepte une course qui lui a été assignée
 */
export async function acceptOrderByDriver(orderId: string, driverId: string) {
    try {
        // 1. Mettre à jour le statut de la commande à 'driver_accepted'
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'driver_accepted',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', driverId) // Sécurité: vérifier que c'est bien le chauffeur assigné
            .select()
            .single();

        if (orderError) {
            console.error('Erreur acceptation commande:', orderError);
            return { success: false, error: orderError };
        }

        // 2. Mettre à jour le statut du chauffeur à 'busy'
        const { error: driverError } = await supabase
            .from('drivers')
            .update({
                status: 'busy',
                updated_at: new Date().toISOString()
            })
            .eq('id', driverId); // ✅ Utiliser l'ID de la table drivers

        if (driverError) {
            console.warn('Erreur mise à jour statut chauffeur:', driverError);
        }

        // 3. Créer un événement dans l'historique
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'driver_accepted',
                    description: 'Le chauffeur a accepté la course',
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: {
                        accepted_at: new Date().toISOString()
                    }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }


        console.log('✅ Course acceptée par le chauffeur:', order);
        return { success: true, data: order };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}

/**
 * Le chauffeur refuse une course qui lui a été assignée
 */
export async function declineOrder(orderId: string, driverId: string) {
    try {
        console.log('🔄 Début declineOrder:', { orderId, driverId });

        // 0. D'abord récupérer le nom du chauffeur
        const { data: driverInfo, error: driverInfoError } = await supabase
            .from('drivers')
            .select('first_name, last_name')
            .eq('id', driverId)
            .single();

        if (driverInfoError) {
            console.error('❌ Erreur récupération chauffeur:', driverInfoError);
        }

        const driverName = driverInfo
            ? `${driverInfo.first_name} ${driverInfo.last_name}`
            : 'Chauffeur inconnu';

        console.log('👤 Chauffeur:', driverName);

        // Récupérer le compteur actuel de refus
        const { data: currentOrder, error: countError } = await supabase
            .from('orders')
            .select('refusal_count, reference')
            .eq('id', orderId)
            .single();

        if (countError) {
            console.error('❌ Erreur récupération compteur:', countError);
        }

        const currentCount = currentOrder?.refusal_count || 0;
        const newCount = currentCount + 1;

        console.log(`📊 Compteur refus: ${currentCount} → ${newCount} (commande: ${currentOrder?.reference})`);

        // 1. Mettre à jour la commande avec le compteur de refus incrémenté
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'driver_refused',
                driver_id: null,
                dispatched_at: null,
                refusal_count: newCount,
                last_refused_by: driverName,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', driverId)
            .select()
            .single();

        if (orderError) {
            console.error('❌ Erreur refus commande:', orderError);
            return { success: false, error: orderError };
        }

        console.log(`✅ Refus enregistré: ${driverName} (total: ${newCount} refus)`);
        console.log('📝 Commande après mise à jour:', order);

        // 2. Remettre le chauffeur en ligne
        const { error: driverError } = await supabase
            .from('drivers')
            .update({
                status: 'online',
                updated_at: new Date().toISOString()
            })
            .eq('id', driverId);

        if (driverError) {
            console.warn('Erreur mise à jour statut chauffeur:', driverError);
        }

        // 3. Créer un événement
        try {
            console.log('📝 Tentative création événement de refus:', {
                order_id: orderId,
                event_type: 'driver_declined',
                actor_id: driverId
            });

            const { data: eventData, error: eventError } = await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'driver_declined',
                    description: 'Le chauffeur a refusé la course',
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: {
                        declined_at: new Date().toISOString()
                    }
                })
                .select();

            if (eventError) {
                console.error('❌ ERREUR création événement refus:', eventError);
                console.error('❌ Code erreur:', eventError.code);
                console.error('❌ Message:', eventError.message);
                console.error('❌ Details:', eventError.details);
                console.error('❌ Hint:', eventError.hint);
            } else {
                console.log('✅ Événement de refus créé avec succès:', eventData);
            }
        } catch (eventError) {
            console.error('❌ Exception création événement:', eventError);
        }

        console.log('✅ Course refusée par le chauffeur');
        return { success: true, data: order };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}

/**
 * Le chauffeur démarre la livraison (passe en 'in_progress')
 */
export async function startDelivery(orderId: string, driverId: string) {
    try {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'in_progress',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', driverId)
            .select()
            .single();

        if (orderError) {
            console.error('Erreur démarrage livraison:', orderError);
            return { success: false, error: orderError };
        }

        // Créer un événement
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'in_progress',
                    description: 'Livraison démarrée',
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: {
                        started_at: new Date().toISOString()
                    }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }

        console.log('✅ Livraison démarrée:', order);
        return { success: true, data: order };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}

/**
 * Le chauffeur marque la livraison comme terminée
 */
export async function completeDelivery(orderId: string, driverId: string) {
    try {
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'delivered',
                delivered_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', driverId)
            .select()
            .single();

        if (orderError) {
            console.error('Erreur finalisation livraison:', orderError);
            return { success: false, error: orderError };
        }

        // Remettre le chauffeur en ligne
        await supabase
            .from('drivers')
            .update({
                status: 'online',
                updated_at: new Date().toISOString()
            })
            .eq('id', driverId); // ✅ Utiliser l'ID de la table drivers

        // Créer un événement
        try {
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'delivered',
                    description: 'Livraison terminée',
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: {
                        delivered_at: new Date().toISOString()
                    }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }

        console.log('✅ Livraison terminée:', order);
        return { success: true, data: order };

    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error };
    }
}

/**
 * Récupère les courses assignées au chauffeur
 */
export async function getDriverOrders(driverId: string) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', driverId)
            .in('status', ['dispatched', 'driver_accepted', 'in_progress'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erreur récupération commandes chauffeur:', error);
            return { success: false, error, data: [] };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erreur inattendue:', error);
        return { success: false, error, data: [] };
    }
}
