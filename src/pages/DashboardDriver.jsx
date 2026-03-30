import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, Navigation, Phone, CheckCircle, Clock, Truck, Package, Loader2 } from "lucide-react";
import {
    acceptOrderByDriver,
    declineOrder,
    startDelivery,
    completeDelivery,
} from "../services/driverOrderActions";
import ProofModal from "../components/driver/ProofModal";

export default function DashboardDriver() {
    const [tasks, setTasks] = useState([]);
    const tasksRef = useRef([]); // To access latest tasks in realtime callback
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const userRef = useRef(null);
    const [isOnline, setIsOnline] = useState(false);
    const [proofModal, setProofModal] = useState({ isOpen: false, orderId: null, type: 'delivery' });

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        fetchInitialData();

        // Subscribe to realtime updates (orders)
        const channel = supabase
            .channel('driver-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchMyTasks();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!user?.id) return;

        // Subscribe to profile status updates (forced online/offline)
        const profileChannel = supabase
            .channel(`driver-profile-${user.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                if (payload?.new && typeof payload.new.is_online !== 'undefined') {
                    setIsOnline(!!payload.new.is_online);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileChannel);
        };
    }, [user?.id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch online status from profile
                const { data: profile } = await supabase.from('profiles').select('is_online').eq('id', user.id).single();
                if (profile) {
                    setIsOnline(profile.is_online || false);
                }
                await fetchMyTasks(user.id);
            }
        } catch (err) {
            console.error("fetchInitialData error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTasks = async (userId) => {
        const id = userId || userRef.current?.id;
        if (!id) return;

        try {
            // Fetch assigned orders that are not delivered yet
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('driver_id', id)
                .in('status', ['accepted', 'assigned', 'driver_accepted', 'in_progress'])
                .order('created_at', { ascending: true });

            if (!error) {
                const next = data || [];

                // Detect removed missions (cancelled or reassigned)
                const prev = tasksRef.current;
                const nextIds = new Set(next.map(t => t.id));
                const removedIds = prev.filter(t => !nextIds.has(t.id)).map(t => t.id);

                if (removedIds.length > 0) {
                    // Verify reason to avoid alerting on self-delivery
                    const { data: lost } = await supabase
                        .from('orders')
                        .select('id, status, driver_id')
                        .in('id', removedIds);

                    if (lost) {
                        const wasCancelledOrReassigned = lost.some(o =>
                            o.driver_id !== id || // Reassigned
                            o.status === 'cancelled' || // Cancelled
                            o.status === 'pending_acceptance' // Unassigned
                        );

                        if (wasCancelledOrReassigned) {
                            alert("Une course a été retirée de votre liste (Annulation ou Réassignation).");
                        }
                    }
                }

                setTasks(next);
            }
        } catch (err) {
            console.error("fetchMyTasks error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleOnline = async () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);

        const { error } = await supabase
            .from('profiles')
            .update({
                is_online: newStatus,
                last_seen_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            alert("Erreur lors de la mise à jour du statut");
            setIsOnline(!newStatus); // Rollback
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!user?.id) return;

        try {
            setLoading(true);
            let result;

            if (newStatus === 'driver_accepted') {
                result = await acceptOrderByDriver(orderId, user.id);
            } else if (newStatus === 'in_progress') {
                result = await startDelivery(orderId, user.id);
            } else if (newStatus === 'delivered') {
                result = await completeDelivery(orderId, user.id);
            } else if (newStatus === 'accepted' || newStatus === 'pending_acceptance') {
                result = await declineOrder(orderId, user.id);
            }

            if (result?.success) {
                fetchMyTasks();
            } else {
                alert("Erreur lors de la mise à jour : " + (result?.error || "Inconnu"));
            }
        } catch (error) {
            console.error('Update Order Error:', error);
            alert("Erreur: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const _handleActionWithProof = (orderId, status) => {
        if (status === 'delivered') {
            setProofModal({ isOpen: true, orderId, type: 'delivery' });
        } else if (status === 'in_progress') {
            // Optionnel: On peut aussi demander une photo au ramassage
            setProofModal({ isOpen: true, orderId, type: 'pickup' });
        } else {
            updateStatus(orderId, status);
        }
    };

    const openMap = (address) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    if (loading) return null;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Mes Missions 🚀</h1>
                    <p className="text-sm font-medium text-slate-500">
                        {tasks.length === 0 ? "Aucune mission en cours." : `${tasks.length} course(s) à traiter.`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleOnline}
                        className={`flex items-center gap-3 rounded-2xl px-5 py-3 transition-all ${isOnline
                            ? "bg-[#ed5518] text-white shadow-lg shadow-emerald-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                    >
                        <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-slate-400"}`}></div>
                        <span className="text-sm font-bold uppercase tracking-wider">{isOnline ? "En ligne" : "Hors ligne"}</span>
                    </button>
                </div>
            </header>

            {tasks.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-100 min-h-[300px]">
                    <div className="mb-4 rounded-full bg-slate-50 p-6">
                        <Truck size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Vous êtes libre !</h3>
                    <p className="mt-2 text-sm text-slate-500">Attendez que l'admin vous assigne une nouvelle course.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="relative overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
                            {/* Header Card */}
                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">#{task.id.slice(0, 8)}</span>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span className="text-xs font-bold">
                                        {task.service_level === 'super' ? 'URGENT ⚡' : task.service_level === 'exclu' ? 'PRIORITAIRE 🔥' : 'STANDARD'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Route */}
                                <div className="flex flex-col gap-6 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-100"></div>

                                    {/* Pickup */}
                                    <div className="relative flex gap-4">
                                        <div className="h-6 w-6 rounded-full border-4 border-slate-900 bg-white z-10 shrink-0"></div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Enlèvement</div>
                                            <div className="font-bold text-slate-900 text-lg leading-tight mt-1">{task.pickup_city || "Paris"}</div>
                                            <div className="text-sm text-slate-500 mt-1">{task.pickup_address}</div>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => openMap(task.pickup_address)} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                                                    <Navigation size={14} />
                                                </button>
                                                {task.notes?.includes('Contact') && (
                                                    <button className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                                                        <Phone size={14} /> Appeler
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery */}
                                    <div className="relative flex gap-4">
                                        <div className="h-6 w-6 rounded-full border-4 border-[#ed5518] bg-white z-10 shrink-0"></div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Livraison</div>
                                            <div className="font-bold text-slate-900 text-lg leading-tight mt-1">{task.delivery_city || "Destination"}</div>
                                            <div className="text-sm text-slate-500 mt-1">{task.delivery_address}</div>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => openMap(task.delivery_address)} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                                                    <Navigation size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <Package className="text-slate-400 shrink-0" size={20} />
                                        <div className="text-sm text-slate-600 font-medium leading-relaxed w-full">
                                            {(() => {
                                                const notes = task.notes || "Aucune note particulière.";
                                                // Intelligent parsing to spot codes (Digicode, Code, etc.)
                                                const hasCode = /code|digicode|acces/i.test(notes);
                                                if (hasCode) {
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="inline-flex items-center gap-2 bg-[#ed5518]/50 border border-[#ed5518] text-[#ed5518] px-3 py-1.5 rounded-lg text-xs font-black w-max">
                                                                🔑 ATTENTION CODE D'ACCÈS INCLUS
                                                            </div>
                                                            <span className="whitespace-pre-line">{notes}</span>
                                                        </div>
                                                    );
                                                }
                                                return <span className="whitespace-pre-line">{notes}</span>;
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-2 flex gap-3">
                                    {task.status === 'assigned' || task.status === 'accepted' ? (
                                        <>
                                            <button
                                                onClick={() => updateStatus(task.id, 'driver_accepted')}
                                                className="flex-1 rounded-2xl bg-[#ed5518] py-4 text-center font-bold text-white shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                                            >
                                                ACCEPTER LA MISSION ✅
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Refuser cette mission ?")) {
                                                        updateStatus(task.id, 'accepted');
                                                    }
                                                }}
                                                className="px-4 rounded-2xl bg-slate-100 text-slate-400 font-bold hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : task.status === 'driver_accepted' ? (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => updateStatus(task.id, 'in_progress')}
                                                className="flex-1 rounded-2xl bg-slate-900 py-4 text-center font-bold text-white shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
                                            >
                                                CONFIRMER PRISE EN CHARGE 📦
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => updateStatus(task.id, 'delivered')}
                                            className="w-full rounded-2xl bg-[#ed5518] py-4 text-center font-bold text-white shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                                        >
                                            VALIDER LA LIVRAISON ✅
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Modal de preuve */}
            <ProofModal
                isOpen={proofModal.isOpen}
                onClose={() => setProofModal({ ...proofModal, isOpen: false })}
                orderId={proofModal.orderId}
                type={proofModal.type}
                onComplete={() => {
                    updateStatus(proofModal.orderId, proofModal.type === 'pickup' ? 'in_progress' : 'delivered');
                }}
            />
        </div>
    );
}


