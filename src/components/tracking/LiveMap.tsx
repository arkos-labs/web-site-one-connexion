import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface LiveMapProps {
    driverLocation: {
        lat: number;
        lng: number;
    };
    deliveryLocation: {
        lat: number;
        lng: number;
        address: string;
    };
    driverName?: string;
}

const LiveMap = ({ driverLocation, deliveryLocation, driverName = "Chauffeur" }: LiveMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const deliveryMarkerRef = useRef<L.Marker | null>(null);

    // Créer une icône personnalisée pour le chauffeur
    const createDriverIcon = () => {
        const iconHtml = renderToString(
            <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FFCC00',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                <Navigation style={{ width: '20px', height: '20px', color: '#0B0B0B' }} />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: 'custom-driver-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });
    };

    // Créer une icône personnalisée pour la destination
    const createDeliveryIcon = () => {
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
            className: 'custom-delivery-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialiser la carte seulement si elle n'existe pas
        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: true,
                attributionControl: false,
            }).setView([driverLocation.lat, driverLocation.lng], 13);

            // Ajouter les tuiles LocationIQ
            L.tileLayer('https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=pk.cc49323fc6339e614aec809f78bc7db4', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://locationiq.com">LocationIQ</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            mapRef.current = map;

            // Ajouter le marqueur du chauffeur
            const driverMarker = L.marker([driverLocation.lat, driverLocation.lng], {
                icon: createDriverIcon(),
            }).addTo(map);

            driverMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <strong style="color: #0B0B0B;">${driverName}</strong><br/>
          <span style="color: #666; font-size: 12px;">Position actuelle</span>
        </div>
      `);

            driverMarkerRef.current = driverMarker;

            // Ajouter le marqueur de destination
            const deliveryMarker = L.marker([deliveryLocation.lat, deliveryLocation.lng], {
                icon: createDeliveryIcon(),
            }).addTo(map);

            deliveryMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <strong style="color: #0B0B0B;">Destination</strong><br/>
          <span style="color: #666; font-size: 12px;">${deliveryLocation.address}</span>
        </div>
      `);

            deliveryMarkerRef.current = deliveryMarker;

            // Ajuster la vue pour inclure les deux marqueurs
            const bounds = L.latLngBounds([
                [driverLocation.lat, driverLocation.lng],
                [deliveryLocation.lat, deliveryLocation.lng],
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        return () => {
            // Cleanup lors du démontage
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Initialisation une seule fois

    // Mettre à jour la position du chauffeur
    useEffect(() => {
        if (driverMarkerRef.current && mapRef.current) {
            const newLatLng = L.latLng(driverLocation.lat, driverLocation.lng);
            driverMarkerRef.current.setLatLng(newLatLng);

            // Recentrer la carte pour inclure les deux marqueurs
            if (deliveryMarkerRef.current) {
                const bounds = L.latLngBounds([
                    [driverLocation.lat, driverLocation.lng],
                    [deliveryLocation.lat, deliveryLocation.lng],
                ]);
                mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
        }
    }, [driverLocation.lat, driverLocation.lng, deliveryLocation.lat, deliveryLocation.lng]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
        />
    );
};

export default LiveMap;
