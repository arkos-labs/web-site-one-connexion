import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Calendar, Loader2, Euro, ShoppingCart, Users, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Statistics = () => {
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // State for stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrder, setAverageOrder] = useState("0.00");
  const [activeClients, setActiveClients] = useState(0);

  // State for charts
  const [chartData, setChartData] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

  useEffect(() => {
    fetchStats();
  }, [filterPeriod, startDate, endDate, sectorFilter]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      let start = new Date();
      let end = new Date();
      end.setHours(23, 59, 59, 999);

      // Determine date range
      switch (filterPeriod) {
        case 'day':
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          const day = start.getDay() || 7; // 1 (Mon) to 7 (Sun)
          start.setDate(start.getDate() - day + 1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'month':
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'year':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'all':
          start = new Date('2000-01-01');
          break;
        case 'custom':
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          break;
      }

      // Fetch Orders
      let query = supabase
        .from('orders')
        .select(`
          id,
          price,
          created_at,
          status,
          clients (
            id,
            company_name
          )
        `)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const { data: ordersData, error: ordersError } = await query;
      if (ordersError) throw ordersError;

      let filteredOrders = ordersData || [];

      // Note: Sector filtering would require adding 'sector' to clients table or fetching it differently.
      // Assuming 'sector' might not be available on all clients yet, we'll skip strict sector filtering for now
      // or implement it if the column exists. Based on previous files, 'sector' wasn't explicitly in Client interface.
      // We will simulate sector data for the chart if not available.

      // Calculate KPIs
      const revenue = filteredOrders.reduce((sum, o) => sum + (o.price || 0), 0);
      const ordersCount = filteredOrders.length;
      const avgOrder = ordersCount > 0 ? (revenue / ordersCount).toFixed(2) : "0.00";

      // Active clients in period
      const uniqueClientIds = new Set(filteredOrders.map((o: any) => o.clients?.id).filter(Boolean));
      const activeClientsCount = uniqueClientIds.size;

      setTotalRevenue(revenue);
      setTotalOrders(ordersCount);
      setAverageOrder(avgOrder);
      setActiveClients(activeClientsCount);

      // Prepare Chart Data
      const chartMap = new Map();

      filteredOrders.forEach((order: any) => {
        const date = new Date(order.created_at);
        let key = '';

        if (filterPeriod === 'day') {
          key = `${date.getHours().toString().padStart(2, '0')}:00`;
        } else if (filterPeriod === 'year') {
          key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        } else {
          key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }

        if (!chartMap.has(key)) {
          chartMap.set(key, { date: key, revenue: 0, orders: 0 });
        }
        const entry = chartMap.get(key);
        entry.revenue += (order.price || 0);
        entry.orders += 1;
      });

      // Sort chart data
      // For simplicity, we rely on the map insertion order which is roughly chronological if we process chronologically
      // But better to sort by date.
      const sortedChartData = Array.from(chartMap.values());

      setChartData(sortedChartData);

      setSectorData([]);

    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const labels: Record<string, string> = {
      day: "Aujourd'hui",
      week: "Cette semaine",
      month: "Ce mois-ci",
      year: "Cette année",
      all: "Tout l'historique",
      custom: `Du ${startDate} au ${endDate}`,
    };
    return labels[filterPeriod] || "Période sélectionnée";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistiques</h1>
        <p className="text-gray-500">Analyse des performances - {getPeriodLabel()}</p>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar size={18} />
            Filtrer par période
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Période</label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full bg-white hover:bg-gray-50 transition-colors">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois-ci</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Secteur</label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full bg-white hover:bg-gray-50 transition-colors">
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  <SelectItem value="Médical">Médical</SelectItem>
                  <SelectItem value="Juridique">Juridique</SelectItem>
                  <SelectItem value="Événementiel">Événementiel</SelectItem>
                  <SelectItem value="Automobile">Automobile</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filterPeriod === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date de début</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date de fin</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Chiffre d'Affaires</p>
              <p className="text-3xl font-bold text-blue-600">{totalRevenue.toFixed(2)} €</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Euro className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Commandes</p>
              <p className="text-3xl font-bold text-green-600">{totalOrders}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Package className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Clients Actifs</p>
              <p className="text-3xl font-bold text-purple-600">{activeClients}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Panier Moyen</p>
              <p className="text-3xl font-bold text-orange-600">{averageOrder} €</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-full">
              <ShoppingCart className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Évolution du CA - {getPeriodLabel()}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} €`, 'Revenu']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Chiffre d'affaires" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Distribution par secteur (Estimation)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {sectorData.length > 0 ? (
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Données de secteur non disponibles
              </div>
            )}
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Volume de Commandes - {getPeriodLabel()}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Nombre de commandes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
