import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, FileX, AlertCircle } from 'lucide-react';
import { approveDriverDocuments, rejectDriverDocuments } from '@/services/driverDocumentsValidation';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DocumentsValidationButtonProps {
    driverId: string;
    firstName: string;
    lastName: string;
    documentsStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected' | null;
    onStatusChanged?: () => void;
}

export function DocumentsValidationButton({
    driverId,
    firstName,
    lastName,
    documentsStatus,
    onStatusChanged
}: DocumentsValidationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [notes, setNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await approveDriverDocuments(driverId, notes);
            if (onStatusChanged) {
                onStatusChanged();
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la validation');
        } finally {
            setIsLoading(false);
            setShowApproveDialog(false);
            setNotes('');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Veuillez indiquer une raison pour le refus');
            return;
        }

        setIsLoading(true);
        try {
            await rejectDriverDocuments(driverId, rejectReason);
            if (onStatusChanged) {
                onStatusChanged();
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors du refus');
        } finally {
            setIsLoading(false);
            setShowRejectDialog(false);
            setRejectReason('');
        }
    };

    // Bouton selon le statut
    if (documentsStatus === 'approved') {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="gap-2 border-green-200 bg-green-50 text-green-700"
                >
                    <CheckCircle size={16} />
                    Documents validés
                </Button>
            </div>
        );
    }

    if (documentsStatus === 'rejected') {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={isLoading}
                    className="gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                    <XCircle size={16} />
                    Documents refusés
                </Button>
            </div>
        );
    }

    if (documentsStatus === 'pending') {
        return (
            <>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApproveDialog(true)}
                        disabled={isLoading}
                        className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                        <CheckCircle size={16} />
                        Valider
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isLoading}
                        className="gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                        <XCircle size={16} />
                        Refuser
                    </Button>
                </div>

                {/* Dialog de validation */}
                <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Valider les documents ?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                                <p>
                                    Vous allez valider les documents de <strong>{firstName} {lastName}</strong>.
                                    Le chauffeur pourra commencer à travailler.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (optionnel)</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ajouter des notes sur la validation..."
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                {isLoading ? 'Validation...' : 'Valider les documents'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Dialog de refus */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Refuser les documents ?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                                <p>
                                    Vous allez refuser les documents de <strong>{firstName} {lastName}</strong>.
                                    Le chauffeur devra soumettre de nouveaux documents.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Raison du refus *</Label>
                                    <Textarea
                                        id="reason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Expliquez pourquoi les documents sont refusés..."
                                        className="min-h-[100px]"
                                        required
                                    />
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReject} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                                {isLoading ? 'Refus...' : 'Refuser les documents'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    // Pas encore de documents soumis
    return (
        <Button
            variant="outline"
            size="sm"
            disabled
            className="gap-2 border-gray-200 bg-gray-50 text-gray-500"
        >
            <FileX size={16} />
            Non soumis
        </Button>
    );
}
