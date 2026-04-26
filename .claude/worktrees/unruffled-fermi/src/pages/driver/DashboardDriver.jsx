import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { acceptOrderByDriver, declineOrder, startDelivery, completeDelivery } from "../../services/driverOrderActions";
import ProofModal from "../../components/driver/ProofModal";
import { DriverHeader, EmptyState } from "./dashboard/DashboardComponents";
import { TaskCard } from "./dashboard/TaskCard";

export default function DashboardDriver() {
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(true);
    const [proofModal, setProofModal] = useState({ isOpen: false, orderId: null, type: 'delivery' });
    const tasksRef = useRef([]);
    const userRef = useRef(null);

    useEffect(() => { tasksRef.current = tasks; }, [tasks]);
    useEffect(() => { userRef.current = user; }, [user]);

    useEffect(() => {
        fetchInitialData();
        const channel = supabase.channel('driver-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchMyTasks()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const profileChannel = supabase.channel(`driver-profile-${user.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (p) => { if (p?.new && typeof p.new.is_online !== 'undefined') setIsOnline(!!p.new.is_online); }).subscribe();
        return () => { supabase.removeChannel(profileChannel); };
    }, [user?.id]);

    const fetchInitialData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            const { data: profile } = await supabase.from('profiles').select('is_online').eq('id', user.id).single();
            if (profile) setIsOnline(profile.is_online || false);
            await fetchMyTasks(user.id);
        }
        setLoading(false);
    };

    const fetchMyTasks = async (userId) => {
        const id = userId || userRef.current?.id; if (!id) return;
        const { data, error } = await supabase.from('orders').select('*').eq('driver_id', id).in('status', ['accepted', 'assigned', 'driver_accepted', 'in_progress']).order('created_at', { ascending: true });
        if (!error && data) {
            const next = data || [];
            const prev = tasksRef.current;
            const removedIds = prev.filter(t => !next.some(n => n.id === t.id)).map(t => t.id);
            if (removedIds.length > 0) {
                const { data: lost } = await supabase.from('orders').select('id, status, driver_id').in('id', removedIds);
                if (lost?.some(o => o.driver_id !== id || o.status === 'cancelled' || o.status === 'pending_acceptance')) alert("Mission retirée (Annulation/Réassignation)");
            }
            setTasks(next);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (!user?.id) return;
        setLoading(true);
        let result;
        if (newStatus === 'driver_accepted') result = await acceptOrderByDriver(orderId, user.id);
        else if (newStatus === 'in_progress') result = await startDelivery(orderId, user.id);
        else if (newStatus === 'delivered') result = await completeDelivery(orderId, user.id);
        else if (newStatus === 'accepted') result = await declineOrder(orderId, user.id);
        if (result?.success) fetchMyTasks();
        else alert(result?.error || "Erreur mise à jour");
        setLoading(false);
    };

    const toggleOnline = async () => {
        const next = !isOnline; setIsOnline(next);
        const { error } = await supabase.from('profiles').update({ is_online: next, last_seen_at: new Date().toISOString() }).eq('id', user.id);
        if (error) { setIsOnline(!next); alert("Erreur statut"); }
    };

    if (loading) return null;

    return (
        <div className="space-y-10 pb-20">
            <DriverHeader tasksCount={tasks.length} isOnline={isOnline} onToggleOnline={toggleOnline} />
            {tasks.length === 0 ? <EmptyState /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:max-w-3xl gap-6">
                    {tasks.map(t => <TaskCard key={t.id} task={t} onUpdateStatus={updateStatus} />)}
                </div>
            )}
            <ProofModal isOpen={proofModal.isOpen} onClose={() => setProofModal({ ...proofModal, isOpen: false })} orderId={proofModal.orderId} type={proofModal.type} onComplete={() => updateStatus(proofModal.orderId, proofModal.type === 'pickup' ? 'in_progress' : 'delivered')} />
        </div>
    );
}
