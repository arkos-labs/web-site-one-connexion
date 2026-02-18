import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Euro } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CancelOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    orderStatus: string;
    isLoading?: boolean;
}

export const CancelOrderModal = ({
    isOpen,
    onClose,
    onConfirm,
    orderStatus,
    isLoading = false,
}: CancelOrderModalProps) => {
    const [reason, setReason] = useState('');

    // Déterminer si des frais s'appliquent
    const isDispatched = orderStatus === 'dispatched' || orderStatus === 'in_progress';
    const cancellationFee = isDispatched ? 8.00 : 0;

    const handleConfirm = async () => {
        if (!reason.trim()) {
            return;
        }
        await onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Annuler la commande
                    </DialogTitle>
                    <DialogDescription>
                        Vous êtes sur le point d'annuler cette commande.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alerte frais d'annulation */}
                    {isDispatched ? (
                        <Alert variant="destructive">
                            <Euro className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Attention :</strong> Cette commande a déjà été dispatchée.
                                Des frais d'annulation de <strong>{cancellationFee.toFixed(2)}€</strong> seront appliqués.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                            <AlertDescription>
                                Cette commande n'a pas encore été dispatchée.
                                L'annulation est <strong>gratuite</strong>.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Raison de l'annulation */}
                    <div className="space-y-2">
                        <label htmlFor="reason" className="text-sm font-medium">
                            Raison de l'annulation *
                        </label>
                        <Textarea
                            id="reason"
                            placeholder="Veuillez indiquer la raison de l'annulation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Récapitulatif */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Statut actuel :</span>
                            <span className="font-medium capitalize">{orderStatus}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frais d'annulation :</span>
                            <span className={`font-semibold ${cancellationFee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {cancellationFee > 0 ? `${cancellationFee.toFixed(2)}€` : 'Gratuit'}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Retour
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isLoading}
                    >
                        {isLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
