import { supabase } from '@/lib/supabase';

/**
 * Le chauffeur accepte une course qui lui a été assignée
 */
export async function acceptOrderByDriver(orderId: string, driverId: string) {
    try {
        console.log('🚀 Accepting mission...', orderId);

        // Résoudre le vrai Auth UUID du chauffeur
        let authUserId = driverId;
        const { data: driverRecord } = await supabase
            .from('drivers')
            .select('user_id')
            .eq('id', driverId)
            .maybeSingle();
        if (driverRecord?.user_id) {
            authUserId = driverRecord.user_id; // Utiliser le Auth UUID pour matcher driver_id dans orders
        }

        // 1. Mettre à jour le statut de la commande à 'driver_accepted'
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'driver_accepted',
                driver_accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('driver_id', authUserId) // Utiliser Auth UUID qui correspond à order.driver_id
            .select()
            .single();

        if (orderError) {
            console.error('Erreur acceptation commande:', orderError);
            // Fallback: essayer sans filtre driver_id si l'UUID ne match pas
            const { data: fallbackOrder, error: fallbackError } = await supabase
                .from('orders')
                .update({
                    status: 'driver_accepted',
                    driver_accepted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();
            if (fallbackError) {
                console.error('❌ Erreur fallback acceptation commande:', fallbackError);
                return { success: false, error: fallbackError };
            }
            console.log('✅ Update success (fallback):', fallbackOrder);
        } else {
            console.log('✅ Update success:', order);
        }

        // 2. Mettre à jour le statut du chauffeur à 'busy'
        await supabase
            .from('drivers')
            .update({ status: 'busy', updated_at: new Date().toISOString() })
            .eq('id', driverId);

        // Aussi essayer par user_id pour compatibilité
        await supabase
            .from('drivers')
            .update({ status: 'busy', updated_at: new Date().toISOString() })
            .eq('user_id', authUserId);

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
                    metadata: { accepted_at: new Date().toISOString() }
                });
        } catch (eventError) {
            console.warn('Erreur création événement:', eventError);
        }

        console.log('✅ Course acceptée par le chauffeur:', orderId);

        try {
            const { data: profile } = await supabase.from('profiles').select('details').eq('id', authUserId).single();
            const driverName = profile?.details?.full_name || profile?.details?.first_name || 'Chauffeur';
        } catch (e) {
        }

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
        // Essayer d'abord par user_id, puis par id en fallback
        let { data: driverInfo, error: driverInfoError } = await supabase
            .from('drivers')
            .select('first_name, last_name, id, user_id')
            .eq('user_id', driverId)
            .single();

        // Fallback: essayer par id si user_id échoue
        if (driverInfoError) {
            const { data: fallbackDriver, error: fallbackError } = await supabase
                .from('drivers')
                .select('first_name, last_name, id, user_id')
                .eq('id', driverId)
                .single();

            if (!fallbackError) {
                driverInfo = fallbackDriver;
                driverInfoError = null;
            }
        }

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

        // 1. Créer un événement d'abord (pendant que driver_id est encore associé dans orders pour le RLS)
        try {
            console.log('📝 Création événement de refus...', orderId);
            await supabase
                .from('order_events')
                .insert({
                    order_id: orderId,
                    event_type: 'driver_declined',
                    description: 'Le chauffeur a refusé la course',
                    actor_type: 'driver',
                    actor_id: driverId,
                    metadata: { declined_at: new Date().toISOString() }
                });
        } catch (eventError) {
            console.warn('⚠️ Erreur (non-fatale) création événement:', eventError);
        }

        // 2. Mettre à jour la commande (va mettre driver_id à null)
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
            console.error('❌ Update error (RLS or other):', orderError);
            return { success: false, error: orderError };
        }

        console.log('✅ Update success (refusal):', order);

        console.log(`✅ Refus enregistré: ${driverName} (total: ${newCount} refus)`);
        console.log('📝 Commande après mise à jour:', order);


        // 3. Remettre le chauffeur en ligne
        // Essayer d'abord par user_id, puis par id en fallback
        let { error: driverError } = await supabase
            .from('drivers')
            .update({
                status: 'online',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', driverId); // ✅ Utiliser user_id (ID Auth)

        // Fallback: si l'update par user_id échoue, essayer par id
        if (driverError) {
            console.warn('Update par user_id échoué, tentative par id...');
            const { error: retryError } = await supabase
                .from('drivers')
                .update({
                    status: 'online',
                    updated_at: new Date().toISOString()
                })
                .eq('id', driverId);

            if (retryError) {
                console.warn('Erreur mise à jour statut chauffeur:', retryError);
            }
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

        try {
            const { data: profile } = await supabase.from('profiles').select('details').eq('id', driverId).single();
            const driverName = profile?.details?.full_name || profile?.details?.first_name || 'Chauffeur';
        } catch (e) {
        }

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
        // Essayer d'abord par user_id, puis par id en fallback
        let { error: driverUpdateError } = await supabase
            .from('drivers')
            .update({
                status: 'online',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', driverId); // ✅ Utiliser user_id (ID Auth)

        // Fallback: si l'update par user_id échoue, essayer par id
        if (driverUpdateError) {
            await supabase
                .from('drivers')
                .update({
                    status: 'online',
                    updated_at: new Date().toISOString()
                })
                .eq('id', driverId);
        }

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

        try {
            const { data: profile } = await supabase.from('profiles').select('details').eq('id', driverId).single();
            const driverName = profile?.details?.full_name || profile?.details?.first_name || 'Chauffeur';
        } catch (e) {
        }

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
        // ✅ driver_id dans orders contient maintenant l'ID Auth (user_id)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', driverId) // driverId est l'ID Auth (user_id)
            .in('status', ['assigned', 'driver_accepted', 'in_progress']) // ✅ Utiliser 'assigned' au lieu de 'assigned'
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

/**
 * Télécharge une preuve (photo ou signature) vers Supabase Storage
 */
export async function uploadProofFile(orderId: string, fileData: Blob | string, type: 'pickup' | 'delivery' | 'signature') {
    try {
        const fileExt = type === 'signature' ? 'png' : 'jpg';
        const fileName = `${orderId}/${type}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        let body: any = fileData;
        if (typeof fileData === 'string' && fileData.startsWith('data:')) {
            const res = await fetch(fileData);
            body = await res.blob();
        }

        const { error: uploadError } = await supabase.storage
            .from('delivery-proofs')
            .upload(filePath, body, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('delivery-proofs')
            .getPublicUrl(filePath);

        return { success: true, publicUrl };
    } catch (error) {
        console.error('Erreur upload preuve:', error);
        return { success: false, error };
    }
}

/**
 * Enregistre l'URL d'une preuve dans la commande
 */
export async function updateOrderProof(orderId: string, proofUrl: string, type: 'pickup' | 'delivery' | 'signature') {
    const field = type === 'pickup' ? 'pickup_photo_url' :
        type === 'delivery' ? 'delivery_photo_url' : 'delivery_signature_url';

    const { error } = await supabase
        .from('orders')
        .update({ [field]: proofUrl, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    return { success: !error, error };
}




