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

export interface AdminStats {
    ordersToday: number;
    ordersTodayChange: number;
    newClientsMonth: number;
    newClientsMonthChange: number;
    activeDrivers: number;
    totalDrivers: number;
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

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats>({
        ordersToday: 0,
        ordersTodayChange: 0,
        newClientsMonth: 0,
        newClientsMonthChange: 0,
        activeDrivers: 0,
        totalDrivers: 0,
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

    const fetchStats = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) {
                setStats(prev => ({ ...prev, loading: true }));
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Execute all independent queries in parallel
            const [
                ordersTodayRes,
                ordersYesterdayRes,
                newClientsRes,
                newClientsLastMonthRes,
                activeDriversRes,
                totalDriversRes,
                revenueTodayRes,
                revenueYesterdayRes,
                pendingRes,
                acceptedRes,
                dispatchedRes,
                deliveredRes,
                cancelledRes,
                driversRes,
                delayedOrdersRes,
                newClientsAlertRes
            ] = await Promise.all([
                // 1. Basic Stats
                supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
                supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString()),
                supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth.toISOString()),
                supabase.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfLastMonth.toISOString()).lt('created_at', firstDayOfMonth.toISOString()),
                supabase.from('drivers').select('*', { count: 'exact', head: true }).in('status', ['available', 'busy']),
                supabase.from('drivers').select('*', { count: 'exact', head: true }),

                // 2. Revenue
                supabase.from('orders').select('price').gte('created_at', today.toISOString()).neq('status', 'cancelled'),
                supabase.from('orders').select('price').gte('created_at', yesterday.toISOString()).lt('created_at', today.toISOString()).neq('status', 'cancelled'),

                // 3. Orders by Status
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending_acceptance'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'dispatched'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered').gte('updated_at', today.toISOString()),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled').gte('updated_at', today.toISOString()),

                // 4. Team Members (Base)
                supabase.from('drivers').select('id, first_name, last_name, status').limit(5),

                // 5. Alerts
                supabase.from('orders').select('reference, created_at').eq('status', 'pending_acceptance').lt('created_at', twoHoursAgo).limit(1),
                supabase.from('clients').select('company_name').gte('created_at', twentyFourHoursAgo).limit(1)
            ]);

            // Process Results
            const ordersTodayCount = ordersTodayRes.count || 0;
            const ordersYesterdayCount = ordersYesterdayRes.count || 0;
            const newClientsCount = newClientsRes.count || 0;
            const newClientsLastMonthCount = newClientsLastMonthRes.count || 0;
            const activeDriversCount = activeDriversRes.count || 0;
            const totalDriversCount = totalDriversRes.count || 0;

            const revenueTodayTotal = revenueTodayRes.data?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;
            const revenueYesterdayTotal = revenueYesterdayRes.data?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;

            const pendingCount = pendingRes.count || 0;
            const acceptedCount = acceptedRes.count || 0;
            const dispatchedCount = dispatchedRes.count || 0;
            const inProgressCount = acceptedCount + dispatchedCount;
            const deliveredCount = deliveredRes.count || 0;
            const cancelledCount = cancelledRes.count || 0;

            // Process Team Members (Optimized)
            const drivers = driversRes.data || [];
            const teamMembers: TeamMember[] = [];

            if (drivers.length > 0) {
                const driverIds = drivers.map(d => d.id);
                // Fetch active deliveries for ALL displayed drivers in one query
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

            if (ordersTodayCount >= 10) {
                alerts.push({
                    type: 'success',
                    title: 'Objectif atteint',
                    message: `${ordersTodayCount} commandes aujourd'hui !`,
                    time: 'Aujourd\'hui'
                });
            }

            // Process Key Points
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

            setStats({
                ordersToday: ordersTodayCount,
                ordersTodayChange: calculateChange(ordersTodayCount, ordersYesterdayCount),
                newClientsMonth: newClientsCount,
                newClientsMonthChange: calculateChange(newClientsCount, newClientsLastMonthCount),
                activeDrivers: activeDriversCount,
                totalDrivers: totalDriversCount,
                revenueToday: revenueTodayTotal,
                revenueTodayChange: calculateChange(revenueTodayTotal, revenueYesterdayTotal),
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
    }, []);

    // Debounced refresh function
    const debouncedRefresh = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fetchStats(true);
        }, 1000); // Wait 1s after last event before fetching
    }, [fetchStats]);

    useEffect(() => {
        fetchStats(false); // Initial load

        // Realtime subscription
        const channel = supabase
            .channel('admin-dashboard-stats')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                () => debouncedRefresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'drivers' },
                () => debouncedRefresh()
            )
            .subscribe();

        // Fallback polling (every 5 minutes)
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
