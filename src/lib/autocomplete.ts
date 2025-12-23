/**
 * AUTOCOMPLETE LOCATIONIQ – ONE CONNEXION
 * 
 * Service d'autocomplétion d'adresses utilisant l'API LocationIQ
 * Compatible avec la base tarifaire existante du projet
 */

export interface AddressSuggestion {
    full: string;        // Adresse complète pour affichage dans les suggestions
    street: string;      // Rue + numéro uniquement
    postcode: string;    // Code postal
    city: string;        // Ville
    lat: string;         // Latitude
    lon: string;         // Longitude
    raw: any;            // Données brutes LocationIQ
}

/**
 * Récupère les suggestions d'adresses depuis LocationIQ
 * @param query - Texte de recherche (minimum 2 caractères)
 * @returns Liste de suggestions d'adresses
 */
export async function autocompleteAddress(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    const key = import.meta.env.VITE_LOCATIONIQ_API_KEY;

    if (!key) {
        console.warn("VITE_LOCATIONIQ_API_KEY non définie dans .env");
        return [];
    }

    const url = `https://api.locationiq.com/v1/autocomplete?key=${key}&q=${encodeURIComponent(
        query
    )}&limit=10&normalizecity=1&dedupe=1&countrycodes=fr`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn("Erreur LocationIQ autocomplete:", response.status);
            return [];
        }

        const data = await response.json();

        // COMMENTÉ POUR DÉBOGAGE : Le filtre strict empêchait certaines adresses valides d'apparaître
        // si LocationIQ ne retournait pas un code postal formaté exactement comme prévu.
        // On retourne toutes les suggestions pertinentes de LocationIQ pour la France.

        const filteredData = data;

        return filteredData.map((item: any) => {
            // Extraire la rue + numéro
            const street = item.address?.road
                ? `${item.address.house_number || ""} ${item.address.road}`.trim()
                : item.display_name.split(",")[0]; // fallback

            // Extraire la ville (sans quartier)
            const city = item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.municipality ||
                "";

            const postcode = item.address?.postcode || "";

            // Format simplifié : Numéro Rue, Code postal Ville
            // Exemple : "10 Avenue Victor Hugo, 92100 Boulogne-Billancourt"
            const simplifiedDisplay = postcode && city
                ? `${street}, ${postcode} ${city}`
                : item.display_name;

            return {
                full: simplifiedDisplay,  // Format simplifié pour l'affichage
                street,                   // Rue + numéro SEULEMENT
                postcode,
                city,
                lat: item.lat,
                lon: item.lon,
                raw: item
            };
        });
    } catch (e) {
        console.error("Autocomplete error:", e);
        return [];
    }
}
