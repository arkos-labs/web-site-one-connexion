import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { downloadOrderPdf } from "./adminPdf.js";
import { Loader2, Search, X, FileText, Check, MoreVertical, Phone, Video, Send } from "lucide-react";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [decisionOpen, setDecisionOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [decisionType, setDecisionType] = useState("accept");
  const [decisionOrder, setDecisionOrder] = useState(null);
  const [reason, setReason] = useState("");

  const [decisionEditMode, setDecisionEditMode] = useState(false);
  const [decisionEdit, setDecisionEdit] = useState({
    pickup: "",
    delivery: "",
    date: "",
    pickupTime: "",
    deliveryDeadline: "",
    contactPhone: "",
    accessCode: "",
    driverPay: "",
  });
  const [query, setQuery] = useState("");
  const [lateOnly, setLateOnly] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);
  const [sortMode, setSortMode] = useState("deadline");
  const [view, setView] = useState("dispatch"); // dispatch | history
  const [isSearching, setIsSearching] = useState(false);

  const statusFilter = searchParams.get("status") || "Tous";

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [dispatchDriver, setDispatchDriver] = useState("");
  const [dispatchEta, setDispatchEta] = useState("");
  const [dispatchNote, setDispatchNote] = useState("");

  useEffect(() => {
    fetchData();

    // Realtime: Orders updates (accept / picked_up / delivered)
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refresh instantly when driver updates status
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to profile changes (online/offline status)
    const profileChannel = supabase
      .channel('profile-status-updates-' + Date.now()) // Use unique name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log("Realtime change:", payload);
          // If we want instant, we can update the state directly
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const p = payload.new;
            if (p.role === 'courier') {
              setDrivers(prev => {
                const filtered = prev.filter(d => d.id !== p.id);
                if (p.is_online) {
                  return [...filtered, {
                    id: p.id,
                    name: p.details?.full_name || 'Chauffeur sans nom',
                    isOnline: true
                  }];
                }
                return filtered; // If offline, they stay out
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setDrivers(prev => prev.filter(d => d.id !== payload.old.id));
          }
          // Fallback: fetch again to be sure
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchProfiles()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const [oRes, pRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, details')
      ]);

      if (oRes.data && pRes.data) {
        setOrders(oRes.data.map(o => {
          const profile = pRes.data.find(p => p.id === o.client_id);
          const cDetails = profile?.details || {};
          let clientName = cDetails.company || cDetails.full_name;
          let isGuest = false;

          if (!clientName) {
            clientName = o.pickup_name || 'Prospect Invité';
            isGuest = true;
          }

          const hasDriver = !!(o.driver_id || o.assigned_driver_id);
          const normalizedStatus = (o.status === 'accepted' && hasDriver) ? 'assigned'
            : (o.status === 'assigned' && o.driver_accepted_at) ? 'driver_accepted'
            : (o.status === 'assigned' && o.picked_up_at) ? 'in_progress'
            : (o.status === 'picked_up' || o.status === 'arrived_pickup') ? 'in_progress'
            : o.status;

          return {
            ...o,
            status: normalizedStatus,
            client: clientName,
            isGuest,
            total: o.price_ht,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString() : '—',
            pickup: o.pickup_address,
            delivery: o.delivery_address,
            route: `${o.pickup_city || '—'} → ${o.delivery_city || '—'}`
          };
        }));
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      setDrivers(data.filter(p => p.role === 'courier' && p.is_online === true).map(p => ({
        id: p.id,
        name: p.details?.full_name || 'Chauffeur sans nom'
      })));
      setClients(data.filter(p => p.role === 'client').map(p => ({
        id: p.id,
        name: p.details?.company || p.details?.full_name || 'Client',
        details: p.details
      })));
    }
  };

  const derived = useMemo(() => {
    const parseDeadlineMs = (o) => {
      if (!o.scheduled_at) return null;
      return new Date(o.scheduled_at).getTime();
    };

    const parseOrderDateMs = (date) => {
      if (!date) return null;
      return new Date(date).getTime();
    };

    const isLate = (o) => {
      if (o.status !== "in_progress") return false;
      const ms = parseDeadlineMs(o);
      return ms != null && Date.now() > ms;
    };

    const missingInfo = (o) => {
      const inOps = o.status === "assigned" || o.status === "in_progress";
      if (!inOps) return false;
      return !o.contact_phone && (!o.notes || !o.notes.includes('Contact:'));
    };

    return { isLate, missingInfo, parseDeadlineMs, parseOrderDateMs };
  }, []);

  const baseList = useMemo(() => {
    const lower = query.toLowerCase();
    return orders.filter((o) => {
      const matchesQuery = String(o.id).toLowerCase().includes(lower) || o.client.toLowerCase().includes(lower);
      const matchesLate = !lateOnly ? true : derived.isLate(o);
      const matchesMissing = !missingOnly ? true : derived.missingInfo(o);
      return matchesQuery && matchesLate && matchesMissing;
    });
  }, [orders, query, lateOnly, missingOnly, derived]);

  const sortOrders = (list) => {
    const sorted = [...list].sort((a, b) => {
      if (sortMode === "amount") return Number(b.total || 0) - Number(a.total || 0);
      if (sortMode === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      const ad = derived.parseDeadlineMs(a);
      const bd = derived.parseDeadlineMs(b);
      if (ad == null && bd == null) return 0;
      if (ad == null) return 1;
      if (bd == null) return -1;
      return ad - bd;
    });
    return sorted;
  };

  const activeOrders = useMemo(
    () => baseList.filter((o) => !["delivered", "cancelled"].includes(o.status)),
    [baseList]
  );

  const historyOrders = useMemo(
    () => baseList.filter((o) => ["delivered", "cancelled"].includes(o.status)),
    [baseList]
  );

  const historyFiltered = useMemo(() => {
    const list = historyOrders.filter((o) => (statusFilter === "Tous" ? true : o.status === statusFilter));
    return sortOrders(list);
  }, [historyOrders, statusFilter, sortMode]);

  const kanbanList = useMemo(
    () => sortOrders(baseList.filter((o) => o.status !== "cancelled")),
    [baseList, sortMode]
  );

  const openDecision = (order, type) => {
    if (!order) return;
    try {
      console.log("DEBUG: openDecision started for", order.id, type);
      setDecisionOrder(order);
      setDecisionType(type);
      setReason("");
      setDecisionEditMode(false);

      const total = Number(order.price_ht || 0);
      const share = total > 0 && total <= 10 ? 0.5 : 0.4;
      const defaultDriverPay = total ? (total * share) : 0;

      let pickupTimeStr = "";
      if (order.scheduled_at) {
        try {
          const d = new Date(order.scheduled_at);
          if (!isNaN(d.getTime())) {
            pickupTimeStr = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
          }
        } catch (e) { }
      }

      const safeDate = order.created_at ? (function () {
        const d = new Date(order.created_at);
        return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
      })() : new Date().toISOString().split('T')[0];

      setDecisionEdit({
        pickup: order.pickup_address || "",
        delivery: order.delivery_address || "",
        date: safeDate,
        pickupTime: pickupTimeStr,
        deliveryDeadline: "",
        contactPhone: order.contact_phone || "",
        accessCode: "",
        driverPay: defaultDriverPay ? defaultDriverPay.toFixed(2) : "",
      });

      console.log("DEBUG: opening modal now");
      setDecisionOpen(true);
    } catch (err) {
      console.error("DEBUG: openDecision crash", err);
      // Fallback: open with minimal data to avoid staying blocked
      setDecisionOrder(order);
      setDecisionType(type);
      setDecisionOpen(true);
    }
  };

  const openDispatch = (order) => {
    setDispatchOrder(order);
    setDispatchDriver(drivers?.[0]?.id || "");
    setDispatchEta("");
    setDispatchNote("");
    setDispatchOpen(true);
  };

  const openUpdateDriverInfo = (order) => {
    openDispatch(order);
  };

  const exportCsv = () => {
    const rows = historyFiltered.map((o) => [
      o.id,
      o.client,
      o.route,
      o.date,
      o.status,
      o.total,
    ]);
    const header = ["Bon", "Client", "Trajet", "Date", "Statut", "Total"];
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commandes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmDecision = async () => {
    if (!decisionOrder) return;
    const nextStatus = decisionType === "accept" ? "accepted" : "cancelled";

    const updatePayload = {
      status: nextStatus,
      notes: `${decisionOrder.notes || ''} | Decision: ${reason} | Contact: ${decisionEdit.contactPhone} | Code: ${decisionEdit.accessCode}`
    };

    // Si l'utilisateur a modifié l'adresse dans le modal (rare mais possible)
    if (decisionEdit.pickup !== decisionOrder.pickup) updatePayload.pickup_address = decisionEdit.pickup;
    if (decisionEdit.delivery !== decisionOrder.delivery) updatePayload.delivery_address = decisionEdit.delivery;

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', decisionOrder.id);

    if (error) {
      console.error("Error confirming decision:", error);
      alert("Erreur lors de la validation : " + error.message);
    } else {
      fetchOrders();
      setDecisionOpen(false);
    }
  };

  const confirmDispatch = async () => {
    console.log("DEBUG DISPATCH", {
      existing: dispatchOrder?.driver_id,
      new: dispatchDriver,
      dispatchOrder
    });

    if (!dispatchOrder) return;
    if (!dispatchDriver) {
      alert("Veuillez sélectionner un chauffeur.");
      return;
    }

    // Check if re-assigning
    if (dispatchOrder.driver_id && String(dispatchOrder.driver_id) !== String(dispatchDriver)) {
      if (!confirm(`⚠️ ATTENTION : Cette course est déjà assignée à un autre chauffeur.\n\nSi vous validez, la mission sera ANNULÉE pour ce chauffeur et transférée au nouveau.\n\nVoulez-vous continuer ?`)) {
        return;
      }
    }

    const { error } = await supabase.from('orders').update({
      status: 'assigned', // New schema status for "Assigned to driver"
      driver_id: dispatchDriver,
      notes: `${dispatchOrder.notes || ''} | Note dispatch: ${dispatchNote}`
    }).eq('id', dispatchOrder.id);

    if (!error) {
      fetchOrders();
      setDispatchOpen(false);
    } else {
      console.error("Dispatch Error", error);
      if (error.message && error.message.toLowerCase().includes("foreign key")) {
        alert("ERREUR CRITIQUE : Ce profil chauffeur est invalide (ID orphelin).\n\nCela arrive quand le chauffeur a été créé avec l'ancien système.\n\nSOLUTION : Allez dans l'onglet 'Chauffeurs', supprimez ce chauffeur, et recréez-le via l'admin Dispatch One Connexion.");
      } else {
        alert("Erreur: " + error.message);
      }
    }
  };

  const completeOrder = async (orderId) => {
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    if (!error) fetchOrders();
  };

  const duplicateOrder = async (order) => {
    if (!confirm("Voulez-vous dupliquer cette commande ?")) return;

    // Construct payload strictly from what likely exists and is needed for a new order
    // Exclude ID, created_at, updated_at, driver_id, status (reset to pending)
    const payload = {
      client_id: order.client_id,
      pickup_address: order.pickup_address,
      pickup_city: order.pickup_city,
      pickup_postal_code: order.pickup_postal_code,
      delivery_address: order.delivery_address,
      delivery_city: order.delivery_city,
      delivery_postal_code: order.delivery_postal_code,
      distance_km: order.distance_km,
      duration_min: order.duration_min,
      price_ht: order.price_ht,
      price_ttc: order.price_ttc,
      tva: order.tva,
      service_level: order.service_level,
      vehicle_type: order.vehicle_type,
      notes: order.notes ? (order.notes + " (Copie)") : "Copie par admin",
      status: 'pending',
      driver_id: null,
      scheduled_at: null // Reset schedule for copy, or keep? Better reset to be safe/immediate.
    };

    const { error } = await supabase.from('orders').insert(payload);
    if (error) {
      console.error("Duplicate error", error);
      alert("Erreur duplication : " + error.message);
    } else {
      fetchOrders();
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Missions Fleet</h2>
          <p className="mt-2 text-base font-medium text-slate-500 max-w-2xl">
            Supervisez l'ensemble des courses et gérez le dispatch en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setView("dispatch")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "dispatch" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              DISPATCH
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "history" ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              HISTORIQUE
            </button>
          </div>
          <button
            onClick={exportCsv}
            className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            EXPORT CSV
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        {[
          { label: "En attente", count: activeOrders.filter(o => o.status.includes('pending')).length, color: "text-rose-600", bg: "bg-rose-50", icon: "🚨" },
          { label: "À Assigner", count: activeOrders.filter(o => o.status === 'accepted').length, color: "text-indigo-600", bg: "bg-indigo-50", icon: "🧭" },
          { label: "En mission", count: activeOrders.filter(o => ['assigned', 'in_progress'].includes(o.status)).length, color: "text-amber-600", bg: "bg-amber-50", icon: "🚚" },
          { label: "Total Livrées", count: historyOrders.filter(o => o.status === 'delivered').length, color: "text-emerald-600", bg: "bg-emerald-50", icon: "💰" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</span>
              <span className={`text-3xl font-black ${stat.color}`}>{stat.count}</span>
            </div>
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("dispatch")}
              className={`rounded-full px-4 py-2 text-xs font-bold ${view === "dispatch" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Dispatch
            </button>
            <button
              onClick={() => setView("history")}
              className={`rounded-full px-4 py-2 text-xs font-bold ${view === "history" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Terminées / Refusées
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {query || isSearching ? (
                <div className="relative animate-fadeIn">
                  <input
                    autoFocus
                    className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Rechercher..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => !query && setIsSearching(false)}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsSearching(true)}
                  className="rounded-full bg-slate-50 border border-slate-100 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {view === "history" && (
              <>
                <button onClick={exportCsv} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Exporter CSV</button>
                {[{ label: "Toutes", status: "Tous" }, { label: "Terminées", status: "delivered" }, { label: "Refusées", status: "cancelled" }].map(({ label, status }) => (
                  <button
                    key={status}
                    onClick={() => setSearchParams({ status })}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${statusFilter === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {label}
                  </button>
                ))}
                <div className="text-xs text-slate-500">{historyFiltered.length} commandes</div>
              </>
            )}

            {view === "dispatch" && (
              <div className="text-xs text-slate-500">{kanbanList.length} commandes actives</div>
            )}
          </div>
        </div>

        {view === "history" ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher une mission, un client..."
                  className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {[{ label: "Toutes", status: "Tous" }, { label: "Terminées", status: "delivered" }, { label: "Refusées", status: "cancelled" }].map(({ label, status }) => (
                  <button
                    key={status}
                    onClick={() => setSearchParams({ status })}
                    className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "bg-slate-100 text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {label}
                  </button>
                ))}
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{historyFiltered.length} Résultats</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">Référence</th>
                    <th className="px-8 py-5">Client</th>
                    <th className="px-8 py-5">Trajet</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Statut</th>
                    <th className="px-8 py-5">Montant</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {historyFiltered.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-400">#{o.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900">{o.client}</span>
                          {o.isGuest && <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter mt-0.5">Invité</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 line-clamp-1">
                          {o.pickup_city} <span className="text-slate-300">→</span> {o.delivery_city}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-slate-500">{o.date}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${o.status === "delivered" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          }`}>
                          {o.status === "delivered" ? "Livrée" : "Annulée"}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">{o.total}€</td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const fullClient = clients.find(c => c.id === o.client_id);
                              downloadOrderPdf(o, fullClient || {});
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`); }}
                            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
                          >
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { label: "Nouveaux", statuses: ["pending_acceptance", "pending"], color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600" },
              { label: "Dispatch", statuses: ["accepted"], color: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
              { label: "En cours", statuses: ["assigned", "driver_accepted", "in_progress"], color: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600" },
              { label: "Livrées", statuses: ["delivered"], color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
            ].map((col) => (
              <div key={col.label} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${col.color}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{col.label}</span>
                  </div>
                  <span className={`text-[10px] font-black ${col.light} ${col.text} px-2 py-0.5 rounded-md`}>
                    {kanbanList.filter((o) => col.statuses.includes(o.status)).length}
                  </span>
                </div>

                <div className="space-y-4">
                  {kanbanList.filter((o) => col.statuses.includes(o.status)).length === 0 ? (
                    <div className="p-8 rounded-[2rem] border border-dashed border-slate-200 text-center opacity-50">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vide</span>
                    </div>
                  ) : kanbanList.filter((o) => col.statuses.includes(o.status)).map((o) => (
                    <div
                      key={o.id}
                      className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BC-{o.id.slice(0, 8)}</span>
                          <h4 className="text-base font-black text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">{o.client}</h4>
                          <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                            o.status === "assigned" ? "bg-amber-50 text-amber-700" :
                            o.status === "driver_accepted" ? "bg-blue-50 text-blue-700" :
                            o.status === "in_progress" ? "bg-purple-50 text-purple-700" :
                            o.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                            o.status === "accepted" ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-500"
                          }`}>
                            {o.status === "assigned" ? "À ACCEPTER" :
                             o.status === "driver_accepted" ? "ACCEPTÉE" :
                             o.status === "in_progress" ? "ENLEVÉE" :
                             o.status === "delivered" ? "LIVRÉE" :
                             o.status === "accepted" ? "À DISPATCHER" : o.status}
                          </span>
                        </div>
                        {o.isGuest && (
                          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex flex-col items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                            <div className="h-4 w-px bg-slate-100"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{o.pickup_city || 'Départ'}</span>
                            <span className="text-[10px] text-slate-900 font-black uppercase truncate">{o.delivery_city || 'Arrivée'}</span>
                          </div>
                        </div>
                      </div>

                      {o.driver_id && (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                          <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] text-white font-black uppercase">
                            {drivers.find(d => d.id === o.driver_id)?.name?.slice(0, 1) || '?'}
                          </div>
                          <span className="text-[10px] font-black text-slate-600 truncate">
                            {drivers.find(d => d.id === o.driver_id)?.name || "Chauffeur"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex gap-2 relative z-20">
                          {col.label === "Nouveaux" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); openDecision(o, "accept"); }}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                              ACCEPTER
                            </button>
                          ) : col.label === "Dispatch" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                              className="rounded-xl bg-orange-500 px-4 py-2 text-[10px] font-black text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg shadow-orange-500/10 active:scale-95"
                            >
                              DISPATCH
                            </button>
                          ) : col.label === "En cours" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); openDispatch(o); }}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                            >
                              RÉASSIGNER
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">LIVRÉ ✓</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-slate-900">{o.total}€ HT</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{o.vehicle_type}</span>
                        </div>
                      </div>

                      {derived.isLate(o) && (
                        <div className="absolute top-0 right-0 h-1 w-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {
        decisionOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDecisionOpen(false)}></div>
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-8 shadow-xl shadow-slate-900/20">
                🤝
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Accepter la mission ?</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                Une fois acceptée, vous pourrez dispatcher cette mission à un livreur de votre flotte.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note Interne</label>
                  <textarea
                    className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                    placeholder="Ex: Client VIP, adresse difficile..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setDecisionOpen(false)}
                    className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest border border-slate-100 rounded-2xl"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDecision}
                    className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {dispatchOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDispatchOpen(false)}></div>
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-3xl mb-8 shadow-xl shadow-orange-500/20">
              🧭
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Dispatch Mission</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              Sélectionnez un livreur disponible pour prendre en charge cette course.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Livreur Connecté</label>
                <select
                  className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-black focus:ring-2 focus:ring-slate-900 transition-all shadow-inner appearance-none cursor-pointer"
                  value={dispatchDriver}
                  onChange={(e) => setDispatchDriver(e.target.value)}
                >
                  <option value="">— Sélectionner —</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note pour le livreur (optionnel)</label>
                <textarea
                  className="w-full rounded-2xl border-none bg-slate-100 p-5 text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all shadow-inner"
                  placeholder="Ex: Demander signature, code 1234..."
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setDispatchOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest border border-slate-100 rounded-2xl"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDispatch}
                  className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




