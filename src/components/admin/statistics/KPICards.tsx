import { Card } from "@/components/ui/card";
import { Euro, Package, TrendingUp, Users } from "lucide-react";
import { KPIData } from "./types";
import { useNavigate } from "react-router-dom";

interface KPICardsProps {
    data: KPIData;
    onOpenRevenueDetails: () => void;
    onOpenGrowthDetails: () => void;
}

export const KPICards = ({ data, onOpenRevenueDetails, onOpenGrowthDetails }: KPICardsProps) => {
    const navigate = useNavigate();

    const cards = [
        {
            title: "Revenus du mois",
            value: `${data.revenue.total.toLocaleString()}€`,
            change: `${data.revenue.growth > 0 ? "+" : ""}${data.revenue.growth.toFixed(1)}%`,
            subtext: "vs période précédente",
            icon: Euro,
            color: "text-primary",
            bgColor: "bg-primary/10",
            onClick: onOpenRevenueDetails,
        },
        {
            title: "Commandes totales",
            value: data.orders.total.toString(),
            change: `${data.orders.growth > 0 ? "+" : ""}${data.orders.growth.toFixed(1)}%`,
            subtext: "variation",
            icon: Package,
            color: "text-success",
            bgColor: "bg-success-light",
            onClick: () => navigate("/dashboard-admin/commandes"),
        },
        {
            title: "Taux de croissance",
            value: `${data.growthRate.value > 0 ? "+" : ""}${data.growthRate.value.toFixed(1)}%`,
            change: `${data.growthRate.trend > 0 ? "+" : ""}${data.growthRate.trend.toFixed(1)} pts`,
            subtext: "tendance",
            icon: TrendingUp,
            color: "text-accent-main",
            bgColor: "bg-accent-light",
            onClick: onOpenGrowthDetails,
        },
        {
            title: "Nouveaux clients",
            value: data.newClients.total.toString(),
            change: `${data.newClients.growth > 0 ? "+" : ""}${data.newClients.growth.toFixed(1)}%`,
            subtext: "sur la période",
            icon: Users,
            color: "text-warning",
            bgColor: "bg-warning-light",
            onClick: () => navigate("/dashboard-admin/clients?filter=new"),
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    className="p-6 shadow-soft border-0 animate-fade-in-up cursor-pointer hover:shadow-medium transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={card.onClick}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                        <p className="text-3xl font-display font-bold text-primary mb-2">
                            {card.value}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${card.change.startsWith("+") ? "text-success" : "text-destructive"
                                }`}>
                                {card.change}
                            </span>
                            <span className="text-xs text-muted-foreground">{card.subtext}</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
