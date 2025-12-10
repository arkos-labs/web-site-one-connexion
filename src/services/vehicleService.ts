import { supabase } from "@/lib/supabase";

export interface Vehicle {
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

export interface CreateVehicleData {
    driver_id: string;
    brand: string;
    model: string;
    license_plate: string;
    vehicle_type: 'moto' | 'voiture' | 'utilitaire';
    color?: string;
    year?: number;
    max_weight_kg?: number;
    max_volume_m3?: number;
}

export interface UpdateVehicleData {
    brand?: string;
    model?: string;
    license_plate?: string;
    vehicle_type?: 'moto' | 'voiture' | 'utilitaire';
    color?: string;
    year?: number;
    max_weight_kg?: number;
    max_volume_m3?: number;
    status?: 'active' | 'inactive' | 'maintenance';
    is_verified?: boolean;
}

/**
 * Récupérer tous les véhicules d'un chauffeur
 */
export async function getDriverVehicles(driverId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Récupérer un véhicule par son ID
 */
export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Créer un nouveau véhicule
 */
export async function createVehicle(vehicleData: CreateVehicleData): Promise<Vehicle> {
    const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Mettre à jour un véhicule
 */
export async function updateVehicle(
    vehicleId: string,
    updates: UpdateVehicleData
): Promise<Vehicle> {
    const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Supprimer un véhicule
 */
export async function deleteVehicle(vehicleId: string): Promise<void> {
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

    if (error) throw error;
}

/**
 * Récupérer tous les véhicules (pour admin)
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
        .from('vehicles')
        .select(`
      *,
      driver:drivers(
        id,
        first_name,
        last_name,
        phone
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Vérifier un véhicule (admin uniquement)
 */
export async function verifyVehicle(vehicleId: string, isVerified: boolean): Promise<Vehicle> {
    const { data, error } = await supabase
        .from('vehicles')
        .update({ is_verified: isVerified })
        .eq('id', vehicleId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Récupérer les statistiques des véhicules (admin)
 */
export async function getVehicleStats() {
    const { data, error } = await supabase
        .from('vehicles')
        .select('vehicle_type, status');

    if (error) throw error;

    const stats = {
        total: data?.length || 0,
        byType: {
            moto: data?.filter(v => v.vehicle_type === 'moto').length || 0,
            voiture: data?.filter(v => v.vehicle_type === 'voiture').length || 0,
            utilitaire: data?.filter(v => v.vehicle_type === 'utilitaire').length || 0,
        },
        byStatus: {
            active: data?.filter(v => v.status === 'active').length || 0,
            inactive: data?.filter(v => v.status === 'inactive').length || 0,
            maintenance: data?.filter(v => v.status === 'maintenance').length || 0,
        }
    };

    return stats;
}
