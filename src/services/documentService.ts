import { supabase } from "@/lib/supabase";

export interface DriverDocument {
    id: string;
    driver_id: string;
    document_type: 'permis' | 'assurance' | 'carte_grise' | 'kbis' | 'autre';
    document_name: string;
    file_url: string;
    file_size_kb?: number;
    mime_type?: string;
    issue_date?: string;
    expiry_date?: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    verified_by?: string;
    verified_at?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDocumentData {
    driver_id: string;
    document_type: 'permis' | 'assurance' | 'carte_grise' | 'kbis' | 'autre';
    document_name: string;
    file_url: string;
    file_size_kb?: number;
    mime_type?: string;
    issue_date?: string;
    expiry_date?: string;
}

export interface UpdateDocumentData {
    document_name?: string;
    issue_date?: string;
    expiry_date?: string;
}

export interface VerifyDocumentData {
    verification_status: 'approved' | 'rejected';
    verified_by: string;
    rejection_reason?: string;
}

/**
 * Récupérer tous les documents d'un chauffeur
 */
export async function getDriverDocuments(driverId: string): Promise<DriverDocument[]> {
    const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Récupérer un document par son ID
 */
export async function getDocumentById(documentId: string): Promise<DriverDocument | null> {
    const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('id', documentId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Créer un nouveau document
 */
export async function createDocument(documentData: CreateDocumentData): Promise<DriverDocument> {
    const { data, error } = await supabase
        .from('driver_documents')
        .insert([documentData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Mettre à jour un document
 */
export async function updateDocument(
    documentId: string,
    updates: UpdateDocumentData
): Promise<DriverDocument> {
    const { data, error } = await supabase
        .from('driver_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Supprimer un document
 */
export async function deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
        .from('driver_documents')
        .delete()
        .eq('id', documentId);

    if (error) throw error;
}

/**
 * Upload un fichier vers Supabase Storage
 */
export async function uploadDocument(
    file: File,
    driverId: string,
    documentType: string
): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${driverId}/${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `driver-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

/**
 * Vérifier un document (admin uniquement)
 */
export async function verifyDocument(
    documentId: string,
    verificationData: VerifyDocumentData
): Promise<DriverDocument> {
    const { data, error } = await supabase
        .from('driver_documents')
        .update({
            ...verificationData,
            verified_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Récupérer tous les documents en attente de vérification (admin)
 */
export async function getPendingDocuments(): Promise<DriverDocument[]> {
    const { data, error } = await supabase
        .from('driver_documents')
        .select(`
      *,
      driver:drivers(
        id,
        first_name,
        last_name,
        phone
      )
    `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Récupérer les documents expirés ou bientôt expirés
 */
export async function getExpiringDocuments(daysBeforeExpiry: number = 30): Promise<DriverDocument[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysBeforeExpiry);

    const { data, error } = await supabase
        .from('driver_documents')
        .select(`
      *,
      driver:drivers(
        id,
        first_name,
        last_name,
        phone,
        email
      )
    `)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .eq('verification_status', 'approved')
        .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Vérifier si un chauffeur a tous les documents requis et valides
 */
export async function checkDriverDocumentsComplete(driverId: string): Promise<{
    isComplete: boolean;
    missing: string[];
    expired: string[];
}> {
    const requiredDocuments = ['permis', 'assurance', 'carte_grise'];
    const documents = await getDriverDocuments(driverId);

    const approvedDocs = documents.filter(d => d.verification_status === 'approved');
    const today = new Date().toISOString().split('T')[0];

    const missing: string[] = [];
    const expired: string[] = [];

    for (const docType of requiredDocuments) {
        const doc = approvedDocs.find(d => d.document_type === docType);

        if (!doc) {
            missing.push(docType);
        } else if (doc.expiry_date && doc.expiry_date < today) {
            expired.push(docType);
        }
    }

    return {
        isComplete: missing.length === 0 && expired.length === 0,
        missing,
        expired
    };
}

/**
 * Récupérer les statistiques des documents (admin)
 */
export async function getDocumentStats() {
    const { data, error } = await supabase
        .from('driver_documents')
        .select('document_type, verification_status');

    if (error) throw error;

    const stats = {
        total: data?.length || 0,
        byType: {
            permis: data?.filter(d => d.document_type === 'permis').length || 0,
            assurance: data?.filter(d => d.document_type === 'assurance').length || 0,
            carte_grise: data?.filter(d => d.document_type === 'carte_grise').length || 0,
            kbis: data?.filter(d => d.document_type === 'kbis').length || 0,
            autre: data?.filter(d => d.document_type === 'autre').length || 0,
        },
        byStatus: {
            pending: data?.filter(d => d.verification_status === 'pending').length || 0,
            approved: data?.filter(d => d.verification_status === 'approved').length || 0,
            rejected: data?.filter(d => d.verification_status === 'rejected').length || 0,
        }
    };

    return stats;
}
