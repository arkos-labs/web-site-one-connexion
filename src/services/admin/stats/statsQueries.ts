import { supabase } from '@/lib/supabase';

export const getAdminStats = async () => {
    const { data: orders } = await supabase.from('orders').select('status');
    const { data: drivers } = await supabase.from('drivers').select('status');
    const { data: clients } = await supabase.from('clients').select('status');
    const { data: invoices } = await supabase.from('invoices').select('status, amount_ttc');

    return {
        orders: {
            total: orders?.length || 0,
            pending: orders?.filter(o => o.status === 'pending_acceptance').length || 0,
            accepted: orders?.filter(o => o.status === 'accepted').length || 0,
            assigned: orders?.filter(o => o.status === 'assigned').length || 0,
            in_progress: orders?.filter(o => o.status === 'in_progress').length || 0,
            delivered: orders?.filter(o => o.status === 'delivered').length || 0,
            cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
        },
        drivers: {
            total: drivers?.length || 0,
            online: drivers?.filter(d => d.status === 'available').length || 0,
            active: drivers?.filter(d => d.status === 'busy').length || 0,
        },
        clients: {
            total: clients?.length || 0,
            active: clients?.filter(c => c.status === 'active').length || 0,
            pending: clients?.filter(c => c.status === 'pending').length || 0,
            inactive: clients?.filter(c => c.status === 'inactive').length || 0,
        },
        invoices: {
            total: invoices?.length || 0,
            paid: invoices?.filter(i => i.status === 'paid').length || 0,
            pending: invoices?.filter(i => i.status === 'pending').length || 0,
            overdue: invoices?.filter(i => i.status === 'overdue').length || 0,
            totalAmount: invoices?.reduce((sum, i) => sum + i.amount_ttc, 0) || 0,
            pendingAmount: invoices?.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount_ttc, 0) || 0,
        },
    };
};

export const getFilteredStats = async (filters?: { startDate?: string; endDate?: string; }) => {
    let ordersQuery = supabase.from('orders').select('status, price');
    if (filters?.startDate) ordersQuery = ordersQuery.gte('created_at', filters.startDate);
    if (filters?.endDate) ordersQuery = ordersQuery.lte('created_at', filters.endDate);

    const { data: orders } = await ordersQuery;
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
    
    return {
        totalOrders: orders?.length || 0,
        totalRevenue,
        averageOrderValue: orders && orders.length > 0 ? totalRevenue / orders.length : 0,
        deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
        cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending_acceptance').length || 0,
    };
};
