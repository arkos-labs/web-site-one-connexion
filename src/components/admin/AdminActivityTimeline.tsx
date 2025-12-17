import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    UserPlus,
    Truck,
    CheckCircle,
    XCircle,
    FileText,
    Clock,
    AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityEvent {
    id: string;
    type: 'order' | 'client' | 'driver' | 'delivery' | 'cancellation' | 'invoice';
    title: string;
    description: string;
    timestamp: string;
    icon: any;
    color: string;
    bgColor: string;
}

interface AdminActivityTimelineProps {
    limit?: number;
}

export const AdminActivityTimeline = ({ limit = 10 }: AdminActivityTimelineProps) => {
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const events: ActivityEvent[] = [];

                // Execute all queries in parallel
                const [
                    { data: orders },
                    { data: clients },
                    { data: drivers },
                    { data: invoices }
                ] = await Promise.all([
                    supabase.from('orders').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(8),
                    supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5),
                    supabase.from('drivers').select('*').order('created_at', { ascending: false }).limit(3),
                    supabase.from('invoices').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(3)
                ]);

                // 1. Commandes récentes
                if (orders) {
                    orders.forEach((order) => {
                        // Création
                        events.push({
                            id: `order-created-${order.id}`,
                            type: 'order',
                            title: 'Nouvelle commande',
                            description: `${order.reference} - ${order.clients?.company_name || 'Client inconnu'}`,
                            timestamp: order.created_at,
                            icon: Package,
                            color: 'text-accent-main',
                            bgColor: 'bg-accent-light',
                        });

                        // Livraison
                        if (order.status === 'delivered' && order.delivered_at) {
                            events.push({
                                id: `order-delivered-${order.id}`,
                                type: 'delivery',
                                title: 'Commande livrée',
                                description: `${order.reference} - Livraison réussie`,
                                timestamp: order.delivered_at,
                                icon: CheckCircle,
                                color: 'text-success',
                                bgColor: 'bg-success-light',
                            });
                        }

                        // Annulation
                        if (order.status === 'cancelled' && order.cancelled_at) {
                            events.push({
                                id: `order-cancelled-${order.id}`,
                                type: 'cancellation',
                                title: 'Commande annulée',
                                description: `${order.reference} - ${order.cancellation_reason || 'Raison non spécifiée'}`,
                                timestamp: order.cancelled_at,
                                icon: XCircle,
                                color: 'text-destructive',
                                bgColor: 'bg-destructive/10',
                            });
                        }

                        // Dispatch
                        if (order.dispatched_at) {
                            events.push({
                                id: `order-dispatched-${order.id}`,
                                type: 'order',
                                title: 'Commande dispatchée',
                                description: `${order.reference} - Chauffeur assigné`,
                                timestamp: order.dispatched_at,
                                icon: Truck,
                                color: 'text-info',
                                bgColor: 'bg-info/10',
                            });
                        }
                    });
                }

                // 2. Nouveaux clients
                if (clients) {
                    clients.forEach((client) => {
                        events.push({
                            id: `client-${client.id}`,
                            type: 'client',
                            title: 'Nouveau client',
                            description: `${client.company_name} a rejoint la plateforme`,
                            timestamp: client.created_at,
                            icon: UserPlus,
                            color: 'text-primary',
                            bgColor: 'bg-primary/10',
                        });
                    });
                }

                // 3. Nouveaux chauffeurs
                if (drivers) {
                    drivers.forEach((driver) => {
                        events.push({
                            id: `driver-${driver.id}`,
                            type: 'driver',
                            title: 'Nouveau chauffeur',
                            description: `${driver.first_name} ${driver.last_name} a rejoint l'équipe`,
                            timestamp: driver.created_at,
                            icon: Truck,
                            color: 'text-warning',
                            bgColor: 'bg-warning-light',
                        });
                    });
                }

                // 4. Factures récentes
                if (invoices) {
                    invoices.forEach((invoice) => {
                        events.push({
                            id: `invoice-${invoice.id}`,
                            type: 'invoice',
                            title: 'Nouvelle facture',
                            description: `${invoice.reference} - ${invoice.clients?.company_name || 'Client'} - ${invoice.amount_ttc}€`,
                            timestamp: invoice.created_at,
                            icon: FileText,
                            color: 'text-cta',
                            bgColor: 'bg-cta/10',
                        });

                        if (invoice.status === 'paid' && invoice.paid_date) {
                            events.push({
                                id: `invoice-paid-${invoice.id}`,
                                type: 'invoice',
                                title: 'Facture payée',
                                description: `${invoice.reference} - ${invoice.amount_ttc}€ reçu`,
                                timestamp: invoice.paid_date,
                                icon: CheckCircle,
                                color: 'text-success',
                                bgColor: 'bg-success-light',
                            });
                        }
                    });
                }

                // Trier par date et limiter
                const sortedEvents = events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, limit);

                setActivities(sortedEvents);
            } catch (error) {
                console.error('Error fetching admin activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();

        // Rafraîchir toutes les 10 secondes
        const interval = setInterval(fetchActivities, 10000);

        return () => clearInterval(interval);
    }, [limit]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune activité récente</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => (
                <div
                    key={activity.id}
                    className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                >
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-primary text-sm">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {activity.description}
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(activity.timestamp), {
                                    addSuffix: true,
                                    locale: fr,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
