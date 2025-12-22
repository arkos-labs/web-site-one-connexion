import { supabase } from '@/lib/supabase';
import { Order, Client, Invoice } from '@/lib/supabase';
import { OrderEvent } from '@/types/order_events';
import { sendEmail } from './emailService';

// ==================== TYPES ====================

export interface Driver {
    id: string;
    user_id?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    vehicle_type?: string;
    vehicle_registration?: string;
    license_number?: string;
    insurance_document?: string;
    license_expiry?: string;
    insurance_expiry?: string;
    license_document_url?: string;
    insurance_document_url?: string;
    is_online?: boolean;
    last_location_update?: string;
    status: 'available' | 'busy' | 'offline' | 'suspended';
    siret?: string;
    vehicle_capacity?: string;
    created_at: string;
    updated_at?: string;
}

export interface OrderWithDetails extends Order {
    clients?: Client;
    drivers?: Driver;
    // Propriétés pour les commandes invitées (sans compte)
    user_id?: string | null;
    email_client?: string;
    nom_client?: string;
    facturation?: {
        societe?: string;
        nom?: string;
        adresse?: string;
        siret?: string;
        email?: string;
        telephone?: string;
    };
    distance_km?: number;
}

export interface MessageData {
    id?: string;
    client_id: string;
    sender_type: 'admin' | 'client';
    subject?: string;
    message: string;
    is_read: boolean;
    created_at?: string;
}

// ==================== COMMANDES ====================

export const getAllOrders = async (): Promise<OrderWithDetails[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      clients!orders_client_id_fkey_clients (
        id,
        company_name,
        email,
        phone,
        status
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Récupérer les IDs de chauffeurs uniques
    const driverIds = [...new Set((data || []).filter((o: any) => o.driver_id).map((o: any) => o.driver_id))];

    // Récupérer tous les chauffeurs en une seule requête batch (évite les erreurs 406)
    let driversMap: Record<string, any> = {};
    if (driverIds.length > 0) {
        const { data: drivers } = await supabase
            .from('drivers')
            .select('id, user_id, first_name, last_name, phone, status')
            .or(`id.in.(${driverIds.join(',')}),user_id.in.(${driverIds.join(',')})`);

        // Créer un map pour la recherche rapide par id ET user_id
        (drivers || []).forEach((d: any) => {
            driversMap[d.id] = d;
            if (d.user_id) driversMap[d.user_id] = d;
        });
    }

    // Associer les chauffeurs aux commandes
    const ordersWithDrivers = (data || []).map((order: any) => ({
        ...order,
        drivers: order.driver_id ? driversMap[order.driver_id] || null : null
    }));

    return ordersWithDrivers as OrderWithDetails[];
};

export const getOrderById = async (orderId: string): Promise<OrderWithDetails | null> => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      clients!orders_client_id_fkey_clients (
        id,
        company_name,
        email,
        phone,
        status
      )
    `)
        .eq('id', orderId)
        .single();

    if (error) throw error;

    // Récupérer les infos du chauffeur séparément (recherche par id OU user_id)
    let orderWithDriver = data as any;
    if (data?.driver_id) {
        const { data: driver } = await supabase
            .from('drivers')
            .select('id, user_id, first_name, last_name, phone, email, vehicle_type, status')
            .or(`id.eq.${data.driver_id},user_id.eq.${data.driver_id}`)
            .limit(1)
            .maybeSingle();
        orderWithDriver = { ...data, drivers: driver || null };
    } else {
        orderWithDriver = { ...data, drivers: null };
    }

    return orderWithDriver as OrderWithDetails;
};

export const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    additionalData?: Partial<Order>
) => {
    const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
    };

    // Ajouter timestamp selon le statut
    if (status === 'accepted' && !updateData.accepted_at) {
        updateData.accepted_at = new Date().toISOString();
    } else if (status === 'dispatched' && !updateData.dispatched_at) {
        updateData.dispatched_at = new Date().toISOString();
    } else if (status === 'delivered' && !updateData.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
    } else if (status === 'cancelled' && !updateData.cancelled_at) {
        updateData.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        throw error;
    }

    // Les événements sont créés automatiquement par le trigger DB
};

export const assignDriverToOrder = async (orderId: string, driverId: string) => {
    const { error } = await supabase
        .from('orders')
        .update({
            driver_id: driverId,
            status: 'dispatched',
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) throw error;
};

export const cancelOrder = async (orderId: string, cancellationReason: string) => {
    // Récupérer la commande pour vérifier si elle est dispatchée
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

    if (fetchError) throw fetchError;

    // Calculer les frais d'annulation (8€ si dispatchée)
    const cancellationFee = (order.status === 'dispatched' || order.status === 'in_progress') ? 8.00 : 0;

    const { error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_reason: cancellationReason,
            cancellation_fee: cancellationFee,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }

    // L'événement est créé automatiquement par le trigger DB
};

export const duplicateOrder = async (orderId: string): Promise<string> => {
    // Récupérer la commande originale
    const { data: originalOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error('Error fetching original order:', fetchError);
        throw fetchError;
    }

    // Générer nouvelle référence
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const reference = `CMD-${dateStr}-${randomSuffix}`;

    // Créer une nouvelle commande avec TOUS les champs pertinents
    const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({
            reference,
            client_id: originalOrder.client_id,
            client_code: originalOrder.client_code,
            pickup_address: originalOrder.pickup_address,
            delivery_address: originalOrder.delivery_address,
            delivery_type: originalOrder.delivery_type,
            price: originalOrder.price,
            status: 'pending_acceptance',
            pickup_lat: originalOrder.pickup_lat,
            pickup_lng: originalOrder.pickup_lng,
            delivery_lat: originalOrder.delivery_lat,
            delivery_lng: originalOrder.delivery_lng,
            notes: originalOrder.notes,
            package_description: originalOrder.package_description,
        })
        .select()
        .single();

    if (createError) {
        console.error('Error creating duplicate order:', createError);
        throw createError;
    }

    if (!newOrder) {
        // Fallback: try to fetch by reference if select() returned null (e.g. RLS)
        const { data: fallbackOrder, error: fallbackError } = await supabase
            .from('orders')
            .select('id')
            .eq('reference', reference)
            .single();

        if (fallbackError || !fallbackOrder) {
            throw new Error("Order created but could not be retrieved.");
        }
        return fallbackOrder.id;
    }

    // L'événement 'created' est créé automatiquement par le trigger DB
    return newOrder.id;
};

export const createOrderWithClient = async (orderData: {
    clientData: {
        company_name: string;
        email: string;
        phone: string;
        address?: string;
    };
    orderDetails: {
        pickup_address: string;
        delivery_address: string;
        delivery_type: string;
        price: number;
        pickup_lat?: number;
        pickup_lng?: number;
        delivery_lat?: number;
        delivery_lng?: number;
    };
}) => {
    const { clientData, orderDetails } = orderData;

    // 1. Vérifier si le client existe déjà (par email)
    const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', clientData.email)
        .single();

    let clientId: string;

    if (existingClient) {
        // Client existe déjà
        clientId = existingClient.id;
    } else {
        // Créer le nouveau client
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
                company_name: clientData.company_name,
                email: clientData.email,
                phone: clientData.phone,
                address: clientData.address,
                status: 'pending', // Statut par défaut
            })
            .select()
            .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
    }

    // 2. Créer la commande
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
            client_id: clientId,
            client_code: existingClient?.internal_code || `CL-${clientId.slice(0, 8)}`,
            ...orderDetails,
            status: 'pending_acceptance',
        })
        .select()
        .single();

    if (orderError) throw orderError;
    return { order: newOrder, clientId };
};

// ==================== ORDER EVENTS (HISTORIQUE) ====================

export const getOrderEvents = async (orderId: string): Promise<OrderEvent[]> => {
    const { data, error } = await supabase
        .from('order_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching order events:', error);
        throw error;
    }

    return data as OrderEvent[];
};

export const createOrderEvent = async (
    orderId: string,
    eventType: OrderEvent['event_type'],
    description: string,
    metadata?: Record<string, any>
): Promise<void> => {
    const { error } = await supabase
        .from('order_events')
        .insert({
            order_id: orderId,
            event_type: eventType,
            description,
            metadata,
            actor_type: 'admin',
        });

    if (error) {
        console.error('Error creating order event:', error);
        throw error;
    }
};

// ==================== CHAUFFEURS ====================

export const getAllDrivers = async (): Promise<Driver[]> => {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
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
    return data as OrderWithDetails[];
};

export const createDriver = async (driverData: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('drivers')
        .insert({
            ...driverData,
            status: 'offline', // Default status
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

export const updateDriverPersonalInfo = async (driverId: string, data: Partial<Driver>) => {
    // Filtrer pour ne garder que les infos personnelles sûres
    const { first_name, last_name, email, phone, status } = data;

    // 1. Mise à jour des champs de base (qui existent sûrement)
    const { error: mainError } = await supabase
        .from('drivers')
        .update({
            first_name,
            last_name,
            email,
            phone,
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

    if (mainError) throw mainError;

    // 2. Tentative de mise à jour de l'adresse si elle est présente
    if (data.address !== undefined) {
        const { error: addressError } = await supabase
            .from('drivers')
            .update({ address: data.address })
            .eq('id', driverId);

        if (addressError) {
            console.warn("Attention: Impossible de mettre à jour l'adresse (colonne manquante ou erreur schéma)", addressError);
            // On lance une erreur non bloquante ou on laisse passer avec un warning console
            // Pour l'UX, on va throw une erreur spécifique que le front pourra afficher comme un warning
            throw new Error(`Informations enregistrées, mais l'adresse n'a pas pu être mise à jour (Erreur technique: ${addressError.message})`);
        }
    }
};

export const updateDriverVehicle = async (driverId: string, data: Partial<Driver>) => {
    // Filtrer pour ne garder que les infos véhicule
    const { vehicle_type, vehicle_registration } = data;

    // Tentative de mise à jour des colonnes à plat
    const { error } = await supabase
        .from('drivers')
        .update({ vehicle_type, vehicle_registration })
        .eq('id', driverId);

    if (error) {
        // Si erreur, c'est peut-être que la structure est JSONB 'vehicle'
        console.warn("Erreur update vehicle flat, tentative JSONB...", error);

        // Fallback pour structure JSONB (basé sur src/types/drivers.ts)
        // On doit d'abord récupérer le véhicule existant pour ne pas tout écraser
        const { data: currentDriver } = await supabase.from('drivers').select('vehicle').eq('id', driverId).single();
        const currentVehicle = currentDriver?.vehicle || {};

        const { error: jsonError } = await supabase
            .from('drivers')
            .update({
                vehicle: {
                    ...currentVehicle,
                    type: vehicle_type, // Mapping approximatif
                    plate_number: vehicle_registration
                }
            })
            .eq('id', driverId);

        if (jsonError) throw new Error(`Erreur mise à jour véhicule: ${error.message} / ${jsonError.message}`);
    }
};

export const updateDriverDocuments = async (driverId: string, data: Partial<Driver>) => {
    // Filtrer pour ne garder que les documents
    const { license_number, insurance_document } = data;

    // Tentative mise à jour colonnes à plat
    const { error } = await supabase
        .from('drivers')
        .update({ license_number, insurance_document })
        .eq('id', driverId);

    if (error) {
        throw new Error(`Erreur mise à jour documents: ${error.message}`);
    }
};

export const getDriverDetails = async (driverId: string) => {
    return getDriverById(driverId);
};

export const getClientDetails = async (clientId: string) => {
    return getClientById(clientId);
};

// ==================== CLIENTS ====================

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

export const updateClientStatus = async (clientId: string, status: 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted') => {
    const { error } = await supabase
        .from('clients')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

    if (error) throw error;
};

export const createClient = async (clientData: Partial<Client>) => {
    const { data, error } = await supabase
        .from('clients')
        .insert({
            ...clientData,
            status: 'pending', // Statut par défaut
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

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

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

export const getClientStatsBatch = async (clientIds: string[]) => {
    if (clientIds.length === 0) return {};

    // Fetch orders for these clients
    const { data: orders } = await supabase
        .from('orders')
        .select('client_id, status, price')
        .in('client_id', clientIds);

    // Fetch invoices for these clients
    const { data: invoices } = await supabase
        .from('invoices')
        .select('client_id, status, amount_ttc')
        .in('client_id', clientIds);

    const stats: Record<string, any> = {};

    clientIds.forEach(id => {
        const clientOrders = orders?.filter(o => o.client_id === id) || [];
        const clientInvoices = invoices?.filter(i => i.client_id === id) || [];

        const totalOrders = clientOrders.length;
        const totalSpent = clientOrders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.price || 0), 0);

        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + (i.amount_ttc || 0), 0);
        const totalUnpaid = clientInvoices
            .filter(i => i.status === 'pending' || i.status === 'overdue')
            .reduce((sum, i) => sum + (i.amount_ttc || 0), 0);

        stats[id] = {
            stats: {
                total_orders: totalOrders,
                total_spent: totalSpent,
                average_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0,
                delivered_orders: clientOrders.filter(o => o.status === 'delivered').length,
                cancelled_orders: clientOrders.filter(o => o.status === 'cancelled').length,
                pending_orders: clientOrders.filter(o => ['pending', 'accepted'].includes(o.status)).length,
                in_progress_orders: clientOrders.filter(o => ['dispatched', 'in_progress'].includes(o.status)).length,
            },
            billing: {
                total_invoiced: totalInvoiced,
                total_unpaid: totalUnpaid,
                total_paid: clientInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount_ttc || 0), 0),
            }
        };
    });

    return stats;
};

export const getGlobalClientStats = async () => {
    const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    const { count: activeClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: suspendedClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'suspended');

    const { data: invoices } = await supabase.from('invoices').select('amount_ttc, status');

    const totalRevenue = invoices?.reduce((sum, i) => sum + (i.amount_ttc || 0), 0) || 0;
    const totalUnpaid = invoices?.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + (i.amount_ttc || 0), 0) || 0;

    return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        suspendedClients: suspendedClients || 0,
        totalRevenue,
        totalUnpaid
    };
};

export const getOrdersPaginated = async (
    page: number = 1,
    pageSize: number = 10,
    searchQuery: string = "",
    statusFilter: string = "all"
): Promise<PaginatedResult<OrderWithDetails>> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('orders')
        .select(`
      *,
      clients!orders_client_id_fkey_clients (
        id,
        company_name,
        email,
        phone,
        status
      )
    `, { count: 'exact' });

    if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
        // Search in order reference or client company name
        // Note: Searching in joined tables (clients.company_name) is tricky with simple OR syntax in Supabase JS client
        // We might need to rely on a text search index or simplified search for now (e.g. just reference)
        // Or use !inner join if we want to filter by client name, but that filters the rows.
        // For simplicity and performance, let's search primarily on reference and maybe client_code if it exists on order.
        query = query.or(`reference.ilike.%${searchQuery}%,client_code.ilike.%${searchQuery}%,pickup_address.ilike.%${searchQuery}%,delivery_address.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    // Récupérer les IDs de chauffeurs uniques
    const driverIds = [...new Set((data || []).filter((o: any) => o.driver_id).map((o: any) => o.driver_id))];

    // Récupérer tous les chauffeurs en une seule requête batch (évite les erreurs 406)
    let driversMap: Record<string, any> = {};
    if (driverIds.length > 0) {
        const { data: drivers } = await supabase
            .from('drivers')
            .select('id, user_id, first_name, last_name, phone, status')
            .or(`id.in.(${driverIds.join(',')}),user_id.in.(${driverIds.join(',')})`);

        // Créer un map pour la recherche rapide par id ET user_id
        (drivers || []).forEach((d: any) => {
            driversMap[d.id] = d;
            if (d.user_id) driversMap[d.user_id] = d;
        });
    }

    // Associer les chauffeurs aux commandes
    const ordersWithDrivers = (data || []).map((order: any) => ({
        ...order,
        drivers: order.driver_id ? driversMap[order.driver_id] || null : null
    }));

    return {
        data: ordersWithDrivers as OrderWithDetails[],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
    };
};

export const getGlobalOrderStats = async () => {
    // We can use the existing getAdminStats but maybe simplified if we only need counts
    const { count: total } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_acceptance');
    const { count: inProgress } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['dispatched', 'in_progress']);
    const { count: delivered } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered');
    const { count: cancelled } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled');

    return {
        total: total || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        delivered: delivered || 0,
        cancelled: cancelled || 0
    };
};

// ==================== FACTURES ====================

export const getAllInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      clients (
        id,
        company_name,
        email
      )
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const getUnpaidInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
      *,
      clients (
        id,
        company_name,
        email
      )
    `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            clients:client_id (
                id,
                company_name,
                email
            )
        `)
        .eq('id', invoiceId)
        .single();

    if (error) throw error;
    return data as Invoice;
};

export const sendPaymentReminder = async (clientId: string, invoiceId: string) => {
    // 1. Récupérer les infos pour l'email
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) throw new Error("Facture introuvable");

    const clientEmail = (invoice as any).clients?.email;
    const invoiceRef = invoice.reference;

    // 2. Message interne
    const message = `Vous avez une facture impayée (${invoiceRef}) de ${invoice.amount_ttc}€. Merci de régulariser votre situation dans les plus brefs délais.`;
    await sendMessageToClient(clientId, message, 'Relance facture impayée');

    // 3. Email
    if (clientEmail) {
        await sendEmail({
            to: clientEmail,
            subject: `Relance : Facture impayée ${invoiceRef}`,
            html: `
                <h1>Relance de paiement</h1>
                <p>Bonjour,</p>
                <p>Sauf erreur de notre part, la facture <strong>${invoiceRef}</strong> d'un montant de <strong>${invoice.amount_ttc}€</strong> est toujours en attente de règlement.</p>
                <p>Nous vous remercions de bien vouloir procéder au paiement dès que possible.</p>
                <p>Cordialement,<br>L'équipe One Connexion</p>
            `,
            attachmentUrl: invoice.pdf_url
        });
    }
};

export const sendBulkPaymentReminders = async () => {
    // Récupérer toutes les factures impayées
    const unpaidInvoices = await getUnpaidInvoices();

    // Grouper par client
    const clientInvoices = unpaidInvoices.reduce((acc, invoice) => {
        if (!acc[invoice.client_id]) {
            acc[invoice.client_id] = [];
        }
        acc[invoice.client_id].push(invoice);
        return acc;
    }, {} as Record<string, Invoice[]>);

    // Envoyer un message à chaque client
    const results = await Promise.allSettled(
        Object.keys(clientInvoices).map(clientId =>
            sendPaymentReminder(clientId, clientInvoices[clientId][0].id)
        )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    return { successCount, errorCount, totalClients: Object.keys(clientInvoices).length };
};

// ==================== MESSAGERIE ====================

export const getClientMessages = async (clientId: string): Promise<MessageData[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*, threads(subject)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map((m: any) => ({
        id: m.id,
        client_id: m.client_id,
        sender_type: m.sender_type,
        subject: m.threads?.subject,
        message: m.content,
        is_read: m.is_read,
        created_at: m.created_at,
        thread_id: m.thread_id
    }));
};

export const sendMessageToClient = async (clientId: string, message: string, subject?: string) => {
    // Find an open general thread or create one
    let threadId: string;

    const { data: threads } = await supabase
        .from('threads')
        .select('id')
        .eq('client_id', clientId)
        .eq('type', 'general')
        .eq('status', 'open')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (threads && threads.length > 0) {
        threadId = threads[0].id;
    } else {
        // Create new thread
        const { data: newThread, error: threadError } = await supabase
            .from('threads')
            .insert({
                client_id: clientId,
                subject: subject || 'Message du support',
                type: 'general',
                status: 'open'
            })
            .select()
            .single();

        if (threadError) throw threadError;
        threadId = newThread.id;
    }

    const { error } = await supabase
        .from('messages')
        .insert({
            thread_id: threadId,
            client_id: clientId,
            sender_type: 'admin',
            content: message,
            is_read: false
        });

    if (error) throw error;
};

export const sendGroupMessage = async (clientIds: string[], message: string, subject?: string) => {
    const promises = clientIds.map(async (clientId) => {
        // Create Thread
        const { data: thread, error: threadError } = await supabase
            .from('threads')
            .insert({
                client_id: clientId,
                subject: subject || 'Message du support',
                type: 'general',
                status: 'open'
            })
            .select()
            .single();

        if (threadError) throw threadError;

        // Create Message
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                thread_id: thread.id,
                client_id: clientId,
                sender_type: 'admin',
                content: message,
                is_read: false
            });

        if (msgError) throw msgError;
    });

    await Promise.all(promises);
};

export const markMessageAsRead = async (messageId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

    if (error) throw error;
};

// ==================== STATISTIQUES ====================

export const getAdminStats = async () => {
    // Commandes par statut
    const { data: orders } = await supabase
        .from('orders')
        .select('status');

    const orderStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending_acceptance').length || 0,
        accepted: orders?.filter(o => o.status === 'accepted').length || 0,
        dispatched: orders?.filter(o => o.status === 'dispatched').length || 0,
        in_progress: orders?.filter(o => o.status === 'in_progress').length || 0,
        delivered: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
    };

    // Chauffeurs en ligne
    const { data: drivers } = await supabase
        .from('drivers')
        .select('status');

    const driverStats = {
        total: drivers?.length || 0,
        online: drivers?.filter(d => d.status === 'available').length || 0,
        active: drivers?.filter(d => d.status === 'busy').length || 0,
    };

    // Clients actifs
    const { data: clients } = await supabase
        .from('clients')
        .select('status');

    const clientStats = {
        total: clients?.length || 0,
        active: clients?.filter(c => c.status === 'active').length || 0,
        pending: clients?.filter(c => c.status === 'pending').length || 0,
        inactive: clients?.filter(c => c.status === 'inactive').length || 0,
    };

    // Factures
    const { data: invoices } = await supabase
        .from('invoices')
        .select('status, amount_ttc');

    const invoiceStats = {
        total: invoices?.length || 0,
        paid: invoices?.filter(i => i.status === 'paid').length || 0,
        pending: invoices?.filter(i => i.status === 'pending').length || 0,
        overdue: invoices?.filter(i => i.status === 'overdue').length || 0,
        totalAmount: invoices?.reduce((sum, i) => sum + i.amount_ttc, 0) || 0,
        pendingAmount: invoices?.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount_ttc, 0) || 0,
    };

    return {
        orders: orderStats,
        drivers: driverStats,
        clients: clientStats,
        invoices: invoiceStats,
    };
};

// ==================== REALTIME SUBSCRIPTIONS ====================

export const subscribeToOrders = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
        .subscribe();
};

export const subscribeToDrivers = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-drivers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, callback)
        .subscribe();
};

export const subscribeToClients = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-clients')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, callback)
        .subscribe();
};

export const subscribeToInvoices = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-invoices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, callback)
        .subscribe();
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback)
        .subscribe();
};

// ==================== NOUVELLES FONCTIONS POUR AMÉLIORATIONS ====================

// Suspendre/Réactiver un client
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

// Obtenir les commandes d'un client avec filtres
export const getClientOrders = async (
    clientId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        status?: string;
    }
): Promise<OrderWithDetails[]> => {
    let query = supabase
        .from('orders')
        .select(`
            *,
            clients (
                id,
                company_name,
                email,
                phone
            )
        `)
        .eq('client_id', clientId);

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Manually join drivers to avoid relationship errors
    const orders = data as any[];
    const driverIds = [...new Set(orders.filter(o => o.driver_id).map(o => o.driver_id))];

    let driversMap: Record<string, any> = {};
    if (driverIds.length > 0) {
        const { data: driversData } = await supabase
            .from('drivers')
            .select('id, first_name, last_name, phone')
            .in('id', driverIds);

        if (driversData) {
            driversData.forEach(d => {
                driversMap[d.id] = d;
            });
        }
    }

    return orders.map(order => ({
        ...order,
        drivers: order.driver_id ? driversMap[order.driver_id] : null
    })) as OrderWithDetails[];
};

// Obtenir les statistiques avec filtres de date
export const getFilteredStats = async (filters?: {
    startDate?: string;
    endDate?: string;
}) => {
    let ordersQuery = supabase.from('orders').select('status, price');

    if (filters?.startDate) {
        ordersQuery = ordersQuery.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
        ordersQuery = ordersQuery.lte('created_at', filters.endDate);
    }

    const { data: orders } = await ordersQuery;

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
    const averageOrderValue = orders && orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
        totalOrders: orders?.length || 0,
        totalRevenue,
        averageOrderValue,
        deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending_acceptance').length || 0,
    };
};

// Upload de document pour chauffeur
export const uploadDriverDocument = async (
    driverId: string,
    file: File,
    documentType: 'license' | 'insurance'
): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${driverId}_${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `driver-documents/${fileName}`;

    // Upload du fichier
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

    // Mettre à jour le chauffeur avec l'URL du document
    const updateField = documentType === 'license' ? 'license_document_url' : 'insurance_document_url';
    const { error: updateError } = await supabase
        .from('drivers')
        .update({ [updateField]: publicUrl })
        .eq('id', driverId);

    if (updateError) throw updateError;

    return publicUrl;
};

// Obtenir les chauffeurs disponibles pour dispatch
export const getAvailableDrivers = async (): Promise<Driver[]> => {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available')
        .order('last_location_update', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Error fetching available drivers:', error);
        throw error;
    }
    return data as Driver[];
};

// Marquer tous les messages d'un client comme lus
export const markAllClientMessagesAsRead = async (clientId: string) => {
    const { error } = await supabase
        .from('messages')
        .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('is_read', false);

    if (error) throw error;
};

// Obtenir le nombre de messages non lus
export const getUnreadMessagesCount = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender_type', 'client');

    if (error) throw error;
    return count || 0;
};

// Obtenir toutes les factures d'un client
export const getClientInvoices = async (clientId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invoice[];
};

// Générer une facture pour un client (mensuelle)
export const generateMonthlyInvoice = async (
    clientId: string,
    month: number,
    year: number
): Promise<Invoice> => {
    // Récupérer toutes les commandes livrées du mois
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data: orders } = await supabase
        .from('orders')
        .select('price')
        .eq('client_id', clientId)
        .eq('status', 'delivered')
        .gte('delivered_at', startDate)
        .lte('delivered_at', endDate);

    if (!orders || orders.length === 0) {
        throw new Error('Aucune commande livrée pour cette période');
    }

    const totalHT = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const tva = totalHT * 0.20; // TVA 20%
    const totalTTC = totalHT + tva;

    // Créer la facture
    const reference = `FAC-${year}${String(month).padStart(2, '0')}-${clientId.slice(0, 8)}`;

    const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
            reference,
            client_id: clientId,
            month,
            year,
            amount_ht: totalHT,
            amount_tva: tva,
            amount_ttc: totalTTC,
            status: 'pending',
            due_date: new Date(year, month, 15).toISOString(), // 15 du mois suivant
        })
        .select()
        .single();

    if (error) throw error;
    return invoice as Invoice;
};

export const markInvoiceAsPaid = async (invoiceId: string) => {
    // 1. Mettre à jour le statut
    const { data: invoice, error } = await supabase
        .from('invoices')
        .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select(`
            *,
            clients:client_id (
                id,
                company_name,
                email
            )
        `)
        .single();

    if (error) throw error;

    // 2. Notifications
    if (invoice) {
        const clientEmail = (invoice.clients as any)?.email;
        const clientId = invoice.client_id;
        const invoiceRef = invoice.reference;

        // Message interne
        await sendMessageToClient(
            clientId,
            `Votre facture ${invoiceRef} a bien été réglée. Merci de votre confiance.`,
            'Confirmation de paiement'
        );

        // Email
        if (clientEmail) {
            await sendEmail({
                to: clientEmail,
                subject: `Paiement reçu : Facture ${invoiceRef}`,
                html: `
                    <h1>Paiement confirmé</h1>
                    <p>Bonjour,</p>
                    <p>Nous vous confirmons la bonne réception du paiement pour la facture <strong>${invoiceRef}</strong>.</p>
                    <p>Vous pouvez télécharger votre facture acquittée depuis votre espace client.</p>
                    <p>Cordialement,<br>L'équipe One Connexion</p>
                `,
                attachmentUrl: invoice.pdf_url
            });
        }
    }
};

export const sendInvoiceByEmail = async (invoiceId: string) => {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) throw new Error("Facture introuvable");

    const clientEmail = (invoice as any).clients?.email;
    const invoiceRef = invoice.reference;

    if (clientEmail) {
        await sendEmail({
            to: clientEmail,
            subject: `Votre facture ${invoiceRef}`,
            html: `
                <h1>Votre facture est disponible</h1>
                <p>Bonjour,</p>
                <p>Veuillez trouver ci-joint votre facture <strong>${invoiceRef}</strong>.</p>
                <p>Cordialement,<br>L'équipe One Connexion</p>
            `,
            attachmentUrl: invoice.pdf_url
        });
    }
};




