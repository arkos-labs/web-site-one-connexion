/**
 * SIMULATEUR DE PRIX AMÉLIORÉ - PAGE D'ACCUEIL
 * Permet aux visiteurs de simuler le prix d'une course avec sélection de formule
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Calculator,
    ArrowRight,
    Loader2,
    AlertCircle,
    Euro,
    Clock,
    CheckCircle2
} from "lucide-react";
import { geocoderAdresse } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { useNavigate } from "react-router-dom";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import type { AddressSuggestion } from "@/lib/autocomplete";

export function PriceSimulator() {
    const navigate = useNavigate();
    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupCity, setPickupCity] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [selectedFormula, setSelectedFormula] = useState<FormuleNew | null>(null);
    const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [villeArrivee, setVilleArrivee] = useState<string>("");

    // Calculer le prix automatiquement
    useEffect(() => {
        const calculer = async () => {
            if (!deliveryAddress || deliveryAddress.length < 10) {
                setPricingResults(null);
                setError(null);
                setVilleArrivee("");
                setSelectedFormula(null);
                return;
            }

            // Vérifier si on a une ville de départ
            if (!pickupCity) {
                return;
            }

            setIsCalculating(true);
            setError(null);

            try {
                // Si on a déjà deliveryCity (via autocomplete), on l'utilise
                // Sinon on géocode (cas saisie manuelle)
                let villeDest = deliveryCity;
                if (!villeDest) {
                    const geocodingResult = await geocoderAdresse(deliveryAddress);
                    villeDest = geocodingResult.ville;
                }

                setVilleArrivee(villeDest);
                // Charger la configuration de pricing depuis la base de données
                const config = await loadPricingConfigCached();
                const results = await calculerToutesLesFormulesAsync(pickupCity, villeDest, 0, config);
                setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Erreur lors du calcul du prix");
                }
                setPricingResults(null);
                setVilleArrivee("");
                setSelectedFormula(null);
            } finally {
                setIsCalculating(false);
            }
        };

        const timeoutId = setTimeout(calculer, 1000);
        return () => clearTimeout(timeoutId);
    }, [deliveryAddress, deliveryCity, pickupCity]);

    const handleFormulaSelect = (formule: FormuleNew) => {
        setSelectedFormula(formule);
    };

    const handleOrderNow = () => {
        navigate("/order-without-account");
    };

    return (
        <div className="space-y-8">
            <Card className="p-8 shadow-xl border-2 border-primary/10">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero mb-4">
                        <Calculator className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-primary mb-2">
                        Simulateur de prix
                    </h2>
                    <p className="text-muted-foreground">
                        Calculez instantanément le prix de votre course
                    </p>
                </div>

                {/* Formulaire */}
                <div className="space-y-6">
                    {/* Adresse d'enlèvement */}
                    <div>
                        <AddressAutocomplete
                            value={pickupAddress}
                            onChange={setPickupAddress}
                            onAddressSelect={(suggestion) => {
                                const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                setPickupAddress(fullAddress);
                                setPickupCity(suggestion.city);
                            }}
                            label="Adresse d'enlèvement"
                            placeholder="Ex: 10 Rue de la Paix, 75001 Paris"
                        />
                    </div>

                    {/* Adresse de livraison */}
                    <div>
                        <AddressAutocomplete
                            value={deliveryAddress}
                            onChange={setDeliveryAddress}
                            onAddressSelect={async (suggestion) => {
                                const fullAddress = `${suggestion.street}, ${suggestion.postcode} ${suggestion.city}`;
                                setDeliveryAddress(fullAddress);
                                setDeliveryCity(suggestion.city);

                                // Calculer automatiquement le prix
                                if (suggestion.city && pickupCity) {
                                    setIsCalculating(true);
                                    setError(null);
                                    try {
                                        setVilleArrivee(suggestion.city);
                                        // Charger la configuration de pricing depuis la base de données
                                        const config = await loadPricingConfigCached();
                                        const results = await calculerToutesLesFormulesAsync(pickupCity, suggestion.city, 0, config);
                                        setPricingResults(results as Record<FormuleNew, CalculTarifaireResult>);
                                    } catch (err) {
                                        if (err instanceof Error) {
                                            setError(err.message);
                                        } else {
                                            setError("Erreur lors du calcul du prix");
                                        }
                                        setPricingResults(null);
                                        setVilleArrivee("");
                                        setSelectedFormula(null);
                                    } finally {
                                        setIsCalculating(false);
                                    }
                                }
                            }}
                            label="Adresse de livraison"
                            placeholder="Ex: 456 Avenue Victor Hugo, 92100 Boulogne-Billancourt"
                            required
                        />
                    </div>

                    {/* Indicateur de chargement */}
                    {isCalculating && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Calcul du prix en cours...</span>
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Ville détectée */}
                    {villeArrivee && !error && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Ville d'arrivée détectée :</span>
                                <Badge variant="default" className="text-sm">
                                    {villeArrivee}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Résultats - Sélection de formule */}
                    {pricingResults && !error && (
                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-semibold text-center mb-4">
                                Choisissez votre formule
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4">
                                {(Object.entries(pricingResults) as [FormuleNew, CalculTarifaireResult][]).map(([formule, pricing]) => (
                                    <Card
                                        key={formule}
                                        onClick={() => handleFormulaSelect(formule)}
                                        className={`p-6 transition-all cursor-pointer border-2 ${selectedFormula === formule
                                            ? "border-primary bg-primary/5 shadow-lg scale-105"
                                            : "border-border hover:border-primary/50 hover:shadow-md"
                                            }`}
                                    >
                                        <div className="text-center space-y-4">
                                            {/* Badge de sélection */}
                                            {selectedFormula === formule && (
                                                <div className="flex justify-center">
                                                    <Badge variant="default" className="gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Sélectionné
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Nom de la formule */}
                                            <div>
                                                <h4 className="text-xl font-bold text-primary mb-1">
                                                    {pricing.formule}
                                                </h4>
                                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>2h à 4h</span>
                                                </div>
                                            </div>

                                            {/* Prix */}
                                            <div className="py-4 border-y border-border">
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    {pricing.totalBons.toFixed(2)} bons × 5.50€
                                                </div>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Euro className="h-6 w-6 text-primary" />
                                                    <span className="text-4xl font-bold text-primary">
                                                        {pricing.totalEuros.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Caractéristiques */}
                                            <div className="text-xs text-left space-y-1 text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    <span>Suivi temps réel</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    <span>Assurance incluse</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    <span>Notifications SMS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message initial */}
                    {!pricingResults && !isCalculating && !error && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">
                                Entrez une adresse de livraison pour voir les tarifs
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Récapitulatif - Affiché quand une formule est sélectionnée */}
            {selectedFormula && pricingResults && pickupAddress && deliveryAddress && (
                <div className="animate-fade-in-up">
                    <OrderSummary
                        pickupAddress={pickupAddress}
                        deliveryAddress={deliveryAddress}
                        pricingResult={pricingResults[selectedFormula]}
                    />

                    {/* CTA */}
                    <div className="text-center mt-6">
                        <Button
                            size="lg"
                            variant="cta"
                            onClick={handleOrderNow}
                            className="gap-2"
                        >
                            Commander maintenant
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                            Aucun compte requis • Paiement sécurisé • Confirmation immédiate
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PriceSimulator;
