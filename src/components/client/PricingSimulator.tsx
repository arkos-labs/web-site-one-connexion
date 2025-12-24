import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    DEFAULT_PRIX_BON_CENTS,
    type FormuleNew,
    type CalculTarifaireResult
} from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { MapPin, ArrowRight, Calculator, Info, Search } from "lucide-react";

// Mock function until full Geocoding is implemented
const mockGeocode = (addr1: string, addr2: string): number => {
    // Simple determinism for demo: based on length of strings to vary distance
    if (!addr1 || !addr2) return 10;
    return Math.max(5, (addr1.length + addr2.length) % 50);
}

const PricingSimulator = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
    // Removed 'cities' state as we now use free address input
    const [adresseDepart, setAdresseDepart] = useState<string>("");
    const [adresseArrivee, setAdresseArrivee] = useState<string>("");
    const [distance, setDistance] = useState([10]); // Default 10km
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);

    const handleCalculate = async () => {
        if (!adresseDepart || !adresseArrivee) return;
        setIsCalculating(true);

        // Simulating API delay for realist feel
        await new Promise(r => setTimeout(r, 600));

        try {
            // For now, we trust the Slider distance, or we could update it.
            // In a real app, we would await getDistance(adresseDepart, adresseArrivee) here.
            // Let's assume the user adjusts the slider OR we simulate it if they haven't touched it?
            // For stability, we use the current 'distance' state.

            const res = await calculerToutesLesFormulesAsync(
                "Paris", // Defaulting to Paris for zoning logic compatibility if addresses aren't exact zones
                "Paris",
                distance[0] * 1000 // Convert km to meters
            );
            setResults(res as Record<FormuleNew, CalculTarifaireResult>);
        } catch (error) {
            console.error("Erreur de calcul:", error);
        } finally {
            setIsCalculating(false);
        }
    };

    // removed auto-calculate on text change to avoid spamming, prefer "Calculer" button or debounce.
    // We kept auto-calc on distance change if results are already shown?
    useEffect(() => {
        if (results) {
            handleCalculate();
        }
    }, [distance]);

    if (variant === "compact") {
        return (
            <div className="w-full max-w-sm ml-auto">
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 shadow-2xl text-white">
                    <div className="space-y-6">
                        <div className="space-y-2 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-serif font-medium text-white">
                                Simulateur de Tarifs
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white/80 font-light">Adresse de départ</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Ex: 12 Rue de Rivoli, Paris"
                                        className="pl-9 bg-white/90 border-0 text-slate-800 h-10 placeholder:text-gray-400"
                                        value={adresseDepart}
                                        onChange={(e) => setAdresseDepart(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white/80 font-light">Adresse d'arrivée</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Ex: 1 Place de la Défense"
                                        className="pl-9 bg-white/90 border-0 text-slate-800 h-10 placeholder:text-gray-400"
                                        value={adresseArrivee}
                                        onChange={(e) => setAdresseArrivee(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between text-sm text-white/90">
                                    <span>Distance estimée</span>
                                    <span className="font-semibold">{distance[0]} km</span>
                                </div>
                                <Slider
                                    value={distance}
                                    onValueChange={setDistance}
                                    max={100}
                                    min={1}
                                    step={1}
                                    className="py-2 [&_.shift-slider-track]:bg-white/30 [&_.shift-slider-thumb]:border-white"
                                />
                            </div>

                            <Button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                className="w-full bg-gradient-to-r from-[#C5A028] to-[#E5C558] hover:from-[#B08D1F] hover:to-[#D4B346] text-white border-0 font-medium h-11 shadow-lg mt-2 transition-all"
                            >
                                {isCalculating ? "Calcul..." : "Estimer"}
                            </Button>

                            {results && (
                                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in space-y-3 bg-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">Standard (4h)</span>
                                        <span className="font-bold text-[#F3E5AB]">{results.NORMAL.totalEuros.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">Express (2h)</span>
                                        <span className="font-bold text-[#F3E5AB]">{results.EXPRESS.totalEuros.toFixed(2)}€</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Default Variant (Used in /tarifs page)
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Controls */}
                <Card className="lg:col-span-5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 bg-white rounded-2xl h-fit">
                    <div className="space-y-8">
                        <div className="space-y-2 border-b border-gray-100 pb-6">
                            <h3 className="text-2xl font-serif font-bold text-[#0B1525] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-[#D4AF37]" />
                                </div>
                                Simulateur
                            </h3>
                            <p className="text-sm text-gray-500 font-light">
                                Saisissez vos adresses pour obtenir une estimation précise.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-gray-700">Adresse de départ</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        placeholder="Ex: 12 Rue de Rivoli, 75001 Paris"
                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 transition-all"
                                        value={adresseDepart}
                                        onChange={(e) => setAdresseDepart(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Adresse d'arrivée</Label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                    <Input
                                        placeholder="Ex: 1 Place de la Défense, Puteaux"
                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 transition-all"
                                        value={adresseArrivee}
                                        onChange={(e) => setAdresseArrivee(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <Label className="text-gray-700">Distance estimée</Label>
                                    <span className="font-bold text-[#0B1525] bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">{distance[0]} km</span>
                                </div>
                                <Slider
                                    value={distance}
                                    onValueChange={setDistance}
                                    max={100}
                                    min={1}
                                    step={1}
                                    className="py-2"
                                />
                                <p className="text-xs text-gray-400 flex items-center gap-1.5 font-light">
                                    <Info className="w-3 h-3 text-[#D4AF37]" />
                                    Ajustez la distance si nécessaire pour affiner le prix.
                                </p>
                            </div>

                            <Button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                                className="w-full bg-[#0B1525] hover:bg-[#1a2c4e] text-white h-14 text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-xl"
                            >
                                {isCalculating ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Calcul en cours...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Calculer mon tarif <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                <div className="lg:col-span-7 space-y-6">
                    {!results ? (
                        <Card className="p-12 border border-gray-100 bg-white/50 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px] rounded-2xl">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-serif text-gray-400 mb-2">
                                En attente d'estimation
                            </h3>
                            <p className="text-gray-400 font-light max-w-xs">
                                Remplissez les adresses et validez pour voir nos offres sur-mesure.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid gap-5">
                                {/* Standard / Normal */}
                                <PricingCard
                                    title="Standard"
                                    result={results.NORMAL}
                                    delay="4h"
                                    description="Livraison économique dans la demi-journée."
                                />
                                {/* Express */}
                                <PricingCard
                                    title="Express"
                                    result={results.EXPRESS}
                                    delay="2h"
                                    popular
                                    description="La solution idéale pour vos urgences quotidiennes."
                                />
                                {/* Urgence */}
                                <PricingCard
                                    title="Super Express"
                                    result={results.URGENCE}
                                    delay="45min"
                                    description="Un coursier dédié part immédiatement."
                                />
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-6 flex gap-4 items-start">
                                <Info className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                                <div className="space-y-2">
                                    <h4 className="text-blue-900 font-medium">Transparence totale</h4>
                                    <p className="text-sm text-blue-700/80 leading-relaxed">
                                        Ces tarifs sont estimatifs et incluent la prise en charge et le kilométrage.
                                        La valeur du Bon est fixée à <strong>{(DEFAULT_PRIX_BON_CENTS / 100).toFixed(2)}€ HT</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PricingCard = ({
    title,
    result,
    delay,
    popular,
    description
}: {
    title: string,
    result: CalculTarifaireResult,
    delay: string,
    popular?: boolean,
    description: string
}) => {
    return (
        <Card className={`relative overflow-hidden transition-all duration-300 group ${popular
            ? 'border-[#D4AF37] shadow-[0_10px_40px_-10px_rgba(212,175,55,0.2)] bg-white transform hover:-translate-y-1'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg'
            }`}>
            {popular && (
                <div className="absolute top-0 right-0">
                    <div className="bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Recommandé
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-serif font-bold transition-colors ${popular ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-gray-50 text-gray-400 group-hover:bg-[#0B1525] group-hover:text-white'}`}>
                        {title[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-serif font-bold text-xl text-[#0B1525]">{title}</h4>
                            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                {delay}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 font-light">{description}</p>
                    </div>
                </div>

                <div className="text-right w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                    <span className="md:hidden text-gray-400 text-sm font-medium">Tarif estimé</span>
                    <div>
                        <div className="text-3xl font-serif font-bold text-[#0B1525]">{result.totalEuros.toFixed(2)}€</div>
                        <div className="text-xs font-medium text-[#D4AF37] mt-1">
                            {result.totalBons.toFixed(2)} Bons
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
