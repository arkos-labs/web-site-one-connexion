import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { checkPendingGuestOrders, attachOrdersToUser } from '@/services/guestOrderService';
import { useToast } from './use-toast';

/**
 * Hook pour rattacher automatiquement les commandes invitées
 * lors de la connexion d'un utilisateur
 * 
 * Ce hook :
 * 1. Vérifie si l'utilisateur a des commandes invitées avec son email
 * 2. Les rattache automatiquement à son compte
 * 3. Affiche une notification si des commandes ont été rattachées
 */
export const useGuestOrderAttachment = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const attachOrders = async () => {
            // Ne rien faire si pas d'utilisateur connecté
            if (!user?.email) return;

            try {
                // Vérifier s'il y a des commandes invitées
                const pendingCount = await checkPendingGuestOrders(user.email);

                if (pendingCount > 0) {
                    console.log(`🔗 Rattachement de ${pendingCount} commande(s) invitée(s)...`);

                    // Rattacher les commandes
                    const result = await attachOrdersToUser(user.email, user.id);

                    if (result.success) {
                        toast({
                            title: "Commandes retrouvées !",
                            description: `${result.orders_attached || pendingCount} commande(s) ont été rattachées à votre compte.`,
                            className: "bg-[#0B2D55] text-white border-none",
                        });
                    }
                }
            } catch (error) {
                console.error('Erreur lors du rattachement des commandes:', error);
                // Ne pas afficher d'erreur à l'utilisateur, c'est un processus silencieux
            }
        };

        attachOrders();
    }, [user?.id, user?.email]); // Déclenché à chaque connexion

    return null;
};
