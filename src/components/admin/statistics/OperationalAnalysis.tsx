import { Card } from "@/components/ui/card";
import { OperationalStats } from "./types";
import {
    MapPin,
    Clock,
    TrendingUp,
    Euro,
    CheckCircle,
    PieChart,
    User,
    Fuel,
    AlertTriangle
} from "lucide-react";

interface OperationalAnalysisProps {
    data: OperationalStats;
}

export const OperationalAnalysis = ({ data }: OperationalAnalysisProps) => {
    const metrics = [
        { label: "Distance totale", value: `${data.totalDistance} km`, icon: MapPin, color: "text-primary" },
        { label: "Durée moyenne", value: `${data.avgDuration} min`, icon: Clock, color: "text-info" },
        { label: "Pic d'activité", value: data.peakHour, icon: TrendingUp, color: "text-warning" },
        { label: "Rev. moyen/course", value: `${data.avgRevenue}€`, icon: Euro, color: "text-success" },
        { label: "Taux de succès", value: `${data.successRate}%`, icon: CheckCircle, color: "text-success" },
        { label: "Marge estimée", value: `${data.estMargin}%`, icon: PieChart, color: "text-accent-main" },
        { label: "Coût chauffeur", value: `${data.driverCost}€`, icon: User, color: "text-muted-foreground" },
        { label: "Coût carburant", value: `${data.fuelCost}€`, icon: Fuel, color: "text-muted-foreground" },
        { label: "Incidents", value: data.incidents.toString(), icon: AlertTriangle, color: "text-destructive" },
    ];

    return (
        <Card className="p-6 shadow-soft border-0">
            <h2 className="text-xl font-display font-bold text-primary mb-6">
                Analyse opérationnelle
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {metrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {metric.label}
                            </span>
                        </div>
                        <p className="text-xl font-bold text-primary">{metric.value}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};
