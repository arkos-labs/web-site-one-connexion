import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Valide les documents d'un chauffeur
 */
export async function approveDriverDocuments(driverId: string, notes?: string) {
    try {
        // Récupérer l'admin connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Vous devez être connecté pour valider des documents');
        }

        // Mettre à jour le statut du chauffeur
        const { error: updateError } = await supabase
            .from('drivers')
            .update({
                documents_status: 'approved',
                documents_validated_at: new Date().toISOString(),
                validated_by_admin_id: user.id,
                validation_notes: notes || null
            })
            .eq('id', driverId);

        if (updateError) throw updateError;

        toast.success('Documents validés avec succès');
        return { success: true };

    } catch (error: any) {
        console.error('Erreur lors de la validation des documents:', error);
        toast.error(error.message || 'Erreur lors de la validation');
        throw error;
    }
}

/**
 * Refuse les documents d'un chauffeur
 */
export async function rejectDriverDocuments(driverId: string, reason: string) {
    try {
        // Récupérer l'admin connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Vous devez être connecté pour refuser des documents');
        }

        if (!reason || reason.trim() === '') {
            throw new Error('Veuillez fournir une raison pour le refus');
        }

        // Mettre à jour le statut du chauffeur
        const { error: updateError } = await supabase
            .from('drivers')
            .update({
                documents_status: 'rejected',
                documents_validated_at: new Date().toISOString(),
                validated_by_admin_id: user.id,
                validation_notes: reason
            })
            .eq('id', driverId);

        if (updateError) throw updateError;

        toast.success('Documents refusés');
        return { success: true };

    } catch (error: any) {
        console.error('Erreur lors du refus des documents:', error);
        toast.error(error.message || 'Erreur lors du refus');
        throw error;
    }
}

/**
 * Marque les documents comme soumis (appelé par le chauffeur)
 */
export async function submitDriverDocuments(driverId: string) {
    try {
        const { error: updateError } = await supabase
            .from('drivers')
            .update({
                documents_status: 'pending',
                documents_submitted_at: new Date().toISOString()
            })
            .eq('id', driverId);

        if (updateError) throw updateError;

        toast.success('Documents soumis pour validation');
        return { success: true };

    } catch (error: any) {
        console.error('Erreur lors de la soumission des documents:', error);
        toast.error(error.message || 'Erreur lors de la soumission');
        throw error;
    }
}

/**
 * Récupère le statut des documents d'un chauffeur
 */
export async function getDriverDocumentsStatus(driverId: string) {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('documents_status, documents_submitted_at, documents_validated_at, validation_notes')
            .eq('id', driverId)
            .single();

        if (error) throw error;

        return data;

    } catch (error: any) {
        console.error('Erreur lors de la récupération du statut:', error);
        throw error;
    }
}
