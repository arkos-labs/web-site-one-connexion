/**
 * COMPOSANT DE RÉCAPITULATIF DE COMMANDE
 * Affiche un résumé professionnel de la commande avec le prix calculé
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Package,
    Clock,
    Euro,
    User,
    Phone,
    Calendar,
    CheckCircle2
} from "lucide-react";
import type { CalculTarifaireResult } from "@/utils/pricingEngine";

interface OrderSummaryProps {
    // Adresses
    pickupAddress: string;
    deliveryAddress: string;

    // Contact
    senderName?: string;
    senderPhone?: string;
    recipientName?: string;
    recipientPhone?: string;

    // Colis
    packageDescription?: string;
    packageValue?: string;

    // Tarification
    pricingResult: CalculTarifaireResult | null;

    // Date/heure
    pickupDate?: string;
    pickupTime?: string;

    // Style
    className?: string;
}

export function OrderSummary({
    pickupAddress,
    deliveryAddress,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone,
    packageDescription,
    packageValue,
    pricingResult,
    pickupDate,
    pickupTime,
    className = ""
}: OrderSummaryProps) {

    if (!pricingResult) {
        return null;
    }

    return (
        <Card className={`p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background ${className}`}>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-display font-bold text-primary">
                        Récapitulatif de la commande
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Vérifiez les informations avant de valider
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    {pricingResult.formule}
                </Badge>
            </div>

            <Separator className="mb-6" />

            {/* Itinéraire */}
            <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-green-500/10">
                        <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Adresse d'enlèvement
                        </p>
                        <p className="text-base font-semibold mt-1">{pickupAddress}</p>
                        {senderName && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{senderName}</span>
                                {senderPhone && (
                                    <>
                                        <Phone className="h-4 w-4 ml-2" />
                                        <span>{senderPhone}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-5">
                    <div className="h-12 w-0.5 bg-gradient-to-b from-green-500 to-blue-500" />
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-blue-500/10">
                        <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Adresse de livraison
                        </p>
                        <p className="text-base font-semibold mt-1">{deliveryAddress}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                                {pricingResult.villeArrivee}
                            </Badge>
                        </div>
                        {recipientName && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{recipientName}</span>
                                {recipientPhone && (
                                    <>
                                        <Phone className="h-4 w-4 ml-2" />
                                        <span>{recipientPhone}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="mb-6" />

            {/* Informations colis */}
            {(packageDescription || packageValue) && (
                <>
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>Informations colis</span>
                        </div>
                        {packageDescription && (
                            <p className="text-sm pl-6">{packageDescription}</p>
                        )}
                        {packageValue && (
                            <p className="text-sm pl-6 text-muted-foreground">
                                Valeur déclarée : {packageValue}€
                            </p>
                        )}
                    </div>
                    <Separator className="mb-6" />
                </>
            )}

            {/* Date et heure */}
            {(pickupDate || pickupTime) && (
                <>
                    <div className="flex items-center gap-4 mb-6">
                        {pickupDate && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{pickupDate}</span>
                            </div>
                        )}
                        {pickupTime && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{pickupTime}</span>
                            </div>
                        )}
                    </div>
                    <Separator className="mb-6" />
                </>
            )}

            {/* Détails tarifaires */}
            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Euro className="h-4 w-4" />
                    <span>Détails tarifaires</span>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {/* Formule */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Formule</span>
                        <span className="font-semibold">{pricingResult.formule}</span>
                    </div>

                    {/* Délai */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Délai estimé</span>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">2h à 4h</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Calcul */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prise en charge</span>
                        <span className="font-medium">{pricingResult.priseEnCharge} bons</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Supplément kilométrique</span>
                        <span className={`font-medium ${pricingResult.supplement > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {pricingResult.supplement > 0 ? '+' : ''}{pricingResult.supplement.toFixed(2)} bons
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix unitaire</span>
                        <span className="font-medium">5.50€</span>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-base font-semibold">Prix total</span>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-primary">
                                {pricingResult.totalEuros.toFixed(2)}€
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Garanties */}
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                            Garanties incluses
                        </p>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                            <li>✓ Suivi en temps réel</li>
                            <li>✓ Notifications SMS + Email</li>
                            <li>✓ Assurance incluse</li>
                            <li>✓ Support client dédié</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default OrderSummary;
