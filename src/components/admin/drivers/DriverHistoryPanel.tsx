import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface DriverHistoryPanelProps {
  driverId: number;
  driverName: string;
}

interface Delivery {
  id: number;
  date: string;
  destination: string;
  amount: number;
  status: string;
}

interface EarningsData {
  day: string;
  earnings: number;
}

const mockDeliveries: Record<number, Delivery[]> = {
  1: [
    { id: 1, date: "2025-11-28", destination: "Paris", amount: 45, status: "completed" },
    { id: 2, date: "2025-11-28", destination: "Lyon", amount: 60, status: "completed" },
    { id: 3, date: "2025-11-27", destination: "Marseille", amount: 55, status: "completed" },
    { id: 4, date: "2025-11-27", destination: "Toulouse", amount: 50, status: "completed" },
    { id: 5, date: "2025-11-26", destination: "Nice", amount: 65, status: "completed" },
  ],
  2: [
    { id: 6, date: "2025-11-28", destination: "Lille", amount: 50, status: "completed" },
    { id: 7, date: "2025-11-27", destination: "Bordeaux", amount: 55, status: "completed" },
    { id: 8, date: "2025-11-26", destination: "Nantes", amount: 48, status: "completed" },
  ],
  3: [
    { id: 9, date: "2025-11-28", destination: "Strasbourg", amount: 40, status: "completed" },
    { id: 10, date: "2025-11-27", destination: "Montpellier", amount: 52, status: "completed" },
    { id: 11, date: "2025-11-26", destination: "Grenoble", amount: 48, status: "completed" },
  ],
  4: [
    { id: 12, date: "2025-11-28", destination: "Rennes", amount: 55, status: "completed" },
    { id: 13, date: "2025-11-28", destination: "Rouen", amount: 60, status: "completed" },
    { id: 14, date: "2025-11-27", destination: "Le Havre", amount: 58, status: "completed" },
    { id: 15, date: "2025-11-27", destination: "Reims", amount: 52, status: "completed" },
  ],
};

const mockEarningsData: Record<number, EarningsData[]> = {
  1: [
    { day: "Lun", earnings: 250 },
    { day: "Mar", earnings: 320 },
    { day: "Mer", earnings: 280 },
    { day: "Jeu", earnings: 410 },
    { day: "Ven", earnings: 380 },
    { day: "Sam", earnings: 340 },
    { day: "Dim", earnings: 200 },
  ],
  2: [
    { day: "Lun", earnings: 200 },
    { day: "Mar", earnings: 280 },
    { day: "Mer", earnings: 250 },
    { day: "Jeu", earnings: 320 },
    { day: "Ven", earnings: 290 },
    { day: "Sam", earnings: 310 },
    { day: "Dim", earnings: 180 },
  ],
  3: [
    { day: "Lun", earnings: 180 },
    { day: "Mar", earnings: 220 },
    { day: "Mer", earnings: 200 },
    { day: "Jeu", earnings: 250 },
    { day: "Ven", earnings: 240 },
    { day: "Sam", earnings: 270 },
    { day: "Dim", earnings: 160 },
  ],
  4: [
    { day: "Lun", earnings: 280 },
    { day: "Mar", earnings: 340 },
    { day: "Mer", earnings: 310 },
    { day: "Jeu", earnings: 380 },
    { day: "Ven", earnings: 360 },
    { day: "Sam", earnings: 390 },
    { day: "Dim", earnings: 240 },
  ],
};

export function DriverHistoryPanel({ driverId, driverName }: DriverHistoryPanelProps) {
  const deliveries = mockDeliveries[driverId] || [];
  const earningsData = mockEarningsData[driverId] || [];
  const totalEarnings = deliveries.reduce((sum, d) => sum + d.amount, 0);
  const totalDeliveries = deliveries.length;
  const averageEarnings = totalDeliveries > 0 ? (totalEarnings / totalDeliveries).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Courses cette semaine</p>
          <p className="text-2xl font-bold">{totalDeliveries}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Revenus totaux</p>
          <p className="text-2xl font-bold text-green-600">{totalEarnings}€</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Moyenne par course</p>
          <p className="text-2xl font-bold">{averageEarnings}€</p>
        </Card>
      </div>

      {/* Graphique revenus */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenus cette semaine</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Historique des courses */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historique des courses</h3>
        <div className="space-y-3">
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{delivery.destination}</p>
                  <p className="text-sm text-gray-500">{delivery.date}</p>
                </div>
                <Badge className="bg-green-500">{delivery.status === "completed" ? "Complétée" : "En cours"}</Badge>
                <p className="font-bold ml-4">{delivery.amount}€</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucune course pour le moment</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DriverHistoryPanel;
