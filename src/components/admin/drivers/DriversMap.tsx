import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Filter } from "lucide-react";
import { Driver, DriversMapFilter } from "@/types/drivers";
import { getDriverStatusLabel, getDriverStatusBadgeColor } from "@/types/orders";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface DriversMapProps {
    drivers: Driver[];
    onDriverClick?: (driver: Driver) => void;
}

const DriversMap = ({ drivers, onDriverClick }: DriversMapProps) => {
    const [filter, setFilter] = useState<DriversMapFilter>({
        online: true,
        offline: true,
        on_break: true,
        on_vacation: true,
        on_delivery: true
    });

    const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris
    const [zoom, setZoom] = useState(12);

    // Filter drivers based on status
    const filteredDrivers = drivers.filter(driver => {
        switch (driver.status) {
            case 'online':
                return filter.online;
            case 'offline':
                return filter.offline;
            case 'on_break':
                return filter.on_break;
            case 'on_vacation':
                return filter.on_vacation;
            case 'on_delivery':
                return filter.on_delivery;
            default:
                return true;
        }
    });

    const toggleFilter = (key: keyof DriversMapFilter) => {
        setFilter(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getDriverIcon = (status: string) => {
        // Return scooter emoji with different colors based on status
        const colors: Record<string, string> = {
            online: '#10b981',      // green
            offline: '#6b7280',     // gray
            on_delivery: '#3b82f6', // blue
            on_break: '#f59e0b',    // yellow
            on_vacation: '#a855f7'  // purple
        };
        return colors[status] || '#6b7280';
    };

    const createDriverIcon = (status: string) => {
        return new L.DivIcon({
            className: 'custom-div-icon',
            html: `
                <div style="
                    background-color: ${getDriverIcon(status)};
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    font-size: 16px;
                ">
                    🛵
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtres de statut
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {filteredDrivers.length} / {drivers.length} chauffeurs affichés
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={filter.online ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('online')}
                        className={filter.online ? "bg-success hover:bg-success/90" : ""}
                    >
                        🟢 En ligne ({drivers.filter(d => d.status === 'online').length})
                    </Button>
                    <Button
                        variant={filter.on_delivery ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('on_delivery')}
                        className={filter.on_delivery ? "bg-blue-500 hover:bg-blue-600" : ""}
                    >
                        🔵 En déplacement ({drivers.filter(d => d.status === 'on_delivery').length})
                    </Button>
                    <Button
                        variant={filter.on_break ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('on_break')}
                        className={filter.on_break ? "bg-warning hover:bg-warning/90" : ""}
                    >
                        🟡 En pause ({drivers.filter(d => d.status === 'on_break').length})
                    </Button>
                    <Button
                        variant={filter.on_vacation ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('on_vacation')}
                        className={filter.on_vacation ? "bg-purple-500 hover:bg-purple-600" : ""}
                    >
                        🟣 En vacances ({drivers.filter(d => d.status === 'on_vacation').length})
                    </Button>
                    <Button
                        variant={filter.offline ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('offline')}
                        className={filter.offline ? "bg-gray-500 hover:bg-gray-600" : ""}
                    >
                        ⚫ Hors ligne ({drivers.filter(d => d.status === 'offline').length})
                    </Button>
                </div>
            </Card>

            {/* Map Container */}
            <Card className="p-0 overflow-hidden">
                <div className="relative w-full h-[600px] bg-gray-100">
                    {filteredDrivers.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="text-center">
                                <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Aucun chauffeur à afficher</h3>
                                <p className="text-muted-foreground mb-4">
                                    Ajoutez des positions GPS à vos chauffeurs pour les voir sur la carte
                                </p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer
                            center={[mapCenter.lat, mapCenter.lng]}
                            zoom={zoom}
                            style={{ height: "100%", width: "100%" }}
                            className="rounded-lg"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.cc49323fc6339e614aec809f78bc7db4"
                            />
                            {filteredDrivers.map((driver) => {
                                if (!driver.current_location) return null;

                                return (
                                    <Marker
                                        key={driver.id}
                                        position={[driver.current_location.latitude, driver.current_location.longitude]}
                                        icon={createDriverIcon(driver.status)}
                                        eventHandlers={{
                                            click: () => onDriverClick?.(driver),
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="text-xl">🛵</div>
                                                    <p className="font-semibold">
                                                        {driver.first_name} {driver.last_name}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {driver.vehicle?.brand} {driver.vehicle?.model}
                                                </p>
                                                <Badge className={`${getDriverStatusBadgeColor(driver.status)} text-white border-0`}>
                                                    {getDriverStatusLabel(driver.status)}
                                                </Badge>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>
            </Card>

            {/* Drivers List */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Chauffeurs actifs
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredDrivers.length > 0 ? (
                        filteredDrivers.map((driver) => (
                            <div
                                key={driver.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                                onClick={() => onDriverClick?.(driver)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">🛵</div>
                                    <div>
                                        <p className="font-medium">
                                            {driver.first_name} {driver.last_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {driver.vehicle?.brand} {driver.vehicle?.model}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {driver.current_location && (
                                        <div className="text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3 inline mr-1" />
                                            {driver.current_location.latitude.toFixed(4)}, {driver.current_location.longitude.toFixed(4)}
                                        </div>
                                    )}
                                    <Badge className={`${getDriverStatusBadgeColor(driver.status)} text-white border-0`}>
                                        {getDriverStatusLabel(driver.status)}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            Aucun chauffeur ne correspond aux filtres sélectionnés
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DriversMap;
