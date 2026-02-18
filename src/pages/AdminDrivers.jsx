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
    <div className="p-8">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-slate-900">Flotte de Chauffeurs 🚚</h1>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${rtStatus === "SUBSCRIBED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${rtStatus === "SUBSCRIBED" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              {rtStatus === "SUBSCRIBED" ? "En direct" : "Connexion..."}
            </div>
          </div>
          <p className="mt-2 text-base font-medium text-slate-500 flex items-center gap-2">
            Pilotez vos équipes sur le terrain.
            <span className="text-[11px] text-slate-400 font-normal italic">
              Dernière synchro : {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="rounded-full bg-white border border-slate-200 p-3 text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
            title="Rafraîchir manuellement"
          >
            <Loader2 size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
          <button onClick={() => setCreateOpen(true)} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all hover:-translate-y-0.5">
            + Nouveau Chauffeur
          </button>
        </div>
      </header>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Ajouter un chauffeur</h3>
            <p className="text-sm text-slate-500 mb-6">
              Pour garantir la sécurité et la connexion, chaque chauffeur doit avoir son propre compte utilisateur validé.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-6">
              <strong>Information :</strong> La gestion des comptes chauffeurs est centralisée sur l'application <strong>Dispatch One Connexion</strong>.
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Veuillez utiliser l'interface administrateur du projet <strong>Dispatch</strong> pour créer de nouveaux comptes.
              <br /><br />
              Une fois le compte créé là-bas, le chauffeur apparaîtra automatiquement dans cette liste après rafraîchissement.
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setCreateOpen(false)}
                className="bg-slate-900 text-white rounded-full px-6 py-2 text-sm font-bold hover:bg-slate-800"
              >
                Compris, je vais sur l'autre admin
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">Liste des chauffeurs</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2">Chauffeur</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Compteur</th>
                <th className="py-2">Courses (jour)</th>
                <th className="py-2">€ (jour)</th>
                <th className="py-2">€ (mois)</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr
                    key={r.driver.id}
                    onClick={() => navigate(`/admin/drivers/${r.driver.id}`)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-4 font-semibold text-slate-900">
                      <div className="flex flex-col">
                        <span className="hover:text-slate-600 transition-colors">{r.driver.name}</span>
                        <div className="text-[11px] font-normal text-slate-400">{r.driver.details?.email || 'Email non renseigné'}</div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${r.status === "En mission" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {r.status}
                        </span>
                        <span className={`w-fit rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-tight ${r.driver.is_online ? "text-emerald-500" : "text-slate-400"}`}>
                          {r.driver.is_online ? "● En ligne" : "○ Hors ligne"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-700 font-medium">{r.onMeterCount}</td>
                    <td className="py-4 text-slate-700 font-medium">{r.completedTodayCount}</td>
                    <td className="py-4 font-bold text-slate-900">{r.earningsToday.toFixed(2)}€</td>
                    <td className="py-4 font-bold text-slate-900">{r.earningsMonth.toFixed(2)}€</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.driver.is_online && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Voulez-vous déconnecter ce chauffeur ?")) {
                                const { data, error } = await supabase
                                  .from('profiles')
                                  .update({ is_online: false })
                                  .eq('id', r.driver.id)
                                  .select();
                                console.log("FORCE_OFFLINE", { id: r.driver.id, data, error });
                                if (error) alert("Erreur: " + error.message);
                                else fetchData(true);
                              }
                            }}
                            className="rounded-xl bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            Déconnecter
                          </button>
                        )}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Voulez-vous vraiment supprimer ce chauffeur ? Cette action est irréversible.")) {
                              const { error } = await supabase.from('profiles').delete().eq('id', r.driver.id);
                              if (error) alert("Erreur: " + error.message);
                              else fetchData(); // Refresh list
                            }
                          }}
                          className="rounded-xl bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/drivers/${r.driver.id}`);
                          }}
                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-900 transition-all hover:bg-white hover:text-slate-900"
                        >
                          Gérer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                        <Loader2 size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">Aucun chauffeur trouvé.</p>
                      <p className="text-xs text-slate-400 mt-1">Commencez par en ajouter un.</p>
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


