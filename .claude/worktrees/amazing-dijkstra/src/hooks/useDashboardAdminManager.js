import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

function computeDriverPay(order) {
    const total = Number(order?.price_ht || 0);
    if (!total) return 0;
    const share = total <= 10 ? 0.5 : 0.4;
    return total * share;
}

export default function useDashboardAdminManager() {
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
    const [clientMode, setClientMode] = useState("existing");
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDelivery, setLoadingDelivery] = useState(false);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    // Form definition
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

    const latestOrderIdRef = useRef(null);

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
                    // Realtime: new order received
                    triggerNewOrderAlert(payload.new);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                () => fetchOrders()
            )
            .subscribe();

        // Fallback: Poll every 10 seconds
        const interval = setInterval(() => checkForNewOrders(), 10000);

        return () => {
            supabase.removeChannel(profileChannel);
            supabase.removeChannel(ordersChannel);
            clearInterval(interval);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const checkForNewOrders = async () => {
        const { data } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();

        if (data) {
            if (!latestOrderIdRef.current) {
                latestOrderIdRef.current = data.id;
                return;
            }
            if (data.id !== latestOrderIdRef.current) {
                const { data: fullOrder } = await supabase.from('orders').select('*').eq('id', data.id).single();
                if (fullOrder) {
                    triggerNewOrderAlert(fullOrder);
                }
            }
        }
    };

    const triggerNewOrderAlert = (orderData) => {
        if (latestOrderIdRef.current === orderData.id) return;
        latestOrderIdRef.current = orderData.id;
        setNewOrderAlert(orderData);
        fetchOrders();
    };

    const fetchOrders = async () => {
        try {
            const [oRes, pRes] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('id, details')
            ]);

            if (oRes.data) {
                const profilesMap = (pRes.data || []).reduce((acc, p) => {
                    acc[p.id] = p.details;
                    return acc;
                }, {});

                setOrdersAll(oRes.data.map(o => {
                    const clientDetails = profilesMap[o.client_id] || {};
                    return {
                        ...o,
                        clientName: clientDetails.company || clientDetails.full_name || o.pickup_name || 'Client Inconnu'
                    };
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInvoices = async () => {
        const { data } = await supabase.from('invoices').select('*');
        if (data) setInvoicesAll(data);
    };

    const fetchDriverPayments = async () => {
        const { data } = await supabase.from('driver_payments').select('*');
        if (data) setDriverPaymentsAll(data);
    };

    const fetchProfiles = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) {
            setDrivers(data.filter(p => p.role === 'courier'));
            setClients(data.filter(p => p.role === 'client').map(p => ({
                id: p.id,
                name: p.details?.company || p.details?.full_name || 'Client',
                status: p.details?.billing_status || 'ok'
            })));
        }
    };

    const handleQuickAccept = async (orderId) => {
        await supabase.from('orders').update({ status: 'accepted' }).eq('id', orderId);
        fetchOrders();
    };

    // KPI Calculations
    const kpis = useMemo(() => {
        const toAccept = ordersAll.filter(o => o.status === 'pending' || o.status === 'pending_acceptance').length;
        const toDispatch = ordersAll.filter(o => o.status === 'accepted').length;
        const active = ordersAll.filter(o => ['assigned', 'driver_accepted', 'in_progress'].includes(o.status)).length;

        const delivered = ordersAll.filter(o => o.status === 'delivered');
        const totalDeliveredHT = delivered.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);

        const nonCancelled = ordersAll.filter(o => o.status !== 'cancelled' && o.status !== 'pending' && o.status !== 'pending_acceptance');
        const revenueOps = nonCancelled.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);

        const revenuePaidHT = invoicesAll
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + Number(i.amount_ht || 0), 0);

        let overdueAmount = 0;
        let debtorClientsCount = 0;
        const unpaidInvoices = invoicesAll.filter(i => i.status !== 'paid');
        const debtorClients = new Set();
        unpaidInvoices.forEach(i => {
            const ms = new Date(i.due_date).getTime();
            if (Date.now() > ms) {
                overdueAmount += Number(i.amount_ttc || 0);
                debtorClients.add(i.client_id);
            }
        });
        debtorClientsCount = debtorClients.size;
        const totalToRecoup = unpaidInvoices.reduce((sum, i) => sum + Number(i.amount_ttc || 0), 0);

        const driverPayOutstanding = delivered.reduce((sum, o) => sum + computeDriverPay(o), 0);

        const driverPayPaid = driverPaymentsAll
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const netProfit = totalDeliveredHT - (driverPayOutstanding + driverPayPaid);

        return {
            toAccept,
            toDispatch,
            active,
            dispatchLive: toAccept + toDispatch + active,
            revenueOps,
            totalDeliveredHT,
            deliveredCount: delivered.length,
            revenuePaidHT,
            overdueAmount,
            debtorClientsCount,
            totalToRecoup,
            driverPayOutstanding,
            netProfit,
        };
    }, [ordersAll, invoicesAll, driverPaymentsAll]);

    // Derived Rows
    const clientPaymentRows = useMemo(() => {
        return clients.map(c => {
            let isLate = false;
            let hasUnpaid = false;
            const cInvoices = invoicesAll.filter(i => i.client_id === c.id);

            cInvoices.forEach(i => {
                if (i.status !== 'paid') hasUnpaid = true;
                if (i.status !== 'paid' && new Date(i.due_date).getTime() < Date.now()) {
                    isLate = true;
                }
            });

            let status = "À JOUR";
            let cls = "text-emerald-600 bg-emerald-50";

            if (isLate) {
                status = "EN RETARD";
                cls = "text-rose-600 bg-rose-50";
            } else if (hasUnpaid) {
                status = "EN COURS";
                cls = "text-amber-600 bg-amber-50";
            }

            return { ...c, status, cls };
        }).sort((a) => a.status === 'EN RETARD' ? -1 : 1);
    }, [clients, invoicesAll]);

    const driverRows = useMemo(() => {
        return drivers.filter(d => d.is_online).map(d => {
            const cDetails = d.details || {};
            const oCount = ordersAll.filter(o => o.driver_id === d.id && o.status === 'in_progress').length;
            return {
                id: d.id,
                name: cDetails.full_name || 'Livreur',
                status: oCount > 0 ? "EN MISSION" : "EN ATTENTE",
                cls: oCount > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
            };
        });
    }, [drivers, ordersAll]);

    useEffect(() => {
        calculatePrice();
    }, [form.pickup, form.delivery, form.vehicle, form.service]); // eslint-disable-line react-hooks/exhaustive-deps

    const calculatePrice = async () => {
        if (!form.pickup || !form.delivery || form.pickup.length < 5 || form.delivery.length < 5) {
            setForm(prev => ({ ...prev, price: "" }));
            return;
        }
        setCalculatingPrice(true);
        setTimeout(() => {
            let base = form.vehicle === 'Voiture' ? 45 : 25;
            if (form.service === 'Super') base *= 1.5;
            if (form.service === 'Exclu') base *= 2;
            setForm(prev => ({ ...prev, price: base.toFixed(2) }));
            setCalculatingPrice(false);
        }, 500);
    };



    const _getPostcode = (str = "") => {
        const match = str.match(/\b\d{5}\b/);
        return match ? match[0] : null;
    };

    const _fetchClientAddresses = async () => {
        return [];
    };

    const fillAddress = (addr, type) => {
        if (type === 'pickup') {
            setForm(f => ({ ...f, pickup: addr.address, pickupCity: addr.city, pickupPostcode: addr.postal_code || "" }));
        } else {
            setForm(f => ({ ...f, delivery: addr.address, deliveryCity: addr.city, deliveryPostcode: addr.postal_code || "" }));
        }
    };

    const fetchSuggestions = async (query, setSuggestions, setLoadingState) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoadingState(true);
        try {
            const cachedCity = "Paris"; // Fallback ou debounce si API limit
            const url = `${LOCATIONIQ_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&countrycodes=fr&limit=5`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erreur api autocomplete");
            const data = await res.json();
            const format = data.map(d => ({
                label: d.display_name,
                city: d.address?.city || d.address?.town || d.address?.village || cachedCity,
                postcode: d.address?.postcode || ""
            }));
            setSuggestions(format);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        } finally {
            setLoadingState(false);
        }
    };

    const handleCreateOrder = async () => {
        const payload = {
            client_id: form.client,
            pickup_address: form.pickup,
            pickup_city: form.pickupCity,
            delivery_address: form.delivery,
            delivery_city: form.deliveryCity,
            vehicle_type: form.vehicle.toLowerCase(),
            service_level: form.service.toLowerCase(),
            price_ht: form.price,
            status: 'accepted',
            scheduled_at: form.date && form.pickupTime ? new Date(`${form.date}T${form.pickupTime}:00`).toISOString() : new Date().toISOString()
        };
        await supabase.from('orders').insert(payload);
        setOpen(false);
        fetchOrders();
        setForm({
            client: "", clientNew: "", clientEmail: "", clientSiret: "", clientPhone: "", clientAddress: "", clientBilling: "",
            pickup: "", pickupCity: "", delivery: "", deliveryCity: "", date: "", pickupTime: "", deliveryDeadline: "",
            vehicle: "Moto", service: "Normal", packageType: "Pli", packageDesc: "", packageWeight: "", packageSize: "",
            contactPhone: "", accessCode: "", price: "",
        });
    };

    return {
        open, setOpen,
        newOrderAlert, setNewOrderAlert,
        triggerNewOrderAlert,
        ordersAll,
        invoicesAll,
        driverPaymentsAll,
        drivers,
        clients,
        loading,
        operationView, setOperationView,
        form, setForm,
        clientMode, setClientMode,
        pickupSuggestions, setPickupSuggestions,
        deliverySuggestions, setDeliverySuggestions,
        loadingPickup, setLoadingPickup, loadingDelivery, setLoadingDelivery, calculatingPrice,
        kpis,
        clientPaymentRows, driverRows,
        handleQuickAccept, fetchSuggestions, handleCreateOrder, fillAddress
    }
}
