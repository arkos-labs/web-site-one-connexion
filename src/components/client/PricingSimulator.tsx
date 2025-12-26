import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Info, X, ChevronRight, MapPin, Loader2 } from "lucide-react";
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
            <div className="w-full max-w-sm ml-auto">
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl text-white overflow-visible transition-all duration-300">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-serif font-medium text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-[#D4AF37]" />
                                Tarif Rapide
                            </h3>
                            <p className="text-xs text-gray-300 font-light">
                                Vérifiez le prix d'une ville (Départ/Arrivée Paris)
                            </p>
                        </div>

                        <div className="relative">
                            <div className="relative z-50">
                                <Input
                                    placeholder="Ville ou code postal..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setIsOpen(true);
                                        if (!e.target.value) setSelectedCity(null);
                                    }}
                                    onFocus={() => setIsOpen(true)}
                                    // Handle Blur with timeout to allow clicking suggestions
                                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                                    className="pl-4 pr-10 h-12 bg-white/10 border-white/10 text-white placeholder:text-gray-400 focus:bg-[#0B1525] focus:border-[#D4AF37] transition-all rounded-lg"
                                />
                                {query && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Suggestions */}
                            {isOpen && filteredCities.length > 0 && !selectedCity && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    <ul className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {filteredCities.map((city, idx) => (
                                            <li key={`${city.cp}-${city.ville}-${idx}`}>
                                                <button
                                                    onClick={() => handleSelect(city)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50/50 transition-colors flex items-center justify-between group text-gray-800"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{city.ville}</p>
                                                            <p className="text-xs text-gray-400">{city.cp}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37] transition-colors" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Selected City Details */}
                        <div className="transition-all duration-300 ease-in-out">
                            {selectedCity && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 bg-white/5 rounded-xl p-4 border border-white/10 mt-2">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                                            <span className="font-serif text-lg font-medium text-white">{selectedCity.ville}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Standard (4h)</span>
                                            <span className="font-bold text-[#F3E5AB]">
                                                {selectedCity.formules.NORMAL} bons
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Express (2h)</span>
                                            <span className="font-bold text-[#F3E5AB]">
                                                {selectedCity.formules.EXPRESS} bons
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Urgence</span>
                                            <span className="font-bold text-red-400">
                                                {selectedCity.formules.URGENCE} bons
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Link */}
                        <div className="pt-2 text-center">
                            <a href="/tarifs" className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-[#D4AF37] transition-colors font-medium">
                                Voir la grille complète →
                            </a>
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