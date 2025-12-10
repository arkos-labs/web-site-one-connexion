import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface StaticMapProps {
    center: {
        lat: number;
        lng: number;
    };
    zoom?: number;
    address?: string;
}

const StaticMap = ({ center, zoom = 13, address = "Paris" }: StaticMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const createMarkerIcon = () => {
        const iconHtml = renderToString(
            <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#0B0B0B',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                <MapPin style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
            }).setView([center.lat, center.lng], zoom);

            // Add LocationIQ tiles
            L.tileLayer('https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.cc49323fc6339e614aec809f78bc7db4', {
                maxZoom: 19,
            }).addTo(map);

            // Add marker
            L.marker([center.lat, center.lng], {
                icon: createMarkerIcon(),
            }).addTo(map);

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center, zoom]);

    return (
        <div className="relative w-full h-full min-h-[500px]">
            <div
                ref={mapContainerRef}
                className="w-full h-full absolute inset-0"
            />
            {/* Overlay to prevent interaction but allow clicking through to Google Maps via button */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
        </div>
    );
};

export default StaticMap;
