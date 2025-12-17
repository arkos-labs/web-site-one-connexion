import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Envoie une invitation par email à un chauffeur
 * Le chauffeur recevra un email avec un lien pour définir son mot de passe
 */
export async function sendDriverInvitation(email: string, driverId: string) {
    try {
        // 1. Vérifier que le chauffeur existe et n'a pas déjà une invitation acceptée
        const { data: driver, error: driverError } = await supabase
            .from('drivers')
            .select('invitation_status')
            .eq('id', driverId)
            .single();

        if (driverError) throw new Error('Chauffeur introuvable');

        if (driver?.invitation_status === 'accepted') {
            throw new Error('Ce chauffeur a déjà activé son compte');
        }

        // 2. Créer l'utilisateur avec un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-16) + 'Aa1!';
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: tempPassword,
            options: {
                data: {
                    driver_id: driverId,
                    role: 'driver',
                    invitation_sent_at: new Date().toISOString()
                }
            }
        });

        // 3. Envoyer immédiatement un email de réinitialisation de mot de passe
        // Redirige vers l'application chauffeur sur le port 8081
        const driverAppUrl = import.meta.env.VITE_DRIVER_APP_URL || 'https://localhost:8081';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${driverAppUrl}/set-password`
        });

        if (resetError && !authError) {
            // Si resetPasswordForEmail échoue mais que l'utilisateur a été créé, on continue
            console.warn('Erreur lors de l\'envoi de l\'email de réinitialisation:', resetError);
        }

        // 4. Mettre à jour le statut du chauffeur dans la table drivers
        const { error: updateError } = await supabase
            .from('drivers')
            .update({
                email: email,
                invitation_sent_at: new Date().toISOString(),
                invitation_status: 'pending'
            })
            .eq('id', driverId);

        if (updateError) throw updateError;

        return {
            success: true,
            message: 'Invitation envoyée avec succès',
            userId: authData?.user?.id
        };

    } catch (error: any) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', error);
        throw error;
    }
}

/**
 * Renvoie une invitation à un chauffeur
 */
export async function resendDriverInvitation(email: string) {
    try {
        const driverAppUrl = import.meta.env.VITE_DRIVER_APP_URL || 'https://localhost:8081';
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${driverAppUrl}/set-password`
        });

        if (error) throw error;

        toast.success('Invitation renvoyée avec succès');
        return { success: true };

    } catch (error: any) {
        console.error('Erreur lors du renvoi de l\'invitation:', error);
        toast.error(error.message || 'Erreur lors du renvoi de l\'invitation');
        throw error;
    }
}

/**
 * Vérifie le statut d'une invitation
 */
export async function checkInvitationStatus(driverId: string) {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('email, invitation_sent_at, invitation_status')
            .eq('id', driverId)
            .single();

        if (error) throw error;

        return data;

    } catch (error: any) {
        console.error('Erreur lors de la vérification du statut:', error);
        throw error;
    }
}
