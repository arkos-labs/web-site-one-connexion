import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/supabase';
import { OrderWithDetails, PaginatedResult } from '../types';

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

    const driverIds = [...new Set((data || []).filter((o: any) => o.driver_id).map((o: any) => o.driver_id))];

    let driversMap: Record<string, any> = {};
    if (driverIds.length > 0) {
        const { data: drivers } = await supabase
            .from('drivers')
            .select('id, user_id, first_name, last_name, phone, status')
            .or(`id.in.(${driverIds.join(',')}),user_id.in.(${driverIds.join(',')})`);

        (drivers || []).forEach((d: any) => {
            driversMap[d.id] = d;
            if (d.user_id) driversMap[d.user_id] = d;
        });
    }

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

    if (status === 'accepted' && !updateData.accepted_at) {
        updateData.accepted_at = new Date().toISOString();
    } else if (status === 'assigned' && !updateData.dispatched_at) {
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

    if (error) throw error;
};

export const assignDriverToOrder = async (orderId: string, driverId: string) => {
    const { error } = await supabase
        .from('orders')
        .update({
            driver_id: driverId,
            status: 'assigned',
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (error) throw error;
};

export const cancelOrder = async (orderId: string, cancellationReason: string) => {
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

    if (fetchError) throw fetchError;

    const cancellationFee = (order.status === 'assigned' || order.status === 'in_progress') ? 8.00 : 0;

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

    if (error) throw error;
};

export const duplicateOrder = async (orderId: string): Promise<string> => {
    const { data: originalOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (fetchError) throw fetchError;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const reference = `CMD-${dateStr}-${randomSuffix}`;

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

    if (createError) throw createError;

    if (!newOrder) {
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

    return newOrder.id;
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
        query = query.or(`reference.ilike.%${searchQuery}%,client_code.ilike.%${searchQuery}%,pickup_address.ilike.%${searchQuery}%,delivery_address.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    const driverIds = [...new Set((data || []).filter((o: any) => o.driver_id).map((o: any) => o.driver_id))];

    let driversMap: Record<string, any> = {};
    if (driverIds.length > 0) {
        const { data: drivers } = await supabase
            .from('drivers')
            .select('id, user_id, first_name, last_name, phone, status')
            .or(`id.in.(${driverIds.join(',')}),user_id.in.(${driverIds.join(',')})`);

        (drivers || []).forEach((d: any) => {
            driversMap[d.id] = d;
            if (d.user_id) driversMap[d.user_id] = d;
        });
    }

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

export const subscribeToOrders = (callback: (payload: any) => void) => {
    return supabase
        .channel('admin-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
        .subscribe();
};
