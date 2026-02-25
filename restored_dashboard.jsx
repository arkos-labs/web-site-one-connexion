import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Search, X, MapPin, BookOpen, Bell, Activity, Truck, Shield, CheckCircle as CheckIcon } from "lucide-react";
import { autocompleteAddress } from "../lib/autocomplete";
import AdminAssistant from "@/components/admin/AdminAssistant";

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

// Simulation de la date (pour test)
const SIMULATED_NOW = new Date('2026-03-01T10:00:00');

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  const share = total <= 10 ? 0.5 : 0.4;
  return total * share;
}


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
  const [operationView, setOperationView] = useState("pending_acceptance");

  // Form State
  const [_clientMode, _setClientMode] = useState("existing");
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Show alert
    setNewOrderAlert(orderData);

    // Refresh list
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      // Pour ├¬tre s├╗r ├á 100%, on r├®cup├¿re les commandes et les profils s├®par├®ment
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
          const clientName = cDetails.company || cDetails.full_name || o.pickup_name || 'Prospect Invit├®';

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
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        const dList = data
          .filter(p => p.role?.toLowerCase() === 'courier' && p.is_online === true)
          .map(p => ({
            id: p.id,
            name: p.details?.full_name || p.details?.company || 'Nom inconnu',
          }));
        setDrivers(dList);

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

  const handleQuickAccept = async (orderId) => {
    if (!orderId) return;
    try {
      // 1. Mise ├á jour locale imm├®diate (Optimiste)
      setOrdersAll(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o));

      // 2. Changement de vue imm├®diat
      setOperationView('accepted');

      // 3. Appel API
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (error) throw error;

      // 4. Rafra├«chissement complet en arri├¿re-plan
      await fetchOrders();

    } catch (err) {
      console.error("Error during quick accept:", err);
      fetchOrders(); // Rollback en rafra├«chissant
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

    // Ajustement si minuit est d├®pass├®
    if (end < start) end.setDate(end.getDate() + 1);

    const diffMinutes = (end - start) / (1000 * 60);

    let autoService = "Normal";

    if (diffMinutes <= 0) {
      autoService = "Normal";
    } else if (diffMinutes <= 90) {
      autoService = "Super";
    } else if (diffMinutes <= 180) { // Jusqu'├á 3h -> Exclu
      autoService = "Exclu";
    } else {
      autoService = "Normal";
    }

    if (form.service !== autoService) {
      setForm(prev => ({ ...prev, service: autoService }));
    }
  }, [form.pickupTime, form.deliveryDeadline, form.service]);

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
  }, [form.pickup, form.delivery, form.pickupPostcode, form.deliveryPostcode, form.vehicle, form.service]);

  const kpis = useMemo(() => {
    const toAcceptCount = ordersAll.filter(o => ["pending_acceptance", "pending"].includes(o.status)).length;
    const toDispatchCount = ordersAll.filter(o => ["accepted", "assigned"].includes(o.status)).length;
    const activeMissionsCount = ordersAll.filter(o => ["assigned", "driver_accepted", "in_progress", "in_progress"].includes(o.status)).length;

    // CA Op├®rations : Tout ce qui est valid├® mais pas encore fini
    const revenueOps = ordersAll
      .filter(o => ["accepted", "assigned", "assigned", "driver_accepted", "in_progress", "in_progress"].includes(o.status))
      .reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);

    // --- Cycle Paiements Clients ---
    const deliveredOrders = ordersAll.filter(o => o.status === 'delivered');
    const totalDeliveredHT = deliveredOrders.reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
    const revenuePaidHT = invoicesAll
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + (Number(i.total_ht) || 0), 0);

    // ├Ç Recouvrer Total
    const totalToRecoup = Math.max(0, totalDeliveredHT - revenuePaidHT);

    // Retards Sp├®cifiques (Bas├® sur les factures)
    const overdueInvoices = invoicesAll.filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < SIMULATED_NOW);
    const overdueAmount = overdueInvoices.reduce((acc, i) => acc + (Number(i.total_ttc) || 0), 0);
    const debtorClientsCount = new Set(invoicesAll.filter(i => i.status !== 'paid').map(i => i.client_id)).size;

    // --- Cycle Reversement Chauffeurs ---
    const totalDriverPayRequired = deliveredOrders.reduce((acc, o) => acc + computeDriverPay(o), 0);
    const driverPayPaid = driverPaymentsAll.filter(p => p.status === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const driverPayOutstanding = Math.max(0, totalDriverPayRequired - driverPayPaid);

    // Profit Net One Connection (Sur livr├®es)
    const netProfit = totalDeliveredHT - totalDriverPayRequired;

    return {
      dispatchLive: (toAcceptCount || 0) + (toDispatchCount || 0) + (activeMissionsCount || 0),
      toAccept: toAcceptCount || 0,
      toDispatch: toDispatchCount || 0,
      active: activeMissionsCount || 0,
      revenueOps: revenueOps || 0,
      totalToRecoup: totalToRecoup || 0,
      revenuePaidHT: revenuePaidHT || 0,
      overdueAmount: overdueAmount || 0,
      debtorClientsCount: debtorClientsCount || 0,
      totalDeliveredHT: totalDeliveredHT || 0,
      totalDriverPayRequired: totalDriverPayRequired || 0,
      driverPayOutstanding: driverPayOutstanding || 0,
      netProfit: netProfit || 0,
      deliveredCount: deliveredOrders.length || 0
    };
  }, [ordersAll, invoicesAll, driverPaymentsAll]);

  const driverRows = useMemo(() => {
    return drivers.map((d) => {
      const activeOrder = ordersAll.find((o) => o.driver_id === d.id && (o.status === "in_progress" || o.status === "in_progress"));
      const status = activeOrder ? "EN MISSION" : "├Ç VIDE";
      const cls = activeOrder ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
      return { ...d, status, cls };
    });
  }, [ordersAll, drivers]);

  const clientPaymentRows = useMemo(() => {
    return clients.map(c => {
      const cInvoices = invoicesAll.filter(i => i.client_id === c.id);
      // On prend la facture la plus r├®cente
      const latest = cInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      let status = "SANS FACTURE";
      let cls = "bg-slate-100 text-slate-500";

      if (latest) {
        if (latest.status === 'paid') {
          status = "├Ç JOUR";
          cls = "bg-emerald-100 text-emerald-700";
        } else {
          status = "├Ç PAYER";
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
  const [_addressBookOpen, setAddressBookOpen] = useState(null);
  const [addressSearch, setAddressSearch] = useState("");

  const _filteredAddresses = clientAddresses.filter(addr =>
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
      status: 'pending_acceptance',
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
      notes: `Dimensions: ${form.packageSize || 'ÔÇö'}. ${form.packageDesc || ''}`,
    });

    if (!error) {
      fetchOrders(); // Refresh
      setOpen(false);
    } else {
      alert('Erreur lors de la cr├®ation de la commande');
    }
  };

  return (
    <div className="p-8 pt-0 space-y-8">
      <header className="pt-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-slate-900/20">
                Aujourd'hui
              </span>
              <span className="text-xs font-bold text-slate-400">Dimanche 1er Mars 2026</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl">
              Ravi de vous revoir ! ­ƒæï
            </h2>
            <p className="mt-3 text-lg font-medium text-slate-500 max-w-2xl">
              Votre flotte One Connexion est pr├¬te. Voici un aper├ºu de l'activit├® en temps r├®el.
            </p>
          </div>

          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
            <button
              onClick={() => {
                triggerNewOrderAlert({
                  id: 'test-' + Date.now(),
                  pickup_city: 'Paris (Simulation)',
                  delivery_city: 'Boulogne (Simulation)',
                  price_ht: 25.50
                });
              }}
              className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              <Bell size={18} className="text-slate-400 group-hover:rotate-12 transition-transform" />
              Tester l'alerte
            </button>

            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Syst├¿me Op├®rationnel</span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              {
                label: "Flux Op├®rationnel",
                value: kpis.dispatchLive,
                icon: "­ƒÜ¿",
                color: "from-slate-800 to-slate-900",
                light: "bg-slate-50",
                text: "text-slate-900",
                details: [
                  { label: "├Ç Valider", value: kpis.toAccept, cls: "text-rose-500" },
                  { label: "├Ç Dispatcher", value: kpis.toDispatch, cls: "text-indigo-500" },
                  { label: "En Mission", value: kpis.active, cls: "text-amber-500" }
                ]
              },
              {
                label: "CA Op├®rations",
                value: `${(kpis.revenueOps || 0).toFixed(0)}Ôé¼`,
                icon: "­ƒøá´©Å",
                color: "from-indigo-500 to-indigo-600",
                light: "bg-indigo-50",
                text: "text-indigo-600",
                details: [{ label: "En cours de livraison", value: "", cls: "" }]
              },
              {
                label: "Relances Clients",
                value: `${(kpis.totalToRecoup || 0).toFixed(0)}Ôé¼`,
                icon: "Ôîø",
                color: (kpis.overdueAmount || 0) > 0 ? "from-rose-500 to-rose-600" : "from-orange-500 to-orange-600",
                light: (kpis.overdueAmount || 0) > 0 ? "bg-rose-50" : "bg-orange-50",
                text: (kpis.overdueAmount || 0) > 0 ? "text-rose-600" : "text-orange-600",
                details: [
                  { label: "D├ëJ├Ç ENCAISS├ë", value: `${(kpis.revenuePaidHT || 0).toFixed(0)}Ôé¼`, cls: "text-emerald-600" },
                  { label: "DONT EN RETARD", value: `${(kpis.overdueAmount || 0).toFixed(0)}Ôé¼`, cls: "text-rose-600 font-black" },
                  { label: "Clients ├á relancer", value: kpis.debtorClientsCount || 0, cls: "text-slate-600" }
                ]
              },
              {
                label: "D├╗ Chauffeurs",
                value: `${(kpis.driverPayOutstanding || 0).toFixed(0)}Ôé¼`,
                icon: "­ƒæñ",
                color: "from-amber-500 to-amber-600",
                light: "bg-amber-50",
                text: "text-amber-600",
                details: [{ label: "├Ç r├®gler (Missions livr├®es)", value: "", cls: "" }]
              },
              {
                label: "Profit One (Est.)",
                value: `${(kpis.netProfit || 0).toFixed(0)}Ôé¼`,
                icon: "­ƒÆ░",
                color: "from-emerald-600 to-emerald-700",
                light: "bg-emerald-50",
                text: "text-emerald-700",
                details: [
                  { label: "Base CA Livr├®", value: `${(kpis.totalDeliveredHT || 0).toFixed(0)}Ôé¼`, cls: "text-slate-400" },
                  { label: "Missions Termin├®es", value: kpis.deliveredCount || 0, cls: "text-emerald-600" },
                ]
              },
            ].map((k, i) => (
              <div key={i} className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 flex items-center justify-center rounded-2xl ${k.light} transition-transform group-hover:scale-110 duration-300`}>
                    <span className="text-xl">{k.icon}</span>
                  </div>
                  {k.value > 10 && k.label === "├Ç Accepter" && (
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">{k.value}</h3>
                  <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{k.label}</div>
                </div>

                {k.details && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    {k.details.map((d, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{d.label}</span>
                        <span className={`text-xs font-black ${d.cls}`}>{d.value}</span>
                      </div>
                    ))}
                    <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Shield size={12} className="text-emerald-500" />
                    </div>
                  </div>
                )}

                {/* Background Decor */}
                <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700 bg-slate-900`}></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 stagger">
        <AdminAssistant />
            <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              <div className="px-8 py-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-black tracking-tight text-slate-900">Suivi des Missions</h4>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Live Dispatch Center</p>
                </div>

                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                  {[
                    { id: 'pending_acceptance', label: '├Ç Accepter', icon: Bell, statuses: ['pending_acceptance', 'pending'] },
                    { id: 'accepted', label: '├Ç Dispatcher', icon: MapPin, statuses: ['accepted', 'assigned'] },
                    { id: 'in_progress', label: 'En cours', icon: Truck, statuses: ['assigned', 'driver_accepted', 'in_progress'] },
                    { id: 'delivered', label: 'Termin├®es', icon: CheckIcon, statuses: ['delivered'] }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOperationView(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${operationView === tab.id
                        ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-600 border border-transparent'
                        }`}
                    >
                      <tab.icon size={14} className={operationView === tab.id ? "text-orange-500" : ""} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-50 min-h-[300px]">
                {(() => {
                  const tabConfig = {
                    pending_acceptance: ['pending_acceptance', 'pending'],
                    accepted: ['accepted', 'assigned'],
                    in_progress: ['assigned', 'driver_accepted', 'in_progress'],
                    delivered: ['delivered']
                  };
                  const filtered = ordersAll.filter(o => tabConfig[operationView].includes(o.status));

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-sm text-slate-500 text-center flex flex-col items-center gap-3">
                        <span className="text-3xl text-slate-200 opacity-50">­ƒôï</span>
                        Aucune commande pour cette cat├®gorie.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-slate-100">
                      {filtered.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => navigate(operationView === 'accepted' ? `/admin/orders?status=assigned` : `/admin/orders/${o.id}`)}
                          className="p-6 bg-white hover:bg-slate-50 transition-all group cursor-pointer relative"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                BC-{o.id.slice(0, 8)}
                              </span>
                              <span className="text-base font-black text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">
                                {o.clientName}
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${o.status.includes('pending') ? "bg-rose-50 text-rose-600" :
                              (o.status === "accepted") ? "bg-indigo-50 text-indigo-600" :
                                (o.status === "assigned") ? "bg-amber-50 text-amber-600" :
                                  (o.status === "driver_accepted") ? "bg-emerald-50 text-emerald-600" :
                                    (o.status === "in_progress") ? "bg-blue-50 text-blue-600" :
                                      (o.status === "delivered") ? "bg-slate-100 text-slate-600" :
                                        "bg-slate-50 text-slate-500"
                              }`}>
                              {o.status.includes('pending') ? 'Nouveau' :
                                o.status === 'accepted' ? 'Valid├®' :
                                  o.status === 'assigned' ? 'En attente acceptation' :
                                    o.status === 'driver_accepted' ? 'Accept├®' :
                                      o.status === 'in_progress' ? 'Enlev├®e' :
                                        o.status === 'delivered' ? 'Livr├®e' :
                                          o.status}
                            </div>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex flex-col items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{o.pickup_city || 'D├®part'}</span>
                                <span className="text-[10px] text-slate-900 font-bold uppercase truncate">{o.delivery_city || 'Arriv├®e'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-20">
                            <div className="flex items-center gap-2">
                              {(o.status === 'pending_acceptance' || o.status === 'pending') && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleQuickAccept(o.id);
                                  }}
                                  className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all"
                                >
                                  ACCEPTER
                                </button>
                              )}
                              {(o.status === 'accepted' || o.status === 'assigned') && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/admin/orders?status=assigned`);
                                  }}
                                  className="rounded-xl bg-orange-500 px-4 py-2 text-[10px] font-black text-white shadow-lg shadow-orange-500/10 hover:bg-orange-600 active:scale-95 transition-all"
                                >
                                  DISPATCHER
                                </button>
                              )}
                              <span className="text-[10px] font-black text-slate-900 ml-1">{o.price_ht}Ôé¼ HT</span>
                            </div>
                            <div className="flex -space-x-2">
                              {/* Small avatar or vehicle icon */}
                              <div className="h-6 w-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                {o.vehicle_type?.[0].toUpperCase() || 'M'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="text-lg font-black tracking-tight mb-2">Actions Rapides</h3>
                  <p className="text-xs font-medium text-slate-400 mb-6">G├®rez vos op├®rations en un clic.</p>

                  <div className="space-y-3">
                    <button
                      onClick={() => setOpen(true)}
                      className="w-full flex items-center justify-between p-4 bg-white text-slate-900 rounded-2xl font-black text-sm transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
                    >
                      Nouvelle Mission
                      <div className="h-6 w-6 rounded-lg bg-orange-500 text-white flex items-center justify-center">+</div>
                    </button>
                    <button
                      onClick={() => navigate("/admin/orders")}
                      className="w-full flex items-center justify-between p-4 bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm transition-all hover:bg-white/20 active:scale-95"
                    >
                      Toutes les Missions
                      <span className="text-white/40">ÔåÆ</span>
                    </button>
                  </div>
                </div>
                {/* Decor */}
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Solvabilit├®</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Statut Facturation</p>
                  </div>
                  <button onClick={() => navigate("/admin/invoices")} className="text-[10px] font-black text-orange-500 hover:orange-600 uppercase tracking-tighter">Tout voir</button>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[250px] custom-scrollbar">
                  {clientPaymentRows.length === 0 ? (
                    <div className="p-8 text-xs text-slate-400 text-center italic">Aucun client actif.</div>
                  ) : clientPaymentRows.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-700 truncate">{c.name}</span>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${c.cls} shadow-sm border border-black/5`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Fleet Live</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{driverRows.length} Livreurs Actifs</p>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[250px] custom-scrollbar">
                  {driverRows.length === 0 ? (
                    <div className="p-8 text-xs text-slate-400 text-center italic">Aucun livreur en ligne.</div>
                  ) : driverRows.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-[10px] text-white shadow-lg overflow-hidden">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-slate-700">{c.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-black/5 ${c.cls}`}>
                          {c.status}
                        </span>
                      </div>
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
              ­ƒöö
            </div>
            <div>
              <h4 className="font-bold text-lg">Nouvelle commande !</h4>
              <p className="text-sm text-slate-300 mt-1">
                {newOrderAlert.pickup_city || 'Ville inconnue'} ÔåÆ {newOrderAlert.delivery_city || 'Ville inconnue'}
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
              <div className="text-sm font-bold text-slate-900">Cr├®er une commande (Admin)</div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900">Ô£ò</button>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Client</label>
                <div className="mt-2 text-xs text-slate-500 mb-2">S├®lectionnez un client existant pour cette commande.</div>

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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lieu d'enl├¿vement</label>
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
                    <div className="mt-2 text-xs text-slate-400">RechercheÔÇª</div>
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
                          ­ƒôì {addr.name}
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
                    <div className="mt-2 text-xs text-slate-400">RechercheÔÇª</div>
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
                          ­ƒÅü {addr.name}
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heure dÔÇÖenl├¿vement</label>
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">V├®hicule</label>
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
                    {form.service || 'ÔÇö'}
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
                    placeholder="Ex: Documents, mat├®riel..."
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">T├®l├®phone sur place</label>
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix HT Calcul├®</label>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {calculatingPrice ? '...' : (form.price ? `${Number(form.price).toFixed(2)}Ôé¼` : 'ÔÇö')}
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button onClick={() => setOpen(false)} className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Annuler</button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!form.price || calculatingPrice}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  Cr├®er la commande
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



