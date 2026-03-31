import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ClientHeader } from "./dashboard/ClientHeader";
import { KpiGrid } from "./dashboard/KpiGrid";
import { RecentActivity, InvoicesList } from "./dashboard/ListComponents";

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  const [stats, setStats] = useState({ count: 0, totalPaid: 0, totalPending: 0, activeCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (!clientId) return;
    const channel = supabase.channel(`client-dashboard-updates:${clientId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `client_id=eq.${clientId}` }, () => fetchDashboardData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (clientId !== user.id) setClientId(user.id);
      const { data: orders } = await supabase.from('orders').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
      if (orders) {
        const completed = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const active = ['pending_acceptance', 'pending', 'accepted', 'assigned', 'driver_accepted', 'in_progress'];
        const pendingValue = orders.filter(o => active.includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        setStats({ count: orders.length, totalPaid: completed, totalPending: pendingValue, activeCount: orders.filter(o => active.includes(o.status)).length });
        setRecentOrders(orders.slice(0, 3));
      }
      const { data: inv } = await supabase.from('invoices').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5);
      if (inv) setInvoices(inv);
      const { data: prof } = await supabase.from('profiles').select('details').eq('id', user.id).single();
      if (prof) setProfile(prof.details);
    }
    setLoading(false);
  };

  const downloadOrder = async (order) => {
    const { generateOrderPdf } = await import("../../lib/pdfGenerator");
    await generateOrderPdf(order, profile || {});
  };

  const downloadInvoice = async (inv) => {
    // Logic for invoice download
  };

  if (loading) return null;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-10">
      <ClientHeader profile={profile} activeCount={stats.activeCount} />
      <KpiGrid stats={stats} />
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <RecentActivity orders={recentOrders} downloadOrder={downloadOrder} />
        <InvoicesList invoices={invoices} downloadInvoice={downloadInvoice} />
      </div>
    </div>
  );
}
