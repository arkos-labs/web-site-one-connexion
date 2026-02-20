import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { downloadOrderPdf } from "./adminPdf.js";
import { Loader2, Search, X } from "lucide-react";

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

          return {
            ...o,
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
      if (o.status !== "picked_up") return false;
      const ms = parseDeadlineMs(o);
      return ms != null && Date.now() > ms;
    };

    const missingInfo = (o) => {
      const inOps = o.status === "assigned" || o.status === "picked_up";
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

  const kanbanList = useMemo(() => sortOrders(activeOrders), [activeOrders, sortMode]);

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
    const nextStatus = decisionType === "accept" ? "assigned" : "cancelled";

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
      status: 'assigned', // CHANGED: 'assigned' triggers "À accepter" on driver side
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
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Gestion des Commandes 📦</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Gérez, attribuez et optimisez vos livraisons en temps réel.</p>
      </header>

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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2">Bon</th>
                  <th className="py-2">Client</th>
                  <th className="py-2">Trajet</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Total</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyFiltered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 align-top">
                    <td className="py-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-black text-orange-600 border border-orange-100 uppercase tracking-tight shadow-sm">
                        BC-{o.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-700">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {o.client}
                        {o.isGuest && <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase">Invité</span>}
                      </div>
                    </td>
                    <td className="py-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{o.route}</div>
                      <div className="mt-1 text-xs text-slate-500 line-clamp-1">{o.pickup}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{o.delivery}</div>
                    </td>
                    <td className="py-4 text-slate-600">
                      <div className="text-sm font-semibold text-slate-900">{o.date}</div>
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${o.status === "delivered" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
                        {o.status === "pending" ? "À Accepter" : (o.status === "assigned" ? (o.driver_id ? "Dispatchée" : "Acceptée") : (o.status === "delivered" ? "Terminée" : o.status))}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-900">{Number(o.total || 0).toFixed(2)}€</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => duplicateOrder(o)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Dupliquer</button>
                        <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">Détails</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { label: "Accepter", statuses: ["pending"] },
              { label: "Dispatcher", statuses: ["assigned"] },
              { label: "En cours / Acceptée", statuses: ["accepted", "picked_up"] }, // KEEP: already added
            ].map((col) => (
              <div key={col.label} className="rounded-3xl bg-white p-4 border border-slate-100">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{col.label}</div>
                <div className="space-y-3">
                  {kanbanList.filter((o) => col.statuses.includes(o.status)).map((o) => (
                    <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2">
                        <span className="inline-flex items-center rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-black text-orange-600 border border-orange-100 uppercase tracking-tight shadow-sm">
                          BC-{o.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{o.route}</div>

                      {/* Driver info if assigned */}
                      {o.driver_id && (
                        <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-600 font-medium flex items-center gap-1">
                          <span className="text-lg">👮</span>
                          {drivers.find(d => d.id === o.driver_id)?.name || "Chauffeur inconnu"}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 relative z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/admin/orders/${o.id}`);
                          }}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Détails
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            duplicateOrder(o);
                          }}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Dupliquer
                        </button>

                        {o.status === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("CLICK: Accepter button kanban", o.id);
                              openDecision(o, "accept");
                            }}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer ring-2 ring-emerald-100"
                            title="Accepter la commande"
                          >
                            Accepter
                          </button>
                        )}

                        {/* Only show Dispatch button if in 'assigned' state (À dispatcher) */}
                        {o.status === "assigned" && (
                          <button onClick={() => openDispatch(o)} className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95">
                            {o.driver_id ? "Réassigner" : "Dispatcher"}
                          </button>
                        )}

                        {(o.status === "picked_up" || o.status === "accepted") && (
                          <button onClick={() => completeOrder(o.id)} className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold text-white">Terminer</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {decisionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Accepter la commande</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Voulez-vous valider cette mission ? Vous pourrez ensuite l'assigner à un chauffeur.</p>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Note interne (optionnel)</label>
            <textarea
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm mb-6 focus:ring-4 focus:ring-slate-100 outline-none transition-all"
              placeholder="Ex: Urgent, fragile..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDecisionOpen(false)}
                className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDecision}
                className="bg-slate-900 text-white rounded-2xl px-8 py-3 text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {dispatchOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Dispatcher la course</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Sélectionnez le chauffeur qui effectuera cette livraison.</p>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Chauffeur disponible</label>
            <select
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm mb-6 focus:ring-4 focus:ring-slate-100 outline-none transition-all appearance-none cursor-pointer font-bold"
              value={dispatchDriver}
              onChange={(e) => setDispatchDriver(e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDispatchOpen(false)}
                className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDispatch}
                className="bg-slate-900 text-white rounded-2xl px-8 py-3 text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
              >
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


