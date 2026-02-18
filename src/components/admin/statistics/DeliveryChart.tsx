import { Card } from "@/components/ui/card";
import { DeliveryTypeStat } from "./types";
import { useNavigate } from "react-router-dom";

interface DeliveryChartProps {
    data: DeliveryTypeStat[];
}

export const DeliveryChart = ({ data }: DeliveryChartProps) => {
    const navigate = useNavigate();

    const handleClick = (type: string) => {
        navigate(`/admin/commandes?type=${encodeURIComponent(type)}`);
    };

    return (
        <Card className="p-6 shadow-soft border-0">
            <h2 className="text-xl font-display font-bold text-primary mb-6">
                Types de livraison
            </h2>
            <div className="space-y-6">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="cursor-pointer group"
                        onClick={() => handleClick(item.type)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-primary group-hover:text-accent-main transition-colors">
                                {item.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {item.count} commandes ({item.percentage}%)
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-hero h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

