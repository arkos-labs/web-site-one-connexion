import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, MessageSquare, FileText, CheckCircle, XCircle, Truck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityEvent {
    id: string;
    type: 'order' | 'message' | 'invoice' | 'status_change';
    title: string;
    description: string;
    timestamp: string;
    icon: any;
    color: string;
    bgColor: string;
}

interface ActivityTimelineProps {
    clientId: string;
    limit?: number;
}

export const ActivityTimeline = ({ clientId, limit = 10 }: ActivityTimelineProps) => {
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientId) return;

        const fetchActivities = async () => {
            try {
                setLoading(true);
                const events: ActivityEvent[] = [];

                // 1. Récupérer les commandes récentes
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!ordersError && orders) {
                    orders.forEach((order) => {
                        // Événement de création
                        events.push({
                            id: `order-created-${order.id}`,
                            type: 'order',
                            title: 'Nouvelle commande créée',
                            description: `Commande ${order.reference} - ${order.delivery_type}`,
                            timestamp: order.created_at,
                            icon: Package,
                            color: 'text-accent-main',
                            bgColor: 'bg-accent-light',
                        });

                        // Événement de livraison
                        if (order.status === 'delivered' && order.delivered_at) {
                            events.push({
                                id: `order-delivered-${order.id}`,
                                type: 'status_change',
                                title: 'Commande livrée',
                                description: `Commande ${order.reference} livrée avec succès`,
                                timestamp: order.delivered_at,
                                icon: CheckCircle,
                                color: 'text-success',
                                bgColor: 'bg-success-light',
                            });
                        }

                        // Événement d'annulation
                        if (order.status === 'cancelled' && order.cancelled_at) {
                            events.push({
                                id: `order-cancelled-${order.id}`,
                                type: 'status_change',
                                title: 'Commande annulée',
                                description: `Commande ${order.reference} - ${order.cancellation_reason || 'Raison non spécifiée'}`,
                                timestamp: order.cancelled_at,
                                icon: XCircle,
                                color: 'text-destructive',
                                bgColor: 'bg-destructive/10',
                            });
                        }

                        // Événement de dispatch
                        if (order.dispatched_at) {
                            events.push({
                                id: `order-dispatched-${order.id}`,
                                type: 'status_change',
                                title: 'Chauffeur assigné',
                                description: `Commande ${order.reference} prise en charge`,
                                timestamp: order.dispatched_at,
                                icon: Truck,
                                color: 'text-info',
                                bgColor: 'bg-info/10',
                            });
                        }
                    });
                }

                // 2. Récupérer les factures récentes
                const { data: invoices, error: invoicesError } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (!invoicesError && invoices) {
                    invoices.forEach((invoice) => {
                        events.push({
                            id: `invoice-${invoice.id}`,
                            type: 'invoice',
                            title: 'Nouvelle facture',
                            description: `Facture ${invoice.reference} - ${invoice.amount_ttc}€`,
                            timestamp: invoice.created_at,
                            icon: FileText,
                            color: 'text-primary',
                            bgColor: 'bg-primary/10',
                        });

                        // Événement de paiement
                        if (invoice.status === 'paid' && invoice.paid_date) {
                            events.push({
                                id: `invoice-paid-${invoice.id}`,
                                type: 'invoice',
                                title: 'Facture payée',
                                description: `Facture ${invoice.reference} réglée`,
                                timestamp: invoice.paid_date,
                                icon: CheckCircle,
                                color: 'text-success',
                                bgColor: 'bg-success-light',
                            });
                        }
                    });
                }

                // 3. Récupérer les messages récents
                const { data: threads, error: threadsError } = await supabase
                    .from('threads')
                    .select('id')
                    .eq('client_id', clientId);

                if (!threadsError && threads && threads.length > 0) {
                    const threadIds = threads.map(t => t.id);

                    const { data: messages, error: messagesError } = await supabase
                        .from('messages')
                        .select('*')
                        .in('thread_id', threadIds)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (!messagesError && messages) {
                        messages.forEach((message) => {
                            events.push({
                                id: `message-${message.id}`,
                                type: 'message',
                                title: message.is_from_admin ? 'Message reçu' : 'Message envoyé',
                                description: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
                                timestamp: message.created_at,
                                icon: MessageSquare,
                                color: 'text-cta',
                                bgColor: 'bg-cta/10',
                            });
                        });
                    }
                }

                // Trier par date décroissante et limiter
                const sortedEvents = events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, limit);

                setActivities(sortedEvents);
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();

        // Rafraîchir toutes les 30 secondes
        const interval = setInterval(fetchActivities, 30000);

        return () => clearInterval(interval);
    }, [clientId, limit]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <div
                    key={activity.id}
                    className="flex gap-4 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
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
