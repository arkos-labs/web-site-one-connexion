import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateOrderPdf } from "../lib/pdfGenerator";
import {
  Loader2, ArrowLeft, MapPin, Clock, Package, User, Phone,
  FileText, CheckCircle2, Truck, AlertTriangle, Save, ChevronRight
} from "lucide-react";
import AdminPageHeader from "../components/admin/AdminPageHeader";

const STATUS_CONFIG = {
  pending_acceptance: { label: "Nouveau", cls: "bg-rose-50 text-rose-700 border-rose-200", step: 0 },
  pending: { label: "En attente", cls: "bg-rose-50 text-rose-700 border-rose-200", step: 0 },
  accepted: { label: "Validé", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", step: 1 },
  assigned: { label: "Assigné", cls: "bg-amber-50 text-amber-700 border-amber-200", step: 2 },
  driver_accepted: { label: "Accepté chauffeur", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", step: 3 },
  picked_up: { label: "Enlevée", cls: "bg-blue-50 text-blue-700 border-blue-200", step: 4 },
  in_progress: { label: "Enlevée", cls: "bg-blue-50 text-blue-700 border-blue-200", step: 4 },
  delivered: { label: "Livrée ✓", cls: "bg-slate-100 text-slate-700 border-slate-300", step: 5 },
  cancelled: { label: "Annulée", cls: "bg-red-50 text-red-600 border-red-200", step: -1 },
};

const PIPELINE = [
  { key: "pending_acceptance", label: "Nouveau" },
  { key: "accepted", label: "Validé" },
  { key: "driver_accepted", label: "Accepté" },
  { key: "in_progress", label: "Enlevé" },
  { key: "delivered", label: "Livré" },
];

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [edit, setEdit] = useState({
    pickupTime: "", deliveryDeadline: "", contactPhone: "",
    accessCode: "", deliveryPhone: "", deliveryAccessCode: "",
    dispatchNote: "", driverId: "", serviceLevel: "",
  });

  useEffect(() => {
    if (!edit.pickupTime || !edit.serviceLevel) return;
    const [h, m] = edit.pickupTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const delays = { super: 90, exclu: 180, normal: 240 };
    const total = (h * 60) + m + (delays[edit.serviceLevel] || 240);
    const newTime = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    if (edit.deliveryDeadline !== newTime) setEdit(p => ({ ...p, deliveryDeadline: newTime }));
  }, [edit.pickupTime, edit.serviceLevel, edit.deliveryDeadline]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchOrder(); fetchDrivers(); }, [id]);

  const fetchDrivers = async (keepId = null) => {
    const { data } = await supabase.from('profiles').select('id, details, is_online').eq('role', 'courier');
    if (data) {
      const currentId = keepId || edit.driverId || order?.driver_id;
      setDrivers(data.filter(d => d.is_online || d.id === currentId).map(d => ({
        id: d.id,
        name: d.details?.full_name || d.details?.company || 'Chauffeur',
        isOnline: d.is_online
      })));
    }
  };

  const fetchOrder = async () => {
    setLoading(true);
    const { data: ord, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !ord) { setLoading(false); return; }
    setOrder(ord);
    if (ord.client_id) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', ord.client_id).single();
      if (profile) setClient(profile);
    }
    const safeTime = (d) => { if (!d) return ""; try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ""; } };
    setEdit({
      pickupTime: ord.scheduled_at ? new Date(ord.scheduled_at).toLocaleTimeString().slice(0, 5) : "",
      deliveryDeadline: safeTime(ord.delivery_deadline),
      contactPhone: ord.pickup_phone || "",
      accessCode: ord.pickup_access_code || "",
      deliveryPhone: ord.delivery_phone || "",
      deliveryAccessCode: ord.delivery_access_code || "",
      dispatchNote: ord.notes?.match(/Dispatch: (.*)/)?.[1] || "",
      driverId: ord.driver_id || "",
      serviceLevel: ord.service_level || "normal",
    });
    fetchDrivers(ord.driver_id);
    setLoading(false);
  };

  const saveEdits = async () => {
    if (!order) return;
    setSaving(true);
    const datePart = (order.scheduled_at || order.created_at).split('T')[0];
    const updates = {
      pickup_phone: edit.contactPhone,
      pickup_access_code: edit.accessCode,
      delivery_phone: edit.deliveryPhone,
      delivery_access_code: edit.deliveryAccessCode,
      service_level: edit.serviceLevel,
      driver_id: edit.driverId || null,
      notes: `${(order.notes || '').split(' | Dispatch:')[0]} | Dispatch: ${edit.dispatchNote}`,
      ...(edit.pickupTime ? { scheduled_at: `${datePart}T${edit.pickupTime}:00` } : {}),
      ...(edit.deliveryDeadline ? { delivery_deadline: `${datePart}T${edit.deliveryDeadline}:00` } : {}),
    };
    if (edit.driverId) {
      const driverChanged = String(edit.driverId) !== String(order.driver_id);
      const canAssign = ['pending', 'pending_acceptance', 'accepted'].includes(order.status);
      const canReassign = ['assigned', 'driver_accepted', 'in_progress'].includes(order.status) && driverChanged;
      if (canAssign || canReassign || (!order.driver_id && edit.driverId)) {
        updates.status = 'driver_accepted';
        updates.driver_id = edit.driverId;
        updates.driver_accepted_at = new Date().toISOString();
        // Send async, don't wait for it
      }
    }
    const { error } = await supabase.from('orders').update(updates).eq('id', order.id);
    if (!error) { await fetchOrder(); } else alert("Erreur: " + error.message);
    setSaving(false);
  };

  const updateStatus = async (newStatus) => {
    setSaving(true);

    // Vérifier la session avant la mise à jour
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("⚠️ Votre session a expiré. Veuillez vous reconnecter.");
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    const patch = { status: newStatus, updated_at: now };
    if (newStatus === 'driver_accepted') patch.driver_accepted_at = now;

    // Utiliser .select() pour confirmer que la ligne a bien été modifiée
    const { data: updated, error } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', id)
      .select('id, status');

    if (error) {
      console.error('updateStatus error:', error);
      alert(`Erreur mise à jour statut: ${error.message}`);
      setSaving(false);
      return;
    }

    // Vérifier que l'update a bien eu lieu (RLS peut bloquer silencieusement)
    if (!updated || updated.length === 0) {
      alert("⚠️ Session admin expirée — veuillez vous déconnecter et vous reconnecter.");
      setSaving(false);
      return;
    }


    await fetchOrder();
    setSaving(false);
  };


  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement…</span>
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <div className="text-2xl font-black text-slate-300 mb-3">Commande introuvable</div>
      <button onClick={() => navigate('/admin/orders')} className="text-sm font-bold text-orange-500 hover:underline">← Retour aux missions</button>
    </div>
  );

  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = sc.step;
  const notesStr = order.notes || "";
  const pCode = order.pickup_access_code || notesStr.match(/(?:Code Enlev:|Code :|Code:)\s?([^.]+)/)?.[1]?.trim();
  const dCode = order.delivery_access_code || notesStr.match(/(?:Code Dest:|Code Deliv:)\s?([^.]+)/)?.[1]?.trim();
  const nInstructions = notesStr.match(/Instructions:\s*(.*?)(?:\.|$)/)?.[1]?.trim() || "";
  const nPNote = nInstructions.split('/')?.[0]?.trim();
  const nDNote = nInstructions.split('/')?.[1]?.trim();
  const pickupName = order.pickup_name || notesStr.match(/(?:Entreprise Pick|Contact Pick):\s*(.*?)(?:\.|$)/)?.[1]?.trim() || "—";
  const deliveryName = order.delivery_name || notesStr.match(/(?:Entreprise Deliv|Contact Deliv):\s*(.*?)(?:\.|$)/)?.[1]?.trim() || "—";
  const pickupPhone = order.pickup_phone || notesStr.match(/Phone Pick:\s*(.*?)(?:\.|$)/)?.[1]?.trim() || "—";
  const deliveryPhone = order.delivery_phone || notesStr.match(/Phone Deliv:\s*(.*?)(?:\.|$)/)?.[1]?.trim() || "—";
  const displayCompany = client?.details?.company || "";
  const displayEmail = client?.details?.email || "—";
  const packageNature = order.package_type || "—";
  const packageWeight = order.weight ? `${order.weight} kg` : "—";
  const assignedDriver = drivers.find(d => d.id === order.driver_id);

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={`Commande #${order.id.slice(0, 8)}`}
        subtitle={`${order.pickup_city || '—'} → ${order.delivery_city || '—'} · ${displayCompany || pickupName}`}
        backTo="/admin/orders"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${sc.cls}`}>
              {sc.label}
            </span>
            <button
              onClick={() => generateOrderPdf(order, client)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileText size={14} /> Bon de commande PDF
            </button>
            {['pending_acceptance', 'pending'].includes(order.status) && (
              <button onClick={() => updateStatus(order.driver_id || edit.driverId ? 'driver_accepted' : 'accepted')} disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-orange-500 transition-all disabled:opacity-50 tracking-widest uppercase">ACCEPTER</button>
            )}
            {order.status === 'accepted' && (
              <button onClick={() => {
                const el = document.getElementById('driver-select');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-700 transition-all disabled:opacity-50">DISPATCHER</button>
            )}
            {order.status === 'in_progress' && (
              <button onClick={() => updateStatus('delivered')} disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition-all disabled:opacity-50">MARQUER LIVRÉE</button>
            )}
            {order.status === 'delivered' && (
              <button
                onClick={() => {
                  import("../lib/pdfGenerator").then(m => m.generateIndividualInvoicePdf(order, client));
                }}
                className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
              >
                <TrendingUp size={14} /> Facture PDF
              </button>
            )}
            {!['delivered', 'cancelled'].includes(order.status) && (
              <button onClick={() => { if (confirm('Annuler cette commande ?')) updateStatus('cancelled'); }} disabled={saving} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-50">ANNULER</button>
            )}
          </div>
        }
      />

      {/* Pipeline */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-0 overflow-x-auto">
          {PIPELINE.map((step, i) => {
            const currentStepIdx = STATUS_CONFIG[order.status]?.step ?? 0;
            const isDone = currentStepIdx >= i;
            const isCurrent = currentStepIdx === i;
            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${isCurrent ? 'bg-orange-500 border-orange-500 text-white scale-110' : isDone ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {isDone && !isCurrent ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${isCurrent ? 'text-orange-500' : isDone ? 'text-slate-700' : 'text-slate-300'}`}>{step.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className={`h-px flex-1 mx-1 ${PIPELINE.findIndex(s => s.key === order.status) > i ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-[1fr_420px] gap-6">
        {/* Left — order info */}
        <div className="space-y-5">
          {/* Route */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Itinéraire</div>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center"><MapPin size={12} className="text-white" /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Enlèvement</span>
                </div>
                <div className="font-black text-slate-900 text-sm">{pickupName}</div>
                <div className="text-xs text-slate-500 mt-1">{order.pickup_address || "—"}</div>
                {pCode && <div className="mt-2 inline-flex items-center rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-1 text-xs font-black text-orange-600">🔑 Code: {pCode}</div>}
                {nPNote && <div className="mt-2 text-xs text-slate-600 italic bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">📝 {nPNote}</div>}
                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  {pickupPhone !== "—" && <span className="flex items-center gap-1"><Phone size={11} /> {pickupPhone}</span>}
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center"><MapPin size={12} className="text-white" /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Livraison</span>
                </div>
                <div className="font-black text-slate-900 text-sm">{deliveryName}</div>
                <div className="text-xs text-slate-500 mt-1">{order.delivery_address || "—"}</div>
                {dCode && <div className="mt-2 inline-flex items-center rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-1 text-xs font-black text-orange-600">🔑 Code: {dCode}</div>}
                {nDNote && <div className="mt-2 text-xs text-slate-600 italic bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">📝 {nDNote}</div>}
                {deliveryPhone !== "—" && <div className="mt-3 flex items-center gap-1 text-xs text-slate-500"><Phone size={11} /> {deliveryPhone}</div>}
              </div>

              {/* Timing row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Enlèvement</div>
                  <div className="text-sm font-black text-slate-900">{order.scheduled_at ? new Date(order.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : "Immédiat"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Deadline</div>
                  <div className="text-sm font-black text-slate-900">{order.delivery_deadline ? new Date(order.delivery_deadline).toLocaleTimeString('fr-FR', { timeStyle: 'short' }) : "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Package */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Colis & Formule</div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Type", value: packageNature },
                { label: "Poids", value: packageWeight },
                { label: "Contenu", value: order.package_description || "—" },
                { label: "Véhicule", value: order.vehicle_type?.toUpperCase() || "—" },
                { label: "Formule", value: order.service_level?.toUpperCase() || "—" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Expéditeur</div>
              {!client?.id && <span className="rounded-lg bg-orange-50 border border-orange-100 px-2 py-0.5 text-[9px] font-black text-orange-600 uppercase">Invité</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Entreprise", value: displayCompany || pickupName },
                { label: "Email", value: displayEmail },
                { label: "Téléphone", value: client?.details?.phone || pickupPhone },
                { label: "Adresse fact.", value: client?.details?.address || "—" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                  <div className="font-bold text-slate-800 truncate mt-0.5">{item.value || "—"}</div>
                </div>
              ))}
            </div>
            {client?.id && (
              <button onClick={() => navigate(`/admin/clients/${client.id}`)} className="mt-4 flex items-center gap-1.5 text-xs font-black text-orange-500 hover:underline">
                Voir le dossier client <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right — Dispatch panel */}
        <div className="space-y-5">
          {/* Price */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-24 w-24 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Montant HT</div>
              <div className="text-5xl font-black tabular-nums">{Number(order.price_ht || 0).toFixed(2)}€</div>
              <div className="text-xs text-slate-500 mt-1">+20% TVA = {(Number(order.price_ht || 0) * 1.2).toFixed(2)}€ TTC</div>
              {assignedDriver && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Livreur assigné</div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 text-[10px] font-black grid place-items-center">{assignedDriver.name[0]}</div>
                    <span className="text-sm font-black">{assignedDriver.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit dispatch panel */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Dispatch & Édition</div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Chauffeur assigné</label>
                <select
                  id="driver-select"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  value={edit.driverId}
                  onChange={e => setEdit(p => ({ ...p, driverId: e.target.value }))}
                >
                  <option value="">-- Aucun chauffeur --</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}{d.isOnline ? ' 🟢' : ' ⚫'}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Formule</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" value={edit.serviceLevel} onChange={e => setEdit(p => ({ ...p, serviceLevel: e.target.value }))}>
                    <option value="normal">Normal(4h)</option>
                    <option value="exclu">Exclu (3h)</option>
                    <option value="super">Super(1h30)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Enlèvement</label>
                  <input type="time" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" value={edit.pickupTime} onChange={e => setEdit(p => ({ ...p, pickupTime: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Deadline (auto)</label>
                  <input readOnly className="w-full rounded-xl border border-slate-100 bg-slate-100 px-3 py-3 text-sm font-black text-slate-500 cursor-not-allowed" value={edit.deliveryDeadline} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Tél. Enlèvement</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="06…" value={edit.contactPhone} onChange={e => setEdit(p => ({ ...p, contactPhone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Code d'accès Pick.</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="Digicode…" value={edit.accessCode} onChange={e => setEdit(p => ({ ...p, accessCode: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Tél. Livraison</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="06…" value={edit.deliveryPhone} onChange={e => setEdit(p => ({ ...p, deliveryPhone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Code d'accès Dest.</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="Digicode…" value={edit.deliveryAccessCode} onChange={e => setEdit(p => ({ ...p, deliveryAccessCode: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Note dispatch</label>
                <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="Prioritaire, fragile, appeler avant…" value={edit.dispatchNote} onChange={e => setEdit(p => ({ ...p, dispatchNote: e.target.value }))} />
              </div>

              <button
                onClick={saveEdits}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-black text-white hover:bg-orange-500 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer les modifications
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Informations</div>
            <div className="space-y-2.5">
              {[
                { label: "ID Commande", value: `#${order.id.slice(0, 8)}` },
                { label: "Créée le", value: new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) },
                { label: "Statut actuel", value: sc.label },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                  <span className="text-xs font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


