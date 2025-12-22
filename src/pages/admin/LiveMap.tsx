import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, Package, Navigation, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Driver {
    id: string;
    first_name: string;
    last_name: string;
    current_lat: number | null;
    current_lng: number | null;
    status: string;
    is_online: boolean;
}

interface Order {
    id: string;
    reference: string;
    status: string;
    pickup_address: string;
    delivery_address: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    driver_id: string | null;
    clients: {
        company_name: string;
    } | null;
}

const LiveMap = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        fetchData();

        // Real-time subscriptions
        const driversChannel = supabase
            .channel("drivers-location")
            .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
                fetchDrivers();
            })
            .subscribe();

        const ordersChannel = supabase
            .channel("orders-map")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(driversChannel);
            supabase.removeChannel(ordersChannel);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchDrivers(), fetchOrders()]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const { data, error } = await supabase
                .from("drivers")
                .select("id, first_name, last_name, current_lat, current_lng, status, is_online")
                .not("current_lat", "is", null)
                .not("current_lng", "is", null);

            if (error) throw error;
            setDrivers(data || []);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select(`
          id,
          reference,
          status,
          pickup_address,
          delivery_address,
          pickup_lat,
          pickup_lng,
          delivery_lat,
          delivery_lng,
          driver_id,
          clients (
            company_name
          )
        `)
                .in("status", ["accepted", "dispatched", "in_progress"])
                .or("pickup_lat.not.is.null,delivery_lat.not.is.null");

            if (error) throw error;
            setOrders((data as any) || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView([48.8566, 2.3522], 12);

        L.tileLayer("https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.cc49323fc6339e614aec809f78bc7db4", {
            attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapRef.current = map;
    }, [loading]);

    // Update markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add driver markers
        drivers.forEach(driver => {
            if (driver.current_lat && driver.current_lng) {
                const marker = L.marker([driver.current_lat, driver.current_lng], {
                    icon: L.divIcon({
                        html: `
                            <div class="relative">
                                <div class="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping"></div>
                                <div class="relative bg-emerald-500 w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-lg z-10 transition-transform hover:scale-110">
                                    🛵
                                </div>
                            </div>
                        `,
                        className: 'driver-marker',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                    })
                }).addTo(mapRef.current!);

                marker.bindPopup(`
                    <div class="p-4 min-w-[200px] border-none shadow-none font-sans">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                ${driver.first_name[0]}${driver.last_name[0]}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 m-0">${driver.first_name} ${driver.last_name}</h3>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <span class="w-2 h-2 rounded-full ${driver.is_online ? 'bg-emerald-500' : 'bg-slate-400'}"></span>
                                    <span class="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                        ${driver.is_online ? 'En ligne' : 'Hors ligne'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-50 rounded-lg p-2 flex flex-col gap-1 text-xs">
                            <div class="flex justify-between">
                                <span class="text-slate-500">Statut:</span>
                                <span class="font-medium text-slate-700 uppercase">${driver.status}</span>
                            </div>
                        </div>
                    </div>
                `, {
                    className: 'premium-popup'
                });

                markersRef.current.push(marker);
            }
        });

        // Add order markers
        orders.forEach(order => {
            // Pickup Marker
            if (order.pickup_lat && order.pickup_lng) {
                const pickupMarker = L.marker([order.pickup_lat, order.pickup_lng], {
                    icon: L.divIcon({
                        html: `
                            <div class="bg-blue-600 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs z-10">
                                📦
                            </div>
                        `,
                        className: 'pickup-marker',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    })
                }).addTo(mapRef.current!);

                pickupMarker.bindPopup(`
                    <div class="p-2 text-xs font-sans">
                        <strong class="text-blue-600">POINT DE RETRAIT</strong><br/>
                        <span class="font-bold text-slate-800">${order.reference}</span><br/>
                        <p class="text-slate-500 mt-1">${order.pickup_address}</p>
                    </div>
                `);

                markersRef.current.push(pickupMarker);
            }

            // Delivery Marker
            if (order.delivery_lat && order.delivery_lng) {
                const deliveryMarker = L.marker([order.delivery_lat, order.delivery_lng], {
                    icon: L.divIcon({
                        html: `
                            <div class="bg-orange-500 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs z-10">
                                🎯
                            </div>
                        `,
                        className: 'delivery-marker',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                    })
                }).addTo(mapRef.current!);

                deliveryMarker.bindPopup(`
                    <div class="p-2 text-xs font-sans">
                        <strong class="text-orange-500">DESTINATION</strong><br/>
                        <span class="font-bold text-slate-800">${order.reference}</span><br/>
                        <p class="text-slate-500 mt-1">${order.delivery_address}</p>
                    </div>
                `);

                markersRef.current.push(deliveryMarker);
            }
        });

        // Fit bounds if there are markers
        if (markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current);
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
        }
    }, [drivers, orders]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Carte en Direct</h1>
                    <p className="text-muted-foreground">
                        Visualisation temps réel des chauffeurs et commandes actives
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Truck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Chauffeurs en ligne</p>
                            <p className="text-2xl font-bold text-primary">
                                {drivers.filter((d) => d.is_online).length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Commandes actives</p>
                            <p className="text-2xl font-bold text-primary">{orders.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Navigation className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">En livraison</p>
                            <p className="text-2xl font-bold text-primary">
                                {orders.filter((o) => o.status === "in_progress").length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Map */}
            <Card className="flex-1 overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '500px' }} />
            </Card>
        </div>
    );
};

export default LiveMap;
