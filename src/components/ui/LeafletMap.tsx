import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Type definition for Routing Control since types might be missing
declare module 'leaflet' {
    namespace Routing {
        function control(options: any): Control;
        interface Control extends L.Control {
            getWaypoints(): any[];
            setWaypoints(waypoints: any[]): this;
            on(type: string, fn: (e: any) => void): this;
        }
        interface Waypoint {
            latLng: L.LatLng;
            name?: string;
        }
    }
}

interface LeafletMapProps {
    start: [number, number];
    end: [number, number];
    className?: string;
    onDistanceFound?: (distanceKm: number) => void;
}

const RoutingMachine = ({ start, end, onDistanceFound }: LeafletMapProps) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map) return;

        // Cleanup previous control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            // Use OSRM demo server (default) but be aware of limits.
            // Ideally we would use router: new L.Routing.OSRMv1({ serviceUrl: '...' })
            routeWhileDragging: false,
            show: false, // Hide the turn-by-turn text container
            addWaypoints: false, // Disable adding new waypoints
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#D4AF37', opacity: 0.8, weight: 6 }]
            },
            createMarker: function (i: number, waypoint: L.Routing.Waypoint, n: number) {
                const markerIcon = L.icon({
                    iconUrl: icon,
                    shadowUrl: iconShadow,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                });
                return L.marker(waypoint.latLng, {
                    draggable: false,
                    icon: markerIcon
                }).bindPopup(i === 0 ? "Départ" : "Arrivée");
            }
        });

        control.on('routesfound', function (e: any) {
            const routes = e.routes;
            const summary = routes[0].summary;
            // distance is in meters
            if (onDistanceFound) {
                onDistanceFound(summary.totalDistance / 1000);
            }
        });

        control.addTo(map);
        routingControlRef.current = control;

        return () => {
            if (routingControlRef.current) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) {
                    console.warn("Error removing routing control", e);
                }
            }
        };
    }, [map, start, end, onDistanceFound]);

    return null;
};

export default function LeafletMap({ start, end, className, onDistanceFound }: LeafletMapProps) {
    // Calculate center for initial view (optional, RoutingMachine handles fitBounds)
    const center: [number, number] = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2
    ];

    return (
        <MapContainer
            center={center}
            zoom={10}
            scrollWheelZoom={false}
            className={`w-full h-full rounded-xl z-0 ${className}`}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RoutingMachine start={start} end={end} onDistanceFound={onDistanceFound} />
        </MapContainer>
    );
}
