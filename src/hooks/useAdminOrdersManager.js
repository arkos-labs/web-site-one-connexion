import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useAdminOrdersManager(searchParams) {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [decisionOpen, setDecisionOpen] = useState(false);
    const [_dragId, _setDragId] = useState(null);
    const [decisionType, setDecisionType] = useState("accept");
    const [decisionOrder, setDecisionOrder] = useState(null);
    const [reason, setReason] = useState("");

    const [_decisionEditMode, setDecisionEditMode] = useState(false);
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
    const [lateOnly, _setLateOnly] = useState(false);
    const [missingOnly, _setMissingOnly] = useState(false);
    const [sortMode, _setSortMode] = useState("deadline");
    const [isSearching, setIsSearching] = useState(false);

    const statusFilter = searchParams.get("status") || "Tous";

    const [dispatchOpen, setDispatchOpen] = useState(false);
    const [dispatchOrder, setDispatchOrder] = useState(null);
    const [dispatchDriver, setDispatchDriver] = useState("");
    const [_dispatchEta, _setDispatchEta] = useState("");
    const [dispatchNote, setDispatchNote] = useState("");

    const fetchOrders = useCallback(async () => {
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

                    const pickedUp = !!(o.picked_up_at || o.pickup_time_at);
                    const normalizedStatus = (o.status === 'assigned' && pickedUp) ? 'in_progress'
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
    }, []);

    const fetchProfiles = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.all([fetchOrders(), fetchProfiles()]);
            if (isMounted) {
                setLoading(false);
            }
        })();

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
                    // Realtime profile change detected
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
            isMounted = false;
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(profileChannel);
        };
    }, [fetchOrders, fetchProfiles]);

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

    const sortOrders = useCallback((list) => {
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
    }, [derived, sortMode]);

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
    }, [historyOrders, sortOrders, statusFilter]);

    const kanbanList = useMemo(
        () => sortOrders(baseList.filter((o) => o.status !== "cancelled")),
        [baseList, sortOrders]
    );

    const openDecision = (order, type) => {
        if (!order) return;
        try {
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
                } catch { /* noop */ }
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

            setDecisionOpen(true);
        } catch (err) {
            console.error("DEBUG: openDecision crash", err);
            setDecisionOrder(order);
            setDecisionType(type);
            setDecisionOpen(true);
        }
    };

    const openDispatch = (order) => {
        setDispatchOrder(order);
        setDispatchDriver(drivers?.[0]?.id || "");
        _setDispatchEta("");
        setDispatchNote("");
        setDispatchOpen(true);
    };

    const confirmDecision = async () => {
        if (!decisionOrder) return;
        const nextStatus = decisionType === "accept" ? "accepted" : "cancelled";

        const updatePayload = {
            status: nextStatus,
            notes: `${decisionOrder.notes || ''} | Decision: ${reason} | Contact: ${decisionEdit.contactPhone} | Code: ${decisionEdit.accessCode}`
        };

        if (decisionEdit.pickup !== decisionOrder.pickup) updatePayload.pickup_address = decisionEdit.pickup;
        if (decisionEdit.delivery !== decisionOrder.delivery) updatePayload.delivery_address = decisionEdit.delivery;

        const { error, data } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', decisionOrder.id)
            .select();

        if (error) {
            console.error("Error confirming decision:", error);
            alert("Erreur lors de la validation : " + error.message);
            return;
        }

        if (!data || data.length === 0) {
            alert("Opération échouée silencieusement. Vérifiez vos permissions (RLS).");
            return;
        }

        fetchOrders();
        setDecisionOpen(false);
    };

    const confirmDispatch = async () => {
        if (!dispatchOrder) return;
        if (!dispatchDriver) {
            alert("Veuillez sélectionner un chauffeur.");
            return;
        }

        if (dispatchOrder.driver_id && String(dispatchOrder.driver_id) !== String(dispatchDriver)) {
            if (!confirm(`⚠️ ATTENTION : Cette course est déjà assignée à un autre chauffeur.\n\nSi vous validez, la mission sera ANNULÉE pour ce chauffeur et transférée au nouveau.\n\nVoulez-vous continuer ?`)) {
                return;
            }
        }

        const now = new Date().toISOString();
        const { error } = await supabase.from('orders').update({
            status: 'assigned',
            driver_id: dispatchDriver,
            dispatched_at: now,
            updated_at: now,
            notes: `${dispatchOrder.notes || ''} | Note dispatch: ${dispatchNote}`
        }).eq('id', dispatchOrder.id).select();

        if (error) {
            console.error("Dispatch Error", error);
            if (error.message && error.message.toLowerCase().includes("foreign key")) {
                alert("ERREUR CRITIQUE : Ce profil chauffeur est invalide (ID orphelin).\n\nCela arrive quand le chauffeur a été créé avec l'ancien système.\n\nSOLUTION : Allez dans l'onglet 'Chauffeurs', supprimez ce chauffeur, et recréez-le via l'admin Dispatch One Connexion.");
            } else {
                alert("Erreur: " + error.message);
            }
            return;
        }

        fetchOrders();
        setDispatchOpen(false);
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

    return {
        orders,
        drivers,
        clients,
        loading,
        activeOrders,
        historyOrders,
        kanbanList,
        historyFiltered,
        decisionOpen,
        setDecisionOpen,
        reason,
        setReason,
        dispatchOpen,
        setDispatchOpen,
        dispatchDriver,
        setDispatchDriver,
        dispatchNote,
        setDispatchNote,
        query,
        setQuery,
        isSearching,
        setIsSearching,
        statusFilter,
        derived,
        openDecision,
        openDispatch,
        confirmDecision,
        confirmDispatch,
        exportCsv
    };
}
