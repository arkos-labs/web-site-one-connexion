import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    acceptOrderByDriver,
    declineOrder,
    startDelivery,
    completeDelivery,
    getDriverOrders
} from '@/services/driverOrderActions';
import {
    Package,
    MapPin,
    CheckCircle,
    XCircle,
    Play,
    Loader2,
    Clock,
    Navigation
} from 'lucide-react';

interface Order {
    id: string;
    reference: string;
    pickup_address: string;
    delivery_address: string;
    price: number;
    status: string;
    created_at: string;
    pickup_time?: string;
}

export default function DriverDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
    const [driverId, setDriverId] = useState<string | null>(null);

    useEffect(() => {
        fetchDriverInfo();
    }, []);

    useEffect(() => {
        if (driverId) {
            fetchOrders();

            // Realtime subscription pour les courses assignées
            const assignedChannel = supabase
                .channel('driver-orders-assigned')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `driver_id=eq.${driverId}`
                    },
                    (payload) => {
                        console.log('Order change detected:', payload);
                        fetchOrders();
                    }
                )
                .subscribe();

            // Subscription pour détecter quand une course est retirée (driver_id devient null)
            const unassignedChannel = supabase
                .channel('driver-orders-unassigned')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders'
                    },
                    (payload) => {
                        const oldOrder = payload.old as any;
                        const newOrder = payload.new as any;

                        // Si cette commande était assignée à ce chauffeur et ne l'est plus
                        if (oldOrder.driver_id === driverId && newOrder.driver_id === null) {
                            console.log('Order unassigned from driver');
                            toast.info('Une course vous a été retirée');
                            fetchOrders();
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(assignedChannel);
                supabase.removeChannel(unassignedChannel);
            };
        }
    }, [driverId]);

    const fetchDriverInfo = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Récupérer l'ID de la table drivers à partir du user_id (Auth UUID)
                const { data: drivers, error } = await supabase
                    .from('drivers')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1);

                if (error) {
                    console.error('Error fetching driver record:', error);
                    toast.error('Erreur lors du chargement du profil chauffeur');
                    return;
                }

                const driver = drivers?.[0];
                if (driver?.id) {
                    setDriverId(driver.id); // ✅ Utiliser l'ID de la table drivers, pas le user_id
                    console.log('Driver ID loaded:', driver.id);
                } else {
                    console.warn('Profil chauffeur non trouvé pour user_id:', user.id);
                    toast.error('Profil chauffeur non trouvé');
                }
            }
        } catch (error) {
            console.error('Error fetching driver info:', error);
            toast.error('Erreur lors du chargement des informations');
        }
    };

    const fetchOrders = async () => {
        if (!driverId) return;

        try {
            setIsLoading(true);
            const result = await getDriverOrders(driverId);
            if (result.success) {
                setOrders(result.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Erreur lors du chargement des courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        if (!driverId) return;

        try {
            setProcessingOrderId(orderId);
            const result = await acceptOrderByDriver(orderId, driverId);

            if (result.success) {
                toast.success('Course acceptée !');
                fetchOrders();
            } else {
                toast.error('Erreur lors de l\'acceptation');
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            toast.error('Erreur lors de l\'acceptation');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleDeclineOrder = async (orderId: string) => {
        if (!driverId) return;

        if (!confirm('Êtes-vous sûr de vouloir refuser cette course ?')) return;

        try {
            setProcessingOrderId(orderId);
            const result = await declineOrder(orderId, driverId);

            if (result.success) {
                toast.success('Course refusée');
                fetchOrders();
            } else {
                toast.error('Erreur lors du refus');
            }
        } catch (error) {
            console.error('Error declining order:', error);
            toast.error('Erreur lors du refus');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleStartDelivery = async (orderId: string) => {
        if (!driverId) return;

        try {
            setProcessingOrderId(orderId);
            const result = await startDelivery(orderId, driverId);

            if (result.success) {
                toast.success('Livraison démarrée !');
                fetchOrders();
            } else {
                toast.error('Erreur lors du démarrage');
            }
        } catch (error) {
            console.error('Error starting delivery:', error);
            toast.error('Erreur lors du démarrage');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleCompleteDelivery = async (orderId: string) => {
        if (!driverId) return;

        try {
            setProcessingOrderId(orderId);
            const result = await completeDelivery(orderId, driverId);

            if (result.success) {
                toast.success('Livraison terminée !');
                fetchOrders();
            } else {
                toast.error('Erreur lors de la finalisation');
            }
        } catch (error) {
            console.error('Error completing delivery:', error);
            toast.error('Erreur lors de la finalisation');
        } finally {
            setProcessingOrderId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            dispatched: { label: 'Nouvelle', className: 'bg-orange-100 text-orange-700 border-orange-200' },
            driver_accepted: { label: 'Acceptée', className: 'bg-teal-100 text-teal-700 border-teal-200' },
            in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        };

        const variant = variants[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Mes Courses</h1>
                <p className="text-muted-foreground">Gérez vos livraisons en temps réel</p>
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Aucune course en cours</p>
                        <p className="text-sm text-muted-foreground">Vous serez notifié dès qu'une course vous sera assignée</p>
                    </Card>
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{order.reference}</h3>
                                    {order.pickup_time && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(order.pickup_time).toLocaleString('fr-FR')}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(order.status)}
                                    <span className="font-bold text-lg">{order.price}€</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Ramassage</p>
                                        <p className="font-medium text-sm">{order.pickup_address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Livraison</p>
                                        <p className="font-medium text-sm">{order.delivery_address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                {order.status === 'dispatched' && (
                                    <>
                                        <Button
                                            onClick={() => handleDeclineOrder(order.id)}
                                            disabled={processingOrderId === order.id}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Refuser
                                        </Button>
                                        <Button
                                            onClick={() => handleAcceptOrder(order.id)}
                                            disabled={processingOrderId === order.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {processingOrderId === order.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Accepter
                                        </Button>
                                    </>
                                )}

                                {order.status === 'driver_accepted' && (
                                    <Button
                                        onClick={() => handleStartDelivery(order.id)}
                                        disabled={processingOrderId === order.id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {processingOrderId === order.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Play className="h-4 w-4 mr-2" />
                                        )}
                                        Démarrer la livraison
                                    </Button>
                                )}

                                {order.status === 'in_progress' && (
                                    <Button
                                        onClick={() => handleCompleteDelivery(order.id)}
                                        disabled={processingOrderId === order.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        {processingOrderId === order.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Marquer comme livrée
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Open navigation app
                                        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(order.pickup_address)}&destination=${encodeURIComponent(order.delivery_address)}`;
                                        window.open(url, '_blank');
                                    }}
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Itinéraire
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
