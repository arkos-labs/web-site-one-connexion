import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

function computeDriverPay(order) {
  // Use price_ht or custom driverPay if we had it
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  const share = total <= 10 ? 0.5 : 0.4;
  return total * share;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AdminDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", email: "", phone: "", password: "" });

  const handleCreateDriver = async () => {
    if (!newDriver.name || !newDriver.email || !newDriver.password) return alert("Nom, Email et Mot de passe requis");
    setCreating(true);

    // Note: This creates a profile entry. The Auth User must be created separately properly linking to this ID,
    // or ideally, use an Admin API to create both. Here we simulate profile creation for Dispatch purposes.
    // We generate a random ID for the profile.
    const fakeId = crypto.randomUUID();

    const { error } = await supabase.from('profiles').insert({
      id: fakeId,
      role: 'courier',
      details: {
        full_name: newDriver.name,
        email: newDriver.email,
        phone_number: newDriver.phone,
        company: "One Connexion Flotte",
        initial_password: newDriver.password // Stored for admin reference only
      }
    });

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      setCreateOpen(false);
      setNewDriver({ name: "", email: "", phone: "", password: "" });
      fetchData();
    }
    setCreating(false);
  };

  const [rtStatus, setRtStatus] = useState("connecting");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchData();

    // Unique channel to avoid collisions with other subscriptions
    const fleetChannel = supabase
      .channel('fleet_realtime_v1')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log("🔔 REALTIME: Profile changed", payload);
        setLastUpdate(new Date());
        fetchData(true);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log("🔔 REALTIME: Order changed", payload);
        setLastUpdate(new Date());
        fetchData(true);
      })
      .subscribe((status, err) => {
        console.log("📡 fleet_realtime Status:", status);
        if (err) console.error("📡 Realtime Error:", err);
        setRtStatus(status);
        if (status === "SUBSCRIBED") {
          setLastUpdate(new Date());
        }
      });

    return () => {
      supabase.removeChannel(fleetChannel);
    };
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [dRes, oRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'courier'),
        supabase.from('orders').select('*')
      ]);

      if (dRes.data) setDrivers(dRes.data);
      if (oRes.data) setOrders(oRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return drivers.map((d) => {
      const driverName = d.details?.full_name || 'Chauffeur sans nom';
      // In Supabase orders table, we should use driver_id
      const mine = orders.filter((o) => o.driver_id === d.id);

      const onMeter = mine.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
      const completed = mine.filter((o) => o.status === "delivered");

      const completedToday = completed.filter((o) => {
        const dt = o.updated_at ? new Date(o.updated_at) : null;
        return dt && !Number.isNaN(dt.getTime()) && isSameDay(dt, now);
      });

      const completedThisMonth = completed.filter((o) => {
        const dt = o.updated_at ? new Date(o.updated_at) : null;
        return dt && !Number.isNaN(dt.getTime()) && dt >= startOfMonth;
      });

      const earningsToday = completedToday.reduce((sum, o) => sum + computeDriverPay(o), 0);
      const earningsMonth = completedThisMonth.reduce((sum, o) => sum + computeDriverPay(o), 0);

      const status = onMeter.length > 0 ? "En mission" : "À vide";

      return {
        driver: { ...d, name: driverName },
        status,
        onMeterCount: onMeter.length,
        completedTodayCount: completedToday.length,
        earningsToday,
        earningsMonth,
      };
    });
  }, [orders, drivers]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Flotte Opérationnelle</h2>
            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${rtStatus === "SUBSCRIBED" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-amber-500 text-white"
              }`}>
              <span className={`h-1 w-1 rounded-full bg-white ${rtStatus === "SUBSCRIBED" ? "animate-ping" : ""}`}></span>
              {rtStatus === "SUBSCRIBED" ? "Live Sync" : "Connecting"}
            </div>
          </div>
          <p className="text-base font-medium text-slate-500 max-w-2xl">
            Pilotez vos équipes sur le terrain et suivez les performances en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
          <button
            onClick={() => fetchData()}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
          >
            <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-slate-900 text-white rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
          >
            + NOUVEAU LIVREUR
          </button>
        </div>
      </header>

      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCreateOpen(false)}></div>
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-8 shadow-xl shadow-slate-900/20">
              👮
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Ajouter un livreur</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              La gestion des comptes est centralisée. Veuillez utiliser l'interface de dispatch pour créer de nouveaux accès.
            </p>

            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-8 text-sm font-medium text-orange-800">
              <strong>Note :</strong> Une fois le compte créé sur le portail dispatch, il apparaîtra ici instantanément.
            </div>

            <button
              onClick={() => setCreateOpen(false)}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Équipage actif</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-900">{rows.length} LIVREURS</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">MaJ : {lastUpdate.toLocaleTimeString()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Livreur</th>
                <th className="px-8 py-5">État de service</th>
                <th className="px-8 py-5">Activité</th>
                <th className="px-8 py-5">Revenus Jour</th>
                <th className="px-8 py-5">Revenus Mois</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.driver.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/drivers/${r.driver.id}`)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg transition-transform group-hover:scale-110 ${r.driver.is_online ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-400 shadow-slate-400/20'}`}>
                          {r.driver.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors uppercase tracking-tight">{r.driver.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 lowercase">{r.driver.details?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${r.status === "En mission" ? "text-amber-600" : "text-emerald-600"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${r.status === "En mission" ? "bg-amber-600 animate-pulse" : "bg-emerald-600"}`}></span>
                          {r.status}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${r.driver.is_online ? "text-emerald-500" : "text-slate-300"}`}>
                          {r.driver.is_online ? "Connecté" : "Déconnecté"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{r.completedTodayCount}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Courses</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">{r.earningsToday.toFixed(2)}€</td>
                    <td className="px-8 py-6 font-black text-slate-900">{r.earningsMonth.toFixed(2)}€</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {r.driver.is_online && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Déconnecter ce livreur ?")) {
                                await supabase.from('profiles').update({ is_online: false }).eq('id', r.driver.id);
                                fetchData(true);
                              }
                            }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                            title="Forcer déconnexion"
                          >
                            <Loader2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/drivers/${r.driver.id}`); }}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                        >
                          GÉRER
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">🚚</div>
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900">Aucun livreur actif</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




