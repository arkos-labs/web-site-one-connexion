import { Sector } from "@/config/sectors";

export type StatsPeriod =
    | "today"
    | "week"
    | "month"
    | "last_month"
    | "year"
    | "last_year"
    | "custom";

export interface KPIData {
    revenue: { total: number; growth: number; history: any[] };
    orders: { total: number; growth: number };
    growthRate: { value: number; trend: number };
    newClients: { total: number; growth: number };
}

export interface ChartData {
    date: string;
    revenue: number;
    orders: number;
}

export interface SectorStat {
    name: Sector | string;
    value: number; // orders count
    revenue: number;
    percentage: number;
    fill: string;
}

export interface DeliveryTypeStat {
    type: string;
    count: number;
    percentage: number;
}

export interface TopDriver {
    id: string;
    name: string;
    initials: string;
    deliveries: number;
    avgTime: string;
    rating: number;
    revenue: number;
    status: string;
}

export interface TopClient {
    id: string;
    name: string;
    sector: string;
    orders: number;
    revenue: number;
    growth: number;
}

export interface OperationalStats {
    totalDistance: number;
    avgDuration: number;
    peakHour: string;
    avgRevenue: number;
    successRate: number;
    estMargin: number;
    driverCost: number;
    fuelCost: number;
    incidents: number;
}

export interface ForecastStats {
    revenue: number;
    orders: number;
    growth: number;
    newClients: number;
}

export interface DashboardStats {
    kpi: KPIData;
    charts: {
        revenue: ChartData[];
        sectors: SectorStat[];
        deliveryTypes: DeliveryTypeStat[];
    };
    topPerformers: {
        drivers: TopDriver[];
        clients: TopClient[];
    };
    operational: OperationalStats;
    forecasts: ForecastStats;
}
