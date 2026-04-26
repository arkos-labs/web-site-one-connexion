import { supabase } from '@/lib/supabase';
import { CalculTarifaireResult, FormuleNew } from '@/utils/pricingEngine';

export interface GuestOrderData {
    // Informations client
    senderName: string;
    senderEmail: string;
    senderPhone: string;

    // Informations expéditeur
    pickupAddress: string;
    pickupDetails?: string;

    // Informations destinataire
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    deliveryDetails?: string;

    // Informations colis
    packageDescription: string;
    packageValue?: string;

    // Tarification
    formula: FormuleNew;
    pricingResult: CalculTarifaireResult;

    // Coordonnées GPS (optionnelles)
    pickupLat?: number;
    pickupLng?: number;
    deliveryLat?: number;
    deliveryLng?: number;

    // Ville d'arrivée
    villeArrivee?: string;

    // Horaire de prise en charge (optionnel)
    scheduleTime?: string; // Format: "2025-12-13T01:23"

    // Facturation (optionnel)
    billingInfo?: {
        name: string;
        address: string;
        zip: string;
        city: string;
        companyName: string;
        siret: string;
    };
}

export interface GuestOrderResponse {
    success: boolean;
    order_id?: string;
    reference?: string;
    message: string;
    error?: string;
}

/**
 * Crée une commande pour un utilisateur NON CONNECTÉ
 * 
 * RÈGLES IMPORTANTES :
 * - user_id sera NULL (commande invitée)
 * - Toutes les données sont stockées même sans compte
 * - Si l'utilisateur crée un compte plus tard avec le même email,
 *   toutes ses commandes seront automatiquement rattachées
 * 
 * @param orderData - Données de la commande
 * @returns Réponse avec succès et référence de commande
 */
export const createGuestOrder = async (orderData: GuestOrderData): Promise<GuestOrderResponse> => {
    try {
        console.log('🚀 Création commande invitée pour:', orderData.senderEmail);

        // Calculer pickup_time si scheduleTime fourni
        let pickupTime: string | null = null;
        if (orderData.scheduleTime) {
            const scheduledDateTime = new Date(orderData.scheduleTime);
            const now = new Date();
            const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);

            console.log('⏰ Calcul créneau guest:', { scheduleTime: orderData.scheduleTime, diffMinutes, isDeferred: diffMinutes > 45 });

            // Si c'est dans plus de 45 minutes, c'est une commande différée
            if (diffMinutes > 45) {
                pickupTime = scheduledDateTime.toISOString();
            }
        }

        // Préparer les données pour la fonction RPC
        // IMPORTANT : Aucune vérification de user connecté ici
        const { data, error } = await supabase.rpc('create_guest_order_v2', {
            p_email_client: orderData.senderEmail,
            p_telephone_client: orderData.senderPhone,
            p_nom_client: orderData.senderName,

            // Expéditeur (JSONB)
            p_expediteur: {
                nom: orderData.senderName,
                telephone: orderData.senderPhone,
                email: orderData.senderEmail,
            },

            // Destinataire (JSONB)
            p_destinataire: {
                nom: orderData.recipientName,
                telephone: orderData.recipientPhone,
            },

            // Adresse de retrait (JSONB)
            p_adresse_retrait: {
                adresse: orderData.pickupAddress,
                details: orderData.pickupDetails || '',
                ville: 'Paris', // Par défaut Paris pour le retrait
            },

            // Adresse de livraison (JSONB)
            p_adresse_livraison: {
                adresse: orderData.deliveryAddress,
                details: orderData.deliveryDetails || '',
                ville: orderData.villeArrivee || '',
            },

            // Adresses texte (pour compatibilité)
            p_pickup_address: orderData.pickupAddress,
            p_delivery_address: orderData.deliveryAddress,

            // Facturation (JSONB)
            p_facturation: orderData.billingInfo ? {
                nom: orderData.billingInfo.name,
                adresse: `${orderData.billingInfo.address}, ${orderData.billingInfo.zip} ${orderData.billingInfo.city}`,
                societe: orderData.billingInfo.companyName,
                siret: orderData.billingInfo.siret,
                email: orderData.senderEmail,
                telephone: orderData.senderPhone
            } : {
                email: orderData.senderEmail,
                telephone: orderData.senderPhone,
                nom: orderData.senderName,
            },

            // Informations colis
            p_type_colis: orderData.packageDescription,
            p_formule: orderData.formula,

            // Tarification
            p_prix: orderData.pricingResult.totalEuros,
            p_bons: orderData.pricingResult.totalBons,

            // Instructions
            p_instructions_retrait: orderData.pickupDetails || null,
            p_instructions_livraison: orderData.deliveryDetails || null,

            // Coordonnées GPS
            p_pickup_lat: orderData.pickupLat || null,
            p_pickup_lng: orderData.pickupLng || null,
            p_delivery_lat: orderData.deliveryLat || null,
            p_delivery_lng: orderData.deliveryLng || null,

            // Horaire planifié
            p_pickup_time: pickupTime,
        });

        if (error) {
            console.error('❌ Erreur RPC create_guest_order_v2:', error);
            throw error;
        }

        // La fonction RPC retourne un JSONB avec success, order_id, reference, message
        if (data && typeof data === 'object') {
            console.log('✅ Commande invitée créée avec succès:', data);
            return data as GuestOrderResponse;
        }

        throw new Error('Réponse invalide de la fonction RPC');

    } catch (error) {
        console.error('❌ Erreur lors de la création de la commande invitée:', error);

        return {
            success: false,
            message: 'Erreur lors de la création de la commande',
            error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
    }
};

/**
 * Récupère toutes les commandes associées à un email
 * Utile pour afficher l'historique sans compte
 */
export const getGuestOrdersByEmail = async (email: string) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('email_client', email)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, orders: data };

    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return {
            success: false,
            orders: [],
            error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
    }
};

/**
 * Vérifie si un email a des commandes invitées en attente de rattachement
 * Retourne le nombre de commandes non rattachées
 */
export const checkPendingGuestOrders = async (email: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('email_client', email)
            .is('user_id', null);

        if (error) throw error;
        return count || 0;

    } catch (error) {
        console.error('Erreur lors de la vérification des commandes invitées:', error);
        return 0;
    }
};

/**
 * Rattache manuellement les commandes d'un email à un utilisateur
 * Utile si le rattachement automatique échoue
 */
export const attachOrdersToUser = async (email: string, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('attach_orders_to_user', {
            p_email: email,
            p_user_id: userId
        });

        if (error) throw error;
        return data;

    } catch (error) {
        console.error('Erreur lors du rattachement des commandes:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
    }
};


