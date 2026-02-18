import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { sendDriverInvitation, resendDriverInvitation } from '@/services/driverInvitation';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SendInvitationButtonProps {
    driverId: string;
    email: string;
    firstName: string;
    lastName: string;
    invitationStatus?: 'pending' | 'accepted' | null;
    onInvitationSent?: () => void;
}

export function SendInvitationButton({
    driverId,
    email,
    firstName,
    lastName,
    invitationStatus,
    onInvitationSent
}: SendInvitationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isResend, setIsResend] = useState(false);

    const handleSendInvitation = async () => {
        if (!email || !email.includes('@')) {
            toast.error('Veuillez d\'abord ajouter une adresse email valide pour ce chauffeur');
            return;
        }

        setIsLoading(true);
        try {
            if (invitationStatus === 'pending') {
                // Renvoyer l'invitation
                await resendDriverInvitation(email);
                toast.success(`Invitation renvoyée à ${firstName} ${lastName}`);
            } else {
                // Envoyer une nouvelle invitation
                await sendDriverInvitation(email, driverId);
                toast.success(`Invitation envoyée à ${firstName} ${lastName} (${email})`);
            }

            if (onInvitationSent) {
                onInvitationSent();
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
        } finally {
            setIsLoading(false);
            setShowConfirmDialog(false);
        }
    };

    const handleClick = () => {
        setIsResend(invitationStatus === 'pending');
        setShowConfirmDialog(true);
    };

    // Bouton différent selon le statut
    if (invitationStatus === 'accepted') {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2 border-green-200 bg-green-50 text-green-700"
            >
                <CheckCircle size={16} />
                Compte activé
            </Button>
        );
    }

    if (invitationStatus === 'pending') {
        return (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    disabled={isLoading}
                    className="gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                    <AlertCircle size={16} />
                    {isLoading ? 'Envoi...' : 'Renvoyer invitation'}
                </Button>

                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Renvoyer l'invitation ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Un nouvel email d'invitation sera envoyé à <strong>{email}</strong> pour permettre à{' '}
                                <strong>{firstName} {lastName}</strong> de définir son mot de passe.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSendInvitation} disabled={isLoading}>
                                {isLoading ? 'Envoi...' : 'Renvoyer'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    // Pas encore d'invitation envoyée
    return (
        <>
            <Button
                variant="cta"
                size="sm"
                onClick={handleClick}
                disabled={isLoading || !email}
                className="gap-2"
            >
                <Mail size={16} />
                {isLoading ? 'Envoi...' : 'Envoyer invitation'}
            </Button>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Envoyer une invitation ?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Un email d'invitation sera envoyé à <strong>{email}</strong> pour permettre à{' '}
                                <strong>{firstName} {lastName}</strong> de :
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Confirmer son adresse email</li>
                                <li>Définir son propre mot de passe</li>
                                <li>Activer son compte chauffeur</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendInvitation} disabled={isLoading}>
                            {isLoading ? 'Envoi...' : 'Envoyer'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
