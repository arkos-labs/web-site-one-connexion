import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Package, MapPin, Clock, User, Euro, AlertCircle, Loader2, Calendar } from "lucide-react";
import { geocoderAdresse } from "@/services/locationiq";
import { type FormuleNew, type CalculTarifaireResult } from "@/utils/pricingEngine";
import { calculerToutesLesFormulesAsync } from "@/utils/pricingEngineDb";
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { supabase } from "@/lib/supabase";

const OrderWithoutAccount = () => {

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
    formula: null as FormuleNew | null,
    // Schedule info
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    pickupDate: "",
    pickupTime: "",
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
        const results = await calculerToutesLesFormulesAsync("Paris", geocodingResult.ville, 0, config);
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
      toast.error("Erreur", {
        description: "Veuillez entrer une adresse de livraison valide pour calculer le prix.",
      });
      return;
    }

    // Validation des créneaux horaires
    if (orderData.scheduleType === 'scheduled' && (!orderData.pickupDate || !orderData.pickupTime)) {
      toast.error("Erreur", {
        description: "Veuillez choisir une date et une heure pour l'enlèvement.",
      });
      return;
    }

    const selectedPrice = pricingResults[orderData.formula];

    // Vérifier si l'email correspond à un client suspendu
    try {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id, status, is_suspended, suspension_reason')
        .eq('email', orderData.senderEmail)
        .single();

      if (existingClient && (existingClient.status === 'suspended' || existingClient.is_suspended)) {
        toast.error("Impossible de créer la commande", {
          description: `Ce compte client est suspendu. Raison : ${existingClient.suspension_reason || 'Non spécifiée'}.`,
        });
        return;
      }
    } catch (e) {
      // Ignore error if client not found
    }

    // Afficher un loader
    toast.info("Création en cours...", {
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
        toast.success("Commande créée avec succès !", {
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
          formula: null,
          scheduleType: 'immediate',
          pickupDate: "",
          pickupTime: "",
        });
        setPricingResults(null);
        setVilleArrivee("");
        setStep(1);

      } else {
        throw new Error(response.error || response.message || "Erreur lors de la création de la commande");
      }

    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la commande. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden my-10">

        {/* EN-TÊTE (Header) */}
        <div className="border-b border-gray-100 p-6 bg-white">
          <h1 className="text-2xl font-bold text-slate-900 font-serif">Commande Express</h1>
          <p className="text-sm text-slate-500 mt-1">Commandez sans créer de compte en 2 minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50/50 border-b border-gray-100 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Expéditeur", icon: User },
              { num: 2, label: "Destinataire", icon: MapPin },
              { num: 3, label: "Colis", icon: Package },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${step >= s.num
                    ? "bg-[#D4AF37] text-white"
                    : "bg-gray-100 text-gray-400"
                    }`}
                >
                  <s.icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${step >= s.num ? "font-bold text-slate-900" : "text-gray-500"}`}>
                  {s.label}
                </span>
                {s.num < 3 && (
                  <div className={`w-8 h-0.5 ${step > s.num ? "bg-[#D4AF37]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>

            {/* Step 1: Sender Info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-serif">
                  <User className="h-5 w-5 text-[#D4AF37]" />
                  Informations expéditeur
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet *</label>
                    <Input
                      value={orderData.senderName}
                      onChange={(e) =>
                        setOrderData({ ...orderData, senderName: e.target.value })
                      }
                      placeholder="Jean Dupont"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone *</label>
                    <Input
                      type="tel"
                      value={orderData.senderPhone}
                      onChange={(e) =>
                        setOrderData({ ...orderData, senderPhone: e.target.value })
                      }
                      placeholder="06 12 34 56 78"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Email *</label>
                  <Input
                    type="email"
                    value={orderData.senderEmail}
                    onChange={(e) =>
                      setOrderData({ ...orderData, senderEmail: e.target.value })
                    }
                    placeholder="jean.dupont@example.com"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Adresse de récupération *
                  </label>
                  <Input
                    value={orderData.pickupAddress}
                    onChange={(e) =>
                      setOrderData({ ...orderData, pickupAddress: e.target.value })
                    }
                    placeholder="123 Rue de la Paix, 75001 Paris"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Détails supplémentaires
                  </label>
                  <Textarea
                    value={orderData.pickupDetails}
                    onChange={(e) =>
                      setOrderData({ ...orderData, pickupDetails: e.target.value })
                    }
                    placeholder="Code d'accès, étage, instructions..."
                    className="min-h-[80px] bg-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Recipient Info */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-serif">
                  <MapPin className="h-5 w-5 text-[#D4AF37]" />
                  Informations destinataire
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet *</label>
                    <Input
                      value={orderData.recipientName}
                      onChange={(e) =>
                        setOrderData({ ...orderData, recipientName: e.target.value })
                      }
                      placeholder="Marie Martin"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone *</label>
                    <Input
                      type="tel"
                      value={orderData.recipientPhone}
                      onChange={(e) =>
                        setOrderData({ ...orderData, recipientPhone: e.target.value })
                      }
                      placeholder="06 98 76 54 32"
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Adresse de livraison *
                  </label>
                  <Input
                    value={orderData.deliveryAddress}
                    onChange={(e) =>
                      setOrderData({ ...orderData, deliveryAddress: e.target.value })
                    }
                    placeholder="456 Avenue Victor Hugo, 92100 Boulogne"
                    required
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Détails supplémentaires
                  </label>
                  <Textarea
                    value={orderData.deliveryDetails}
                    onChange={(e) =>
                      setOrderData({ ...orderData, deliveryDetails: e.target.value })
                    }
                    placeholder="Code d'accès, étage, instructions..."
                    className="min-h-[80px] bg-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Package Info */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-serif">
                  <Package className="h-5 w-5 text-[#D4AF37]" />
                  Informations colis
                </h2>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Description du colis *
                  </label>
                  <Textarea
                    value={orderData.packageDescription}
                    onChange={(e) =>
                      setOrderData({ ...orderData, packageDescription: e.target.value })
                    }
                    placeholder="Documents confidentiels, médicaments, etc."
                    className="min-h-[100px] bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Valeur déclarée (€)
                  </label>
                  <Input
                    type="number"
                    value={orderData.packageValue}
                    onChange={(e) =>
                      setOrderData({ ...orderData, packageValue: e.target.value })
                    }
                    placeholder="100"
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Assurance incluse jusqu'à 500€
                  </p>
                </div>
                <div>
                  {/* SÉLECTION DU CRÉNEAU (NOUVEAU) */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Quand souhaitez-vous l'enlèvement ? *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 cursor-pointer p-3 border rounded-xl transition-all flex items-center gap-3 ${orderData.scheduleType === 'immediate' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="scheduleType"
                          value="immediate"
                          checked={orderData.scheduleType === 'immediate'}
                          onChange={() => {
                            setOrderData({ ...orderData, scheduleType: 'immediate', formula: orderData.formula === 'NORMAL' ? null : orderData.formula });
                          }}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Dès que possible</p>
                          <p className="text-xs text-muted-foreground">Enlèvement immédiat</p>
                        </div>
                      </label>

                      <label className={`flex-1 cursor-pointer p-3 border rounded-xl transition-all flex items-center gap-3 ${orderData.scheduleType === 'scheduled' ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="scheduleType"
                          value="scheduled"
                          checked={orderData.scheduleType === 'scheduled'}
                          onChange={() => setOrderData({ ...orderData, scheduleType: 'scheduled' })}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">Programmé</p>
                          <p className="text-xs text-muted-foreground">Choisir date & heure</p>
                        </div>
                      </label>
                    </div>

                    {/* Champs Date & Heure si Programmé */}
                    {orderData.scheduleType === 'scheduled' && (
                      <div className="mt-4 grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Date</label>
                          <Input
                            type="date"
                            value={orderData.pickupDate}
                            onChange={(e) => setOrderData({ ...orderData, pickupDate: e.target.value })}
                            className="bg-white"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">Heure</label>
                          <Input
                            type="time"
                            value={orderData.pickupTime}
                            onChange={(e) => setOrderData({ ...orderData, pickupTime: e.target.value })}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="block text-sm font-medium mb-4 text-gray-700">
                    Formule de livraison *
                  </label>

                  {/* Indicateur de chargement */}
                  {isCalculatingPrice && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
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
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Ville d'arrivée détectée :</span>
                        <span className="font-bold">{villeArrivee}</span>
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
                      const isSelected = orderData.formula === formula.value;

                      // Logique de désactivation
                      let isDisabled = !pricingResults || !!pricingError;
                      let disabledReason = "";

                      // Désactiver Standard si "Dès que possible"
                      if (formula.value === 'NORMAL' && orderData.scheduleType === 'immediate') {
                        isDisabled = true;
                        disabledReason = "Indisponible en immédiat";
                      }

                      return (
                        <label
                          key={formula.value}
                          className={`cursor-pointer relative p-4 border rounded-xl transition-all duration-200 ${isSelected
                            ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                            : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                            }`}
                        >
                          <input
                            type="radio"
                            name="formula"
                            value={formula.value}
                            checked={isSelected}
                            onChange={() =>
                              setOrderData({ ...orderData, formula: formula.value })
                            }
                            disabled={isDisabled}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center ${isSelected ? "bg-primary text-white" : isDisabled ? "bg-gray-200 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                              <formula.icon className="h-5 w-5" />
                            </div>
                            <p className={`font-semibold mb-1 ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{formula.label}</p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {formula.description}
                            </p>

                            {isDisabled && disabledReason && (
                              <div className="mt-2 pt-2 border-t border-gray-200/50">
                                <p className="text-xs font-medium text-red-500 flex items-center justify-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {disabledReason}
                                </p>
                              </div>
                            )}

                            {!isDisabled && pricing ? (
                              <div className="mt-2 pt-2 border-t border-gray-200/50">
                                <p className="text-xs text-muted-foreground mb-1">
                                  {pricing.totalBons.toFixed(2)} bons
                                </p>
                                <p className="text-xl font-bold text-primary flex items-center justify-center gap-0.5">
                                  {pricing.totalEuros.toFixed(2)} <span className="text-sm">€</span>
                                </p>
                              </div>
                            ) : !isDisabled && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                ...
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

            {/* Récapitulatif de la commande */}
            {step === 3 && pricingResults && orderData.formula && (
              <div className="mt-8 animate-fade-in bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
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
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </Button>
              ) : (
                <div></div> // Spacer
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8 shadow-md hover:shadow-lg transition-all"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8 font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={!orderData.formula}
                >
                  Valider et Payer
                </Button>
              )}
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default OrderWithoutAccount;
