
interface RouteResult {
    distance: number; // in meters
    duration: number; // in seconds
    coordinates: [number, number][]; // Array of [lng, lat]
}

// OSRM Public Demo Server (Gratuit, pas de token nécessaire)
// Note: C'est un serveur de démo, évitez de faire des milliers de requêtes par minute.
const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving";

export const getRoute = async (
    start: [number, number], // [lat, lng]
    end: [number, number]    // [lat, lng]
): Promise<RouteResult | null> => {
    try {
        // OSRM expects [lng, lat]
        const startStr = `${start[1]},${start[0]}`;
        const endStr = `${end[1]},${end[0]}`;

        // Request full geojson geometry
        const url = `${OSRM_API_URL}/${startStr};${endStr}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            return {
                distance: route.distance,
                duration: route.duration,
                coordinates: route.geometry.coordinates, // [lng, lat][]
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching route from OSRM:", error);
        return null;
    }
};
