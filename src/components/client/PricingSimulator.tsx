import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Info, X, ChevronRight, MapPin, Loader2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARIFS_BONS, TarifVille } from "@/data/tarifs_idf";
import { supabase } from "@/lib/supabase";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";

// Hook personnalisé pour charger les données (Local + DB)
const usePricingData = () => {
    const [data, setData] = useState<TarifVille[]>(TARIFS_BONS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDbPricing = async () => {
            try {
                // 1. Récupérer les tarifs depuis Supabase
                const { data: dbCities, error } = await supabase
                    .from('city_pricing')
                    .select('*');

                if (error) {
                    console.error("Erreur récupération tarifs DB:", error);
                    return;
                }

                if (dbCities && dbCities.length > 0) {
                    // 2. Convertir le format DB en format TarifVille
                    const formattedDbCities: TarifVille[] = dbCities
                        .filter(city => city.zip_code && city.city_name) // BASIC FILTER: Must have CP and Name
                        .map(city => ({
                            ville: city.city_name,
                            cp: city.zip_code || "",
                            formules: {
                                "NORMAL": city.price_normal,
                                "EXPRESS": city.price_express,
                                "URGENCE": city.price_urgence,
                                "VL_NORMAL": city.price_vl_normal,
                                "VL_EXPRESS": city.price_vl_express
                            }
                        }));

                    // 3. Fusionner avec les données locales (Priorité au Local maintenant que le fichier est à jour)
                    setData(currentLocalData => {
                        const mergedMap = new Map();

                        // D'abord les données DB (pour qu'elles soient écrasées par le local si conflit)
                        formattedDbCities.forEach(item => {
                            // Clean name for key: lowercase + trim
                            const key = `${item.ville.toLowerCase().trim()}-${item.cp}`;
                            mergedMap.set(key, item);
                        });

                        // Ensuite les données Locales (écrasent les DB si conflit, car src/data/tarifs_idf.ts est la référence 2025)
                        currentLocalData.forEach(item => {
                            const key = `${item.ville.toLowerCase().trim()}-${item.cp}`;
                            mergedMap.set(key, item);
                        });

                        return Array.from(mergedMap.values()).sort((a, b) => a.ville.localeCompare(b.ville));
                    });
                }
            } catch (err) {
                console.error("Erreur chargement prix:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDbPricing();
    }, []);

    return { data, isLoading };
};

const PricingGrid = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: pricingData, isLoading } = usePricingData();

    const filteredData = useMemo(() => {
        if (!searchTerm) return pricingData;

        // Normalisation stricte pour la recherche (supprime espaces et tirets)
        const normalizeSearch = (str: string) => str.toLowerCase().replace(/[\s-]/g, '');
        const normalizedQuery = normalizeSearch(searchTerm);

        return pricingData.filter(t =>
            normalizeSearch(t.ville).includes(normalizedQuery) ||
            t.cp.includes(searchTerm)
        );
    }, [searchTerm, pricingData]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Rechercher une ville ou un code postal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white border-gray-200"
                />
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-serif font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Ville</th>
                                <th className="px-6 py-4 text-center bg-blue-50/50 text-blue-900">Normal<br /><span className="text-[10px] font-normal opacity-70">4h</span></th>
                                <th className="px-6 py-4 text-center bg-purple-50/50 text-purple-900">Express<br /><span className="text-[10px] font-normal opacity-70">2h</span></th>
                                <th className="px-6 py-4 text-center bg-red-50/50 text-red-900">Urgence<br /><span className="text-[10px] font-normal opacity-70">45min</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Chargement des tarifs...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                        Aucune ville trouvée pour "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((city, idx) => (
                                    <tr key={`${city.cp}-${city.ville}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {city.ville} <span className="text-gray-400 font-normal ml-1">({city.cp})</span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-blue-700">
                                            {city.formules.NORMAL} bons
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-purple-700">
                                            {city.formules.EXPRESS} bons
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-red-600">
                                            {city.formules.URGENCE} bons
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                    Ces tarifs correspondent à une prise en charge (trajet <strong>Paris ↔ Ville</strong>).
                    Pour un trajet <strong>Banlieue ↔ Banlieue</strong>, un supplément kilométrique peut s'appliquer si aucune des deux villes n'est Paris.
                </p>
            </div>
        </div>
    );
};

const PricingSimulator = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
    // Shared Data Hook
    const { data: pricingData } = usePricingData();

    // Compact variant (Widget for Home/Sidebar)
    if (variant === "compact") {
        const [query, setQuery] = useState("");
        const [startQuery, setStartQuery] = useState("");
        const [selectedCity, setSelectedCity] = useState<TarifVille | null>(null);
        const [selectedDelay, setSelectedDelay] = useState<"NORMAL" | "EXPRESS" | "URGENCE">("NORMAL");
        const [showResult, setShowResult] = useState(false);

        const [selectedStartCity, setSelectedStartCity] = useState<TarifVille | null>(null);

        // Calculate the effective city to use for pricing (Max of Start or End)
        const pricingCity = useMemo(() => {
            if (!selectedCity && !selectedStartCity) return null;
            if (!selectedCity) return selectedStartCity;
            if (!selectedStartCity) return selectedCity;

            // Logique : Le prix le plus élevé l'emporte
            const priceStart = selectedStartCity.formules[selectedDelay];
            const priceEnd = selectedCity.formules[selectedDelay];

            return priceStart > priceEnd ? selectedStartCity : selectedCity;
        }, [selectedCity, selectedStartCity, selectedDelay]);

        const handleSelect = (city: TarifVille) => {
            setSelectedCity(city);
            // On ne met PAS à jour 'query' ici car elle contient déjà l'adresse complète set par l'Autocomplete
            setShowResult(false);
        };

        const handleStartSelect = (city: TarifVille) => {
            setSelectedStartCity(city);
            setShowResult(false);
        };

        const clearSearch = () => {
            setQuery("");
            setSelectedCity(null);
            setShowResult(false);
        };

        const handleCalculate = () => {
            if (pricingCity) setShowResult(true);
        };

        return (
            <div className="w-full max-w-sm ml-auto font-sans">
                <Card className="relative overflow-visible bg-white rounded-lg shadow-xl border-0 border-t-4 border-[#D4AF37]">
                    <div className="p-6 space-y-5">
                        <h3 className="text-xl text-center text-[#0B1525] font-serif font-bold pb-2">
                            Estimer un tarif
                        </h3>

                        {/* Point de départ */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#0B1525]">Point de départ:</label>
                            <div className="relative z-50">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 rounded-l-md z-10">
                                    <List className="h-5 w-5 text-gray-400" />
                                </div>
                                <AddressAutocomplete
                                    value={startQuery}
                                    onChange={(val) => {
                                        setStartQuery(val);
                                        if (!val) {
                                            setSelectedStartCity(null);
                                            setShowResult(false);
                                        }
                                    }}
                                    onAddressSelect={(suggestion) => {
                                        const found = pricingData.find(p => p.ville === suggestion.city && p.cp === suggestion.postcode);
                                        if (found) {
                                            handleStartSelect(found);
                                        }
                                    }}
                                    placeholder="Adresse de départ..."
                                    className="w-full"
                                    inputClassName="pl-12 h-10 border-gray-200 bg-white focus:ring-0 focus:border-[#D4AF37] rounded-md text-sm text-gray-700 font-normal shadow-none"
                                />
                                {startQuery && (
                                    <button
                                        onClick={() => setStartQuery("")}
                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Destination (Active Search) */}
                        <div className="space-y-1 relative">
                            <label className="text-sm font-bold text-[#0B1525]">Destination:</label>
                            <div className="relative group z-40">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-50 border-r border-gray-100 rounded-l-md z-10">
                                    <List className="h-5 w-5 text-gray-400" />
                                </div>
                                <AddressAutocomplete
                                    value={query}
                                    onChange={(val) => {
                                        setQuery(val);
                                        if (!val) {
                                            setSelectedCity(null);
                                            setShowResult(false);
                                        }
                                    }}
                                    onAddressSelect={(suggestion) => {
                                        const found = pricingData.find(p => p.ville === suggestion.city && p.cp === suggestion.postcode);
                                        if (found) {
                                            handleSelect(found);
                                        }
                                    }}
                                    placeholder="Ville ou code postal..."
                                    className="w-full"
                                    inputClassName="pl-12 h-10 border-gray-200 bg-white focus:ring-0 focus:border-[#D4AF37] rounded-md text-sm text-gray-700 font-normal shadow-none"
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-end pt-2">
                            {/* Délai (Results if selected) */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#0B1525]">Délai:</label>
                                <select
                                    value={selectedDelay}
                                    onChange={(e) => {
                                        setSelectedDelay(e.target.value as "NORMAL" | "EXPRESS" | "URGENCE");
                                        if (showResult) setShowResult(true);
                                    }}
                                    className="flex w-full h-10 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50 text-gray-700 cursor-pointer"
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="EXPRESS">Express</option>
                                    <option value="URGENCE">Urgence</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleCalculate}
                                disabled={!pricingCity}
                                className={`h-10 text-white font-medium shadow-md transition-all border-0 ${pricingCity ? 'bg-gradient-to-r from-[#D4AF37] to-[#B08D1F] hover:from-[#B08D1F] hover:to-[#967D2B]' : 'bg-gray-300 cursor-not-allowed'}`}
                            >
                                Obtenir le prix
                            </Button>
                        </div>

                        {/* Result Display */}
                        {/* Result Display */}
                        <div className={`transition-all duration-300 ${showResult && pricingCity ? 'max-h-[150px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            {pricingCity && (
                                <div className="bg-[#0B1525]/5 p-4 rounded-lg border border-[#D4AF37]/20 text-sm text-center animate-in slide-in-from-top-2 fade-in">
                                    <p className="text-gray-500 mb-1 font-medium">
                                        Estimation pour {startQuery && query ? "le trajet" : pricingCity.ville} ({selectedDelay === "NORMAL" ? "Standard" : selectedDelay})
                                    </p>
                                    <div className="font-serif font-bold text-[#0B1525] text-3xl my-2">
                                        {(pricingCity.formules[selectedDelay] * 5).toFixed(2)} €
                                        <span className="block text-xs font-sans font-normal text-gray-500 mt-1">
                                            ({pricingCity.formules[selectedDelay]} bons)
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            if (startQuery) params.append("pickupAddress", startQuery);
                                            if (selectedStartCity) {
                                                params.append("pickupCity", selectedStartCity.ville);
                                                params.append("pickupZip", selectedStartCity.cp);
                                            }
                                            if (query) params.append("deliveryAddress", query);
                                            if (selectedCity) {
                                                params.append("deliveryCity", selectedCity.ville);
                                                params.append("deliveryZip", selectedCity.cp);
                                            }

                                            const formulaMap: Record<string, string> = { "NORMAL": "standard", "EXPRESS": "express", "URGENCE": "flash" };
                                            params.append("formula", formulaMap[selectedDelay] || "standard");

                                            window.location.href = `/commande-sans-compte?${params.toString()}`;
                                        }}
                                        className="w-full mt-2 bg-[#0B1525] hover:bg-[#1a2c4e] text-white font-bold py-2 rounded shadow-sm text-xs uppercase tracking-wider"
                                    >
                                        Commander cette course
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Default variant: Show the full pricing grid
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-[#0B1525]">Grille Tarifaire Officielle</h2>
                <p className="text-gray-500 font-light mt-1">
                    Retrouvez tous nos tarifs fixes par ville (Départ ou Arrivée Paris).
                </p>
            </div>

            <PricingGrid />
        </div>
    );
};

export default PricingSimulator;