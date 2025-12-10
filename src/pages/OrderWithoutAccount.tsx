import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, Clock, User, Euro, AlertCircle, Loader2 } from "lucide-react";
import { geocoderAdresse } from "@/services/locationiq";
import { calculerToutesLesFormules, type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngineNew";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderSummary } from "@/components/orders/OrderSummary";

const OrderWithoutAccount = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState({
    // Sender info
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    pickupAddress: "",
    pickupDetails: "",
    // Recipient info
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    deliveryDetails: "",
    // Package info
    packageDescription: "",
    packageValue: "",
    formula: "NORMAL" as FormuleNew,
  });

  // États pour le calcul tarifaire
  const [pricingResults, setPricingResults] = useState<Record<FormuleNew, CalculTarifaireResult> | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [villeArrivee, setVilleArrivee] = useState<string>("");

  // Calculer le prix automatiquement quand l'adresse de livraison change
  useEffect(() => {
    const calculerPrix = async () => {
      if (!orderData.deliveryAddress || orderData.deliveryAddress.length < 10) {
        setPricingResults(null);
        setPricingError(null);
        setVilleArrivee("");
        return;
      }

      setIsCalculatingPrice(true);
      setPricingError(null);

      try {
        // 1. Géocoder l'adresse pour extraire la ville
        const geocodingResult = await geocoderAdresse(orderData.deliveryAddress);
        setVilleArrivee(geocodingResult.ville);

        // 2. Charger la configuration de pricing
        const config = await loadPricingConfigCached();

        // 3. Calculer les prix pour les 3 formules (distance par défaut 0)
        const results = calculerToutesLesFormules("Paris", geocodingResult.ville, 0, config);
        setPricingResults(results);
      } catch (error) {
        if (error instanceof Error) {
          setPricingError(error.message);
        } else {
          setPricingError("Erreur lors du calcul du prix");
        }
        setPricingResults(null);
        setVilleArrivee("");
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(calculerPrix, 1000);
    return () => clearTimeout(timeoutId);
  }, [orderData.deliveryAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pricingResults) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse de livraison valide pour calculer le prix.",
        variant: "destructive",
      });
      return;
    }

    const selectedPrice = pricingResults[orderData.formula];

    // Afficher un loader
    toast({
      title: "Création en cours...",
      description: "Votre commande est en cours de création, veuillez patienter.",
    });

    try {
      // Importer dynamiquement le service
      const { createGuestOrder } = await import('@/services/guestOrderService');

      // Créer la commande
      const response = await createGuestOrder({
        senderName: orderData.senderName,
        senderEmail: orderData.senderEmail,
        senderPhone: orderData.senderPhone,
        pickupAddress: orderData.pickupAddress,
        pickupDetails: orderData.pickupDetails,
        recipientName: orderData.recipientName,
        recipientPhone: orderData.recipientPhone,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDetails: orderData.deliveryDetails,
        packageDescription: orderData.packageDescription,
        packageValue: orderData.packageValue,
        formula: orderData.formula,
        pricingResult: selectedPrice,
        villeArrivee: villeArrivee,
      });

      if (response.success && response.reference) {
        toast({
          title: "Commande créée avec succès !",
          description: `Votre numéro de commande est ${response.reference}. Prix : ${selectedPrice.totalEuros.toFixed(2)}€ (${selectedPrice.totalBons.toFixed(2)} bons). Vous recevrez un email de confirmation à ${orderData.senderEmail}.`,
        });

        // Réinitialiser le formulaire
        setOrderData({
          senderName: "",
          senderPhone: "",
          senderEmail: "",
          pickupAddress: "",
          pickupDetails: "",
          recipientName: "",
          recipientPhone: "",
          deliveryAddress: "",
          deliveryDetails: "",
          packageDescription: "",
          packageValue: "",
          formula: "NORMAL",
        });
        setPricingResults(null);
        setVilleArrivee("");
        setStep(1);

      } else {
        throw new Error(response.error || response.message || "Erreur lors de la création de la commande");
      }

    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-primary mb-4">
              Commander sans compte
            </h1>
            <p className="text-muted-foreground">
              Créez votre commande en quelques minutes
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 gap-4">
            {[
              { num: 1, label: "Expéditeur", icon: User },
              { num: 2, label: "Destinataire", icon: MapPin },
              { num: 3, label: "Colis", icon: Package },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s.num
                    ? "bg-gradient-hero text-white"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className={`text-sm ${step >= s.num ? "font-semibold" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {s.num < 3 && (
                  <div className={`w-8 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-8 shadow-soft border-0">
              {/* Step 1: Sender Info */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-display font-bold text-primary mb-6">
                    Informations expéditeur
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet *</label>
                      <Input
                        value={orderData.senderName}
                        onChange={(e) =>
                          setOrderData({ ...orderData, senderName: e.target.value })
                        }
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone *</label>
                      <Input
                        type="tel"
                        value={orderData.senderPhone}
                        onChange={(e) =>
                          setOrderData({ ...orderData, senderPhone: e.target.value })
                        }
                        placeholder="06 12 34 56 78"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      value={orderData.senderEmail}
                      onChange={(e) =>
                        setOrderData({ ...orderData, senderEmail: e.target.value })
                      }
                      placeholder="jean.dupont@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Adresse de récupération *
                    </label>
                    <Input
                      value={orderData.pickupAddress}
                      onChange={(e) =>
                        setOrderData({ ...orderData, pickupAddress: e.target.value })
                      }
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Détails supplémentaires
                    </label>
                    <Textarea
                      value={orderData.pickupDetails}
                      onChange={(e) =>
                        setOrderData({ ...orderData, pickupDetails: e.target.value })
                      }
                      placeholder="Code d'accès, étage, instructions..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Recipient Info */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-display font-bold text-primary mb-6">
                    Informations destinataire
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom complet *</label>
                      <Input
                        value={orderData.recipientName}
                        onChange={(e) =>
                          setOrderData({ ...orderData, recipientName: e.target.value })
                        }
                        placeholder="Marie Martin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Téléphone *</label>
                      <Input
                        type="tel"
                        value={orderData.recipientPhone}
                        onChange={(e) =>
                          setOrderData({ ...orderData, recipientPhone: e.target.value })
                        }
                        placeholder="06 98 76 54 32"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Adresse de livraison *
                    </label>
                    <Input
                      value={orderData.deliveryAddress}
                      onChange={(e) =>
                        setOrderData({ ...orderData, deliveryAddress: e.target.value })
                      }
                      placeholder="456 Avenue Victor Hugo, 92100 Boulogne"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Détails supplémentaires
                    </label>
                    <Textarea
                      value={orderData.deliveryDetails}
                      onChange={(e) =>
                        setOrderData({ ...orderData, deliveryDetails: e.target.value })
                      }
                      placeholder="Code d'accès, étage, instructions..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Package Info */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  <h2 className="text-2xl font-display font-bold text-primary mb-6">
                    Informations colis
                  </h2>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description du colis *
                    </label>
                    <Textarea
                      value={orderData.packageDescription}
                      onChange={(e) =>
                        setOrderData({ ...orderData, packageDescription: e.target.value })
                      }
                      placeholder="Documents confidentiels, médicaments, etc."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valeur déclarée (€)
                    </label>
                    <Input
                      type="number"
                      value={orderData.packageValue}
                      onChange={(e) =>
                        setOrderData({ ...orderData, packageValue: e.target.value })
                      }
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Assurance incluse jusqu'à 500€
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-4">
                      Formule de livraison *
                    </label>

                    {/* Indicateur de chargement */}
                    {isCalculatingPrice && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Calcul du prix en cours...</span>
                      </div>
                    )}

                    {/* Erreur de tarification */}
                    {pricingError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{pricingError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Affichage de la ville détectée */}
                    {villeArrivee && !pricingError && (
                      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">Ville d'arrivée détectée :</span>
                          <span className="text-primary font-semibold">{villeArrivee}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        {
                          value: "NORMAL" as FormuleNew,
                          label: "Standard",
                          icon: Clock,
                          description: "Livraison économique"
                        },
                        {
                          value: "EXPRESS" as FormuleNew,
                          label: "Express",
                          icon: Clock,
                          description: "Livraison rapide"
                        },
                        {
                          value: "URGENCE" as FormuleNew,
                          label: "Flash Express",
                          icon: Clock,
                          description: "Livraison ultra-rapide"
                        },
                      ].map((formula) => {
                        const pricing = pricingResults?.[formula.value];
                        const isDisabled = !pricingResults || !!pricingError;

                        return (
                          <label
                            key={formula.value}
                            className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${orderData.formula === formula.value
                              ? "border-primary bg-primary/5 shadow-md"
                              : isDisabled
                                ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                                : "border-border hover:border-primary/50 hover:shadow-sm"
                              }`}
                          >
                            <input
                              type="radio"
                              name="formula"
                              value={formula.value}
                              checked={orderData.formula === formula.value}
                              onChange={() =>
                                setOrderData({ ...orderData, formula: formula.value })
                              }
                              disabled={isDisabled}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <formula.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                              <p className="font-semibold mb-1">{formula.label}</p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {formula.description}
                              </p>

                              {pricing ? (
                                <>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    2h à 4h
                                  </p>
                                  <div className="mt-2 pt-2 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {pricing.totalBons.toFixed(2)} bons × 5.50€
                                    </p>
                                    <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                                      <Euro className="h-5 w-5" />
                                      {pricing.totalEuros.toFixed(2)}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-2">
                                  Entrez une adresse
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Récapitulatif de la commande - Affiché dès qu'une formule est sélectionnée */}
              {step === 3 && pricingResults && orderData.formula && (
                <div className="mt-8 animate-fade-in-up">
                  <OrderSummary
                    pickupAddress={orderData.pickupAddress}
                    deliveryAddress={orderData.deliveryAddress}
                    senderName={orderData.senderName}
                    senderPhone={orderData.senderPhone}
                    recipientName={orderData.recipientName}
                    recipientPhone={orderData.recipientPhone}
                    packageDescription={orderData.packageDescription}
                    packageValue={orderData.packageValue}
                    pricingResult={pricingResults[orderData.formula]}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Retour
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    variant="cta"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button type="submit" variant="cta" className="ml-auto">
                    Valider la commande
                  </Button>
                )}
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderWithoutAccount;
