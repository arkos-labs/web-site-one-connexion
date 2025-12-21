import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
// import { Order, DriverStatus, OrderDriver } from '@/types'; // We define local types to match DB
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Navigation, Clock, User, Phone, Car } from "lucide-react";
import { toast } from "sonner";

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
    assigned_driver_id?: string;
    driver_id?: string;
    created_at: string;
    updated_at: string;
}

interface Driver {
    id: string;
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING & SUBSCRIPTION ---
    useEffect(() => {
        const fetchData = async () => {
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            const { data: driversData } = await supabase
                .from('drivers')
                .select('*')
                // .eq('status', 'online') // fetch all initially
                .order('updated_at', { ascending: false });

            if (ordersData) setOrders(ordersData as Order[]);
            if (driversData) setDrivers(driversData as Driver[]);
            setLoading(false);
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('dispatch_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new as Order, ...prev]);
                    toast.info("Nouvelle commande reçue !");
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    setDrivers(prev => {
                        const exists = prev.find(d => d.id === payload.new.id);
                        if (!exists) return [...prev, payload.new as Driver];
                        return prev.map(d => d.id === payload.new.id ? payload.new as Driver : d);
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Filter Drivers for Display (e.g. only online or busy)
    const activeDrivers = drivers.filter(d => d.is_online || d.status === 'busy');

    // --- DERIVED STATE ---
    const pendingOrders = orders.filter(o => o.status === 'pending_acceptance');
    const assignedOrders = orders.filter(o => o.status === 'assigned');
    const acceptedOrders = orders.filter(o => ['accepted', 'driver_accepted', 'in_progress'].includes(o.status));

    const getDriverActiveOrder = (driverId: string) => {
        return acceptedOrders.find(o => o.assigned_driver_id === driverId || o.driver_id === driverId);
    };

    const handleAssign = async (orderId: string, driverId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({
                status: 'assigned',
                assigned_driver_id: driverId,
                dispatched_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) toast.error("Erreur lors de l'attribution");
        else toast.success("Course attribuée au chauffeur");
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dispatch</h1>
                    <p className="text-slate-500">Supervision en temps réel de la flotte</p>
                </div>
                <Badge variant="outline" className="px-4 py-1">
                    {activeDrivers.length} Chauffeurs actifs
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-150px)]">
                
                {/* COLONNE 1 : À DISPATCHER */}
                <Card className="md:col-span-1 shadow-sm border-l-4 border-l-yellow-500 flex flex-col">
                    <CardHeader className="pb-3 bg-yellow-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-yellow-700 flex justify-between">
                            À Dispatcher <Badge variant="secondary">{pendingOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        {pendingOrders.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">Aucune commande en attente</div>
                        ) : (
                            <div className="space-y-3 mt-4">
                                {pendingOrders.map(order => (
                                    <Card key={order.id} className="p-3 border-yellow-200 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline">{order.reference}</Badge>
                                            <span className="font-bold">{order.price}€</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
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
                                            <p className="text-xs font-semibold mb-2 text-slate-500">Assigner à :</p>
                                            <div className="space-y-1">
                                                {activeDrivers.map(driver => (
                                                    <button
                                                        key={driver.id}
                                                        onClick={() => handleAssign(order.id, driver.id)}
                                                        className="w-full text-left text-xs p-2 hover:bg-slate-100 rounded flex items-center justify-between group"
                                                    >
                                                        <span className="font-medium">{driver.first_name} {driver.last_name}</span>
                                                        <Badge className="opacity-0 group-hover:opacity-100 transition-opacity">Choisir</Badge>
                                                    </button>
                                                ))}
                                                {activeDrivers.length === 0 && <span className="text-xs text-red-400">Aucun chauffeur dispo</span>}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Card>

                {/* COLONNE 2 : EN ATTRIBUTION */}
                <Card className="md:col-span-1 shadow-sm border-l-4 border-l-blue-500 flex flex-col">
                    <CardHeader className="pb-3 bg-blue-50/50">
                        <CardTitle className="text-sm font-bold uppercase text-blue-700 flex justify-between">
                            En cours d'acceptation <Badge variant="secondary">{assignedOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                         <div className="space-y-3 mt-4">
                            {assignedOrders.map(order => {
                                const driver = drivers.find(d => d.id === order.assigned_driver_id);
                                return (
                                    <Card key={order.id} className="p-3 border-blue-100 bg-white opacity-80">
                                        <div className="flex justify-between items-center mb-2">
                                            <Badge variant="secondary">{order.reference}</Badge>
                                            <div className="flex items-center gap-1 text-xs text-blue-600 animate-pulse">
                                                <Clock className="w-3 h-3" /> En attente
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium">
                                            Chauffeur : {driver ? `${driver.first_name} ${driver.last_name}` : 'Inconnu'}
                                        </p>
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
                            En Cours (Live) <Badge variant="secondary">{acceptedOrders.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        <div className="space-y-4 mt-4">
                            {acceptedOrders.map(order => {
                                const driver = drivers.find(d => d.id === (order.driver_id || order.assigned_driver_id));
                                
                                // Calculs LIVE
                                let distance = 0;
                                let targetLabel = "";
                                
                                if (driver && driver.current_lat && driver.current_lng) {
                                    if (order.status === 'driver_accepted' || order.status === 'accepted') {
                                        // Vers retrait
                                        distance = calculateDistance(driver.current_lat, driver.current_lng, order.pickup_lat || 0, order.pickup_lng || 0);
                                        targetLabel = "Vers Retrait";
                                    } else if (order.status === 'in_progress') {
                                        // Vers livraison
                                        distance = calculateDistance(driver.current_lat, driver.current_lng, order.delivery_lat || 0, order.delivery_lng || 0);
                                        targetLabel = "Vers Livraison";
                                    }
                                }

                                return (
                                    <Card key={order.id} className="p-3 border-green-200 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm">{order.reference}</span>
                                            <Badge className={order.status === 'in_progress' ? 'bg-purple-500' : 'bg-blue-500'}>
                                                {order.status === 'in_progress' ? 'En Livraison' : 'Approche'}
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
                                                        <p className="font-mono font-bold text-slate-800">{formatDistance(distance)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">ETA estimé</p>
                                                        <p className="font-mono font-bold text-green-600">{estimateTime(distance)}</p>
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

                {/* COLONNE 4 : CHAUFFEURS */}
                <Card className="md:col-span-1 shadow-sm flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase text-slate-700">
                            Chauffeurs ({activeDrivers.length})
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-4 pt-0">
                        <div className="space-y-3 mt-4">
                            {activeDrivers.map(driver => {
                                const activeOrder = getDriverActiveOrder(driver.id);
                                return (
                                    <div key={driver.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200 transition-all">
                                        <div className={`w-2 h-2 rounded-full ${driver.is_online ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{driver.first_name} {driver.last_name}</p>
                                            <p className="text-xs text-slate-500">{driver.vehicle_type || 'Véhicule N/A'}</p>
                                        </div>
                                        {activeOrder && (
                                            <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-600 bg-orange-50">
                                                En course
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </Card>

            </div>
        </div>
    );
}