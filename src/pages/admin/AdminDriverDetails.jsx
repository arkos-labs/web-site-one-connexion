import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Loader2, Edit2, Save, X, Truck, CreditCard, FileText,
  Zap, Clock, TrendingUp, CheckCircle2, Download, Calendar
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { VehicleManager } from "../../components/admin/drivers/VehicleManager";

function parseOrderDateToMs(d) {
  if (!d) return null;
  const s = String(d).trim();
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt.getTime();
}

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  return total * (total <= 10 ? 0.5 : 0.4);
}

function computeDurationMinutes(order) {
  if (order?.status !== "delivered" || !order?.updated_at) return null;
  const start = order.picked_up_at || order.dispatched_at || order.accepted_at || order.created_at;
  const end = order.updated_at;
  if (!start || !end) return null;
  const a = new Date(start).getTime(), b = new Date(end).getTime();
  return (!isNaN(a) && !isNaN(b) && b >= a) ? Math.round((b - a) / 60000) : null;
}

function fmtMinutes(mins) {
  if (mins == null) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}

export default function AdminDriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "", email: "", phone_number: "", company: "", siret: "",
    address: "", vehicle_model: "", vehicle_plate: "", vehicle_type: "", iban: "", bic: ""
  });
  const [driverRowId, setDriverRowId] = useState(null);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel(`driver-details-v2-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${id}` }, () => fetchData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${id}` }, () => fetchData(true))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [dRes, oRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('orders').select('*').eq('driver_id', id)
    ]);
    if (dRes.data) {
      setDriver(dRes.data);
      if (!isEditing) {
        const d = dRes.data.details || {};
        setFormData({
          full_name: d.full_name || "", email: d.email || dRes.data.email || "",
          phone_number: d.phone_number || "", company: d.company || "",
          siret: d.siret || "", address: d.address || "",
          vehicle_model: d.vehicle_model || "", vehicle_plate: d.vehicle_plate || "",
          vehicle_type: d.vehicle_type || "", iban: d.iban || "", bic: d.bic || ""
        });
      }

      // Link to drivers table for vehicle management
      try {
        const email = dRes.data.email || dRes.data.details?.email;
        if (email) {
          const { data: driverRow } = await supabase
            .from('drivers')
            .select('id')
            .eq('email', email)
            .maybeSingle();
          setDriverRowId(driverRow?.id || null);
        } else {
          setDriverRowId(null);
        }
      } catch {
        setDriverRowId(null);
      }
    }
    if (oRes.data) setOrders(oRes.data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ details: { ...driver.details, ...formData } }).eq('id', id);
    if (error) alert("Erreur: " + error.message);
    else { setIsEditing(false); fetchData(); }
    setSaving(false);
  };

  const handleSelectMonth = (monthStr) => {
    if (!monthStr) return;
    const [year, month] = monthStr.split("-").map(Number);
    const fmt = d => d.toISOString().split('T')[0];
    setFrom(fmt(new Date(year, month - 1, 1)));
    setTo(fmt(new Date(year, month, 0)));
  };

  const handleDownloadListing = async () => {
    const periodLabel = from ? new Date(from).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "Période globale";
    const completedOrders = rows.filter(r => r.status === "delivered");
    const { generateDriverStatementPdf } = await import("@/lib/pdf-generator");
    generateDriverStatementPdf(driver, completedOrders, periodLabel, computeDriverPay);
  };

  const rows = useMemo(() => {
    const fromMs = from ? parseOrderDateToMs(from) : null;
    const toMs = to ? parseOrderDateToMs(to) : null;
    return orders
      .filter(o => {
        const ms = parseOrderDateToMs(o.updated_at || o.scheduled_at || o.created_at);
        if (ms == null) return true;
        return (fromMs == null || ms >= fromMs) && (toMs == null || ms <= (toMs + 86399999));
      })
      .map(o => {
        const pay = o.status === "delivered" ? computeDriverPay(o) : 0;
        const mins = o.status === "delivered" ? computeDurationMinutes(o) : null;
        return {
          ...o,
          driverPayComputed: pay, durationMinutes: mins,
          route: `${o.pickup_city || ''} → ${o.delivery_city || ''}`,
          displayDate: o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString('fr-FR') : '—',
          displayStatus: o.status === 'delivered' ? 'Terminée' : o.status,
          pickupTime: o.picked_up_at ? new Date(o.picked_up_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          deliveryTime: (o.status === 'delivered' && o.updated_at) ? new Date(o.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, from, to]);

  const totals = useMemo(() => {
    const done = rows.filter(r => r.status === "delivered");
    return {
      count: done.length,
      allCount: rows.length,
      totalPay: done.reduce((sum, r) => sum + Number(r.driverPayComputed || 0), 0),
      totalMins: done.reduce((sum, r) => sum + Number(r.durationMinutes || 0), 0),
    };
  }, [rows]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement…</span>
    </div>
  );

  if (!driver) return (
    <div className="py-20 text-center">
      <div className="text-2xl font-black text-slate-300 mb-3">Chauffeur introuvable</div>
      <button onClick={() => navigate('/admin/drivers')} className="text-sm font-bold text-[#ed5518] hover:underline">← Retour à la flotte</button>
    </div>
  );

  const driverDetails = driver.details || {};
  const driverName = driverDetails.full_name || driver.email || "Chauffeur";

  const field = (label, key, type = "text", placeholder = "") => (
    <div className={`rounded-2xl p-3.5 border ${isEditing ? 'border-slate-200 bg-white shadow-sm' : 'bg-slate-50 border-transparent'} transition-all`}>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      {isEditing ? (
        type === "select" ? (
          <select value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none">
            <option value="">Sélectionner</option>
            <option value="velo">Vélo / Électrique</option>
            <option value="scooter">Scooter / Moto</option>
            <option value="voiture">Voiture / Van</option>
            <option value="camion">Camion</option>
          </select>
        ) : (
          <input type={type} className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none" value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} />
        )
      ) : (
        <div className="text-sm font-bold text-slate-900">{formData[key] || "—"}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={driverName}
        subtitle={`${driverDetails.company ? driverDetails.company + ' · ' : ''}Membre depuis le ${new Date(driver.created_at).toLocaleDateString('fr-FR')}`}
        backTo="/admin/drivers"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Online status badge */}
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${driver.is_online ? 'bg-[#ed5518] border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`h-2 w-2 rounded-full ${driver.is_online ? 'bg-[#ed5518] animate-pulse' : 'bg-slate-400'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${driver.is_online ? 'text-[#ed5518]' : 'text-slate-500'}`}>
                {driver.is_online ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            {/* Role change */}
            <select
              value={driver.role}
              onChange={async e => {
                if (confirm(`Changer le rôle vers "${e.target.value}" ?`)) {
                  const { error } = await supabase.from('profiles').update({ role: e.target.value }).eq('id', driver.id);
                  if (error) alert(error.message); else fetchData();
                }
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none shadow-sm"
            >
              <option value="courier">Chauffeur</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>

            {driver.is_online && (
              <button
                onClick={async () => {
                  if (confirm("Déconnecter ce chauffeur ?")) {
                    await supabase.from('profiles').update({ is_online: false }).eq('id', driver.id);
                    fetchData();
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition-all"
              >
                <Zap size={13} /> Déconnecter
              </button>
            )}

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500">
                  <X size={14} /> Annuler
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Enregistrer
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <CheckCircle2 size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Courses terminées", value: `${totals.count} / ${totals.allCount}` },
          { icon: <TrendingUp size={18} />, iconBg: "bg-[#ed5518] text-[#ed5518]", label: "Gains période", value: `${totals.totalPay.toFixed(2)}€` },
          { icon: <Clock size={18} />, iconBg: "bg-amber-100 text-amber-700", label: "Temps cumulé", value: fmtMinutes(totals.totalMins) },
          { icon: <Truck size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Véhicule", value: driverDetails.vehicle_type?.toUpperCase() || "—" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
            <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
            <div className="text-xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* Left — forms + history */}
        <div className="space-y-5">
          {/* Personal info */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Informations personnelles</div>
            <div className="grid gap-3 md:grid-cols-2">
              {field("Prénom & Nom", "full_name", "text", "Jean Dupont")}
              {field("Téléphone", "phone_number", "tel", "06 12 34 56 78")}
              <div className="md:col-span-2">{field("Email", "email", "email", "email@exemple.com")}</div>
              {field("Société", "company", "text", "Société Express")}
              {field("SIRET", "siret", "text", "123 456 789 00010")}
              <div className="md:col-span-2">{field("Adresse", "address", "text", "123 rue de la livraison, 75000 Paris")}</div>
            </div>
          </div>

          {/* Vehicle + Bank grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Truck size={14} className="text-slate-400" />
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Véhicule</div>
              </div>
              <div className="space-y-3">
                {field("Modèle", "vehicle_model", "text", "Renault Master")}
                {field("Immatriculation", "vehicle_plate", "text", "AA-123-BB")}
                {field("Type", "vehicle_type", "select")}
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={14} className="text-slate-400" />
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordonnées bancaires</div>
              </div>
              <div className="space-y-3">
                {field("IBAN", "iban", "text", "FR76 0000 0000 0000...")}
                {field("BIC", "bic", "text", "XXXXXXXX")}
              </div>
              <div className="mt-4 rounded-2xl bg-[#ed5518] border border-emerald-100 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-[#ed5518]">
                  <CheckCircle2 size={14} /> Profil actif — Virements automatiques
                </div>
              </div>
            </div>
          </div>

          {/* Gestion véhicules (Admin) */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Véhicules</div>
            {driverRowId ? (
              <VehicleManager driverId={driverRowId} />
            ) : (
              <div className="text-sm text-slate-500">
                Aucun profil chauffeur lié dans la table <code>drivers</code>. Vérifie l’email du chauffeur.
              </div>
            )}
          </div>

          {/* Missions history */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historique des missions</div>
                <div className="text-xs font-bold text-slate-500 mt-0.5">{rows.length} commande(s) dans la période</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                  <Calendar size={13} className="text-slate-400 ml-1" />
                  <select
                    onChange={e => handleSelectMonth(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-1"
                    defaultValue=""
                  >
                    <option value="">Choisir un mois</option>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const d = new Date(); d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      return <option key={val} value={val}>{d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</option>;
                    })}
                  </select>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-slate-200 rounded-xl px-2 py-1.5 bg-white text-xs font-bold focus:outline-none" />
                  <span>→</span>
                  <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-slate-200 rounded-xl px-2 py-1.5 bg-white text-xs font-bold focus:outline-none" />
                </div>
                <button
                  onClick={handleDownloadListing}
                  disabled={totals.count === 0}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 shadow-sm"
                >
                  <FileText size={13} className="text-[#ed5518]" /> Listing PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 border-b border-slate-50">
                    <th className="px-6 py-3">Réf.</th>
                    <th className="px-6 py-3">Trajet</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Enlèvement</th>
                    <th className="px-6 py-3">Livraison</th>
                    <th className="px-6 py-3">Durée</th>
                    <th className="px-6 py-3 text-right">Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-sm font-bold text-slate-300">Aucune mission dans cette période.</td></tr>
                  ) : rows.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      <td className="px-6 py-4 font-black text-slate-900 group-hover:text-[#ed5518] transition-colors text-xs font-mono">#{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-[180px] truncate">{o.route}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{o.displayDate}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{o.pickupTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${o.status === 'delivered' ? 'bg-[#ed5518] text-[#ed5518]' : 'bg-slate-50 text-slate-400'}`}>{o.deliveryTime}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{fmtMinutes(o.durationMinutes)}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">
                        {o.status === "delivered" ? `${Number(o.driverPayComputed || 0).toFixed(2)}€` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {rows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-900">
                      <td colSpan={6} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Total période ({totals.count} courses)</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">{totals.totalPay.toFixed(2)}€</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Right — Stats */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-28 w-28 bg-[#ed5518]/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Vue d'ensemble</div>
              <div className="space-y-5">
                {[
                  { label: "Courses terminées", value: `${totals.count} / ${totals.allCount}`, icon: <CheckCircle2 size={18} className="text-[#ed5518]" /> },
                  { label: "Temps de livraison", value: fmtMinutes(totals.totalMins), icon: <Clock size={18} className="text-amber-400" /> },
                  { label: "Gains HT (période)", value: `${totals.totalPay.toFixed(2)}€`, icon: <TrendingUp size={18} className="text-[#ed5518]" /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-xs font-bold text-slate-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-black tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Informations rapides</div>
            <div className="space-y-3">
              {[
                { label: "Téléphone", value: driverDetails.phone_number },
                { label: "Email", value: driverDetails.email || driver.email },
                { label: "Véhicule", value: driverDetails.vehicle_model ? `${driverDetails.vehicle_model} · ${driverDetails.vehicle_plate || "—"}` : null },
                { label: "IBAN", value: driverDetails.iban ? `${driverDetails.iban.slice(0, 8)}…` : null },
                { label: "Depuis le", value: new Date(driver.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' }) },
              ].map((item, i) => item.value ? (
                <div key={i} className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                  <span className="text-xs font-bold text-slate-900 text-right max-w-[55%] truncate">{item.value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Listing export card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Export</div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Générez un relevé PDF de toutes les courses sur la période sélectionnée.</p>
            <button
              onClick={handleDownloadListing}
              disabled={totals.count === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ed5518] py-3 text-xs font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-40"
            >
              <Download size={14} /> Télécharger le relevé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

