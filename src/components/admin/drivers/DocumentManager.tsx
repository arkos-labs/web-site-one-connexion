import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Upload, Trash2, Eye, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { uploadFile, deleteFile, extractFilePathFromUrl, formatFileSize } from "@/services/storageService";
import { getDriverDocuments, createDocument, deleteDocument as deleteDocumentRecord, type DriverDocument } from "@/services/documentService";

interface DocumentManagerProps {
    driverId: string;
}

type DocumentType = 'permis' | 'assurance' | 'carte_grise' | 'kbis' | 'autre';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    permis: 'Permis de conduire',
    assurance: 'Assurance',
    carte_grise: 'Carte grise',
    kbis: 'KBIS',
    autre: 'Autre document'
};

const STATUS_CONFIG = {
    pending: { label: 'En attente', icon: Clock, color: 'bg-yellow-500' },
    approved: { label: 'Approuvé', icon: CheckCircle, color: 'bg-green-500' },
    rejected: { label: 'Rejeté', icon: XCircle, color: 'bg-red-500' }
};

export function DocumentManager({ driverId }: DocumentManagerProps) {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<DocumentType>('permis');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, [driverId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await getDriverDocuments(driverId);
            setDocuments(docs);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast.error("Erreur lors du chargement des documents");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validation basique côté client
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("Le fichier est trop volumineux (max 5MB)");
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Format non autorisé. Utilisez JPG, PNG, WEBP ou PDF");
            return;
        }

        setSelectedFile(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Veuillez sélectionner un fichier");
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            // Simulation de progression (Supabase ne fournit pas de progression native)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            // Upload du fichier
            const result = await uploadFile({
                file: selectedFile,
                driverId,
                documentType: selectedType
            });

            clearInterval(progressInterval);

            if (!result.success) {
                toast.error(result.error || "Erreur lors de l'upload");
                setUploadProgress(0);
                return;
            }

            setUploadProgress(100);

            // Créer l'enregistrement dans la base de données
            await createDocument({
                driver_id: driverId,
                document_type: selectedType,
                document_name: selectedFile.name,
                file_url: result.fileUrl!,
                file_size_kb: Math.round(selectedFile.size / 1024),
                mime_type: selectedFile.type
            });

            toast.success("Document uploadé avec succès");

            // Réinitialiser le formulaire
            setSelectedFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Recharger la liste des documents
            await fetchDocuments();

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Erreur lors de l'upload du document");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (doc: DriverDocument) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ce document ?`)) {
            return;
        }

        try {
            // Extraire le chemin du fichier depuis l'URL
            const filePath = extractFilePathFromUrl(doc.file_url);

            // Supprimer le fichier du storage
            if (filePath) {
                const result = await deleteFile(filePath);
                if (!result.success) {
                    console.warn("Failed to delete file from storage:", result.error);
                }
            }

            // Supprimer l'enregistrement de la base de données
            await deleteDocumentRecord(doc.id);

            toast.success("Document supprimé");
            await fetchDocuments();

        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error("Erreur lors de la suppression du document");
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Chargement des documents...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Upload */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Uploader un document
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Sélection du type de document */}
                    <div className="space-y-2">
                        <Label>Type de document</Label>
                        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DocumentType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Zone de drop */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                            Glissez-déposez un fichier ici ou
                        </p>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" asChild>
                                <span>Parcourir les fichiers</span>
                            </Button>
                        </Label>
                        <p className="text-xs text-gray-500 mt-2">
                            Formats acceptés : JPG, PNG, WEBP, PDF (max 5MB)
                        </p>
                    </div>

                    {/* Fichier sélectionné */}
                    {selectedFile && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-sm">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    disabled={uploading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Progress bar */}
                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center text-gray-500">
                                Upload en cours... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {/* Bouton d'upload */}
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Uploader le document
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Liste des documents */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents uploadés ({documents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            Aucun document uploadé pour le moment
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc) => {
                                const StatusIcon = STATUS_CONFIG[doc.verification_status].icon;
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {doc.document_name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {DOCUMENT_TYPE_LABELS[doc.document_type]}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        <StatusIcon className={`h-3 w-3 ${STATUS_CONFIG[doc.verification_status].color.replace('bg-', 'text-')}`} />
                                                        <span className="text-xs text-gray-500">
                                                            {STATUS_CONFIG[doc.verification_status].label}
                                                        </span>
                                                    </div>
                                                </div>
                                                {doc.rejection_reason && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Raison : {doc.rejection_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(doc.file_url, '_blank')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteDocument(doc)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
