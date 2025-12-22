import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Navigation, Clock, User, Phone, Car, AlertCircle, ArrowRight, Truck, UserCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assignOrderToDriver, unassignOrder } from '@/services/orderAssignment';
import { getMultipleOrderRefusals, OrderRefusalInfo } from '@/services/orderRefusals';

// --- TYPES (Matching DB Schema) ---
interface Order {
    id: string;
    reference: string;
    status: string;
    pickup_address: string;
    delivery_address: string;
    pickup_lat?: number;
    pickup_lng?: number;
    delivery_lat?: number;
    delivery_lng?: number;
    price: number;
    distance_km?: number;
    created_at: string;
    pickup_time?: string;
    assigned_driver_id?: string;
    driver_id?: string;
    updated_at: string;
    refusal_count?: number;
    last_refused_by?: string;
}

interface Driver {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    status: string;
    current_lat?: number;
    current_lng?: number;
    vehicle_type?: string;
    last_location_update?: string;
    is_online?: boolean;
}

// --- UTILS ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
};

const estimateTime = (km: number) => {
    // Supposons une vitesse moyenne de 25km/h en ville
    const speed = 25;
    const hours = km / speed;
    const minutes = Math.round(hours * 60);
    if (minutes < 1) return '< 1 min';
    return `${minutes} min`;
};

export default function Dispatch() {
    // State management
    const [orders, setOrders] = useState<Order[]>([]);

    // Listes séparées pour l'affichage Drag & Drop (simulé ici par colonnes)
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]); // "À Dispatcher" (Acceptée par Admin)
    const [dispatchedOrders, setDispatchedOrders] = useState<Order[]>([]); // "En Attribution" (Envoyée au chauffeur)
    const [driverAcceptedOrders, setDriverAcceptedOrders] = useState<Order[]>([]); // "Acceptée par Chauffeur" (En cours)
    const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]); // "En Livraison"

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

    const [activeDeliveries, setActiveDeliveries] = useState<Record<string, Order>>({});
    const [orderRefusals, setOrderRefusals] = useState<Map<string, OrderRefusalInfo>>(new Map());

    const [loading, setLoading] = useState(true);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // UI State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- REALTIME HANDLER ---
    const handleOrderUpdate = async (payload: any) => {
        const updatedOrder = payload.new as Order;
        const oldOrder = payload.old as Order;

        console.log('[Dispatch Realtime] UPDATE:', {
            id: updatedOrder.id,
            ref: updatedOrder.reference,
            oldStatus: oldOrder?.status,
            newStatus: updatedOrder.status,
            driver: updatedOrder.driver_id
        });

        // Cas 1: Nouvelle commande acceptée par l'admin -> "À Dispatcher"
        if (updatedOrder.status === 'accepted' && oldOrder?.status === 'pending_acceptance') {
            toast.success(`✅ Nouvelle commande à dispatcher : ${updatedOrder.reference}`);
            setAcceptedOrders(prev => [...prev, updatedOrder]);
        }

        // Cas 1.2: Commande assignée (dispatched) qui revient à 'accepted' (probablement désassignée manuellement)
        if (updatedOrder.status === 'accepted' && oldOrder?.status === 'dispatched') {
            setDispatchedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
            toast.info(`Commande ${updatedOrder.reference} désassignée, retour à "À Dispatcher"`);
        }

        // Cas 1.5: Chauffeur ARRIVÉ au point de retrait
        if (updatedOrder.status === 'arrived_pickup') {
            toast.info(
                `📍 CHAUFFEUR ARRIVÉ AU RETRAIT (${updatedOrder.reference})`,
                {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    icon: '📍'
                }
            );

            // Mettre à jour dans la liste des acceptées
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 2: La commande passe en cours (in_progress) - RESTE dans "Acceptées"
        if (updatedOrder.status === 'in_progress') {
            toast.info(
                `🚚 COMMANDE ${updatedOrder.reference} EN COURS DE LIVRAISON`,
                {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    icon: '→'
                }
            );

            // Mettre à jour dans driverAcceptedOrders
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 3: Commande dispatchée (envoyée au chauffeur)
        if (updatedOrder.status === 'dispatched') { // dispatched peut venir de accepted ou driver_refused
            toast(
                `📤 Commande ${updatedOrder.reference} envoyée au chauffeur`,
                {
                    duration: 4000,
                    style: {
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                    }
                }
            );

            // Retirer de accepted et ajouter à assigned/dispatched
            setAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDispatchedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 3.5: Chauffeur ACCEPTE la course - passe dans "Acceptées par chauffeur"
        if (updatedOrder.status === 'driver_accepted') {
            toast.success(
                `✅ Commande ${updatedOrder.reference} ACCEPTÉE par le chauffeur`,
                {
                    duration: 5000,
                    style: {
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    icon: '🚗'
                }
            );

            // Retirer de "En Attribution" et ajouter à "Acceptées"
            setDispatchedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });

            // Mettre à jour le statut du chauffeur à 'busy'
            if (updatedOrder.driver_id) {
                setAvailableDrivers(prev => prev.map(d =>
                    d.id === updatedOrder.driver_id
                        ? { ...d, status: 'busy' as const }
                        : d
                ));
            }
        }

        // Cas 4: Commande livrée/complétée - la retirer de toutes les colonnes
        if (['delivered', 'completed', 'cancelled'].includes(updatedOrder.status)) {
            toast.success(
                `✅ Commande ${updatedOrder.reference} terminée`,
                { duration: 3000 }
            );

            setDispatchedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDriverAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setInProgressOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
        }

        // Cas 5: Chauffeur REFUSE la course - désassignation
        if (updatedOrder.status === 'driver_refused') {
            // Récupérer l'ancien driver_id depuis oldOrder pour mettre à jour son statut
            const previousDriverId = oldOrder?.driver_id;

            toast.warning(
                `⚠️ COURSE ${updatedOrder.reference} REFUSÉE PAR LE CHAUFFEUR, REMISE EN ATTENTE D'ATTRIBUTION.`,
                {
                    duration: 8000,
                    style: {
                        background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
                        color: 'white',
                        border: '2px solid white',
                        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.5)',
                        fontWeight: 'bold',
                    },
                    icon: '🚫'
                }
            );

            // Retirer la commande des colonnes "Acceptées par chauffeur" et "En Cours" et "Acceptées"
            setAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDriverAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setInProgressOrders(prev => prev.filter(o => o.id !== updatedOrder.id));

            // Remettre la commande dans "En Attribution" avec le statut actuel (driver_refused)
            // Cela permet à l'admin de voir clairement que cette course a été refusée et doit être réattribuée
            // Ajouter à la colonne "En Attribution" pour réassignation
            setDispatchedOrders(prev => {
                const filtered = prev.filter(o => o.id !== updatedOrder.id);
                return [...filtered, updatedOrder];
            });

            // Nettoyer les livraisons actives liées à cette commande
            setActiveDeliveries(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (next[key].id === updatedOrder.id) delete next[key];
                });
                return next;
            });

            // ✅ MISE À JOUR OPTIMISTE : Remettre le chauffeur en ligne immédiatement
            if (previousDriverId) {
                setAvailableDrivers(prev => prev.map(d =>
                    d.id === previousDriverId
                        ? { ...d, status: 'online' as const }
                        : d
                ));
            }

            // ✅ RECHARGER L'HISTORIQUE DES REFUS pour cette commande
            try {
                const refusals = await getMultipleOrderRefusals([updatedOrder.id]);
                setOrderRefusals(prev => {
                    const updated = new Map(prev);
                    refusals.forEach((value, key) => updated.set(key, value));
                    return updated;
                });
            } catch (e) { console.error("Error refreshing refusals", e); }
        }
    };

    // --- DATA FETCHING & SUBSCRIPTION ---
    useEffect(() => {
        const fetchInitialData = async () => {
            // 1. Fetch Orders Logic - Initial Load
            await fetchAllOrders();
            // 2. Fetch Drivers Logic - Initial Load
            await fetchDrivers();
            setLoading(false);
        };

        fetchInitialData();

        // ============================================
        // POLLING DE SECOURS POUR LES CHAUFFEURS
        // Toutes les 10 secondes si le WebSocket échoue
        // ============================================
        const driversPollingInterval = setInterval(() => {
            fetchDrivers();
        }, 10000);

        // Polling silencieux pour la mise à jour du temps (déverrouillage commandes différées)
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        // ============================================
        // CANAL REALTIME POUR LES COMMANDES
        // ============================================
        const ordersChannel = supabase
            .channel('dispatch-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: "status=in.(accepted,dispatched,driver_accepted,arrived_pickup,in_progress,driver_refused,delivered,completed,cancelled)"
                },
                handleOrderUpdate
            )
            // Également écouter les INSERT pour les nouvelles commandes acceptées
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    const newOrder = payload.new as Order;
                    if (newOrder.status === 'accepted') {
                        toast(`📥 Nouvelle commande ${newOrder.reference}`, { duration: 4000 });
                        setAcceptedOrders(prev => {
                            const exists = prev.find(o => o.id === newOrder.id);
                            if (exists) return prev;
                            return [...prev, newOrder];
                        });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsRealtimeConnected(true);
                    console.log('[Dispatch] ✅ Realtime connecté - Canal dispatch-orders');
                }
            });

        // ============================================
        // CANAL REALTIME POUR LES CHAUFFEURS
        // ============================================
        const driversChannel = supabase
            .channel('dispatch-drivers')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'drivers' },
                (payload) => {
                    const newDriver = payload.new as Driver;
                    const oldDriver = payload.old as Driver;

                    // ========== CHAUFFEUR PASSE EN LIGNE ==========
                    if ((newDriver.status === 'available' || newDriver.status === 'online') &&
                        oldDriver?.status !== 'available' && oldDriver?.status !== 'online') {
                        setAvailableDrivers(prev => {
                            const exists = prev.find(d => d.id === newDriver.id);
                            if (exists) {
                                return prev.map(d => d.id === newDriver.id
                                    ? { ...d, ...newDriver, status: 'online' }
                                    : d
                                );
                            }
                            return [...prev, { ...newDriver, status: 'online' }];
                        });
                    }
                    // ========== CHAUFFEUR PASSE HORS LIGNE ==========
                    else if (newDriver.status === 'offline' &&
                        (oldDriver?.status === 'available' || oldDriver?.status === 'online')) {
                        setAvailableDrivers(prev => prev.filter(d => d.id !== newDriver.id));
                    }
                    // ========== CHAUFFEUR PASSE OCCUPÉ ==========
                    else if (newDriver.status === 'busy' || newDriver.status === 'on_delivery') {
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver, status: 'busy' } : d
                        ));
                    }
                    // ========== CHAUFFEUR REDEVIENT DISPONIBLE (après course) ==========
                    else if ((newDriver.status === 'available' || newDriver.status === 'online') &&
                        (oldDriver?.status === 'busy' || oldDriver?.status === 'on_delivery')) {
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver, status: 'online' } : d
                        ));
                        toast.success(`✅ ${newDriver.first_name} ${newDriver.last_name} est de nouveau DISPONIBLE`);
                    }
                    // ========== MISE À JOUR GÉNÉRIQUE ==========
                    else {
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver } : d
                        ));
                    }
                }
            )
            .subscribe();

        // CLEANUP
        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(driversChannel);
            clearInterval(timeInterval);
            clearInterval(driversPollingInterval);
        };
    }, []);

    // ============================================
    // FONCTIONS DE RÉCUPÉRATION DES DONNÉES
    // ============================================

    const fetchAllOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['accepted', 'dispatched', 'driver_accepted', 'arrived_pickup', 'in_progress', 'driver_refused'])
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[Dispatch] Error fetching orders:', error);
            return;
        }

        const orders = data || [];
        const accepted: Order[] = [];
        const dispatched: Order[] = [];
        const driverAccepted: Order[] = [];
        const inProgress: Order[] = [];
        const deliveriesMap: Record<string, Order> = {};

        orders.forEach((order: Order) => {
            switch (order.status) {
                case 'accepted': accepted.push(order); break;
                case 'dispatched':
                case 'driver_refused': // Les commandes refusées sont aussi affichées dans "En Attribution"
                    dispatched.push(order);
                    if (order.driver_id) deliveriesMap[order.driver_id] = order;
                    break;
                case 'driver_accepted':
                case 'arrived_pickup':
                case 'in_progress':
                    driverAccepted.push(order);
                    if (order.driver_id) deliveriesMap[order.driver_id] = order;
                    break;
            }
        });

        const sortOrders = (list: Order[]) => {
            return list.sort((a, b) => {
                if (a.pickup_time && b.pickup_time) return new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime();
                if (a.pickup_time) return 1;
                if (b.pickup_time) return -1;
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });
        };

        setAcceptedOrders(sortOrders(accepted));
        setDispatchedOrders(dispatched);
        setDriverAcceptedOrders(driverAccepted);
        setInProgressOrders(inProgress);
        setActiveDeliveries(deliveriesMap);

        const allOrderIds = orders.map(o => o.id);
        if (allOrderIds.length > 0) {
            const refusals = await getMultipleOrderRefusals(allOrderIds);
            setOrderRefusals(refusals);
        }
    };

    const fetchDrivers = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .in('status', ['online', 'available', 'busy', 'on_delivery'])
            .order('first_name', { ascending: true });

        if (error) { console.error('[Dispatch] Error fetching drivers:', error); return; }

        const normalizedDrivers = (data || []).map((d: any) => ({
            ...d,
            status: d.status === 'available' ? 'online' : d.status
        }));

        normalizedDrivers.sort((a: any, b: any) => {
            if (a.status === 'online' && b.status !== 'online') return -1;
            if (a.status !== 'online' && b.status === 'online') return 1;
            return 0;
        });

        setAvailableDrivers(normalizedDrivers);
    };

    const handleAssignDriver = async (orderId: string, driverId: string) => {
        if (!orderId || !driverId) return;

        const driver = availableDrivers.find(d => d.id === driverId);
        if (!driver) { toast.error("Chauffeur introuvable"); return; }

        if (!driver.user_id) {
            toast.error("Erreur critique: Ce chauffeur n'a pas de compte utilisateur lié (user_id manquant).");
            return;
        }

        setIsProcessing(true);
        try {
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            const result = await assignOrderToDriver({
                orderId: orderId,
                driverId: driverId,
                driverUserId: driver.user_id || driverId,
                adminId: adminUser?.id || 'admin'
            });

            if (result.success) {
                toast.success(`✅ Course dispatchée avec succès !`);

                // Optimistic
                setAcceptedOrders(prev => prev.filter(o => o.id !== orderId));
                setDispatchedOrders(prev => {
                    const exists = prev.find(o => o.id === orderId);
                    if (exists) return prev;
                    // fetch one to be sure, but for now push dummy
                    const moved = acceptedOrders.find(o => o.id === orderId);
                    return moved ? [...prev, { ...moved, status: 'dispatched', driver_id: driverId }] : prev;
                });
                setAvailableDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'busy' } : d));

                setIsAssignDialogOpen(false);
                setSelectedOrder(null);
            } else { throw result.error; }
        } catch (err: any) {
            toast.error(`Erreur: ${err.message || 'Impossible d\'attribuer la course'}`);
        } finally { setIsProcessing(false); }
    };

    const handleUnassign = async (driverId: string, orderId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir retirer cette course au chauffeur ?')) return;
        setIsProcessing(true);
        const result = await unassignOrder(orderId, 'Annulation par le dispatch');
        setIsProcessing(false);

        if (result.success) {
            toast.success('Course retirée au chauffeur');
            setAvailableDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'online' } : d));
            fetchAllOrders();
        } else {
            toast.error('Erreur lors du retrait de la course');
        }
    };

    // --- RENDER HELPERS ---
    const formatPickupTime = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getDispatchStatus = (scheduledTime?: string) => {
        if (!scheduledTime) return { allowed: true, message: null };
        const pickupDate = new Date(scheduledTime);
        const unlockDate = new Date(pickupDate.getTime() - 45 * 60000); // -45 minutes
        const now = new Date();

        if (now >= unlockDate) {
            return { allowed: true, message: null };
        } else {
            const diffMs = unlockDate.getTime() - now.getTime();
            const diffMins = Math.ceil(diffMs / 60000);
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            let timeString = "";
            if (hours > 0) timeString += `${hours}h `;
            timeString += `${mins}min`;
            return {
                allowed: false,
                message: `Déblocage dans ${timeString}`,
                unlockTime: unlockDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
        }
    };

    const activeDrivers = availableDrivers.filter(d => d.status === 'busy' || d.status === 'on_delivery');

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dispatch</h1>
                    <p className="text-slate-500">Supervision en temps réel de la flotte</p>
                </div>
                <Badge variant="outline" className="px-4 py-1">
                    {activeDrivers.length} Chauffeurs actifs / {availableDrivers.length} connectés
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-150px)]">

                {/* COLONNE 1 : À DISPATCHER (Commandes Acceptées par Admin) */}
                <Card className="md:col-span-1 shadow-sm border-l-4 border-l-yellow-500 flex flex-col">
                    <CardHeader className="pb-3 bg-yellow-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-yellow-700 flex justify-between">
                            À Dispatcher <Badge variant="secondary">{acceptedOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        {acceptedOrders.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">Aucune commande à dispatcher</div>
                        ) : (
                            acceptedOrders.map((order) => {
                                const pickupTime = formatPickupTime(order.pickup_time);
                                const isDeferred = !!pickupTime;
                                const dispatchStatus = getDispatchStatus(order.pickup_time);
                                // Afficher comme "verrouillé" si différé et pas encore l'heure
                                const isLocked = isDeferred && !dispatchStatus.allowed;

                                return (
                                    <div key={order.id} className={`bg-white p-3 rounded-md border shadow-sm mb-3 ${isLocked ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline">{order.reference}</Badge>
                                            <span className="font-bold">{order.price}€</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {isDeferred && (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 p-1 rounded">
                                                    <Clock className="w-3 h-3" />
                                                    {pickupTime?.date} à {pickupTime?.time}
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{order.pickup_address}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Navigation className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{order.delivery_address}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            {!isLocked ? (
                                                <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                                                    onClick={() => { setSelectedOrder(order); setIsAssignDialogOpen(true); }}>
                                                    Attribuer un chauffeur
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            ) : (
                                                <div className="text-center">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 w-full justify-center py-1">
                                                        <Lock className="w-3 h-3 mr-1" />
                                                        {dispatchStatus.message}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </ScrollArea>
                </Card>

                {/* COLONNE 2 : EN ATTRIBUTION (Assignées mais pas encore acceptées) */}
                <Card className="md:col-span-1 shadow-sm border-l-4 border-l-blue-500 flex flex-col">
                    <CardHeader className="pb-3 bg-blue-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-blue-700 flex justify-between">
                            En Attribution <Badge variant="secondary">{dispatchedOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        <div className="space-y-3 mt-4">
                            {dispatchedOrders.map(order => {
                                const driver = availableDrivers.find(d => d.id === order.driver_id || d.id === order.assigned_driver_id);
                                const isRefused = order.status === 'driver_refused';
                                const refusalCount = orderRefusals.get(order.id)?.refusalCount || 0;

                                return (
                                    <Card key={order.id} className={`p-3 bg-white border ${isRefused ? 'border-red-400 bg-red-50' : 'border-blue-100'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <Badge variant={isRefused ? "destructive" : "secondary"}>{order.reference}</Badge>
                                            {isRefused ? (
                                                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Refusé ({refusalCount})
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs text-blue-600 animate-pulse">
                                                    <Clock className="w-3 h-3" /> Attente réponse...
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm mb-2">
                                            <p className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-slate-500" />
                                                <span className="font-medium text-slate-700">
                                                    {driver ? `${driver.first_name} ${driver.last_name}` : 'Chauffeur inconnu'}
                                                </span>
                                            </p>
                                        </div>
                                        {isRefused && (
                                            <Button size="sm" variant="destructive" className="w-full text-xs h-8"
                                                onClick={() => { setSelectedOrder(order); setIsAssignDialogOpen(true); }}>
                                                Réassigner
                                            </Button>
                                        )}
                                        {!isRefused && order.driver_id && (
                                            <Button size="sm" variant="ghost" className="w-full text-xs h-7 text-slate-400 hover:text-red-500"
                                                onClick={() => handleUnassign(order.driver_id!, order.id)}>
                                                Annuler attribution
                                            </Button>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </Card>

                {/* COLONNE 3 : COURSES ACTIVES (AVEC DISTANCE & ETA) */}
                <Card className="md:col-span-1 shadow-sm border-l-4 border-l-green-500 flex flex-col">
                    <CardHeader className="pb-3 bg-green-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-green-700 flex justify-between">
                            En Cours (Live) <Badge variant="secondary">{driverAcceptedOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        <div className="space-y-4 mt-4">
                            {driverAcceptedOrders.map(order => {
                                const driver = availableDrivers.find(d => d.id === (order.driver_id || order.assigned_driver_id));

                                // Calculs LIVE
                                let distance = 0;
                                let targetLabel = "";
                                let badgeColor = 'bg-teal-500';

                                if (driver && driver.current_lat && driver.current_lng) {
                                    if (order.status === 'driver_accepted' || order.status === 'accepted') {
                                        // Vers retrait
                                        distance = calculateDistance(driver.current_lat, driver.current_lng, order.pickup_lat || 0, order.pickup_lng || 0);
                                        targetLabel = "Vers Retrait";
                                        badgeColor = 'bg-blue-500';
                                    } else if (order.status === 'arrived_pickup') {
                                        // SUR PLACE
                                        distance = 0;
                                        targetLabel = "📍 Est arrivé au retrait";
                                        badgeColor = 'bg-orange-500';
                                    } else if (order.status === 'in_progress') {
                                        // Vers livraison
                                        distance = calculateDistance(driver.current_lat, driver.current_lng, order.delivery_lat || 0, order.delivery_lng || 0);
                                        targetLabel = "Vers Livraison";
                                        badgeColor = 'bg-purple-500';
                                    } else if (order.status === 'completed') {
                                        distance = 0;
                                        targetLabel = "✅ Course Terminée";
                                        badgeColor = 'bg-green-600';
                                    }
                                }

                                return (
                                    <Card key={order.id} className="p-3 border-green-200 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm">{order.reference}</span>
                                            <Badge className={`${badgeColor} text-white hover:${badgeColor}`}>
                                                {order.status === 'in_progress' ? 'En Livraison' : (order.status === 'arrived_pickup' ? 'Sur Place' : (order.status === 'completed' ? 'Livré' : 'En approche'))}
                                            </Badge>
                                        </div>

                                        {/* INFO CHAUFFEUR LIVE */}
                                        <div className="bg-slate-50 p-2 rounded mb-2 border">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Car className="w-4 h-4 text-slate-600" />
                                                <span className="text-sm font-semibold">
                                                    {driver ? `${driver.first_name} ${driver.last_name}` : 'Chauffeur ?'}
                                                </span>
                                            </div>
                                            {driver?.current_lat ? (
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-slate-500">Distance</p>
                                                        <p className="font-mono font-bold text-slate-800">
                                                            {order.status === 'arrived_pickup' ? '0 m' : formatDistance(distance)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">ETA estimé</p>
                                                        <p className="font-mono font-bold text-green-600">
                                                            {order.status === 'arrived_pickup' ? 'Sur place' : estimateTime(distance)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-red-400 italic">Position indisponible</p>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-500 flex justify-between items-center">
                                            <span>{targetLabel}</span>
                                            <span className="text-[10px]">{new Date(order.updated_at).toLocaleTimeString()}</span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </Card>

                {/* COLONNE 4 : CHAUFFEURS DISPONIBLES */}
                <Card className="md:col-span-1 shadow-sm flex flex-col h-full border-l-4 border-l-slate-400">
                    <CardHeader className="pb-3 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-slate-700">
                            Chauffeurs ({availableDrivers.length})
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        <div className="space-y-2 mt-4">
                            {availableDrivers.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-4">Aucun chauffeur connecté</p>
                            ) : (
                                availableDrivers.map(driver => {
                                    const activeOrder = activeDeliveries[driver.user_id || ''] || activeDeliveries[driver.id];
                                    const isBusy = (driver.status === 'busy' || driver.status === 'on_delivery') && !!activeOrder;

                                    return (
                                        <div key={driver.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-all">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${driver.status === 'online' ? 'bg-green-500' : 'bg-orange-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{driver.first_name} {driver.last_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{driver.vehicle_type || 'Véhicule N/A'}</p>
                                            </div>
                                            {isBusy && (
                                                <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-600 bg-orange-50 px-1 py-0 h-5">
                                                    En course
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            </div>

            {/* Modal d'attribution */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Attribuer la course {selectedOrder?.reference}</DialogTitle>
                        <DialogDescription>
                            Sélectionnez un chauffeur disponible pour effectuer cette course.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Chauffeurs disponibles ({availableDrivers.length})</h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {availableDrivers.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8 bg-slate-50 rounded-lg">
                                    Aucun chauffeur connecté.
                                </p>
                            ) : (
                                availableDrivers.map((driver) => {
                                    const activeOrder = activeDeliveries[driver.user_id || ''] || activeDeliveries[driver.id];
                                    // FIX: Un chauffeur n'est "busy" QUE s'il a une course active
                                    const isBusy = (driver.status === 'busy' || driver.status === 'on_delivery') && !!activeOrder;

                                    return (
                                        <div
                                            key={driver.id}
                                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors group ${isBusy ? 'bg-slate-50 opacity-75 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}
                                            onClick={() => !isBusy && selectedOrder && handleAssignDriver(selectedOrder.id, driver.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${isBusy ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700 group-hover:bg-green-200'}`}>
                                                    {driver.first_name[0]}{driver.last_name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm truncate">
                                                            {driver.first_name} {driver.last_name}
                                                        </p>
                                                        {isBusy && (
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-blue-50 text-blue-600 border-blue-200">
                                                                Occupé
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {isBusy && activeOrder
                                                            ? `Course ${activeOrder.reference}`
                                                            : (driver.vehicle_type || 'Véhicule non spécifié')
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {!isBusy ? (
                                                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Choisir
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            ) : (
                                                <div className="px-3" title="Ce chauffeur est déjà en course">
                                                    <Lock className="h-4 w-4 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
