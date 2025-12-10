import { useState, useEffect } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Star, Package, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { AvailableDriver, isDriverAvailable, getDriverStatusLabel, getDriverStatusBadgeColor } from "@/types/orders";

interface DispatchDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    pickupAddress: string;
    onDispatch: (driverId: string) => void;
}

// Mock function to calculate distance (in real app, use Google Maps API or similar)
const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number => {
    // Mock calculation - returns random distance between 1-15 km
    return Math.random() * 14 + 1;
};

// Mock function to calculate ETA based on distance
const calculateETA = (distance: number): number => {
    // Assume average speed of 30 km/h in city
    return Math.round((distance / 30) * 60);
};

const DispatchDriverModal = ({
    isOpen,
    onClose,
    orderId,
    pickupAddress,
    onDispatch,
}: DispatchDriverModalProps) => {
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch available drivers
    useEffect(() => {
        if (isOpen) {
            fetchAvailableDrivers();
        }
    }, [isOpen]);

    const fetchAvailableDrivers = async () => {
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('*');

            if (error) throw error;

            if (data) {
                const realDrivers: AvailableDriver[] = data.map((driver: any) => {
                    // Map DB status to Frontend status
                    let status: any = 'offline';
                    if (driver.status === 'available') status = 'online';
                    else if (driver.status === 'busy') status = 'on_delivery';
                    else if (driver.status === 'offline') status = 'offline';
                    else if (driver.status === 'suspended') status = 'offline'; // Treat suspended as offline for now

                    return {
                        id: driver.id,
                        first_name: driver.first_name,
                        last_name: driver.last_name,
                        status: status,
                        phone: driver.phone,
                        rating: 5.0, // Default rating as it's not in DB yet
                        total_deliveries: 0, // Default as not calculated yet
                        current_orders_count: 0, // Default
                        current_location: driver.current_lat && driver.current_lng ? {
                            latitude: driver.current_lat,
                            longitude: driver.current_lng
                        } : undefined
                    };
                });

                // Filter only available drivers (online status)
                // We can relax this filter if we want to see all drivers, but for dispatching we usually want available ones.
                // However, the user might want to see 'busy' drivers too.
                // Let's keep the isDriverAvailable check but maybe we need to update isDriverAvailable to include 'on_delivery' if we want to queue?
                // For now, let's stick to the existing logic: filter by isDriverAvailable.

                const available = realDrivers
                    .filter(driver => isDriverAvailable(driver))
                    .map(driver => ({
                        ...driver,
                        distance_to_pickup: calculateDistance(
                            driver.current_location?.latitude,
                            driver.current_location?.longitude,
                            48.8566, // Mock pickup location (should be parsed from address)
                            2.3522
                        ),
                        estimated_time: 0
                    }))
                    .map(driver => ({
                        ...driver,
                        estimated_time: calculateETA(driver.distance_to_pickup || 0)
                    }))
                    .sort((a, b) => (a.distance_to_pickup || 0) - (b.distance_to_pickup || 0));

                setAvailableDrivers(available);
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            toast.error("Erreur lors du chargement des chauffeurs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDispatch = () => {
        if (!selectedDriverId) {
            toast.error("Veuillez sélectionner un chauffeur");
            return;
        }

        const driver = availableDrivers.find(d => d.id === selectedDriverId);
        if (!driver) {
            toast.error("Chauffeur introuvable");
            return;
        }

        if (!isDriverAvailable(driver)) {
            toast.error("Ce chauffeur n'est pas disponible");
            return;
        }

        onDispatch(selectedDriverId);
        toast.success(`Commande dispatchée à ${driver.first_name} ${driver.last_name}`);
        onClose();
        setSelectedDriverId("");
    };

    // Filter drivers based on search
    const filteredDrivers = availableDrivers.filter(driver => {
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${driver.first_name} ${driver.last_name}`.toLowerCase();
        return fullName.includes(searchLower);
    });

    const selectedDriver = availableDrivers.find(d => d.id === selectedDriverId);

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Dispatcher la commande"
            size="lg"
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDispatch}
                        disabled={!selectedDriverId || filteredDrivers.length === 0}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Dispatcher la commande
                    </Button>
                </>
            }
        >
            <div className="space-y-6 p-6 h-full overflow-y-auto">
                {/* Order Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-blue-900">Commande : {orderId}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                Point de retrait : {pickupAddress}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un chauffeur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Available Drivers Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {filteredDrivers.length} chauffeur{filteredDrivers.length > 1 ? 's' : ''} disponible{filteredDrivers.length > 1 ? 's' : ''}
                    </p>
                    {availableDrivers.length === 0 && !isLoading && (
                        <div className="flex items-center gap-2 text-warning">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Aucun chauffeur disponible</span>
                        </div>
                    )}
                </div>

                {/* Drivers List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Chargement des chauffeurs disponibles...
                        </div>
                    ) : filteredDrivers.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "Aucun chauffeur ne correspond à votre recherche" : "Aucun chauffeur disponible pour le moment"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Les chauffeurs doivent être en ligne et disponibles pour recevoir des commandes
                            </p>
                        </div>
                    ) : (
                        filteredDrivers.map((driver) => (
                            <div
                                key={driver.id}
                                onClick={() => setSelectedDriverId(driver.id)}
                                className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedDriverId === driver.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                    }
                  `}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Driver Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-lg">
                                                {driver.first_name} {driver.last_name}
                                            </h4>
                                            <Badge
                                                className={`${getDriverStatusBadgeColor(driver.status)} text-white border-0`}
                                            >
                                                {getDriverStatusLabel(driver.status)}
                                            </Badge>
                                            {selectedDriverId === driver.id && (
                                                <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span>{driver.rating.toFixed(1)} / 5.0</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Package className="h-4 w-4" />
                                                <span>{driver.total_deliveries} livraisons</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{driver.distance_to_pickup?.toFixed(1)} km</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-warning font-medium">
                                                <Clock className="h-4 w-4" />
                                                <span>~{driver.estimated_time} min</span>
                                            </div>
                                        </div>

                                        {driver.current_orders_count > 0 && (
                                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                                {driver.current_orders_count} commande{driver.current_orders_count > 1 ? 's' : ''} en cours
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Selected Driver Summary */}
                {selectedDriver && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-green-900">
                                    Chauffeur sélectionné : {selectedDriver.first_name} {selectedDriver.last_name}
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    Arrivée estimée au point de retrait : ~{selectedDriver.estimated_time} minutes
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UniversalModal>
    );
};

export default DispatchDriverModal;
