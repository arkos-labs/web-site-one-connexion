import { supabase } from '@/lib/supabase';
import { Driver, OrderWithDetails } from '../types';

export const getAllDrivers = async (): Promise<Driver[]> => {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Driver[];
};

export const getDriverById = async (driverId: string): Promise<Driver | null> => {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();

    if (error) throw error;
    return data as Driver;
};

export const getDriverOrders = async (driverId: string): Promise<OrderWithDetails[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      clients:client_id (
        id,
        company_name,
        email,
        phone
      )
    `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Manually join driver info
    const orders = data as any[];
    const { data: driverData } = await supabase.from('drivers').select('id, first_name, last_name, phone').eq('id', driverId).single();

    return orders.map(o => ({
        ...o,
        drivers: driverData || null
    })) as OrderWithDetails[];
};

export const createDriver = async (driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('drivers')
        .insert({
            ...driverData,
            status: 'offline',
        })
        .select()
        .single();

    if (error) throw error;
    return data as Driver;
};

export const updateDriver = async (driverId: string, updates: Partial<Driver>) => {
    const { error } = await supabase
        .from('drivers')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

    if (error) throw error;
};

export const getAvailableDrivers = async (): Promise<Driver[]> => {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available')
        .order('last_location_update', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data as Driver[];
};

export const subscribeToDrivers = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-drivers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, callback)
        .subscribe();
};

export const uploadDriverDocument = async (
    driverId: string,
    file: File,
    documentType: 'license' | 'insurance'
): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${driverId}_${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `driver-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

    const updateField = documentType === 'license' ? 'license_document_url' : 'insurance_document_url';
    const { error: updateError } = await supabase
        .from('drivers')
        .update({ [updateField]: publicUrl })
        .eq('id', driverId);

    if (updateError) throw updateError;

    return publicUrl;
};
