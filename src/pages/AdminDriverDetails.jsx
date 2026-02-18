import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, Mail, Phone, MapPin, Building2, CreditCard, User, Clock, CheckCircle2, TrendingUp, Calendar, Save, Edit2, X, Truck, Banknote, FileText, Download } from "lucide-react";
import { generateDriverStatementPdf, generateDriverInvoicePdf } from "../lib/pdfGenerator";

function parseOrderDateToMs(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function computeDriverPay(order) {
  const total = Number(order?.price_ht || 0);
  if (!total) return 0;
  const share = total <= 10 ? 0.5 : 0.4;
  return total * share;
}

function computeDurationMinutes(order) {
  if (order?.status === "delivered" && order?.updated_at) {
    // We prioritize the time between actual pickup and actual delivery
    const start = order.picked_up_at || order.dispatched_at || order.created_at;
    const end = order.updated_at;

    if (start && end) {
      const a = new Date(start).getTime();
      const b = new Date(end).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && b >= a) {
        return Math.round((b - a) / 60000);
      }
    }
  }
  return null;
}

function fmtMinutes(mins) {
  if (mins == null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}

export default function AdminDriverDetails() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    company: "",
    siret: "",
    address: "",
    vehicle_model: "",
    vehicle_plate: "",
    vehicle_type: "",
    iban: "",
    bic: ""
  });

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`driver-details-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${id}` },
        (payload) => {
          console.log("Realtime Profile Change:", payload);
          fetchData(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${id}` },
        (payload) => {
          console.log("Realtime Order Change:", payload);
          fetchData(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [dRes, oRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('orders').select('*').eq('driver_id', id)
    ]);

    if (dRes.data) {
      setDriver(dRes.data);
      const details = dRes.data.details || {};
      if (!isEditing) { // Only update form data if not currently editing to avoid overwriting user input
        setFormData({
          full_name: details.full_name || "",
          email: details.email || dRes.data.email || "",
          phone_number: details.phone_number || "",
          company: details.company || "",
          siret: details.siret || "",
          address: details.address || "",
          vehicle_model: details.vehicle_model || "",
          vehicle_plate: details.vehicle_plate || "",
          vehicle_type: details.vehicle_type || "",
          iban: details.iban || "",
          bic: details.bic || ""
        });
      }
    }
    if (oRes.data) setOrders(oRes.data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        details: {
          ...driver.details,
          ...formData
        }
      })
      .eq('id', id);

    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      setIsEditing(false);
      fetchData();
    }
    setSaving(false);
  };

  const rows = useMemo(() => {
    const fromMs = from ? parseOrderDateToMs(from) : null;
    const toMs = to ? parseOrderDateToMs(to) : null;

    const inRange = (order) => {
      const ms = parseOrderDateToMs(order?.updated_at || order?.scheduled_at || order?.created_at);

      if (ms == null) {
        console.log("Order missing date info:", order.id);
        return true;
      }

      const isIn = (fromMs == null || ms >= fromMs) && (toMs == null || ms <= (toMs + 86399999));
      if (!isIn) {
        // console.log("Order filtered out:", order.id, "Date:", new Date(ms).toLocaleDateString(), "Range:", from, "to", to);
      }
      return isIn;
    };

    return orders
      .filter(inRange)
      .map((o) => {
        const pay = o.status === "delivered" ? computeDriverPay(o) : 0;
        const mins = o.status === "delivered" ? computeDurationMinutes(o) : null;

        const pickupInfo = o.picked_up_at ? new Date(o.picked_up_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        const deliveryInfo = (o.status === 'delivered' && o.updated_at) ? new Date(o.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

        return {
          ...o,
          driverPayComputed: pay,
          durationMinutes: mins,
          clientName: 'Client',
          route: `${o.pickup_city || ''} → ${o.delivery_city || ''}`,
          displayDate: o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString() : '—',
          displayStatus: o.status === 'delivered' ? 'Terminée' : (o.status === 'picked_up' ? 'En cours' : o.status),
          pickupTime: pickupInfo,
          deliveryTime: deliveryInfo
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, from, to]);

  const handleSelectMonth = (monthStr) => {
    if (!monthStr) return;
    const [year, month] = monthStr.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // Day 0 of next month is last day of current

    // Format to YYYY-MM-DD for input[type=date]
    const fmt = (d) => d.toISOString().split('T')[0];
    setFrom(fmt(firstDay));
    setTo(fmt(lastDay));
  };

  const handleSaveInvoice = async () => {
    if (!confirm("Voulez-vous générer et sauvegarder cette facture dans Supabase ?")) return;
    setSaving(true);
    try {
      const periodLabel = from ? new Date(from).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "Période globale";
      const completedOrders = rows.filter(r => r.status === "delivered");

      // 1. Generate PDF Blob
      // We pass a special flag to get the blob
      const pdfBlob = generateDriverInvoicePdf({ ...driver, returnBlob: true }, completedOrders, periodLabel, computeDriverPay);

      if (!pdfBlob) throw new Error("Erreur génération PDF");

      // 2. Upload to Storage
      const fileName = `facture_${driver.id}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('driver-invoices')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage.from('driver-invoices').getPublicUrl(fileName);
      const documentUrl = publicUrlData.publicUrl;

      // 4. Save Record in DB
      const totalAmount = completedOrders.reduce((sum, o) => sum + computeDriverPay(o), 0);

      const { error: dbError } = await supabase.from('driver_payments').insert({
        driver_id: driver.id,
        period: periodLabel,
        amount: totalAmount,
        status: 'pending',
        document_url: documentUrl,
        created_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      alert("Facture sauvegardée avec succès !");

      // 5. Download for user
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Erreur sauvegarde facture:", err);
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadListing = () => {
    const periodLabel = from ? new Date(from).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "Période globale";
    const completedOrders = rows.filter(r => r.status === "delivered");
    generateDriverStatementPdf(driver, completedOrders, periodLabel, computeDriverPay);
  };

  const totals = useMemo(() => {
    const completedRows = rows.filter((r) => r.status === "delivered");
    const totalPay = completedRows.reduce((sum, r) => sum + Number(r.driverPayComputed || 0), 0);
    const totalMins = completedRows.reduce((sum, r) => sum + Number(r.durationMinutes || 0), 0);
    return { totalPay, totalMins, count: completedRows.length, allCount: rows.length };
  }, [rows]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={40} /></div>;
  if (!driver) return <div className="p-8 text-center text-slate-500">Chauffeur non trouvé.</div>;

  const driverDetails = driver.details || {};

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
            <User size={40} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2.5 w-2.5 rounded-full ${driver.is_online ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-300"}`}></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{driver.is_online ? "En ligne" : "Hors ligne"}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{driverDetails.full_name || driver.email || 'Nom inconnu'}</h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar size={14} className="text-slate-400" />
              Membre depuis le {new Date(driver.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={driver.role}
            onChange={async (e) => {
              const newRole = e.target.value;
              if (confirm(`Changer le rôle de ce membre vers "${newRole}" ?`)) {
                const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', driver.id);
                if (error) alert(error.message);
                else {
                  alert("Rôle mis à jour. L'utilisateur devra se reconnecter pour voir les changements.");
                  fetchData();
                }
              }
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="courier">Chauffeur</option>
            <option value="client">Client</option>
            <option value="admin">Administrateur</option>
          </select>

          <button
            onClick={async () => {
              if (confirm("Voulez-vous déconnecter ce chauffeur (le passer hors ligne) ?")) {
                const { data, error } = await supabase
                  .from('profiles')
                  .update({ is_online: false })
                  .eq('id', driver.id)
                  .select();
                console.log("FORCE_OFFLINE_DETAILS", { id: driver.id, data, error });
                if (error) alert(error.message);
                else {
                  alert("Chauffeur déconnecté (mis hors ligne).");
                  fetchData();
                }
              }
            }}
            className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 hover:shadow-sm"
            title="Forcer le statut hors ligne"
          >
            Déconnecter
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md"
            >
              <Edit2 size={16} />
              Modifier Profil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50"
              >
                <X size={16} />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Enregistrer
              </button>
            </div>
          )}
          <Link to="/dashboard-admin/drivers" className="group flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Retour
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Info Form */}
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 p-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8] mb-8">Informations Personnelles</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600 ml-1">Prénom & Nom</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600 ml-1">Téléphone</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">Email</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600 ml-1">Société</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="Ma Société Express"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600 ml-1">SIRET</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="123 456 789 00010"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">Adresse</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                  placeholder="123 rue de la livraison, 75000 Paris"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Vehicle Info */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8] mb-8 flex items-center gap-2">
                <Truck size={14} /> Véhicule
              </h3>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 ml-1">Modèle</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                    placeholder="Renault Master / Scooter"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 ml-1">Immatriculation</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                    placeholder="AA-123-BB"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 ml-1">Type</label>
                  <select
                    disabled={!isEditing}
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all appearance-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="velo">Vélo / Électrique</option>
                    <option value="scooter">Scooter / Moto</option>
                    <option value="voiture">Voiture / Van</option>
                    <option value="camion">Camion</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 p-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8] mb-8 flex items-center gap-2">
                <Banknote size={14} /> Informations Bancaires
              </h3>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 ml-1">IBAN</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                    placeholder="FR76 0000 0000 0000..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600 ml-1">BIC</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.bic}
                    onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:opacity-70 transition-all"
                    placeholder="XXXXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Missions History */}
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Historique des missions</h3>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Filtrer par période pour générer un listing</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <select
                    onChange={(e) => handleSelectMonth(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 px-3 py-1.5 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">Sélectionner un mois</option>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() - i);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                      return <option key={val} value={val}>{label}</option>;
                    })}
                  </select>
                  <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent px-2 py-1 text-xs font-semibold text-slate-500 focus:outline-none"
                  />
                  <span className="text-slate-300">→</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent px-2 py-1 text-xs font-semibold text-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDownloadListing}
                  disabled={rows.filter(r => r.status === "delivered").length === 0}
                  className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-50"
                  title="Télécharger le relevé détaillé des courses"
                >
                  <FileText size={16} className="text-blue-500" />
                  Listing
                </button>
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  disabled={rows.filter(r => r.status === "delivered").length === 0}
                  className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl disabled:opacity-50"
                  title="Générer et sauvegarder la facture sur Supabase"
                >
                  <Download size={16} className="text-emerald-400" />
                  Générer Facture
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                    <th className="px-6 py-4">Commande</th>
                    <th className="px-6 py-4">Trajet</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Enlèvement</th>
                    <th className="px-6 py-4">Livraison</th>
                    <th className="px-6 py-4">Durée</th>
                    <th className="px-6 py-4 text-right">Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">#{o.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{o.route}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 font-medium">{o.displayDate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-700 bg-slate-100/50 px-2 py-1 rounded-lg inline-block">{o.pickupTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg inline-block ${o.status === 'delivered' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                          {o.deliveryTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-700 font-medium">{fmtMinutes(o.durationMinutes)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-slate-900">{o.status === "delivered" ? Number(o.driverPayComputed || 0).toFixed(2) : "—"}€</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8]">Vue d'ensemble</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Courses effectuées</div>
                  <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{totals.count} <span className="text-sm font-bold text-slate-400">/ {totals.allCount}</span></div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock size={24} /></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Temps cumulé</div>
                  <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{fmtMinutes(totals.totalMins)}</div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><TrendingUp size={24} /></div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Gains totaux (HT)</div>
                  <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">{totals.totalPay.toFixed(2)}€</div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Banknote size={24} /></div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <h4 className="flex items-center gap-2 text-sm font-bold mb-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Statut Administratif
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Profil vérifié et actif. Le chauffeur reçoit ses virements automatiquement via les coordonnées IBAN renseignées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
