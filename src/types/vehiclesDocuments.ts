// Types mis à jour pour véhicules et documents (Phase 4)

export interface VehicleFromDB {
    id: string;
    driver_id: string;
    brand: string;
    model: string;
    license_plate: string;
    vehicle_type: 'moto' | 'voiture' | 'utilitaire';
    color?: string;
    year?: number;
    max_weight_kg?: number;
    max_volume_m3?: number;
    status: 'active' | 'inactive' | 'maintenance';
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface DocumentFromDB {
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

// Fonction pour convertir VehicleFromDB vers DriverVehicle
export function mapVehicleToDriverVehicle(vehicle: VehicleFromDB) {
    // Map vehicle_type from DB to frontend type
    let frontendType: 'scooter' | 'moto' | 'voiture' | 'velo' = 'voiture';

    if (vehicle.vehicle_type === 'moto') {
        frontendType = 'moto';
    } else if (vehicle.vehicle_type === 'voiture') {
        frontendType = 'voiture';
    } else if (vehicle.vehicle_type === 'utilitaire') {
        // Map 'utilitaire' to 'voiture' as it's the closest match
        frontendType = 'voiture';
    }

    return {
        brand: vehicle.brand,
        model: vehicle.model,
        plate_number: vehicle.license_plate,
        type: frontendType,
        color: vehicle.color
    };
}

// Fonction pour convertir DocumentFromDB vers DriverDocument
export function mapDocumentToDriverDocument(doc: DocumentFromDB) {
    // Map verification_status to status
    let status: 'valid' | 'expired' | 'pending' = 'pending';

    if (doc.verification_status === 'approved') {
        // Check if expired
        if (doc.expiry_date) {
            const expiry = new Date(doc.expiry_date);
            const now = new Date();
            status = expiry < now ? 'expired' : 'valid';
        } else {
            status = 'valid';
        }
    } else if (doc.verification_status === 'rejected') {
        status = 'pending';
    }

    // Map document_type to type
    let type: 'license' | 'registration' | 'insurance' | 'identity' = 'identity';
    if (doc.document_type === 'permis') type = 'license';
    else if (doc.document_type === 'carte_grise') type = 'registration';
    else if (doc.document_type === 'assurance') type = 'insurance';

    return {
        id: doc.id,
        type,
        name: doc.document_name,
        file_url: doc.file_url,
        expiry_date: doc.expiry_date,
        uploaded_at: doc.created_at,
        status
    };
}
