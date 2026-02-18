import { Card } from "@/components/ui/card";
import { ForecastStats } from "./types";
import { TrendingUp, ArrowRight } from "lucide-react";

interface ForecastsProps {
    data: ForecastStats;
}

export const Forecasts = ({ data }: ForecastsProps) => {
    return (
        <Card className="p-6 shadow-soft border-0 bg-gradient-to-br from-primary/5 to-accent-light/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-primary">
                    Prévisions du mois prochain
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                    <span>Basé sur la tendance des 3 derniers mois</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold text-primary">{data.revenue.toLocaleString()}€</p>
                    <div className="flex items-center text-xs text-success">
                        <ArrowRight className="h-3 w-3 mr-1 rotate-[-45deg]" />
                        +{data.growth}% vs ce mois
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Volume commandes</p>
                    <p className="text-2xl font-bold text-primary">{data.orders}</p>
                    <div className="flex items-center text-xs text-success">
                        <ArrowRight className="h-3 w-3 mr-1 rotate-[-45deg]" />
                        Tendance haussière
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                    <p className="text-2xl font-bold text-primary">+{data.newClients}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                        Estimation conservatrice
                    </div>
                </div>

                <div className="h-16 flex items-end gap-1">
                    {/* Mini trend chart visualization */}
                    {[40, 55, 45, 60, 75, 65, 80].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-accent-main/20 rounded-t-sm hover:bg-accent-main/40 transition-colors"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
};
