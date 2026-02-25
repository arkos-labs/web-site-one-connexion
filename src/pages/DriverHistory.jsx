import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, PackageCheck, CalendarClock } from "lucide-react";

export default function DriverHistory() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("id, pickup_city, delivery_city, status, created_at, delivered_at, price_ht")
        .eq("driver_id", user.id)
        .in("status", ["delivered", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(50);

      setOrders(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Chargement de l'historique...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Historique</h1>
        <p className="text-sm text-slate-500">Vos dernières missions terminées ou annulées.</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Aucune mission dans l'historique.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm font-bold text-slate-900">
                    {order.pickup_city || "Départ"} → {order.delivery_city || "Arrivée"}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-bold ${
                    order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {order.status === "delivered" ? "Livrée" : "Annulée"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={14} />
                  {new Date(order.created_at).toLocaleString("fr-FR")}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  <PackageCheck size={14} />
                  {(Number(order.price_ht) || 0).toFixed(2)} EUR HT
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
