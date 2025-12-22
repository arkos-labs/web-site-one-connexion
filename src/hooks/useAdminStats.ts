import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface TeamMember {
    id: string;
    name: string;
    status: string;
    deliveries: number;
    available: boolean;
}

export interface SystemAlert {
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    time: string;
}

export interface KeyPoint {
    title: string;
    impact: 'Critique' | 'Élevé' | 'Moyen' | 'Faible';
    time: string;
    color: string;
}

export interface StatsFilter {
    period: 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';
    startDate?: string;
    endDate?: string;
}

export interface AdminStats {
    // Generic metrics based on filter
    ordersCount: number;
    ordersChange: number;
    newClientsCount: number;
    newClientsChange: number;
    revenueTotal: number;
    revenueChange: number;

    // Kept for specific unique metrics and backward compatibility (mapped)
    activeDrivers: number;
    totalDrivers: number;

    // Mapped aliases for backward compatibility with existing DashboardAdmin
    ordersToday: number;
    ordersTodayChange: number;
    newClientsMonth: number;
    newClientsMonthChange: number;
    revenueToday: number;
    revenueTodayChange: number;

    ordersByStatus: {
        pending: number;
        in_progress: number;
        delivered: number;
        cancelled: number;
    };
    teamMembers: TeamMember[];
    alerts: SystemAlert[];
    keyPoints: KeyPoint[];
    loading: boolean;
}

export const useAdminStats = (filter: StatsFilter = { period: 'day' }) => {
    const [stats, setStats] = useState<AdminStats>({
        ordersCount: 0,
        ordersChange: 0,
        newClientsCount: 0,
        newClientsChange: 0,
        revenueTotal: 0,
        revenueChange: 0,
        activeDrivers: 0,
        totalDrivers: 0,

        // Init aliases
        ordersToday: 0,
        ordersTodayChange: 0,
        newClientsMonth: 0,
        newClientsMonthChange: 0,
        revenueToday: 0,
        revenueTodayChange: 0,

        ordersByStatus: {
            pending: 0,
            in_progress: 0,
            delivered: 0,
            cancelled: 0
        },
        teamMembers: [],
        alerts: [],
        keyPoints: [],
        loading: true
    });

    // Ref for debouncing
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getDates = () => {
        const now = new Date();
        let currentStart = new Date();
        let currentEnd = new Date();
        let prevStart = new Date();
        let prevEnd = new Date();

        currentEnd.setHours(23, 59, 59, 999);

        switch (filter.period) {
            case 'day':
                currentStart.setHours(0, 0, 0, 0);
                prevStart = new Date(currentStart);
                prevStart.setDate(prevStart.getDate() - 1);
                prevEnd = new Date(prevStart);
                prevEnd.setHours(23, 59, 59, 999);
                break;
            case 'week':
                const day = currentStart.getDay() || 7;
                currentStart.setDate(currentStart.getDate() - day + 1);
                currentStart.setHours(0, 0, 0, 0);
                prevStart = new Date(currentStart);
                prevStart.setDate(prevStart.getDate() - 7);
                prevEnd = new Date(prevStart);
                prevEnd.setDate(prevEnd.getDate() + 6);
                prevEnd.setHours(23, 59, 59, 999);
                break;
            case 'month':
                currentStart.setDate(1);
                currentStart.setHours(0, 0, 0, 0);
                prevStart = new Date(currentStart);
                prevStart.setMonth(prevStart.getMonth() - 1);
                prevEnd = new Date(currentStart);
                prevEnd.setDate(0);
                prevEnd.setHours(23, 59, 59, 999);
                break;
            case 'year':
                currentStart.setMonth(0, 1);
                currentStart.setHours(0, 0, 0, 0);
                prevStart = new Date(currentStart);
                prevStart.setFullYear(prevStart.getFullYear() - 1);
                prevEnd = new Date(currentStart);
                prevEnd.setDate(0);
                prevEnd.setHours(23, 59, 59, 999);
                break;
            case 'all':
                currentStart = new Date('2000-01-01');
                prevStart = new Date('1900-01-01');
                prevEnd = new Date('1999-12-31');
                break;
            case 'custom':
                if (filter.startDate && filter.endDate) {
                    currentStart = new Date(filter.startDate);
                    currentEnd = new Date(filter.endDate);
                    currentEnd.setHours(23, 59, 59, 999);

                    const diff = currentEnd.getTime() - currentStart.getTime();
                    prevEnd = new Date(currentStart.getTime() - 1);
                    prevStart = new Date(prevEnd.getTime() - diff);
                }
                break;
        }

        return { currentStart, currentEnd, prevStart, prevEnd };
    };

    const fetchStats = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) {
                setStats(prev => ({ ...prev, loading: true }));
            }

            const { currentStart, currentEnd, prevStart, prevEnd } = getDates();
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Execute queries in parallel
            const [
                ordersCurrentRes,
                ordersPrevRes,
                clientsCurrentRes,
                clientsPrevRes,
                activeDriversRes,
                totalDriversRes,
                revenueCurrentRes,
                revenuePrevRes,
                pendingRes,
                acceptedRes,
                dispatchedRes,
                deliveredRes,
                cancelledRes,
                driversRes,
                delayedOrdersRes,
                newClientsAlertRes
            ] = await Promise.all([
                // 1. Orders
                supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', currentStart.toISOString()).lte('created_at', currentEnd.toISOString()),
                supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString()),

                // 2. Clients
                supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', currentStart.toISOString()).lte('created_at', currentEnd.toISOString()),
                supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString()),

                // 3. Drivers
                supabase.from('drivers').select('*', { count: 'exact', head: true }).or('is_online.eq.true,status.eq.available,status.eq.busy,status.eq.online,status.eq.on_delivery'),
                supabase.from('drivers').select('*', { count: 'exact', head: true }),

                // 4. Revenue
                supabase.from('orders').select('price').gte('created_at', currentStart.toISOString()).lte('created_at', currentEnd.toISOString()).neq('status', 'cancelled'),
                supabase.from('orders').select('price').gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString()).neq('status', 'cancelled'),

                // 5. Orders by Status
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_acceptance'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'dispatched'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered').gte('updated_at', currentStart.toISOString()).lte('updated_at', currentEnd.toISOString()),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled').gte('updated_at', currentStart.toISOString()).lte('updated_at', currentEnd.toISOString()),

                // 6. Team Members
                supabase.from('drivers').select('id, first_name, last_name, status, is_online').limit(5),

                // 7. Alerts
                supabase.from('orders').select('reference, created_at').eq('status', 'pending_acceptance').lt('created_at', twoHoursAgo).limit(1),
                supabase.from('clients').select('company_name').gte('created_at', twentyFourHoursAgo).limit(1)
            ]);

            // Process Results
            const ordersCurrentCount = ordersCurrentRes.count || 0;
            const ordersPrevCount = ordersPrevRes.count || 0;

            const clientsCurrentCount = clientsCurrentRes.count || 0;
            const clientsPrevCount = clientsPrevRes.count || 0;

            const activeDriversCount = activeDriversRes.count || 0;
            const totalDriversCount = totalDriversRes.count || 0;

            const revenueCurrentTotal = revenueCurrentRes.data?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;
            const revenuePrevTotal = revenuePrevRes.data?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;

            const pendingCount = pendingRes.count || 0;
            const acceptedCount = acceptedRes.count || 0;
            const dispatchedCount = dispatchedRes.count || 0;
            const inProgressCount = acceptedCount + dispatchedCount;
            const deliveredCount = deliveredRes.count || 0;
            const cancelledCount = cancelledRes.count || 0;

            // Process Team Members
            const drivers = driversRes.data || [];
            const teamMembers: TeamMember[] = [];

            if (drivers.length > 0) {
                const driverIds = drivers.map(d => d.id);
                const { data: activeDeliveries } = await supabase
                    .from('orders')
                    .select('driver_id')
                    .in('driver_id', driverIds)
                    .in('status', ['dispatched', 'in_progress']);

                const deliveryCounts = (activeDeliveries || []).reduce((acc, curr) => {
                    acc[curr.driver_id] = (acc[curr.driver_id] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                drivers.forEach(driver => {
                    let statusLabel = 'Hors ligne';
                    let available = false;
                    if (driver.status === 'available') {
                        statusLabel = 'Disponible';
                        available = true;
                    } else if (driver.status === 'busy') {
                        statusLabel = 'En livraison';
                    } else if (driver.is_online) {
                        statusLabel = 'En ligne';
                        available = true;
                    }

                    teamMembers.push({
                        id: driver.id,
                        name: `${driver.first_name} ${driver.last_name}`,
                        status: statusLabel,
                        deliveries: deliveryCounts[driver.id] || 0,
                        available: available
                    });
                });
            }

            // Process Alerts
            const alerts: SystemAlert[] = [];
            const delayedOrders = delayedOrdersRes.data;
            const newClients = newClientsAlertRes.data;

            if (delayedOrders && delayedOrders.length > 0) {
                alerts.push({
                    type: 'warning',
                    title: 'Retard potentiel',
                    message: `Commande ${delayedOrders[0].reference} en attente depuis > 2h`,
                    time: 'Maintenant'
                });
            }

            if (newClients && newClients.length > 0) {
                alerts.push({
                    type: 'info',
                    title: 'Nouveau client',
                    message: `${newClients[0].company_name} a rejoint la plateforme`,
                    time: 'Récemment'
                });
            }

            if (filter.period === 'day' && ordersCurrentCount >= 10) {
                alerts.push({
                    type: 'success',
                    title: 'Objectif atteint',
                    message: `${ordersCurrentCount} commandes aujourd'hui !`,
                    time: 'Aujourd\'hui'
                });
            }

            // Key Points
            const keyPoints: KeyPoint[] = [];
            if (pendingCount > 5) {
                keyPoints.push({
                    title: 'Surcharge commandes',
                    impact: 'Critique',
                    time: 'Maintenant',
                    color: 'text-destructive'
                });
            }

            const availabilityRatio = totalDriversCount > 0 ? activeDriversCount / totalDriversCount : 0;
            if (availabilityRatio < 0.2 && totalDriversCount > 0) {
                keyPoints.push({
                    title: 'Pénurie chauffeurs',
                    impact: 'Élevé',
                    time: 'Maintenant',
                    color: 'text-warning'
                });
            }

            if (keyPoints.length === 0) {
                keyPoints.push({
                    title: 'Activité normale',
                    impact: 'Faible',
                    time: 'Maintenant',
                    color: 'text-success'
                });
            }

            const calculateChange = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            const ordersChange = calculateChange(ordersCurrentCount, ordersPrevCount);
            const clientsChange = calculateChange(clientsCurrentCount, clientsPrevCount);
            const revenueChange = calculateChange(revenueCurrentTotal, revenuePrevTotal);

            setStats({
                ordersCount: ordersCurrentCount,
                ordersChange,
                newClientsCount: clientsCurrentCount,
                newClientsChange: clientsChange,
                revenueTotal: revenueCurrentTotal,
                revenueChange,
                activeDrivers: activeDriversCount,
                totalDrivers: totalDriversCount,

                // Mapped aliases
                ordersToday: ordersCurrentCount,
                ordersTodayChange: ordersChange,
                newClientsMonth: clientsCurrentCount, // Now potentially "newClientsDay" etc depending on filter
                newClientsMonthChange: clientsChange,
                revenueToday: revenueCurrentTotal,
                revenueTodayChange: revenueChange,

                ordersByStatus: {
                    pending: pendingCount,
                    in_progress: inProgressCount,
                    delivered: deliveredCount,
                    cancelled: cancelledCount
                },
                teamMembers,
                alerts,
                keyPoints,
                loading: false
            });

        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    }, [filter.period, filter.startDate, filter.endDate]);

    // Debounced refresh
    const debouncedRefresh = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchStats(true);
        }, 1000);
    }, [fetchStats]);

    useEffect(() => {
        fetchStats(false);

        const channel = supabase
            .channel('admin-dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => debouncedRefresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => debouncedRefresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => debouncedRefresh())
            .subscribe();

        const interval = setInterval(() => {
            fetchStats(true);
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

    }, [fetchStats, debouncedRefresh]);

    return stats;
};
