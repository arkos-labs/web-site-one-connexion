import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ClientHeader } from "./dashboard/ClientHeader";
import { KpiGrid } from "./dashboard/KpiGrid";
import { ActiveOrders } from "./dashboard/ActiveOrders";
import { RecentActivity, InvoicesList } from "./dashboard/ListComponents";
import { generateOrderPdf, generateInvoicePdf } from "../../lib/pdf-generator";

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  const [stats, setStats] = useState({ count: 0, completedCount: 0, totalPaid: 0, totalPending: 0, activeCount: 0 });
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (!clientId) return;
    const channel = supabase.channel(`client-dashboard-updates:${clientId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `client_id=eq.${clientId}` }, () => fetchDashboardData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      if (clientId !== currentUser.id) setClientId(currentUser.id);
      const { data: ord } = await supabase.from('orders').select('*').eq('client_id', currentUser.id).order('created_at', { ascending: false });
      if (ord) {
        setOrders(ord);
        const completedPrice = ord.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const completedCount = ord.filter(o => o.status === 'delivered').length;
        const activeTypes = ['pending_acceptance', 'pending', 'accepted', 'assigned', 'driver_accepted', 'in_progress'];
        const pendingValue = ord.filter(o => activeTypes.includes(o.status)).reduce((acc, o) => acc + (Number(o.price_ht) || 0), 0);
        const activeCount = ord.filter(o => activeTypes.includes(o.status)).length;
        
        setStats({ 
          count: ord.length, 
          completedCount: completedCount,
          totalPaid: completedPrice, 
          totalPending: pendingValue, 
          activeCount: activeCount 
        });
        setRecentOrders(ord.slice(0, 3));
      }
      const { data: inv } = await supabase.from('invoices').select('*').eq('client_id', currentUser.id).order('created_at', { ascending: false }).limit(5);
      if (inv) setInvoices(inv);
      const { data: prof } = await supabase
        .from('profiles')
        .select('details, address, city, postal_code, email, company_name')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (prof) {
        setProfile({
          ...(prof.details || {}),
          address: prof.address,
          city: prof.city,
          postal_code: prof.postal_code,
          email: prof.email,
          company_name: prof.company_name
        });
      }
    }
    setLoading(false);
  };

  const downloadOrder = (order) => {
    const clientInfo = {
      name: profile?.full_name || profile?.contact || user?.email?.split('@')[0] || "Client",
      email: user?.email || profile?.email || "",
      phone: profile?.phone || "",
      company: profile?.company || profile?.company_name || "",
      billingAddress: profile?.address || "",
      billingCity: profile?.city || "",
      billingZip: profile?.postal_code || ""
    };
    generateOrderPdf(order, clientInfo);
  };

  const downloadInvoice = (inv) => {
    const clientInfo = {
      name: profile?.full_name || profile?.contact || user?.email?.split('@')[0] || "Client",
      email: user?.email || profile?.email || "",
      phone: profile?.phone || "",
      company: profile?.company || profile?.company_name || "",
      billingAddress: profile?.address || "",
      billingCity: profile?.city || "",
      billingZip: profile?.postal_code || ""
    };
    generateInvoicePdf(inv, clientInfo);
  };

  if (loading) return null;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-12">
      <ClientHeader profile={profile} activeCount={stats.activeCount} />
      <KpiGrid stats={stats} />
      
      <ActiveOrders orders={orders} downloadOrder={downloadOrder} />

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <RecentActivity orders={recentOrders} downloadOrder={downloadOrder} />
        <InvoicesList invoices={invoices} downloadInvoice={downloadInvoice} />
      </div>
    </div>
  );
}
