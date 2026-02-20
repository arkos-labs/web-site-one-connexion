import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Search, X, MapPin, BookOpen } from "lucide-react";
import { autocompleteAddress } from "../lib/autocomplete";

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

// Simulation de la date (pour test)
const SIMULATED_NOW = new Date('2026-03-01T10:00:00');

const NOTIFICATION_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAABjlFVfykAAOEJq/lIAAAExUBWf0kAATKgCs/pIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAAAAA0gAAAAABAAAAAAAAAAAA0gAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Real Data State
  const [ordersAll, setOrdersAll] = useState([]);
  const [invoicesAll, setInvoicesAll] = useState([]);
  const [driverPaymentsAll, setDriverPaymentsAll] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationView, setOperationView] = useState("pending");

  // Form State
  const [clientMode, setClientMode] = useState("existing");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  const [form, setForm] = useState({
    client: "",
    clientNew: "",
    clientEmail: "",
    clientSiret: "",
    clientPhone: "",
    clientAddress: "",
    clientBilling: "",
    pickup: "",
    pickupCity: "",
    delivery: "",
    deliveryCity: "",
    date: "",
    pickupTime: "",
    deliveryDeadline: "",
    vehicle: "Moto",
    service: "Normal",
    packageType: "Pli",
    packageDesc: "",
    packageWeight: "",
    packageSize: "",
    contactPhone: "",
    accessCode: "",
    price: "",
  });

  useEffect(() => {
    Promise.all([fetchOrders(), fetchInvoices(), fetchDriverPayments(), fetchProfiles()]).finally(() => setLoading(false));

    // Subscribe to profile changes (online/offline status)
    const profileChannel = supabase
      .channel('dashboard-profile-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => fetchProfiles()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => fetchProfiles()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles' },
        () => fetchProfiles()
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('dashboard-orders-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log("New Order Received:", payload);
          triggerNewOrderAlert(payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe((status) => {
        console.log("Orders Channel Status:", status);
      });

    // Fallback: Poll every 10 seconds
    const interval = setInterval(() => checkForNewOrders(), 10000);

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(ordersChannel);
      clearInterval(interval);
    };
  }, []);

  const latestOrderIdRef = useRef(null);

  const checkForNewOrders = async () => {
    // Get the very latest order from DB
    const { data } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (data) {
      // If we have no ref yet, just set it (first load)
      if (!latestOrderIdRef.current) {
        latestOrderIdRef.current = data.id;
        return;
      }

      // If different from our known latest, it's a new order!
      if (data.id !== latestOrderIdRef.current) {
        const { data: fullOrder } = await supabase.from('orders').select('*').eq('id', data.id).single();
        if (fullOrder) {
          triggerNewOrderAlert(fullOrder);
        }
      }
    }
  };

  const triggerNewOrderAlert = (orderData) => {
    // Avoid double alerts
    if (latestOrderIdRef.current === orderData.id) return;
    latestOrderIdRef.current = orderData.id;

    // Play sound
    try {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(e => console.warn("Audio autoplay blocked or failed:", e));
    } catch (e) {
      console.error("Audio init failed", e);
    }

    // Show alert
    setNewOrderAlert(orderData);

    // Refresh list
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      // Pour être sûr à 100%, on récupère les commandes et les profils séparément
      const [oRes, pRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, details')
      ]);

      if (oRes.data && pRes.data) {
        // Init ref if empty
        if (oRes.data.length > 0 && !latestOrderIdRef.current) {
          latestOrderIdRef.current = oRes.data[0].id;
        }

        setOrdersAll(oRes.data.map(o => {
          const profile = pRes.data.find(p => p.id === o.client_id);
          const cDetails = profile?.details || {};
          const clientName = cDetails.company || cDetails.full_name || o.pickup_name || 'Prospect Invité';

          return {
            ...o,
            clientName,
            total: o.price_ht,
            date: o.created_at,
            deliveryDeadline: o.scheduled_at ? new Date(o.scheduled_at).toLocaleTimeString().slice(0, 5) : null
          };
        }));
      }
    } catch (err) {
      console.error("Error fetching operations:", err);
    }
  };

  const fetchInvoices = async () => {
    const { data, error } = await supabase.from('invoices').select('*');
    if (!error && data) setInvoicesAll(data);
  };

  const fetchDriverPayments = async () => {
    const { data, error } = await supabase.from('driver_payments').select('*');
    if (!error && data) setDriverPaymentsAll(data);
  };

  const fetchProfiles = async () => {
    try {
      // On récupère TOUS les profils pour être sûr de ne rien rater
      const { data, error } = await supabase.from('profiles').select('*');

      if (!error && data) {
        // Filtrage des chauffeurs (courier) - SEULEMENT CEUX EN LIGNE
        const dList = data
          .filter(p => p.role?.toLowerCase() === 'courier' && p.is_online === true)
          .map(p => ({
            id: p.id,
            name: p.details?.full_name || p.details?.company || 'Nom inconnu',
            status: 'À VIDE',
            cls: "bg-emerald-100 text-emerald-700"
          }));
        setDrivers(dList);

        // Filtrage des clients (tout ce qui n'est pas chauffeur, ou role=client)
        const cList = data.filter(p => p.role?.toLowerCase() === 'client' || !p.role || p.role === 'admin').map(p => ({
          id: p.id,
          name: p.details?.company || p.details?.full_name || 'Client',
          details: p.details
        }));
        setClients(cList);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  // Formula Calculation based on Deadline
  useEffect(() => {
    if (!form.pickupTime || !form.deliveryDeadline) return;

    const [ph, pm] = form.pickupTime.split(':').map(Number);
    const [dh, dm] = form.deliveryDeadline.split(':').map(Number);

    let start = new Date(SIMULATED_NOW);
    start.setHours(ph, pm, 0, 0);
    let end = new Date(SIMULATED_NOW);
    end.setHours(dh, dm, 0, 0);

    // Ajustement si minuit est dépassé
    if (end < start) end.setDate(end.getDate() + 1);

    const diffMinutes = (end - start) / (1000 * 60);

    let autoService = "Normal";

    if (diffMinutes <= 0) {
      autoService = "Normal";
    } else if (diffMinutes <= 90) {
      autoService = "Super";
    } else if (diffMinutes <= 180) { // Jusqu'à 3h -> Exclu
      autoService = "Exclu";
    } else {
      autoService = "Normal";
    }

    if (form.service !== autoService) {
      setForm(prev => ({ ...prev, service: autoService }));
    }
  }, [form.pickupTime, form.deliveryDeadline]);

  // Pricing Calculation
  useEffect(() => {
    const calculatePrice = async () => {
      if (!form.pickup || !form.delivery) return;
      setCalculatingPrice(true);

      const pCode = form.pickupPostcode || getPostcode(form.pickup);
      const dCode = form.deliveryPostcode || getPostcode(form.delivery);

      if (pCode && dCode) {
        const { data, error } = await supabase.rpc('calculate_shipping_cost', {
          p_pickup_postal_code: pCode,
          p_delivery_postal_code: dCode,
          p_vehicle_type: form.vehicle.toLowerCase(),
          p_service_level: form.service.toLowerCase()
        });

        if (!error && data !== null) {
          setForm(prev => ({ ...prev, price: String(data) }));
        }
      }
      setCalculatingPrice(false);
    };

    const timeout = setTimeout(calculatePrice, 800);
    return () => clearTimeout(timeout);
  }, [form.pickup, form.delivery, form.vehicle, form.service]);

  const kpis = useMemo(() => {
    const toAccept = ordersAll.filter((o) => o.status === "pending").length;
    const toDispatch = ordersAll.filter((o) => o.status === "assigned").length;
    const active = ordersAll.filter((o) => o.status === "picked_up").length;

    const revenueOps = ordersAll.filter(o => ['pending', 'assigned', 'picked_up'].includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
    const totalDelivered = ordersAll.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
    const revenuePaid = invoicesAll.filter(i => i.status === 'paid').reduce((acc, i) => acc + (Number(i.total_ht) || 0), 0);

    // À recouvrer = Tout ce qui est livré mais pas encore payé (facturé ou non)
    const revenueToRecoup = Math.max(0, totalDelivered - revenuePaid);

    // Détails Encaissements
    const driverPayPaid = driverPaymentsAll.filter(p => p.status === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const netProfitPaid = revenuePaid - driverPayPaid;

    return {
      toAccept,
      toDispatch,
      active,
      overdueInvoices: invoicesAll.filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < SIMULATED_NOW).length,
      revenueOps,
      revenuePaid,
      revenueToRecoup,
      driverPayPaid,
      netProfitPaid
    };
  }, [ordersAll, invoicesAll, driverPaymentsAll]);

  const driverRows = useMemo(() => {
    return drivers.map((d) => {
      const activeOrder = ordersAll.find((o) => o.driver_id === d.id && o.status === "picked_up");
      const status = activeOrder ? "EN MISSION" : "À VIDE";
      const cls = activeOrder ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
      return { ...d, status, cls };
    });
  }, [ordersAll, drivers]);

  const clientPaymentRows = useMemo(() => {
    return clients.map(c => {
      const cInvoices = invoicesAll.filter(i => i.client_id === c.id);
      // On prend la facture la plus récente
      const latest = cInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      let status = "SANS FACTURE";
      let cls = "bg-slate-100 text-slate-500";

      if (latest) {
        if (latest.status === 'paid') {
          status = "À JOUR";
          cls = "bg-emerald-100 text-emerald-700";
        } else {
          status = "À PAYER";
          cls = "bg-amber-100 text-amber-700";
        }
      }

      return { id: c.id, name: c.name, status, cls };
    });
  }, [clients, invoicesAll]);

  const getPostcode = (str = "") => {
    const match = String(str).match(/\b\d{5}\b/);
    return match ? match[0] : "";
  };

  const [clientAddresses, setClientAddresses] = useState([]);
  const [addressBookOpen, setAddressBookOpen] = useState(null);
  const [addressSearch, setAddressSearch] = useState("");

  const filteredAddresses = clientAddresses.filter(addr =>
    (addr.name || "").toLowerCase().includes(addressSearch.toLowerCase()) ||
    (addr.address_line || "").toLowerCase().includes(addressSearch.toLowerCase()) ||
    (addr.city || "").toLowerCase().includes(addressSearch.toLowerCase())
  );

  useEffect(() => {
    if (form.client) {
      fetchClientAddresses(form.client);
    } else {
      setClientAddresses([]);
    }
  }, [form.client]);

  const fetchClientAddresses = async (clientId) => {
    const { data } = await supabase.from('addresses').select('*').eq('client_id', clientId);
    if (data) setClientAddresses(data);
  };

  const fillAddress = (addr, type) => {
    const fullAddr = `${addr.address_line}, ${addr.postal_code} ${addr.city}`;
    if (type === 'pickup') {
      setForm(prev => ({
        ...prev,
        pickup: fullAddr,
        pickupCity: addr.city,
        pickupPostcode: addr.postal_code
      }));
    } else {
      setForm(prev => ({
        ...prev,
        delivery: fullAddr,
        deliveryCity: addr.city,
        deliveryPostcode: addr.postal_code
      }));
    }
  };

  const fetchSuggestions = async (query, setSuggestions, setLoading) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const results = await autocompleteAddress(query);
      const list = results.map(s => ({
        label: s.full,
        city: s.city,
        postcode: s.postcode
      }));
      setSuggestions(list);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!form.client || !form.pickup || !form.delivery) return;

    const { error } = await supabase.from('orders').insert({
      client_id: form.client,
      pickup_address: form.pickup,
      pickup_city: form.pickupCity || form.pickup.split(',').pop()?.trim(),
      pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
      delivery_address: form.delivery,
      delivery_city: form.deliveryCity || form.delivery.split(',').pop()?.trim(),
      delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
      vehicle_type: form.vehicle.toLowerCase(),
      service_level: form.service.toLowerCase(),
      status: 'pending',
      delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
      package_type: form.packageType,
      package_description: form.packageDesc,
      weight: form.packageWeight || null,
      // package_size: form.packageSize, // No column for size, keep in notes or description
      pickup_phone: form.contactPhone,
      pickup_access_code: form.accessCode,
      price_ht: form.price,
      scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
      // Keep minimal fallback in notes for backward compat or extra info
      notes: `Dimensions: ${form.packageSize || '—'}. ${form.packageDesc || ''}`,
    });

    if (!error) {
      fetchOrders(); // Refresh
      setOpen(false);
    } else {
      alert('Erreur lors de la création de la commande');
    }
  };

  return (
    <div className="p-8 pt-0 space-y-8">
      <header className="pt-8 stagger">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Ravi de vous revoir ! 👋</h2>
            <p className="mt-2 text-base font-medium text-slate-500">Prêt à superviser votre flotte et exploser les performances aujourd'hui ?</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerNewOrderAlert({
                  id: 'test',
                  pickup_city: 'Paris (Test)',
                  delivery_city: 'Lyon (Test)'
                });
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              🔔 Test Alerte
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600">Système opérationnel</span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
            {[
              { label: "En attente", value: kpis.toAccept, tone: "text-emerald-600", bg: "bg-emerald-50", icon: "🚨" },
              { label: "À dispatcher", value: kpis.toDispatch, tone: "text-blue-600", bg: "bg-blue-50", icon: "🧭" },
              { label: "Courses actives", value: kpis.active, tone: "text-amber-600", bg: "bg-amber-50", icon: "🚚" },
              { label: "CA Opérationnel", value: `${kpis.revenueOps.toFixed(2)}€`, tone: "text-slate-500", bg: "bg-slate-50", icon: "🛠️" },
              { label: "CA à Recouvrer (Livrées)", value: `${kpis.revenueToRecoup.toFixed(2)}€`, tone: "text-rose-600", bg: "bg-rose-50", icon: "⏳" },
              {
                label: "CA Encaissé (Réglé)",
                value: `${kpis.revenuePaid.toFixed(2)}€`,
                tone: "text-emerald-700",
                bg: "bg-emerald-100",
                icon: "💰",
                details: [
                  { label: "Encaissé Client", value: `${kpis.revenuePaid.toFixed(2)}€` },
                  { label: "À régler Chauffeur", value: `-${kpis.driverPayPaid.toFixed(2)}€`, cls: "text-rose-500" },
                  { label: "Reste / Marge", value: `${kpis.netProfitPaid.toFixed(2)}€`, cls: "text-emerald-600" },
                ]
              },
            ].map((k, i) => (
              <div key={i} className={`group relative overflow-hidden bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-lg ${k.pulse ? "ring-2 ring-red-100" : ""}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{k.label}</div>
                    <h3 className="text-4xl font-bold tracking-tight text-slate-900 mt-2">{k.value}</h3>
                  </div>
                  <div className={`h-10 w-10 flex items-center justify-center rounded-xl text-xl ${k.bg} transition-transform group-hover:scale-110`}>
                    {k.icon}
                  </div>
                </div>

                {k.details && (
                  <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                    {k.details.map((d, id) => (
                      <div key={id} className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter">{d.label}</span>
                        <span className={d.cls || "text-slate-900"}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {k.pulse && (
                  <p className={`mt-4 text-xs font-bold flex items-center gap-1 ${k.tone}`}>
                    <span className="animate-pulse">●</span>
                    Action requise
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 stagger">
            <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Opérations en cours</h4>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['pending', 'assigned', 'picked_up'].map(s => (
                    <button
                      key={s}
                      onClick={() => setOperationView(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${operationView === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {s === 'pending' ? 'En attente' : s === 'assigned' ? 'À dispatcher' : 'En cours'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50 min-h-[300px]">
                {ordersAll.filter((o) => o.status === operationView).length === 0 ? (
                  <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center gap-3">
                    <span className="text-3xl text-slate-200 opacity-50">📋</span>
                    Aucune commande {operationView === 'pending' ? 'en attente' : operationView === 'assigned' ? 'à dispatcher' : 'en cours'}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-50">
                    {ordersAll.filter((o) => o.status === operationView).map((o) => (
                      <div
                        key={o.id}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="p-5 bg-white hover:bg-slate-50 transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-tighter">#{o.id.slice(0, 8)}</span>
                            <span className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">{o.clientName}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${o.status === "pending" ? "bg-emerald-50 text-emerald-600" : o.status === "assigned" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 leading-relaxed mb-3 line-clamp-2">
                          {o.pickup_city || o.pickup_address.split(',')[0]} → {o.delivery_city || o.delivery_address.split(',')[0]}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                          <span className="text-xs font-bold text-slate-800">{Number(o.price_ht || 0).toFixed(2)}€</span>
                          <span className="text-[10px] font-bold text-slate-400">Voir détails →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <button onClick={() => setOpen(true)} className="w-full group flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] hover:bg-slate-800">
                    <span className="text-sm font-bold">Nouvelle course</span>
                    <span className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">+</span>
                  </button>
                  <button onClick={() => navigate("/admin/orders?status=pending")} className="w-full group flex items-center justify-between p-4 bg-white border border-slate-100 text-slate-700 rounded-2xl hover:border-slate-300 transition-all">
                    <span className="text-sm font-bold">Gérer les commandes</span>
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500"> des Paiements</h4>
                  <button onClick={() => navigate("/admin/invoices")} className="text-[10px] font-bold text-blue-600 hover:underline">Voir tout</button>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[220px]">
                  {clientPaymentRows.length === 0 ? <div className="p-4 text-xs text-slate-400 text-center">Aucun client.</div> : clientPaymentRows.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.cls}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Chauffeurs</h4>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[200px]">
                  {driverRows.length === 0 ? <div className="p-4 text-xs text-slate-400 text-center">Aucun chauffeur trouvé.</div> : driverRows.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">{c.name.slice(0, 2).toUpperCase()}</div>
                        <span className="text-xs font-bold text-slate-700">{c.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.cls}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </>
      )}

      {newOrderAlert && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slideUp">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl animate-pulse">
              🔔
            </div>
            <div>
              <h4 className="font-bold text-lg">Nouvelle commande !</h4>
              <p className="text-sm text-slate-300 mt-1">
                {newOrderAlert.pickup_city || 'Ville inconnue'} → {newOrderAlert.delivery_city || 'Ville inconnue'}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setNewOrderAlert(null);
                    navigate(`/admin/orders/${newOrderAlert.id}`);
                  }}
                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-emerald-50"
                >
                  Voir
                </button>
                <button
                  onClick={() => setNewOrderAlert(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900">Créer une commande (Admin)</div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Client</label>
                <div className="mt-2 text-xs text-slate-500 mb-2">Sélectionnez un client existant pour cette commande.</div>

                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                >
                  <option value="">Choisir un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lieu d'enlèvement</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                      placeholder="Ex: 12 Rue de la Paix, 75008 Paris"
                      value={form.pickup}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, pickup: val, pickupCity: "", pickupPostcode: "" });
                        fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                      }}
                    />
                  </div>
                  {loadingPickup && (
                    <div className="mt-2 text-xs text-slate-400">Recherche…</div>
                  )}
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                      {pickupSuggestions.map((s, i) => (
                        <button
                          type="button"
                          key={`${s.label}-${i}`}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => {
                            const city = s.city || s.label.split(",")[0];
                            setForm({ ...form, pickup: s.label, pickupCity: city, pickupPostcode: s.postcode });
                            setPickupSuggestions([]);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {clientAddresses.slice(0, 3).map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => fillAddress(addr, 'pickup')}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                        >
                          📍 {addr.name}
                        </button>
                      ))}
                    </div>

                    {clientAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setAddressBookOpen('pickup'); setAddressSearch(""); }}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <BookOpen size={14} /> Voir tout
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lieu de livraison (ville)</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                      placeholder="Ex: Puteaux"
                      value={form.delivery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, delivery: val, deliveryCity: "", deliveryPostcode: "" });
                        fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                      }}
                    />
                  </div>
                  {loadingDelivery && (
                    <div className="mt-2 text-xs text-slate-400">Recherche…</div>
                  )}
                  {deliverySuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                      {deliverySuggestions.map((s, i) => (
                        <button
                          type="button"
                          key={`${s.label}-${i}`}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => {
                            const city = s.city || s.label.split(",")[0];
                            setForm({ ...form, delivery: s.label, deliveryCity: city, deliveryPostcode: s.postcode });
                            setDeliverySuggestions([]);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {clientAddresses.slice(0, 3).map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => fillAddress(addr, 'delivery')}
                          className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                        >
                          🏁 {addr.name}
                        </button>
                      ))}
                    </div>
                    {clientAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setAddressBookOpen('delivery'); setAddressSearch(""); }}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <BookOpen size={14} /> Voir tout
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heure d’enlèvement</label>
                  <input
                    type="time"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.pickupTime}
                    onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heure de livraison max</label>
                  <input
                    type="time"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.deliveryDeadline}
                    onChange={(e) => setForm({ ...form, deliveryDeadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Véhicule</label>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  >
                    {["Moto", "Voiture"].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Formule (Auto)</label>
                  <div className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-bold bg-slate-50 ${form.service === 'Super' ? 'text-rose-600 border-rose-100' : form.service === 'Exclu' ? 'text-blue-600 border-blue-100' : 'text-emerald-600 border-emerald-100'}`}>
                    {form.service || '—'}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Type de colis</label>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.packageType}
                    onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                  >
                    {["Pli", "Carton", "Sac", "Palette", "Autre"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: Documents, matériel..."
                    value={form.packageDesc}
                    onChange={(e) => setForm({ ...form, packageDesc: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Poids (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={form.packageWeight}
                    onChange={(e) => setForm({ ...form, packageWeight: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Téléphone sur place</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: 06 12 34 56 78"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Code / instructions</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: Digicode 1234"
                    value={form.accessCode}
                    onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="text-center rounded-2xl bg-slate-50 p-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix HT Calculé</label>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {calculatingPrice ? '...' : (form.price ? `${Number(form.price).toFixed(2)}€` : '—')}
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button onClick={() => setOpen(false)} className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Annuler</button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!form.price || calculatingPrice}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  Créer la commande
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

