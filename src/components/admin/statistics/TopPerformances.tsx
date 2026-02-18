import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopDriver, TopClient } from "./types";
import { Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopPerformancesProps {
    drivers: TopDriver[];
    clients: TopClient[];
}

export const TopPerformances = ({ drivers, clients }: TopPerformancesProps) => {
    const navigate = useNavigate();

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Drivers */}
            <Card className="p-6 shadow-soft border-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold text-primary">
                        Top Chauffeurs
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard-admin/chauffeurs")}>
                        Voir tout
                    </Button>
                </div>
                <div className="space-y-4">
                    {drivers.map((driver) => (
                        <div
                            key={driver.id}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/dashboard-admin/chauffeurs?id=${driver.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {driver.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-primary">{driver.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{driver.deliveries} courses</span>
                                        <span>•</span>
                                        <span>{driver.avgTime} moy.</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-warning mb-1">
                                    <span className="font-bold">{driver.rating}</span>
                                    <Star className="h-3 w-3 fill-current" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        driver.status === "available"
                                            ? "text-success border-success"
                                            : "text-warning border-warning"
                                    }
                                >
                                    {driver.status === "available" ? "Disponible" : "En course"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Top Clients */}
            <Card className="p-6 shadow-soft border-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold text-primary">
                        Top Clients
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard-admin/clients")}>
                        Voir tout
                    </Button>
                </div>
                <div className="space-y-4">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/dashboard-admin/clients?id=${client.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center font-bold text-accent-main">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-primary">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">{client.sector}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary">{client.revenue.toLocaleString()}€</p>
                                <div className="flex items-center justify-end gap-1 text-success text-xs">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>+{client.growth}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
