import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Bell, MapPin, Truck, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { CreateOrderModal } from "../../components/admin/orders/CreateOrderModal";
import AdminOrderModals from "../../components/admin/orders/AdminOrderModals";

// Modular Dashboard Components
import { KpiSection } from "./dashboard/KpiSection";
import { OperationsCenter } from "./dashboard/OperationsCenter";
import { FleetStatus, ClientSolvability } from "./dashboard/SidebarWidgets";
import { QuickLinks, NewOrderNotification } from "./dashboard/OverlayComponents";

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  return total ? total * (total <= 10 ? 0.5 : 0.4) : 0;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [ordersAll, setOrdersAll] = useState([]);
  const [invoicesAll, setInvoicesAll] = useState([]);
  const [driverPaymentsAll, setDriverPaymentsAll] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationView, setOperationView] = useState(() => localStorage.getItem("adminOperationView") || "pending_acceptance");
  const latestOrderIdRef = useRef(null);

  useEffect(() => { localStorage.setItem("adminOperationView", operationView); }, [operationView]);

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [dispatchDriver, setDispatchDriver] = useState("");
  const [dispatchNote, setDispatchNote] = useState("");

  const openDispatch = (o) => { setDispatchOrder(o); setDispatchDriver(""); setDispatchNote(""); setDispatchOpen(true); };

  const confirmDispatch = async () => {
    if (!dispatchOrder || !dispatchDriver) return alert("Sélectionnez un chauffeur.");
    const now = new Date().toISOString();
    const { error, data } = await supabase.from('orders').update({
      status: 'driver_accepted', driver_id: dispatchDriver, driver_accepted_at: now, updated_at: now,
      notes: dispatchNote ? `${dispatchOrder.notes || ''} | Note dispatch: ${dispatchNote}` : dispatchOrder.notes
    }).eq('id', dispatchOrder.id).select();
    if (!error && data?.length) { setDispatchOpen(false); fetchOrders(); } else alert(error?.message || "Erreur assignation");
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchInvoices(), fetchDriverPayments(), fetchProfiles()]).finally(() => setLoading(false));
    const ordersChannel = supabase.channel('admin-updates-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (p) => {
        console.log("Realtime: New order detected", p.new.id);
        if (latestOrderIdRef.current !== p.new.id) {
          latestOrderIdRef.current = p.new.id;
          setNewOrderAlert(p.new);
          fetchOrders();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        console.log("Realtime: Order update", p.new?.id);
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (p) => {
        console.log("Realtime: Profile change detected", p.new?.id, p.new?.is_online);
        fetchProfiles();
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    return () => supabase.removeChannel(ordersChannel);
  }, []);

  const fetchOrders = async () => {
    const [oRes, pRes] = await Promise.all([supabase.from('orders').select('*').order('created_at', { ascending: false }), supabase.from('profiles').select('id, details')]);
    if (oRes.data && pRes.data) {
      if (oRes.data.length && !latestOrderIdRef.current) latestOrderIdRef.current = oRes.data[0].id;
      setOrdersAll(oRes.data.map(o => ({ ...o, clientName: pRes.data.find(p => p.id === o.client_id)?.details?.company || pRes.data.find(p => p.id === o.client_id)?.details?.full_name || o.pickup_name || 'Invité' })));
    }
  };

  const fetchInvoices = async () => { const { data } = await supabase.from('invoices').select('*'); if (data) setInvoicesAll(data); };
  const fetchDriverPayments = async () => { const { data } = await supabase.from('driver_payments').select('*'); if (data) setDriverPaymentsAll(data); };
  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setDrivers(data.filter(p => p.role?.toLowerCase() === 'courier' && p.is_online).map(p => ({ id: p.id, name: p.details?.full_name || p.details?.company || 'Livreur' })));
      setClients(data.filter(p => !p.role || p.role === 'client' || p.role === 'admin').map(p => ({ id: p.id, name: p.details?.company || p.details?.full_name || 'Client', details: p.details })));
    }
  };

  const handleQuickAccept = async (id) => {
    setOrdersAll(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o));
    setOperationView('accepted');
    await supabase.from('orders').update({ status: 'accepted' }).eq('id', id);
    fetchOrders();
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const { data, error } = await supabase.from('orders').insert({
        client_id: orderData.clientId,
        pickup_address: orderData.pickupAddress,
        pickup_city: orderData.pickupCity,
        pickup_postal_code: orderData.pickupPostcode,
        pickup_name: orderData.pickupName,
        pickup_phone: orderData.pickupPhone,
        pickup_access_code: orderData.pickupInstructions,
        delivery_address: orderData.deliveryAddress,
        delivery_city: orderData.deliveryCity,
        delivery_postal_code: orderData.deliveryPostcode,
        delivery_name: orderData.deliveryName,
        delivery_phone: orderData.deliveryPhone,
        delivery_access_code: orderData.deliveryInstructions,
        vehicle_type: orderData.vehicle.toLowerCase(),
        service_level: orderData.formula.toLowerCase(),
        status: 'pending_acceptance',
        price_ht: orderData.pricingResult?.totalEuros || 0,
        scheduled_at: `${orderData.pickupDate}T${orderData.pickupTime}:00`,
        delivery_deadline: `${orderData.pickupDate}T${orderData.deliveryDeadline}:00`,
        package_type: orderData.packageType || "Pli",
        package_description: orderData.packageDesc || "",
        weight: parseFloat(orderData.packageWeight) || null,
        notes: `Contact Pick: ${orderData.pickupContact || '—'} . Contact Deliv: ${orderData.deliveryContact || '—'} . Instructions: ${orderData.notes || '—'}`,
        billing_name: orderData.clientName || "",
        billing_company: orderData.clientCompany || "",
        billing_address: orderData.billingAddress || "",
        billing_city: orderData.billingCity || "",
        billing_zip: orderData.billingZip || "",
        sender_email: orderData.clientEmail || ""
      });
      if (error) throw error;
      setOpen(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erreur création commande");
    }
  };

  const kpis = useMemo(() => {
    const delivered = ordersAll.filter(o => o.status === 'delivered');
    const totalDelHT = delivered.reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
    const paidInvIds = new Set(invoicesAll.filter(i => i.status === 'paid').map(i => i.id));
    const paidOrders = delivered.filter(o => paidInvIds.has(o.invoice_id));
    const paidRevHT = paidOrders.reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
    const totalDriverPay = delivered.reduce((acc, o) => acc + computeDriverPay(o), 0);
    const driverPayPaid = driverPaymentsAll.filter(p => p.status === 'paid').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return {
      toAccept: ordersAll.filter(o => ['pending_acceptance', 'pending'].includes(o.status)).length,
      toDispatch: ordersAll.filter(o => ['accepted'].includes(o.status)).length,
      active: ordersAll.filter(o => ['assigned', 'driver_accepted', 'in_progress', 'picked_up'].includes(o.status)).length,
      revenueOps: ordersAll.filter(o => ['accepted', 'assigned', 'driver_accepted', 'in_progress'].includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0),
      totalToRecoup: totalDelHT - paidRevHT,
      netProfit: paidRevHT - paidOrders.reduce((acc, o) => acc + computeDriverPay(o), 0),
      deliveredCount: delivered.length,
      driverPayOutstanding: totalDriverPay - driverPayPaid
    };
  }, [ordersAll, invoicesAll, driverPaymentsAll]);

  const driverRows = useMemo(() => drivers.map(d => {
    const active = ordersAll.find(o => o.driver_id === d.id && ['in_progress', 'driver_accepted', 'assigned', 'picked_up'].includes(o.status));
    return { ...d, status: active ? (['in_progress', 'picked_up'].includes(active.status) ? "ENLEVÉ" : "EN MISSION") : "DISPONIBLE", cls: active ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100" };
  }), [ordersAll, drivers]);

  const clientRows = useMemo(() => clients.map(c => {
    const last = invoicesAll.filter(i => i.client_id === c.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return { id: c.id, name: c.name, status: !last ? "SANS FACTURE" : (last.status === 'paid' ? "À JOUR" : "À RECOUVRER"), cls: !last ? "bg-slate-50 text-slate-400 border-slate-100" : (last.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100") };
  }), [clients, invoicesAll]);

  const TAB_CONFIG = {
    pending_acceptance: { label: 'À Accepter', icon: Bell, statuses: ['pending_acceptance', 'pending'], count: kpis.toAccept },
    accepted: { label: 'À Dispatcher', icon: MapPin, statuses: ['accepted'], count: kpis.toDispatch },
    in_progress: { label: 'En Mission', icon: Truck, statuses: ['assigned', 'driver_accepted', 'in_progress', 'picked_up'], count: kpis.active },
    delivered: { label: 'Terminées', icon: CheckCircle2, statuses: ['delivered'], count: kpis.deliveredCount },
  };

  return (
    <div className="flex flex-col gap-12 font-body selection:bg-[#ed5518]/30 selection:text-[#ed5518]">
      {/* Editorial Header */}
      <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-noir/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[#ed5518] opacity-75"></span>
                <span className="relative h-2 w-2 rounded-full bg-[#ed5518]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">Système Actif</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-noir/20">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-6xl font-display italic text-noir leading-none tracking-tight">
            Plateforme <span className="text-noir/20 decoration-[#ed5518]/20 underline underline-offset-8">Admin</span>.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 rounded-xl bg-[#ed5518] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 hover:bg-noir transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nouvelle Mission</span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-3 rounded-xl bg-white border border-noir/10 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-noir hover:bg-noir hover:text-white hover:border-noir transition-all active:scale-95 shadow-sm"
          >
            <span>Flux de Missions</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <KpiSection kpis={kpis} driversCount={drivers.length} />

      {/* Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <OperationsCenter
            orders={ordersAll}
            operationView={operationView}
            setOperationView={setOperationView}
            tabConfig={TAB_CONFIG}
            handleQuickAccept={handleQuickAccept}
            openDispatch={openDispatch}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <FleetStatus drivers={driverRows} driversCount={drivers.length} />
          <ClientSolvability clients={clientRows} />
          <QuickLinks />
        </div>
      </div>

      {/* Modals & Notifications */}
      <NewOrderNotification
        order={newOrderAlert}
        onClose={() => setNewOrderAlert(null)}
        onView={() => { setNewOrderAlert(null); navigate(`/admin/orders/${newOrderAlert.id}`); }}
      />
      {open && <CreateOrderModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleCreateOrder} />}
      <AdminOrderModals
        dispatchOpen={dispatchOpen}
        setDispatchOpen={setDispatchOpen}
        dispatchDriver={dispatchDriver}
        setDispatchDriver={setDispatchDriver}
        drivers={drivers}
        dispatchNote={dispatchNote}
        setDispatchNote={setDispatchNote}
        confirmDispatch={confirmDispatch}
        decisionOpen={false}
        setDecisionOpen={() => { }}
        reason=""
        setReason={() => { }}
        confirmDecision={() => { }}
      />
    </div>
  );
}

