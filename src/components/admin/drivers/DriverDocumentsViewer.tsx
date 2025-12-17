import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DriverDocumentsViewerProps {
    driverId: string;
    onDocumentsValidated?: () => void;
}

export function DriverDocumentsViewer({ driverId, onDocumentsValidated }: DriverDocumentsViewerProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [driverId]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);

            // Récupérer le user_id du chauffeur
            const { data: driverData, error: driverError } = await supabase
                .from('drivers')
                .select('user_id')
                .eq('id', driverId)
                .single();

            if (driverError || !driverData?.user_id) {
                console.error('Erreur lors de la récupération du chauffeur:', driverError);
                toast.error('Impossible de charger les informations du chauffeur');
                setIsLoading(false);
                return;
            }

            // Récupérer les documents
            const { data: docs, error: docsError } = await supabase
                .from('driver_documents')
                .select('*')
                .eq('driver_id', driverData.user_id)
                .order('created_at', { ascending: false });

            if (docsError) {
                console.error('Erreur documents:', docsError);
                toast.error('Erreur lors du chargement des documents');
            } else {
                setDocuments(docs || []);
            }
        } catch (error: any) {
            console.error('Exception:', error);
            toast.error('Erreur lors du chargement des documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedDoc) return;

        try {
            setIsProcessing(true);
            const { error } = await supabase
                .from('driver_documents')
                .update({
                    status: 'approved',
                    validated_at: new Date().toISOString()
                })
                .eq('id', selectedDoc.id);

            if (error) throw error;

            toast.success('Document approuvé avec succès');
            setShowApproveDialog(false);
            setSelectedDoc(null);
            fetchDocuments();
            // Ne pas appeler onDocumentsValidated pour rester sur l'onglet Documents
        } catch (error: any) {
            console.error('Erreur lors de l\'approbation:', error);
            toast.error('Erreur lors de l\'approbation du document');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedDoc || !rejectReason.trim()) {
            toast.error('Veuillez indiquer une raison pour le refus');
            return;
        }

        try {
            setIsProcessing(true);
            const { error } = await supabase
                .from('driver_documents')
                .update({
                    status: 'rejected',
                    rejection_reason: rejectReason,
                    validated_at: new Date().toISOString()
                })
                .eq('id', selectedDoc.id);

            if (error) throw error;

            toast.success('Document refusé');
            setShowRejectDialog(false);
            setSelectedDoc(null);
            setRejectReason('');
            fetchDocuments();
            // Ne pas appeler onDocumentsValidated pour rester sur l'onglet Documents
        } catch (error: any) {
            console.error('Erreur lors du refus:', error);
            toast.error('Erreur lors du refus du document');
        } finally {
            setIsProcessing(false);
        }
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            license: 'Permis de conduire',
            insurance: 'Assurance',
            registration: 'Carte grise',
            identity_card: 'Carte d\'identité',
            criminal_record: 'Casier judiciaire',
            medical_certificate: 'Certificat médical',
            permis: 'Permis de conduire',
            assurance: 'Assurance',
            carte_grise: 'Carte grise',
            kbis: 'KBIS',
            autre: 'Autre',
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approuvé
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Refusé
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <p className="text-center text-muted-foreground">Chargement des documents...</p>
            </Card>
        );
    }

    if (documents.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun document uploadé</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Le chauffeur n'a pas encore uploadé de documents depuis son application.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Documents uploadés ({documents.length})</h3>
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <FileText className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                                        {getStatusBadge(doc.status || 'pending')}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{doc.file_name || 'Document'}</p>
                                    {doc.expiry_date && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Expire le: {new Date(doc.expiry_date).toLocaleDateString('fr-FR')}
                                        </p>
                                    )}
                                    {doc.rejection_reason && (
                                        <p className="text-xs text-destructive mt-1">
                                            Raison du refus: {doc.rejection_reason}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Uploadé le: {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Prévisualiser */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        setShowPreviewDialog(true);
                                    }}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Voir
                                </Button>

                                {/* Télécharger */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.file_url, '_blank')}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Télécharger
                                </Button>

                                {/* Actions de validation */}
                                {doc.status === 'pending' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setShowApproveDialog(true);
                                            }}
                                            className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Approuver
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setShowRejectDialog(true);
                                            }}
                                            className="gap-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Refuser
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Statistiques */}
                <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                            {documents.filter(d => d.status === 'pending').length}
                        </p>
                        <p className="text-sm text-muted-foreground">En attente</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {documents.filter(d => d.status === 'approved').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Approuvés</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                            {documents.filter(d => d.status === 'rejected').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Refusés</p>
                    </div>
                </div>
            </Card>

            {/* Dialog d'approbation */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approuver le document ?</DialogTitle>
                        <DialogDescription>
                            Vous allez approuver le document <strong>{selectedDoc?.file_name}</strong>.
                            Cette action confirmera que le document est valide et conforme.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? 'Approbation...' : 'Approuver'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de refus */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refuser le document ?</DialogTitle>
                        <DialogDescription className="space-y-4">
                            <p>
                                Vous allez refuser le document <strong>{selectedDoc?.file_name}</strong>.
                                Le chauffeur devra uploader un nouveau document.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Raison du refus *</Label>
                                <Textarea
                                    id="reason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Expliquez pourquoi le document est refusé..."
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? 'Refus...' : 'Refuser'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de prévisualisation */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{selectedDoc?.file_name}</DialogTitle>
                        <DialogDescription>
                            {getDocumentTypeLabel(selectedDoc?.document_type || '')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        {selectedDoc?.file_url && (
                            <img
                                src={selectedDoc.file_url}
                                alt={selectedDoc.file_name}
                                className="w-full h-auto rounded"
                                onError={(e) => {
                                    // Si l'image ne charge pas, essayer avec iframe
                                    const img = e.target as HTMLImageElement;
                                    const iframe = document.createElement('iframe');
                                    iframe.src = selectedDoc.file_url;
                                    iframe.className = 'w-full h-[600px] border rounded';
                                    iframe.title = 'Prévisualisation du document';
                                    img.parentNode?.replaceChild(iframe, img);
                                }}
                            />
                        )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                            Fermer
                        </Button>
                        <Button variant="outline" onClick={() => window.open(selectedDoc?.file_url, '_blank')}>
                            Ouvrir dans un nouvel onglet
                        </Button>

                        {/* Boutons de validation si le document est en attente */}
                        {selectedDoc?.status === 'pending' && (
                            <>
                                <Button
                                    onClick={async () => {
                                        await handleApprove();
                                        // Ne pas fermer le dialog pour permettre de continuer
                                    }}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? 'Approbation...' : 'Approuver'}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowPreviewDialog(false);
                                        setShowRejectDialog(true);
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Refuser
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
