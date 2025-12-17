import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ClientStats {
    ordersThisMonth: number;
    ordersLastMonth: number;
    successRate: number;
    averageDeliveryTime: string;
    totalSpent: number;
    totalSpentLastMonth: number;
    ordersChange: string;
    spentChange: string;
}

export const useClientStats = (clientId: string | undefined) => {
    const [stats, setStats] = useState<ClientStats>({
        ordersThisMonth: 0,
        ordersLastMonth: 0,
        successRate: 0,
        averageDeliveryTime: '-',
        totalSpent: 0,
        totalSpentLastMonth: 0,
        ordersChange: '+0%',
        spentChange: '+0%',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                setLoading(true);

                // Dates pour ce mois et le mois dernier
                const now = new Date();
                const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

                // Commandes de ce mois
                const { data: ordersThisMonth, error: errorThisMonth } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('client_id', clientId)
                    .gte('created_at', firstDayThisMonth.toISOString());

                if (errorThisMonth) throw errorThisMonth;

                // Commandes du mois dernier
                const { data: ordersLastMonth, error: errorLastMonth } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('client_id', clientId)
                    .gte('created_at', firstDayLastMonth.toISOString())
                    .lte('created_at', lastDayLastMonth.toISOString());

                if (errorLastMonth) throw errorLastMonth;

                // Calcul du taux de succès
                const totalOrders = ordersThisMonth?.length || 0;
                const deliveredOrders = ordersThisMonth?.filter(
                    (order) => order.status === 'delivered'
                ).length || 0;
                const successRate = totalOrders > 0
                    ? Math.round((deliveredOrders / totalOrders) * 100)
                    : 0;

                // Calcul du temps moyen de livraison
                const deliveredOrdersWithTime = ordersThisMonth?.filter(
                    (order) => order.status === 'delivered' && order.dispatched_at && order.delivered_at
                ) || [];

                let averageDeliveryTime = '-';
                if (deliveredOrdersWithTime.length > 0) {
                    const totalMinutes = deliveredOrdersWithTime.reduce((acc, order) => {
                        const dispatched = new Date(order.dispatched_at);
                        const delivered = new Date(order.delivered_at);
                        const diffMs = delivered.getTime() - dispatched.getTime();
                        const diffMinutes = Math.floor(diffMs / 60000);
                        return acc + diffMinutes;
                    }, 0);

                    const avgMinutes = Math.floor(totalMinutes / deliveredOrdersWithTime.length);

                    if (avgMinutes < 60) {
                        averageDeliveryTime = `${avgMinutes}min`;
                    } else {
                        const hours = Math.floor(avgMinutes / 60);
                        const minutes = avgMinutes % 60;
                        averageDeliveryTime = `${hours}h${minutes > 0 ? minutes + 'min' : ''}`;
                    }
                }

                // Calcul des dépenses
                const totalSpent = ordersThisMonth?.reduce(
                    (acc, order) => acc + (parseFloat(order.price) || 0),
                    0
                ) || 0;

                const totalSpentLastMonth = ordersLastMonth?.reduce(
                    (acc, order) => acc + (parseFloat(order.price) || 0),
                    0
                ) || 0;

                // Calcul des changements en pourcentage
                const ordersChangePercent = ordersLastMonth && ordersLastMonth.length > 0
                    ? Math.round(((totalOrders - ordersLastMonth.length) / ordersLastMonth.length) * 100)
                    : 0;

                const spentChangePercent = totalSpentLastMonth > 0
                    ? Math.round(((totalSpent - totalSpentLastMonth) / totalSpentLastMonth) * 100)
                    : 0;

                const ordersChange = ordersChangePercent >= 0
                    ? `+${ordersChangePercent}%`
                    : `${ordersChangePercent}%`;

                const spentChange = spentChangePercent >= 0
                    ? `+${spentChangePercent}%`
                    : `${spentChangePercent}%`;

                setStats({
                    ordersThisMonth: totalOrders,
                    ordersLastMonth: ordersLastMonth?.length || 0,
                    successRate,
                    averageDeliveryTime,
                    totalSpent: Math.round(totalSpent * 100) / 100,
                    totalSpentLastMonth: Math.round(totalSpentLastMonth * 100) / 100,
                    ordersChange,
                    spentChange,
                });
            } catch (error) {
                console.error('Error fetching client stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, [clientId]);

    return { stats, loading };
};
