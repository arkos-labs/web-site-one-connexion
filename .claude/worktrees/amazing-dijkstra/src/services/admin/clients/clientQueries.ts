import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/supabase';
import { PaginatedResult } from '../types';

export const getAllClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
};

export const getClientById = async (clientId: string): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

    if (error) throw error;
    return data as Client;
};

export const createClient = async (clientData: Partial<Client>) => {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            ...clientData,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data as Client;
};

export const updateClient = async (clientId: string, updates: Partial<Client>) => {
    const { error } = await supabase
        .from('clients')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

    if (error) throw error;
};

export const getClientsPaginated = async (
    page: number = 1,
    pageSize: number = 10,
    searchQuery: string = "",
    statusFilter: string = "all"
): Promise<PaginatedResult<Client>> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

    if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
        query = query.or(`company_name.ilike.%${searchQuery}%,internal_code.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        data: data as Client[],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
    };
};

export const suspendClient = async (clientId: string, reason?: string) => {
    const { error } = await supabase
        .from('clients')
        .update({
            is_suspended: true,
            suspended_at: new Date().toISOString(),
            suspension_reason: reason || 'Non spécifiée',
            status: 'suspended',
        })
        .eq('id', clientId);

    if (error) throw error;
};

export const unsuspendClient = async (clientId: string) => {
    const { error } = await supabase
        .from('clients')
        .update({
            is_suspended: false,
            suspended_at: null,
            suspension_reason: null,
            status: 'active',
        })
        .eq('id', clientId);

    if (error) throw error;
};

export const subscribeToClients = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-clients')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, callback)
        .subscribe();
};
