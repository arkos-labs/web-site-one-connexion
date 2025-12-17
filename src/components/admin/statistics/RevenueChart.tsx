import { Card } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
} from "recharts";
import { ChartData } from "./types";

interface RevenueChartProps {
    data: ChartData[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
    return (
        <Card className="p-6 shadow-soft border-0 min-h-[350px]">
            <h2 className="text-xl font-display font-bold text-primary mb-6">
                Évolution des revenus et commandes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0B2D55" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0B2D55" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}€`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6B7280"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenus"
                        stroke="#0B2D55"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        name="Commandes"
                        stroke="#FFCC00"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#FFCC00", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </Card>
    );
};
