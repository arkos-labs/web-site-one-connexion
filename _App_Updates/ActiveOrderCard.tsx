import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation, Phone, MessageSquare, MapPin, Clock, CreditCard } from "lucide-react";
import { SlideToAction } from "./SlideToAction";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ActiveOrderCardProps {
    order: Order;
    onStatusChange: (status: Order['status']) => void;
    isPickupPhase: boolean;
}

export const ActiveOrderCard = ({ order, onStatusChange, isPickupPhase }: ActiveOrderCardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // ========================================
    // RÈGLE MÉTIER CRITIQUE : 40% pour le chauffeur
    // ========================================
    // Le prix stocké dans `order.price` est le prix TOTAL payé par le client (100%)
    // Le chauffeur reçoit UNIQUEMENT 40% de ce montant
    // Utilisation de toFixed(2) pour garantir 2 décimales (ex: 10.20€)
    const driverEarnings = (order.price * 0.40).toFixed(2);

    // Determine target location based on phase
    const targetLocation = isPickupPhase ? order.pickupLocation : order.dropoffLocation;
    const phaseTitle = isPickupPhase ? "Vers le point de retrait" : "Vers la destination";

    return (
        <Card className="fixed bottom-0 left-0 right-0 m-4 p-4 bg-white/95 backdrop-blur-md shadow-2xl border-0 rounded-2xl z-50 animate-in slide-in-from-bottom duration-300">
            {/* Header: Always visible */}
            <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-3 rounded-full",
                        isPickupPhase ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    )}>
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{phaseTitle}</h3>
                        <p className="text-slate-500 text-sm truncate max-w-[200px]">{targetLocation.address}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Votre Gain</p>
                    <p className="text-2xl font-black text-emerald-600">{driverEarnings} €</p>
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={cn(
                "space-y-4 overflow-hidden transition-all duration-300 ease-in-out",
                isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
            )}>
                {/* Client Info */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {order.clientName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{order.clientName}</p>
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                                <span>★ 4.9</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400">Client Premium</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Ride Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Temps estimé</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">12 min</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Navigation className="w-4 h-4" />
                            <span className="text-xs font-medium">Distance</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{order.distance}</p>
                    </div>
                </div>

                {/* Navigation Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-200" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLocation.address}`, '_blank')}>
                    <Navigation className="w-5 h-5 mr-2" />
                    Lancer la navigation
                </Button>
            </div>

            {/* Slide to Confirm - Always Visible */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <SlideToAction
                    label={isPickupPhase ? "Confirmer la Prise en charge" : "Terminer la Course"}
                    onComplete={() => onStatusChange(isPickupPhase ? "in_progress" : "completed")}
                    color={isPickupPhase ? "bg-blue-600" : "bg-green-600"}
                />
            </div>
        </Card>
    );
};
