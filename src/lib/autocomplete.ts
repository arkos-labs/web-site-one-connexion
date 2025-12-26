/**
 * AUTOCOMPLETE LOCATIONIQ – ONE CONNEXION
 * 
 * Service d'autocomplétion d'adresses utilisant l'API LocationIQ
 * Compatible avec la base tarifaire existante du projet
 */

import { rechercherVilles, estVilleDesservie, findCityByZipAndName } from "@/data/tarifs_idf";

export interface AddressSuggestion {
    full: string;        // Adresse complète pour affichage dans les suggestions
    street: string;      // Rue + numéro uniquement
    postcode: string;    // Code postal
    city: string;        // Ville
    lat: string;         // Latitude
    lon: string;         // Longitude
    raw: any;            // Données brutes LocationIQ
    isLocal?: boolean;   // Indique si la suggestion vient de la base locale
}

/**
 * Récupère les suggestions d'adresses
 * RESTRICTION: Uniquement les villes d'Île-de-France définies dans la grille tarifaire.
 * 
 * @param query - Texte de recherche (minimum 2 caractères)
 * @returns Liste de suggestions d'adresses (Villes IDF uniquement)
 */
export async function autocompleteAddress(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    const suggestions: AddressSuggestion[] = [];

    // 1. RECHERCHE LOCALE (Prioritaire - Villes de la grille tarifaire)
    // On cherche dans notre base de tarifs (villes connues)
    const villesLocales = rechercherVilles(query, 10); // + de résultats locaux

    villesLocales.forEach(ville => {
        suggestions.push({
            full: `${ville.ville} (${ville.cp})`,
            street: "",
            postcode: ville.cp,
            city: ville.ville,
            lat: "",
            lon: "",
            raw: null,
            isLocal: true
        });
    });

    // 2. RECHERCHE API (LocationIQ - Pour les rues et adresses précises)
    // Permet de trouver "5 square..." 
    const key = import.meta.env.VITE_LOCATIONIQ_API_KEY;

    if (key) {
        // On cible la France et on limite strictement à l'Île-de-France (Bounding Box)
        // Bbox IDF approx: 1.40 (Ouest), 49.25 (Nord), 3.60 (Est), 48.10 (Sud)
        const bbox = "1.40,49.25,3.60,48.10";
        const url = `https://api.locationiq.com/v1/autocomplete?key=${key}&q=${encodeURIComponent(
            query
        )}&limit=10&normalizecity=1&dedupe=1&countrycodes=fr&viewbox=${bbox}&bounded=1`;

        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();

                const apiSuggestions = data
                    .map((item: any) => {
                        const street = item.address?.road
                            ? `${item.address.house_number || ""} ${item.address.road}`.trim()
                            : item.display_name.split(",")[0];

                        // Récupération intelligente de la ville et du CP
                        const resultCity = item.address?.city ||
                            item.address?.town ||
                            item.address?.village ||
                            item.address?.municipality ||
                            "";

                        const resultZip = item.address?.postcode || "";

                        // ⚠️ FILTRAGE STRICT & MAPPING CANONIQUE
                        // On vérifie si la ville est dans notre base ET on récupère son nom officiel
                        const foundCity = findCityByZipAndName(resultZip, resultCity);

                        // Si la ville n'est pas desservie, on l'ignore
                        if (!foundCity) {
                            return null;
                        }

                        // On utilise les données CANONIQUES pour garantir que le pricing fonctionne
                        const canonicalCity = foundCity.ville;
                        const canonicalZip = foundCity.cp;

                        const simplifiedDisplay = canonicalZip && canonicalCity
                            ? `${street}, ${canonicalZip} ${canonicalCity}`
                            : item.display_name;

                        return {
                            full: simplifiedDisplay,
                            street,
                            postcode: canonicalZip,
                            city: canonicalCity, // IMPORTANT: Nom officiel pour le pricing engine
                            lat: item.lat,
                            lon: item.lon,
                            raw: item,
                            isLocal: false
                        };
                    })
                    .filter((item: any) => item !== null); // Retirer les nuls

                suggestions.push(...apiSuggestions);
            }
        } catch (e) {
            console.error("Autocomplete API error:", e);
        }
    }

    // Dédoublonnage final basé sur l'affichage complet
    const uniqueSuggestions = suggestions.filter((v, i, a) => a.findIndex(v2 => v2.full === v.full) === i);

    return uniqueSuggestions.slice(0, 10);
}
