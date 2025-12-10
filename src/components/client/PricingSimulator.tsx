import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    calculerToutesLesFormules,
    PRISES_EN_CHARGE,
    DEFAULT_PRIX_BON,
    type FormuleNew,
    type CalculTarifaireResult
} from "@/utils/pricingEngine";
import { MapPin, ArrowRight, Calculator, Info } from "lucide-react";

const PricingSimulator = () => {
    // Get list of cities from the pricing engine
    const cities = Object.keys(PRISES_EN_CHARGE).sort();

    const [villeDepart, setVilleDepart] = useState<string>("");
    const [villeArrivee, setVilleArrivee] = useState<string>("");
    const [distance, setDistance] = useState([10]); // Default 10km
    const [results, setResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);

    const handleCalculate = () => {
        if (!villeDepart || !villeArrivee) return;

        try {
            const res = calculerToutesLesFormules(
                villeDepart,
                villeArrivee,
                distance[0] * 1000 // Convert km to meters
            );
            setResults(res);
        } catch (error) {
            console.error("Erreur de calcul:", error);
        }
    };

    // Auto-calculate when inputs change
    useEffect(() => {
        if (villeDepart && villeArrivee) {
            handleCalculate();
        }
    }, [villeDepart, villeArrivee, distance]);

    const formatPrice = (price: number) => price.toFixed(2);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Controls */}
                <Card className="lg:col-span-5 p-6 shadow-soft border-0 h-fit">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-display font-bold text-primary flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-cta" />
                                Simulateur
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Estimez le coût en Bons et en Euros.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ville de départ</Label>
                                <Select onValueChange={setVilleDepart} value={villeDepart}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une ville" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {cities.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Ville d'arrivée</Label>
                                <Select onValueChange={setVilleArrivee} value={villeArrivee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une ville" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {cities.map((city) => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between">
                                    <Label>Distance estimée</Label>
                                    <span className="font-bold text-primary">{distance[0]} km</span>
                                </div>
                                <Slider
                                    value={distance}
                                    onValueChange={setDistance}
                                    max={100}
                                    min={1}
                                    step={1}
                                    className="py-2"
                                />
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Info className="w-3 h-3" />
                                    La distance réelle sera calculée lors de la commande.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Results */}
                <div className="lg:col-span-7 space-y-6">
                    {!results ? (
                        <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center h-full min-h-[300px] bg-muted/30">
                            <MapPin className="w-12 h-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">
                                Sélectionnez votre trajet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-xs mt-2">
                                Choisissez les villes de départ et d'arrivée pour voir les tarifs détaillés.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {/* Explanation Banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex gap-3">
                                <Info className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold mb-1">Comment est calculé ce prix ?</p>
                                    <ul className="list-disc list-inside space-y-1 opacity-90">
                                        <li>Prise en charge : <strong>{results.NORMAL.priseEnCharge} Bons</strong> (Max des 2 villes)</li>
                                        {results.NORMAL.supplementApplique ? (
                                            <li>Supplément distance : <strong>{results.NORMAL.supplement} Bons</strong> (Banlieue à Banlieue)</li>
                                        ) : (
                                            <li>Supplément distance : <strong>0 Bon</strong> (Paris inclus ✅)</li>
                                        )}
                                        <li>Valeur du Bon : <strong>{DEFAULT_PRIX_BON}€</strong></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {/* Standard / Normal */}
                                <PricingCard
                                    title="Standard"
                                    result={results.NORMAL}
                                    color="bg-primary"
                                    textColor="text-primary"
                                    delay="4h"
                                />
                                {/* Express */}
                                <PricingCard
                                    title="Express"
                                    result={results.EXPRESS}
                                    color="bg-accent-main"
                                    textColor="text-accent-main"
                                    delay="2h"
                                    popular
                                />
                                {/* Urgence */}
                                <PricingCard
                                    title="Urgence"
                                    result={results.URGENCE}
                                    color="bg-cta"
                                    textColor="text-cta"
                                    delay="45min"
                                />
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
    color,
    textColor,
    delay,
    popular
}: {
    title: string,
    result: CalculTarifaireResult,
    color: string,
    textColor: string,
    delay: string,
    popular?: boolean
}) => {
    return (
        <Card className={`relative p-4 flex items-center justify-between transition-all hover:shadow-md ${popular ? 'border-2 border-accent-main shadow-md' : 'border border-border'}`}>
            {popular && (
                <span className="absolute -top-3 left-4 bg-accent-main text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommandé
                </span>
            )}
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
                    <span className={`font-bold ${textColor}`}>{title[0]}</span>
                </div>
                <div>
                    <h4 className="font-bold text-lg">{title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Délai moyen : {delay}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-primary">{result.totalEuros.toFixed(2)}€</div>
                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
                    {result.totalBons.toFixed(2)} Bons
                </div>
            </div>
        </Card>
    );
};

export default PricingSimulator;
