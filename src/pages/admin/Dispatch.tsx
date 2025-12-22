import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { assignOrderToDriver, unassignOrder } from "@/services/orderAssignment";
import { getMultipleOrderRefusals, OrderRefusalInfo } from "@/services/orderRefusals";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Truck,
    User,
    Package,
    ArrowRight,
    Clock,
    CheckCircle,
    Calendar,
    Lock,
    Timer,
    MapPin,
    X,
    AlertCircle,
    Send,
    UserCheck,
    Play
} from "lucide-react";

interface Order {
    id: string;
    reference: string;
    pickup_address: string;
    delivery_address: string;
    price: number;
    distance_km: number;
    status: string;
    created_at: string;
    pickup_time?: string;
    driver_id?: string;
    refusal_count?: number;
    last_refused_by?: string;
}

interface Driver {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    vehicle_type: string;
    current_lat?: number;
    current_lng?: number;
    user_id?: string;
}

// Types pour les colonnes Kanban
type DispatchColumn = 'accepted' | 'assigned' | 'driver_accepted' | 'in_progress';

export default function Dispatch() {
    // État des colonnes Kanban
    const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]); // Commandes validées (prêtes à dispatcher)
    const [dispatchedOrders, setDispatchedOrders] = useState<Order[]>([]); // En cours d'attribution
    const [driverAcceptedOrders, setDriverAcceptedOrders] = useState<Order[]>([]); // Acceptées par chauffeur
    const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]); // En cours de livraison

    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [activeDeliveries, setActiveDeliveries] = useState<Record<string, Order>>({});
    const [orderRefusals, setOrderRefusals] = useState<Map<string, OrderRefusalInfo>>(new Map());

    // ============================================
    // REALTIME - Gestion des mises à jour en temps réel
    // ============================================

    /**
     * Handler pour les événements Realtime de mise à jour des commandes
     * Filtre sur les statuts: assigned, driver_accepted, in_progress
     */
    const handleOrderUpdate = useCallback((payload: any) => {
        const updatedOrder = payload.new as Order;
        const oldOrder = payload.old as Order;

        console.log('[Dispatch Realtime] Order UPDATE received:', {
            orderId: updatedOrder.id,
            reference: updatedOrder.reference,
            oldStatus: oldOrder?.status,
            newStatus: updatedOrder.status
        });

        // === TOAST DE NOTIFICATION SELON LE CHANGEMENT DE STATUT ===

        // Cas 1: Un chauffeur a ACCEPTÉ la commande
        if (updatedOrder.status === 'driver_accepted') {
            toast.success(
                `🚗 COMMANDE ${updatedOrder.reference} ACCEPTÉE PAR LE CHAUFFEUR!`,
                {
                    duration: 6000,
                    style: {
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: 'white',
                        border: '2px solid white',
                        boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5)',
                        fontWeight: 'bold',
                    },
                    icon: '✓'
                }
            );

            // Déplacer la commande de "dispatched" vers "driver_accepted"
            setDispatchedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
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

            // Mettre à jour dans driverAcceptedOrders (ne pas déplacer)
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 2.5: Le chauffeur arrive sur place (arrived_pickup) - RESTE dans "Acceptées"
        if (updatedOrder.status === 'arrived_pickup') {
            // Mettre à jour dans driverAcceptedOrders
            setDriverAcceptedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 3: Commande dispatchée (envoyée au chauffeur)
        if (updatedOrder.status === 'dispatched' && oldOrder?.status === 'accepted') {
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

            // Retirer de accepted et ajouter à assigned
            setAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDispatchedOrders(prev => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        }

        // Cas 3.5: Chauffeur ACCEPTE la course - passe dans "Acceptées"
        if (updatedOrder.status === 'driver_accepted' && oldOrder?.status === 'dispatched') {
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
        }


        // Cas 5: Chauffeur REFUSE la course - désassignation
        if (updatedOrder.status === 'driver_refused' && !updatedOrder.driver_id) {
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

            // Retirer la commande des colonnes "Acceptées par chauffeur" et "En Cours"
            // Ne PAS retirer de dispatchedOrders car on va la remettre dedans
            setAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setDriverAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
            setInProgressOrders(prev => prev.filter(o => o.id !== updatedOrder.id));

            // Remettre la commande dans "En Attribution" avec statut driver_refused
            // Cela permet à l'admin de voir clairement que cette course a été refusée et doit être réattribuée
            const revertedOrder: Order = {
                ...updatedOrder,
                // On garde le statut driver_refused pour l'affichage
                status: 'driver_refused',
                driver_id: undefined
            };

            // Ajouter à la colonne "En Attribution" pour réassignation
            setDispatchedOrders(prev => {
                // D'abord retirer si existe déjà (éviter doublons)
                const filtered = prev.filter(o => o.id !== revertedOrder.id);
                return [...filtered, revertedOrder];
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
            // Cela évite que l'admin doive cliquer sur "Libérer"
            if (previousDriverId) {
                setAvailableDrivers(prev => prev.map(d =>
                    d.id === previousDriverId
                        ? { ...d, status: 'online' as const }
                        : d
                ));
            }

            // ✅ RECHARGER L'HISTORIQUE DES REFUS pour cette commande
            // Cela permet d'afficher immédiatement le compteur de refus
            (async () => {
                try {
                    const refusals = await getMultipleOrderRefusals([updatedOrder.id]);
                    setOrderRefusals(prev => {
                        const updated = new Map(prev);
                        refusals.forEach((value, key) => updated.set(key, value));
                        return updated;
                    });
                    console.log('✅ Historique des refus rechargé pour', updatedOrder.reference);
                } catch (error) {
                    console.error('Erreur rechargement refus:', error);
                }
            })();

            console.log('[Dispatch Realtime] Course refusée et remise en attente d\'attribution:', {
                orderId: updatedOrder.id,
                reference: updatedOrder.reference,
                previousDriverId,
                newLocalStatus: 'driver_refused',
                targetColumn: 'En Attribution'
            });
        }

        // Mise à jour des livraisons actives pour l'affichage des chauffeurs
        if (['assigned', 'driver_accepted', 'in_progress'].includes(updatedOrder.status)) {
            if (updatedOrder.driver_id) {
                setActiveDeliveries(prev => ({
                    ...prev,
                    [updatedOrder.driver_id!]: updatedOrder
                }));
            }
        }
    }, []);

    // ============================================
    // EFFET PRINCIPAL - Initialisation et abonnements
    // ============================================

    useEffect(() => {
        fetchAllOrders();
        fetchDrivers();

        // ============================================
        // POLLING DE SECOURS POUR LES CHAUFFEURS
        // Toutes les 10 secondes si le WebSocket échoue
        // ============================================
        const driversPollingInterval = setInterval(() => {
            fetchDrivers();
        }, 10000); // 10 secondes = équilibre fiabilité/performance

        // Polling silencieux pour la mise à jour du temps (déverrouillage commandes différées)
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // Toutes les 30 secondes suffit pour le timer

        // ============================================
        // CANAL REALTIME POUR LES COMMANDES
        // Filtre sur les statuts critiques du dispatch
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
                        setAcceptedOrders(prev => [...prev, newOrder]);
                    }
                }
            )
            // Écouter aussi les updates qui reviennent à 'accepted' (unassign ou refus)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: "status=eq.accepted"
                },
                (payload) => {
                    const updatedOrder = payload.new as Order;
                    const oldOrder = payload.old as Order;

                    console.log('[Dispatch Realtime] Order revient à ACCEPTED:', {
                        orderId: updatedOrder.id,
                        reference: updatedOrder.reference,
                        oldStatus: oldOrder?.status,
                        newStatus: updatedOrder.status,
                        oldDriverId: oldOrder?.driver_id,
                        newDriverId: updatedOrder.driver_id
                    });

                    // Une commande revient à 'accepted' (unassign ou refus chauffeur)
                    // Condition: soit le statut change, soit le driver_id devient null
                    if ((oldOrder?.status !== 'accepted' && updatedOrder.status === 'accepted') ||
                        (oldOrder?.driver_id && !updatedOrder.driver_id && updatedOrder.status === 'accepted')) {

                        const wasRefused = oldOrder?.driver_id && !updatedOrder.driver_id;
                        const message = wasRefused
                            ? `🚫 Commande ${updatedOrder.reference} REFUSÉE par le chauffeur`
                            : `↩️ Commande ${updatedOrder.reference} retournée au dispatch`;

                        toast.warning(message, { duration: 5000 });

                        // La retirer des autres colonnes
                        setDispatchedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
                        setDriverAcceptedOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
                        setInProgressOrders(prev => prev.filter(o => o.id !== updatedOrder.id));

                        // L'ajouter à accepted
                        setAcceptedOrders(prev => {
                            const exists = prev.find(o => o.id === updatedOrder.id);
                            if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                            return [...prev, updatedOrder];
                        });

                        console.log(`✅ [Dispatch] Commande ${updatedOrder.reference} replacée dans "À Dispatcher"`);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Dispatch] Realtime subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    setIsRealtimeConnected(true);
                    console.log('[Dispatch] ✅ Realtime connecté - Canal dispatch-orders');
                }
            });

        // ============================================
        // CANAL REALTIME POUR LES CHAUFFEURS
        // Notifications en temps réel quand un chauffeur se connecte/déconnecte
        // ============================================
        const driversChannel = supabase
            .channel('dispatch-drivers')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'drivers' },
                (payload) => {
                    const newDriver = payload.new as Driver;
                    const oldDriver = payload.old as Driver;

                    console.log('[Dispatch Realtime] Driver UPDATE:', {
                        driverId: newDriver.id,
                        name: `${newDriver.first_name} ${newDriver.last_name}`,
                        oldStatus: oldDriver?.status,
                        newStatus: newDriver.status
                    });

                    // ========== CHAUFFEUR PASSE EN LIGNE ==========
                    if ((newDriver.status === 'available' || newDriver.status === 'online') &&
                        oldDriver?.status !== 'available' && oldDriver?.status !== 'online') {

                        // Toast supprimé pour éviter le spam
                        // toast.success(...) 

                        // Ajouter ou mettre à jour dans la liste
                        setAvailableDrivers(prev => {
                            const exists = prev.find(d => d.id === newDriver.id);
                            if (exists) {
                                return prev.map(d => d.id === newDriver.id
                                    ? { ...d, ...newDriver, status: 'online' }
                                    : d
                                );
                            }
                            // Nouveau chauffeur - l'ajouter avec statut normalisé
                            return [...prev, { ...newDriver, status: 'online' }];
                        });
                    }
                    // ========== CHAUFFEUR PASSE HORS LIGNE ==========
                    else if (newDriver.status === 'offline' &&
                        (oldDriver?.status === 'available' || oldDriver?.status === 'online')) {

                        // Toast supprimé pour éviter le spam
                        // toast(...)

                        // Retirer de la liste
                        setAvailableDrivers(prev => prev.filter(d => d.id !== newDriver.id));
                    }
                    // ========== CHAUFFEUR PASSE OCCUPÉ ==========
                    else if (newDriver.status === 'busy' || newDriver.status === 'on_delivery') {

                        // Toast discret - chauffeur occupé
                        if (oldDriver?.status === 'available' || oldDriver?.status === 'online') {
                            toast(
                                `🟡 ${newDriver.first_name} ${newDriver.last_name} est maintenant OCCUPÉ`,
                                {
                                    duration: 3000,
                                    style: {
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                    }
                                }
                            );
                        }

                        // Mettre à jour le statut
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver, status: 'busy' } : d
                        ));
                    }
                    // ========== CHAUFFEUR REDEVIENT DISPONIBLE (après course) ==========
                    else if ((newDriver.status === 'available' || newDriver.status === 'online') &&
                        (oldDriver?.status === 'busy' || oldDriver?.status === 'on_delivery')) {

                        // Toast - chauffeur de retour disponible
                        toast.success(
                            `✅ ${newDriver.first_name} ${newDriver.last_name} est de nouveau DISPONIBLE`,
                            {
                                duration: 4000,
                                style: {
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: 'white',
                                }
                            }
                        );

                        // Mettre à jour le statut
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver, status: 'online' } : d
                        ));
                    }
                    // ========== MISE À JOUR GÉNÉRIQUE (position GPS, etc.) ==========
                    else {
                        // Mettre à jour silencieusement les données du chauffeur
                        setAvailableDrivers(prev => prev.map(d =>
                            d.id === newDriver.id ? { ...d, ...newDriver } : d
                        ));
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Dispatch] Drivers Realtime status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('[Dispatch] ✅ Realtime chauffeurs connecté');
                }
            });

        // ============================================
        // CLEANUP - Désouscription lors du démontage
        // ============================================
        return () => {
            console.log('[Dispatch] 🔌 Déconnexion des canaux Realtime');
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(driversChannel);
            clearInterval(timeInterval);
            clearInterval(driversPollingInterval);
        };
    }, [handleOrderUpdate]);

    // ============================================
    // FONCTIONS DE RÉCUPÉRATION DES DONNÉES
    // ============================================

    /**
     * Récupère toutes les commandes et les distribue dans les colonnes appropriées
     */
    const fetchAllOrders = async () => {
        // Récupérer toutes les commandes pertinentes pour le dispatch
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

        // Distribuer les commandes dans les colonnes appropriées
        const accepted: Order[] = [];
        const dispatched: Order[] = [];
        const driverAccepted: Order[] = [];
        const inProgress: Order[] = [];
        const deliveriesMap: Record<string, Order> = {};

        orders.forEach((order: Order) => {
            switch (order.status) {
                case 'accepted':
                    accepted.push(order);
                    break;
                case 'dispatched':
                    dispatched.push(order);
                    if (order.driver_id) deliveriesMap[order.driver_id] = order;
                    break;
                case 'driver_refused':
                    // Les commandes refusées vont aussi dans la colonne "En Attribution"
                    // mais avec un indicateur visuel (géré au rendu)
                    dispatched.push(order);
                    break;
                    break;
                case 'driver_accepted':
                case 'arrived_pickup': // Chauffeur arrivé au point de retrait
                case 'in_progress': // Colis récupéré, en route vers livraison
                    driverAccepted.push(order);
                    if (order.driver_id) deliveriesMap[order.driver_id] = order;
                    break;
            }
        });

        // Trier les commandes acceptées par heure de pickup prévue
        accepted.sort((a, b) => {
            if (a.pickup_time && b.pickup_time) {
                return new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime();
            }
            if (a.pickup_time) return 1;
            if (b.pickup_time) return -1;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        setAcceptedOrders(accepted);
        setDispatchedOrders(dispatched);
        setDriverAcceptedOrders(driverAccepted);
        setInProgressOrders(inProgress);
        setActiveDeliveries(deliveriesMap);

        // Charger l'historique des refus pour toutes les commandes
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
            .in('status', ['online', 'available', 'busy', 'on_delivery']) // STRICT FILTER: No 'offline' drivers
            .order('first_name', { ascending: true });

        if (error) {
            console.error('[Dispatch] Error fetching drivers:', error);
            return;
        }

        // Normaliser et trier les chauffeurs
        const normalizedDrivers = (data || []).map((d: any) => ({
            ...d,
            status: d.status === 'available' ? 'online' : d.status
        }));

        // Tri: En ligne d'abord, puis Occupé
        normalizedDrivers.sort((a: any, b: any) => {
            if (a.status === 'online' && b.status !== 'online') return -1;
            if (a.status !== 'online' && b.status === 'online') return 1;
            return 0;
        });

        setAvailableDrivers(normalizedDrivers);
    };

    const handleForceAvailable = async (driverId: string) => {
        if (!confirm("Ce chauffeur semble bloqué en statut 'Occupé' sans course active. Voulez-vous forcer son statut à 'Disponible' ?")) return;

        const { error } = await supabase
            .from('drivers')
            .update({ status: 'online', updated_at: new Date().toISOString() })
            .eq('id', driverId);

        if (error) {
            console.error('Error forcing availability:', error);
            toast.error("Impossible de libérer le chauffeur");
        } else {
            toast.success("Statut du chauffeur corrigé");
            // Optimistic update
            setAvailableDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'online' } : d));
        }
    };

    // Remplacement pour la fonction d'assignation
    const handleAssignDriver = async (orderId: string, driverId: string) => {
        if (!orderId || !driverId) return;

        const driver = availableDrivers.find(d => d.id === driverId);
        if (!driver) {
            toast.error("Chauffeur introuvable");
            return;
        }

        if (!driver.user_id) {
            console.error("❌ [Dispatch] Driver missing user_id:", driver);
            toast.error("Erreur critique: Ce chauffeur n'a pas de compte utilisateur lié (user_id manquant). Impossible d'assigner.");
            return;
        }

        setIsProcessing(true);
        try {
            console.log(`📡 [Dispatch] Attribution de la commande ${orderId} au chauffeur ${driver.first_name}...`);

            // Obtenir l'ID de l'admin actuel (si possible, sinon fallback)
            const { data: { user: adminUser } } = await supabase.auth.getUser();

            console.log(`🔍 [Dispatch] Driver ID Details:`, {
                driver_PK: driver.id,
                driver_AuthID: driver.user_id,
                willUpdateWith: driver.user_id || driver.id
            });

            // Utiliser le service d'assignation qui gère tout (Statut commande, Statut chauffeur, Notifications, Événements)
            const result = await assignOrderToDriver({
                orderId: orderId,
                driverId: driverId,           // ID table drivers (UUID)
                driverUserId: driver.user_id || driverId, // Auth ID (user_id)
                adminId: adminUser?.id || 'admin'
            });

            if (result.success) {
                toast.success(`✅ Course ${selectedOrder?.reference || ''} dispatchée avec succès !`);

                // Mises à jour optimistes de l'UI
                setAcceptedOrders(prev => prev.filter(o => o.id !== orderId));
                setDispatchedOrders(prev => {
                    const exists = prev.find(o => o.id === orderId);
                    if (exists) return prev;
                    const orderToMove = acceptedOrders.find(o => o.id === orderId) || { ...selectedOrder, status: 'assigned' };
                    return [...prev, orderToMove as Order];
                });

                // Mettre le chauffeur en busy localement
                setAvailableDrivers(prev => prev.map(d =>
                    d.id === driverId ? { ...d, status: 'busy' } : d
                ));

                setIsAssignDialogOpen(false);
                setSelectedOrder(null);
            } else {
                throw result.error;
            }
        } catch (err: any) {
            console.error("❌ [Dispatch] Erreur lors de l'attribution:", err);
            toast.error(`Erreur: ${err.message || 'Impossible d\'attribuer la course'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnassign = async (driverId: string, orderId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir retirer cette course au chauffeur ?')) return;

        setIsProcessing(true);
        const result = await unassignOrder(orderId, 'Annulation par le dispatch');
        setIsProcessing(false);

        if (result.success) {
            toast.success('Course retirée au chauffeur');

            // Optimistic Update
            // 1. Remettre le chauffeur en ligne
            setAvailableDrivers(prev => prev.map(d =>
                d.id === driverId ? { ...d, status: 'online' } : d
            ));

            // 2. Retirer la course de la map des livraisons actives
            setActiveDeliveries(prev => {
                const next = { ...prev };
                // On essaie de nettoyer toutes les clés possibles liée à ce driver
                Object.keys(next).forEach(key => {
                    if (next[key].id === orderId) delete next[key];
                });
                return next;
            });

            // 3. Remettre la commande dans la liste des acceptées (si on a l'objet complet sous la main, sinon fetchOrders le fera)
            // On fait un fetch pour être sûr d'avoir les données à jour
            fetchAllOrders();
        } else {
            toast.error('Erreur lors du retrait de la course');
        }
    };

    const formatPickupTime = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Logic to check if dispatch is allowed (45 mins before pickup)
    const getDispatchStatus = (scheduledTime?: string) => {
        if (!scheduledTime) return { allowed: true, message: null }; // Immediate order

        const pickupDate = new Date(scheduledTime);
        const unlockDate = new Date(pickupDate.getTime() - 45 * 60000); // -45 minutes
        const now = new Date();

        if (now >= unlockDate) {
            return { allowed: true, message: null };
        } else {
            // Calculate remaining time
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

    return (
        <div className="container mx-auto p-6 max-w-[1800px] h-[calc(100vh-4rem)] flex flex-col">
            {/* Header avec compteurs */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Dispatch</h1>
                    <p className="text-muted-foreground">Tableau de bord de répartition des commandes en temps réel</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Indicateur temps réel */}
                    {isRealtimeConnected && (
                        <Badge variant="outline" className="text-sm py-1 px-3 border-green-200 bg-green-50 text-green-700 animate-pulse">
                            🟢 LIVE - Temps réel actif
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-sm py-1 px-3 border-blue-200 bg-blue-50 text-blue-700">
                        <Package className="h-3 w-3 mr-1" />
                        {acceptedOrders.length} à dispatcher
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 border-amber-200 bg-amber-50 text-amber-700">
                        <Send className="h-3 w-3 mr-1" />
                        {dispatchedOrders.length} en attente
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 border-teal-200 bg-teal-50 text-teal-700">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {driverAcceptedOrders.length} acceptées
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 border-indigo-200 bg-indigo-50 text-indigo-700">
                        <Play className="h-3 w-3 mr-1" />
                        {inProgressOrders.length} en cours
                    </Badge>
                    <Badge variant="secondary" className="text-sm py-1 px-3 bg-green-100 text-green-800">
                        <Truck className="h-3 w-3 mr-1" />
                        {availableDrivers.filter(d => d.status === 'online').length} chauffeurs dispo
                    </Badge>
                </div>
            </div>

            {/* Grille Kanban - 4 colonnes sur grand écran */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 overflow-hidden">

                {/* ============================================ */}
                {/* COLONNE 1: Commandes Validées (À dispatcher) */}
                {/* ============================================ */}
                <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-blue-500 shadow-md">
                    <div className="p-3 border-b bg-blue-50/50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            À Dispatcher
                            <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">{acceptedOrders.length}</Badge>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                        {acceptedOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Tout est assigné !</p>
                                <p className="text-xs">Aucune commande en attente.</p>
                            </div>
                        ) : (
                            acceptedOrders.map((order) => {
                                const pickupTime = formatPickupTime(order.pickup_time);
                                const isDeferred = !!pickupTime;
                                const dispatchStatus = getDispatchStatus(order.pickup_time);

                                return (
                                    <div
                                        key={order.id}
                                        className={`border rounded-lg p-3 hover:shadow-md transition-all bg-white group relative overflow-hidden ${isDeferred ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-blue-400'}`}
                                    >
                                        {/* Badge Type */}
                                        <div className="absolute top-0 right-0">
                                            {isDeferred ? (
                                                <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-md flex items-center gap-1">
                                                    <Calendar className="h-2.5 w-2.5" />
                                                    DIFFÉRÉ
                                                </div>
                                            ) : (
                                                <div className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-md flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    IMMÉDIAT
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-2 pr-14">
                                            <h3 className="font-bold text-sm text-slate-800">{order.reference}</h3>
                                            {isDeferred && (
                                                <div className="mt-1 flex items-center gap-1 text-orange-600 text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    {pickupTime?.date} à {pickupTime?.time}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-3 text-xs">
                                            <div className="flex items-start gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 mt-1 shrink-0" />
                                                <span className="text-slate-600 truncate">{order.pickup_address}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
                                                <span className="text-slate-600 truncate">{order.delivery_address}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <Badge className="bg-slate-100 text-slate-700 text-xs px-2">{order.price} €</Badge>
                                            {dispatchStatus.allowed ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsAssignDialogOpen(true);
                                                    }}
                                                    className="h-7 text-xs bg-slate-900 hover:bg-slate-700"
                                                >
                                                    Attribuer
                                                    <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                                    <Timer className="h-3 w-3" />
                                                    {dispatchStatus.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* ============================================ */}
                {/* COLONNE 2: En cours d'attribution (Dispatched) */}
                {/* ============================================ */}
                <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-amber-500 shadow-md">
                    <div className="p-3 border-b bg-amber-50/50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2 text-sm">
                            <Send className="h-4 w-4 text-amber-600" />
                            En Attribution
                            <Badge className="ml-1 bg-amber-100 text-amber-700 text-xs">{dispatchedOrders.length}</Badge>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-amber-50/30">
                        {dispatchedOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Send className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucune attribution en attente</p>
                                <p className="text-xs">Les chauffeurs recevront les courses ici.</p>
                            </div>
                        ) : (
                            dispatchedOrders.map((order) => {
                                // Détecter si c'est une commande refusée
                                const isRefused = order.status === 'driver_refused' || order.status === 'pending_acceptance';

                                return (
                                    <div
                                        key={order.id}
                                        className={`border rounded-lg p-3 bg-white hover:shadow-md transition-all ${isRefused
                                            ? 'border-l-4 border-l-red-500 ring-2 ring-red-200'
                                            : 'border-l-4 border-l-amber-400 animate-pulse-slow'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-sm text-slate-800">{order.reference}</h3>
                                            {isRefused ? (
                                                <Badge className="bg-red-100 text-red-700 text-xs font-bold">
                                                    🚫 REFUSÉE
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 text-xs animate-pulse">
                                                    ⏳ En attente
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-600 space-y-1">
                                            <div className="flex items-start gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 mt-1 shrink-0" />
                                                <span className="truncate">{order.pickup_address}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-red-500" />
                                                <span className="truncate">{order.delivery_address}</span>
                                            </div>
                                        </div>

                                        {/* Historique des refus - utilise les champs de la commande */}
                                        {isRefused && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                                    <span className="text-red-700 font-semibold">
                                                        Refusée {order.refusal_count || 1} fois
                                                    </span>
                                                </div>
                                                {order.last_refused_by && (
                                                    <div className="mt-1 text-red-600 text-xs">
                                                        Dernier refus: <span className="font-medium">{order.last_refused_by}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                            <Badge className="bg-slate-100 text-slate-700 text-xs">{order.price} €</Badge>
                                            <div className="flex gap-2">
                                                {isRefused ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsAssignDialogOpen(true);
                                                        }}
                                                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Réattribuer
                                                        <ArrowRight className="h-3 w-3 ml-1" />
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <span className="text-xs text-amber-600 font-medium mr-1 my-auto">Chauffeur notifié...</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUnassign(order.driver_id!, order.id)}
                                                            className="h-7 text-[10px] text-red-500 border-red-200 hover:bg-red-50"
                                                        >
                                                            Annuler
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* ============================================ */}
                {/* COLONNE 3: Acceptées par les Chauffeurs */}
                {/* ============================================ */}
                <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-teal-500 shadow-md">
                    <div className="p-3 border-b bg-teal-50/50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2 text-sm">
                            <UserCheck className="h-4 w-4 text-teal-600" />
                            Acceptées
                            <Badge className="ml-1 bg-teal-100 text-teal-700 text-xs">{driverAcceptedOrders.length}</Badge>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-teal-50/30">
                        {driverAcceptedOrders.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucune acceptation</p>
                                <p className="text-xs">Les courses acceptées apparaîtront ici.</p>
                            </div>
                        ) : (
                            driverAcceptedOrders.map((order) => {
                                // Trouver le chauffeur assigné
                                const assignedDriver = availableDrivers.find(d => d.id === order.driver_id || d.user_id === order.driver_id);

                                return (
                                    <div
                                        key={order.id}
                                        className="border rounded-lg p-3 bg-white border-l-4 border-l-teal-400 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-sm text-slate-800">{order.reference}</h3>
                                            <Badge className={`text-xs ${order.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-700'
                                                : order.status === 'arrived_pickup'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-teal-100 text-teal-700'
                                                }`}>
                                                {order.status === 'in_progress'
                                                    ? '🚚 En Route'
                                                    : order.status === 'arrived_pickup'
                                                        ? '📍 Sur Place'
                                                        : '✓ Acceptée'}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-600 space-y-1">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-red-500" />
                                                <span className="truncate">{order.delivery_address}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                            <Badge className="bg-slate-100 text-slate-700 text-xs">{order.price} €</Badge>
                                            {assignedDriver ? (
                                                <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    {assignedDriver.first_name} {assignedDriver.last_name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    Chauffeur N/A
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* ============================================ */}
                {/* COLONNE 4: Chauffeurs disponibles */}
                {/* ============================================ */}
                <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-green-500 shadow-md">
                    <div className="p-3 border-b bg-green-50/50 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-green-600" />
                            Chauffeurs
                            <Badge className="ml-1 bg-green-100 text-green-700 text-xs">{availableDrivers.length}</Badge>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                        {availableDrivers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-medium">Aucun chauffeur actif</p>
                                <p className="text-xs">En attente de connexion...</p>
                            </div>
                        ) : (
                            availableDrivers.map((driver) => {
                                const activeOrder = activeDeliveries[driver.user_id || ''] || activeDeliveries[driver.id];
                                // ✅ FIX: Un chauffeur n'est "busy" QUE s'il a une course active
                                // Cela évite le bouton "Libérer" après un refus de course
                                const isBusy = (driver.status === 'busy' || driver.status === 'on_delivery') && !!activeOrder;
                                const isAccepted = activeOrder && activeOrder.status === 'driver_accepted';
                                const isInProgress = activeOrder && activeOrder.status === 'in_progress';

                                return (
                                    <div
                                        key={driver.id}
                                        className={`border rounded-lg p-3 transition-all ${isInProgress
                                            ? 'bg-indigo-50/50 border-indigo-200'
                                            : isAccepted
                                                ? 'bg-teal-50/50 border-teal-200'
                                                : isBusy
                                                    ? 'bg-amber-50/50 border-amber-200'
                                                    : 'bg-white hover:shadow-md border-green-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${isInProgress
                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                                                    : isAccepted
                                                        ? 'bg-teal-100 text-teal-700 border-teal-300'
                                                        : isBusy
                                                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                                                            : 'bg-green-100 text-green-700 border-green-300'
                                                    }`}>
                                                    {driver.first_name[0]}{driver.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-slate-800">{driver.first_name} {driver.last_name}</p>
                                                    <p className="text-xs text-slate-500">{driver.vehicle_type || 'Véhicule N/A'}</p>
                                                </div>
                                            </div>
                                            <Badge className={`text-[10px] px-2 ${isInProgress
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : isAccepted
                                                    ? 'bg-teal-100 text-teal-700'
                                                    : isBusy
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {isInProgress ? '🚚 En route' : isAccepted ? '✓ Prêt' : isBusy ? '⏳ En attente' : '🟢 Dispo'}
                                            </Badge>
                                        </div>

                                        {/* Afficher la course active */}
                                        {isBusy && activeOrder && (
                                            <div className={`mt-2 p-2 rounded text-xs border ${isInProgress
                                                ? 'bg-indigo-50 border-indigo-200'
                                                : isAccepted
                                                    ? 'bg-teal-50 border-teal-200'
                                                    : 'bg-white border-amber-200'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">{activeOrder.reference}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 hover:bg-red-100 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnassign(driver.id, activeOrder.id);
                                                        }}
                                                        title="Retirer la course"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="mt-1 text-slate-500 truncate">
                                                    → {activeOrder.delivery_address}
                                                </div>
                                            </div>
                                        )}

                                        {/* Alerte si bloqué */}
                                        {isBusy && !activeOrder && (
                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200 text-xs flex items-center justify-between">
                                                <span className="text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Statut bloqué
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-5 text-[10px] px-2 border-red-200 text-red-600 hover:bg-red-100"
                                                    onClick={() => handleForceAvailable(driver.id)}
                                                >
                                                    Libérer
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
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
                                    // ✅ FIX: Un chauffeur n'est "busy" QUE s'il a une course active
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

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                            Annuler
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
