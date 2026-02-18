import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "@/types";

// --- CONFIGURATION ---
const LOCATIONIQ_KEY = "pk.cc49323fc6339e614aec809f78bc7db4";
const TILE_URL = `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_KEY}`;

// --- ICONES ---
const carIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.4)); transform: translateY(-5px);">🚖</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const pickupIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- CONTROLEUR DE CAMÉRA INTELLIGENT ---
const MapController = ({
    location,
    activeOrder,
    isInteracting,
    onUserInteraction
}: {
    location: { lat: number; lng: number },
    activeOrder: Order | null,
    isInteracting: boolean,
    onUserInteraction: () => void
}) => {
    const map = useMap();

    useMapEvents({
        dragstart: () => onUserInteraction(),
        zoomstart: () => onUserInteraction()
    });

    useEffect(() => {
        if (isInteracting) return;

        if (activeOrder) {
            const bounds = L.latLngBounds(
                [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng],
                [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]
            );
            bounds.extend([location.lat, location.lng]);
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        } else {
            map.flyTo([location.lat, location.lng], 16, { duration: 1.5 });
        }
    }, [location, activeOrder, isInteracting, map]);

    return null;
};

// --- COMPOSANT PRINCIPAL ---
interface DriverMapProps {
    driverLocation: { lat: number; lng: number };
    activeOrder: Order | null;
}

export const DriverMap = ({ driverLocation, activeOrder }: DriverMapProps) => {
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    // Create polyline positions
    const getRoutePositions = () => {
        if (!activeOrder) return [];
        // Route 1: Driver -> Pickup
        const leg1 = [
            [driverLocation.lat, driverLocation.lng] as [number, number],
            [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng] as [number, number]
        ];
        // Route 2: Pickup -> Dropoff
        const leg2 = [
            [activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng] as [number, number],
            [activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng] as [number, number]
        ];
        return { leg1, leg2 };
    };

    const routes = getRoutePositions();

    return (
        <div className="relative h-full w-full bg-gray-100">
            <MapContainer
                center={[driverLocation.lat, driverLocation.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl={false}
                className="z-0 outline-none"
            >
                <TileLayer url={TILE_URL} maxZoom={18} attribution='&copy; LocationIQ' />

                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon} />

                {activeOrder && !Array.isArray(routes) && (
                    <>
                        <Marker position={[activeOrder.pickupLocation.lat, activeOrder.pickupLocation.lng]} icon={pickupIcon}>
                            <Popup>Pickup: {activeOrder.pickupLocation.address}</Popup>
                        </Marker>
                        <Marker position={[activeOrder.dropoffLocation.lat, activeOrder.dropoffLocation.lng]} icon={dropoffIcon}>
                            <Popup>Dropoff: {activeOrder.dropoffLocation.address}</Popup>
                        </Marker>

                        {/* Route: Driver to Pickup (Dashed Blue) */}
                        <Polyline
                            positions={routes.leg1}
                            pathOptions={{ color: '#3b82f6', dashArray: '10, 10', weight: 4, opacity: 0.7 }}
                        />

                        {/* Route: Pickup to Dropoff (Solid Green) */}
                        <Polyline
                            positions={routes.leg2}
                            pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
                        />
                    </>
                )}

                <MapController
                    location={driverLocation}
                    activeOrder={activeOrder}
                    isInteracting={isUserInteracting}
                    onUserInteraction={() => setIsUserInteracting(true)}
                />
            </MapContainer>

            {/* Re-center Button */}
            {isUserInteracting && (
                <button
                    onClick={() => setIsUserInteracting(false)}
                    className="absolute bottom-32 right-4 bg-white p-3 rounded-full shadow-lg z-[400] text-slate-700 animate-in fade-in"
                >
                    <LocateFixed className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};
