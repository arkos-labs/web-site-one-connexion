import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Eye, CheckCircle2, XCircle, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DriverDocument {
    id: string;
    document_type: string;
    document_name: string;
    file_url: string;
    expiry_date: string | null;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
}

interface DocumentManagerProps {
    driverId: string;
}

export function DocumentManager({ driverId }: DocumentManagerProps) {
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        document_type: "permis",
        expiry_date: "",
        file: null as File | null
    });

    useEffect(() => {
        fetchDocuments();
    }, [driverId]);

    const fetchDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('driver_documents')
                .select('*')
                .eq('driver_id', driverId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Erreur lors du chargement des documents");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.file) {
            toast.error("Veuillez sélectionner un fichier");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file to Storage
            const fileExt = formData.file.name.split('.').pop();
            const fileName = `${driverId}/${Math.random()}.${fileExt}`;
            const filePath = `driver-documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents') // Assurez-vous que ce bucket existe
                .upload(filePath, formData.file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            // 3. Save metadata to Database
            const { error: dbError } = await supabase
                .from('driver_documents')
                .insert([{
                    driver_id: driverId,
                    document_type: formData.document_type,
                    document_name: formData.file.name,
                    file_url: publicUrl,
                    expiry_date: formData.expiry_date || null,
                    verification_status: 'pending'
                }]);

            if (dbError) throw dbError;

            toast.success("Document téléchargé avec succès");
            setIsDialogOpen(false);
            setFormData({
                document_type: "permis",
                expiry_date: "",
                file: null
            });
            fetchDocuments();
        } catch (error: any) {
            console.error("Error uploading document:", error);
            toast.error("Erreur lors du téléchargement");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

        try {
            // Delete from DB
            const { error } = await supabase
                .from('driver_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Note: We should also delete from Storage, but let's keep it simple for now

            toast.success("Document supprimé");
            fetchDocuments();
        } catch (error) {
            console.error("Error deleting document:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('driver_documents')
                .update({
                    verification_status: status,
                    verified_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Document ${status === 'approved' ? 'validé' : 'rejeté'}`);
            fetchDocuments();
        } catch (error) {
            console.error("Error verifying document:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Validé</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" /> En attente</Badge>;
        }
    };

    const getDocumentLabel = (type: string) => {
        switch (type) {
            case 'permis': return 'Permis de conduire';
            case 'assurance': return 'Attestation d\'assurance';
            case 'carte_grise': return 'Carte Grise';
            case 'kbis': return 'Kbis';
            case 'identite': return 'Pièce d\'identité';
            default: return type;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Ajouter un document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un document</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type de document</Label>
                                <Select
                                    value={formData.document_type}
                                    onValueChange={(val) => setFormData({ ...formData, document_type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="permis">Permis de conduire</SelectItem>
                                        <SelectItem value="assurance">Attestation d'assurance</SelectItem>
                                        <SelectItem value="carte_grise">Carte Grise</SelectItem>
                                        <SelectItem value="kbis">Kbis</SelectItem>
                                        <SelectItem value="identite">Pièce d'identité</SelectItem>
                                        <SelectItem value="autre">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Date d'expiration (optionnel)</Label>
                                <Input
                                    type="date"
                                    value={formData.expiry_date}
                                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fichier</Label>
                                <Input
                                    type="file"
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? "Téléchargement..." : "Télécharger"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Chargement...</div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun document enregistré</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Nom du fichier</TableHead>
                                <TableHead>Expiration</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        {getDocumentLabel(doc.document_type)}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={doc.document_name}>
                                        {doc.document_name}
                                    </TableCell>
                                    <TableCell>
                                        {doc.expiry_date ? (
                                            <div className={`flex items-center gap-1 ${new Date(doc.expiry_date) < new Date() ? 'text-destructive font-bold' : ''}`}>
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(doc.expiry_date), 'dd/MM/yyyy')}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(doc.verification_status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>

                                            {doc.verification_status === 'pending' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleVerify(doc.id, 'approved')}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleVerify(doc.id, 'rejected')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(doc.id, doc.file_url)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
