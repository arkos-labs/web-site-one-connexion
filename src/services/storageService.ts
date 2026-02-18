import { supabase } from "@/lib/supabase";

/**
 * Configuration des limites de fichiers
 */
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

/**
 * Interface pour les résultats d'upload
 */
export interface UploadResult {
    success: boolean;
    fileUrl?: string;
    filePath?: string;
    error?: string;
}

/**
 * Interface pour les options d'upload
 */
export interface UploadOptions {
    driverId: string;
    documentType: 'avatar' | 'permis' | 'assurance' | 'carte_grise' | 'kbis' | 'autre';
    file: File;
}

/**
 * Valider un fichier avant upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `Le fichier est trop volumineux. Taille maximale : ${MAX_FILE_SIZE_MB}MB`
        };
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Format de fichier non autorisé. Formats acceptés : ${ALLOWED_EXTENSIONS.join(', ')}`
        };
    }

    // Vérifier l'extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return {
            valid: false,
            error: `Extension de fichier non autorisée. Extensions acceptées : ${ALLOWED_EXTENSIONS.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Générer un nom de fichier unique et sécurisé
 */
function generateFileName(driverId: string, documentType: string, originalName: string): string {
    const timestamp = Date.now();
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'pdf';
    const sanitizedType = documentType.replace(/[^a-z0-9_-]/gi, '_');

    return `${driverId}/${sanitizedType}_${timestamp}.${fileExtension}`;
}

/**
 * Upload un fichier vers Supabase Storage
 * 
 * @param options - Options d'upload contenant le fichier, l'ID du chauffeur et le type de document
 * @returns Résultat de l'upload avec l'URL publique ou une erreur
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { file, driverId, documentType } = options;

    try {
        // Validation du fichier
        const validation = validateFile(file);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }

        // Générer le chemin du fichier
        const fileName = generateFileName(driverId, documentType, file.name);
        const filePath = `driver-documents/${fileName}`;

        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false // Ne pas écraser les fichiers existants
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);

            // Gérer les erreurs spécifiques
            if (uploadError.message.includes('already exists')) {
                return {
                    success: false,
                    error: 'Un fichier avec ce nom existe déjà. Veuillez réessayer.'
                };
            }

            return {
                success: false,
                error: `Erreur lors de l'upload : ${uploadError.message}`
            };
        }

        // Récupérer l'URL publique
        const publicUrl = getPublicUrl(filePath);

        return {
            success: true,
            fileUrl: publicUrl,
            filePath: filePath
        };

    } catch (error: any) {
        console.error('Unexpected upload error:', error);
        return {
            success: false,
            error: error.message || 'Une erreur inattendue est survenue lors de l\'upload'
        };
    }
}

/**
 * Obtenir l'URL publique d'un fichier
 * 
 * @param filePath - Chemin du fichier dans le bucket
 * @returns URL publique du fichier
 */
export function getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * Supprimer un fichier du Storage
 * 
 * @param filePath - Chemin du fichier à supprimer
 * @returns Résultat de la suppression
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.storage
            .from('documents')
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: `Erreur lors de la suppression : ${error.message}`
            };
        }

        return { success: true };

    } catch (error: any) {
        console.error('Unexpected delete error:', error);
        return {
            success: false,
            error: error.message || 'Une erreur inattendue est survenue lors de la suppression'
        };
    }
}

/**
 * Extraire le chemin du fichier depuis une URL publique
 * 
 * @param publicUrl - URL publique du fichier
 * @returns Chemin du fichier ou null si invalide
 */
export function extractFilePathFromUrl(publicUrl: string): string | null {
    try {
        const url = new URL(publicUrl);
        const pathParts = url.pathname.split('/');

        // Format attendu: /storage/v1/object/public/documents/driver-documents/...
        const documentsIndex = pathParts.indexOf('documents');
        if (documentsIndex === -1) return null;

        const filePath = pathParts.slice(documentsIndex + 1).join('/');
        return filePath || null;

    } catch (error) {
        console.error('Error extracting file path:', error);
        return null;
    }
}

/**
 * Formater la taille d'un fichier en format lisible
 * 
 * @param bytes - Taille en bytes
 * @returns Taille formatée (ex: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
