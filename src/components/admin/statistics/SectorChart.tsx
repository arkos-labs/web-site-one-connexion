import { Card } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { SectorStat } from "./types";
import { useNavigate } from "react-router-dom";

interface SectorChartProps {
    data: SectorStat[];
}

export const SectorChart = ({ data }: SectorChartProps) => {
    const navigate = useNavigate();

    const handleBarClick = (data: { activePayload?: Array<{ payload: SectorStat }> }) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const sectorName = data.activePayload[0].payload.name;
            navigate(`/dashboard-admin/clients?sector=${encodeURIComponent(sectorName)}`);
        }
    };

    return (
        <Card className="p-6 shadow-soft border-0 min-h-[350px]">
            <h2 className="text-xl font-display font-bold text-primary mb-6">
                Répartition par secteur
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    onClick={handleBarClick}
                    className="cursor-pointer"
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            borderRadius: '8px'
                        }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};
