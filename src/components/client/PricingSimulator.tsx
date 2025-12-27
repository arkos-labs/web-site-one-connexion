import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Info, X, ChevronRight, MapPin, Loader2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARIFS_BONS, TarifVille } from "@/data/tarifs_idf";
import { supabase } from "@/lib/supabase";

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
        const [isOpen, setIsOpen] = useState(false);
        const [selectedCity, setSelectedCity] = useState<TarifVille | null>(null);

        const filteredCities = useMemo(() => {
            if (!query || query.length < 2) return [];
            const lower = query.toLowerCase();
            return pricingData.filter(t =>
                t.ville.toLowerCase().includes(lower) ||
                t.cp.includes(lower)
            );
        }, [query, pricingData]);

        const handleSelect = (city: TarifVille) => {
            setSelectedCity(city);
            setQuery(city.ville);
            setIsOpen(false);
        };

        const clearSearch = () => {
            setQuery("");
            setSelectedCity(null);
            setIsOpen(false);
        };

        return (
            <div className="w-full max-w-sm ml-auto font-sans">
                <Card className="relative overflow-visible bg-white rounded-lg shadow-xl border-0 border-t-4 border-[#F97316]">
                    <div className="p-6 space-y-4">
                        <h3 className="text-xl text-center text-slate-700 font-medium pb-2">
                            Calculer le prix
                        </h3>

                        {/* Point de départ */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-600">Point de départ:</label>
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-slate-100 border-r border-slate-200 rounded-l-md">
                                    <List className="h-5 w-5 text-slate-400" />
                                </div>
                                <Input
                                    className="pl-12 h-10 border-slate-200 bg-white focus:ring-0 focus:border-[#F97316] rounded-md text-sm text-slate-700 font-normal"
                                    placeholder="Adresse de départ..."
                                    defaultValue="Paris, France"
                                />
                                <button className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Destination (Active Search) */}
                        <div className="space-y-1 relative z-50">
                            <label className="text-sm font-bold text-slate-600">Destination:</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-slate-100 border-r border-slate-200 rounded-l-md">
                                    <List className="h-5 w-5 text-slate-400" />
                                </div>
                                <Input
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setIsOpen(true);
                                        if (!e.target.value) setSelectedCity(null);
                                    }}
                                    onFocus={() => setIsOpen(true)}
                                    // Blur with timeout to allow clicking suggestions
                                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                                    className="pl-12 h-10 border-slate-200 bg-white focus:ring-0 focus:border-[#F97316] rounded-md text-sm text-slate-700 font-normal"
                                    placeholder="Ville ou code postal..."
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                {/* Suggestions Dropdown */}
                                {isOpen && filteredCities.length > 0 && !selectedCity && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-slate-200 max-h-[200px] overflow-y-auto z-[60]">
                                        <ul className="divide-y divide-slate-100">
                                            {filteredCities.map((city, idx) => (
                                                <li key={`${city.cp}-${city.ville}-${idx}`}>
                                                    <button
                                                        onClick={() => handleSelect(city)}
                                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700 flex items-center justify-between"
                                                    >
                                                        <span>{city.ville} ({city.cp})</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Poid et Dimension */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-600">Poid et Dimension:</label>
                            <select className="flex w-full h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-[#F97316] disabled:cursor-not-allowed disabled:opacity-50 text-slate-700">
                                <option>0-7 (kg) / 40x30x30 (cm)</option>
                                <option>7-30 (kg) / 60x40x40 (cm)</option>
                                <option>+30 (kg) / Sur devis</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-end">
                            {/* Délai (Results if selected) */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-600">Délai:</label>
                                <select
                                    className="flex w-full h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-[#F97316] disabled:cursor-not-allowed disabled:opacity-50 text-slate-700"
                                >
                                    <option>Normal</option>
                                    <option>Express</option>
                                    <option>Urgence</option>
                                </select>
                            </div>

                            <Button
                                className="h-10 bg-[#F97316] hover:bg-[#EA580C] text-white font-medium shadow-sm transition-all"
                            >
                                Obtenir le prix
                            </Button>
                        </div>

                        {/* Result Display (Injected into this UI structure) */}
                        <div className={`transition-all duration-300 ${selectedCity ? 'max-h-[100px] opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            {selectedCity && (
                                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-center">
                                    <p className="text-slate-500 mb-1">Estimation pour {selectedCity.ville}:</p>
                                    <div className="font-bold text-[#F97316] text-xl">
                                        {selectedCity.formules.NORMAL} <span className="text-sm text-slate-400">bons</span>
                                    </div>
                                    <a href="/tarifs" className="text-xs text-blue-500 hover:underline block mt-1">Voir détail →</a>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 text-center text-xs text-slate-500">
                            Pour de renseignements, appeler au <span className="font-bold text-blue-500">01 88 33 60 60</span>.
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