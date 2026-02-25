import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Loader2, Mail, Phone, Building2, Save, Edit2, X, MessageSquare,
  TrendingUp, AlertTriangle, CheckCircle2, FileText, ChevronRight, Trash2, Shield
} from "lucide-react";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import AdminClientInvoicesPanel from "./AdminClientInvoicesPanel.jsx";

function daysBetween(a, b) {
  return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

function computeClientRisk(invoices) {
  const today = new Date();
  const unpaid = invoices.filter(i => i.status !== "paid");
  const overdue = unpaid.filter(i => i.due_date && new Date(i.due_date) < today);
  const unpaidAmount = unpaid.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const overdueAmount = overdue.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const worstLateDays = overdue.length ? Math.max(...overdue.map(i => daysBetween(new Date(i.due_date), today))) : 0;
  let score = 0;
  if (unpaid.length >= 1) score += 20;
  if (unpaid.length >= 2) score += 20;
  if (overdue.length >= 1) score += 25;
  if (overdue.length >= 2) score += 15;
  if (overdueAmount > 500) score += 10;
  if (worstLateDays > 15) score += 10;
  score = Math.min(100, score);
  const level = score >= 70 ? "Élevé" : score >= 40 ? "Moyen" : "Faible";
  return { score, level, unpaid, overdue, unpaidAmount, overdueAmount, worstLateDays };
}

function buildReminderEmail({ client, overdue, totals }) {
  const name = client.details?.company || client.details?.full_name || client.id;
  const subject = `Relance facture(s) — ${name}`;
  const lines = [
    `Bonjour ${client.details?.contact_name || name},`, ``,
    `Sauf erreur de notre part, des factures sont en attente de règlement :`, ``,
    ...overdue.map(i => `- ${i.id.slice(0, 8)} • ${Number(i.total_ttc || 0).toFixed(2)}€ • Échéance: ${new Date(i.due_date).toLocaleDateString()}`),
    ``, `Total dû : ${totals.overdueAmount.toFixed(2)}€`, ``,
    `Merci de nous confirmer la date de règlement.`, ``, `Cordialement,`, `One Connexion`,
  ];
  return { subject, body: lines.join("\n") };
}

export default function AdminClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [ordersAll, setOrdersAll] = useState([]);
  const [invoicesAll, setInvoicesAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [isEditing, setIsEditing] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [cRes, oRes, iRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('orders').select('*').eq('client_id', id),
      supabase.from('invoices').select('*').eq('client_id', id)
    ]);
    if (cRes.data) setClient(cRes.data);
    if (oRes.data) setOrdersAll(oRes.data);
    if (iRes.data) setInvoicesAll(iRes.data);
    setLoading(false);
  };

  const orders = useMemo(() => {
    if (filter === "Tous") return ordersAll;
    if (filter === "Terminée") return ordersAll.filter(o => o.status === "delivered");
    if (filter === "En cours") return ordersAll.filter(o => o.status === "in_progress");
    if (filter === "À dispatcher") return ordersAll.filter(o => o.status === "assigned");
    return ordersAll;
  }, [ordersAll, filter]);

  const spend = ordersAll.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);
  const risk = useMemo(() => computeClientRisk(invoicesAll), [invoicesAll]);

  const mailto = useMemo(() => {
    if (!client || !risk.overdue.length) return null;
    const today = new Date();
    const eligible = risk.overdue.filter(i => {
      const days = Math.floor((today - new Date(i.due_date)) / (24 * 60 * 60 * 1000));
      return days >= 30;
    });
    if (!eligible.length) return null;
    const totals = { overdueAmount: eligible.reduce((s, i) => s + Number(i.total_ttc || 0), 0) };
    const { subject, body } = buildReminderEmail({ client, overdue: eligible, totals });
    return `mailto:${client.details?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [client, risk]);

  const handleDetailChange = (name, value) =>
    setClient(prev => ({ ...prev, details: { ...(prev.details || {}), [name]: value } }));

  const handleSaveDetails = async () => {
    setSending(true);
    const { error } = await supabase.from('profiles').update({ details: client.details }).eq('id', id);
    if (error) alert("Erreur: " + error.message);
    else { setIsEditing(false); alert("Détails mis à jour !"); }
    setSending(false);
  };

  const handleSendChat = async () => {
    if (!chatMsg.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id, recipient_id: id, content: chatMsg, is_admin_message: true
    });
    if (error) alert("Erreur: " + error.message);
    else { setChatMsg(""); setChatOpen(false); }
    setSending(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold">Chargement…</span>
    </div>
  );

  if (!client || client.role === 'admin') return (
    <div className="py-20 text-center">
      <div className="text-2xl font-black text-slate-300 mb-3">{!client ? "Client introuvable" : "Accès refusé"}</div>
      <button onClick={() => navigate('/admin/clients')} className="text-sm font-bold text-orange-500 hover:underline">← Retour aux clients</button>
    </div>
  );

  const clientName = client.details?.company || client.details?.full_name || "Client";
  const riskColor = risk.level === "Élevé" ? "text-rose-600" : risk.level === "Moyen" ? "text-amber-600" : "text-emerald-600";
  const riskBg = risk.level === "Élevé" ? "bg-rose-50 border-rose-100" : risk.level === "Moyen" ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100";

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title={clientName}
        subtitle={`SIRET ${client.details?.siret || "—"} · Membre depuis le ${new Date(client.created_at).toLocaleDateString('fr-FR')}`}
        backTo="/admin/clients"
        actions={
          <div className="flex items-center gap-3">
            {/* Risk badge */}
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${riskBg}`}>
              <span className={`h-2 w-2 rounded-full ${risk.level === "Élevé" ? "bg-rose-500 animate-pulse" : risk.level === "Moyen" ? "bg-amber-500" : "bg-emerald-500"}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${riskColor}`}>Risque {risk.level} · {risk.score}/100</span>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500">
                  <X size={14} /> Annuler
                </button>
                <button onClick={handleSaveDetails} disabled={sending} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition-all">
                  <Save size={14} /> Sauvegarder
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <TrendingUp size={18} />, iconBg: "bg-indigo-100 text-indigo-600", label: "CA Total", value: `${spend.toFixed(0)}€` },
          { icon: <FileText size={18} />, iconBg: "bg-slate-100 text-slate-600", label: "Commandes", value: ordersAll.length },
          { icon: <AlertTriangle size={18} />, iconBg: risk.unpaid.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400", label: "Impayées", value: risk.unpaidAmount.toFixed(0) + "€", alert: risk.unpaid.length > 0 },
          { icon: <CheckCircle2 size={18} />, iconBg: "bg-emerald-100 text-emerald-600", label: "En retard", value: risk.overdue.length === 0 ? "Aucune" : `${risk.overdue.length} facture(s)`, alert: risk.overdue.length > 0 },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-[2rem] p-5 border ${kpi.alert ? 'border-amber-100 ring-1 ring-amber-200' : 'border-slate-100'} shadow-sm`}>
            <div className={`h-9 w-9 rounded-xl mb-3 flex items-center justify-center ${kpi.iconBg}`}>{kpi.icon}</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-[1fr_380px] gap-6">
        {/* CRM Card */}
        <div className="space-y-5">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">Fiche Client — CRM</div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: "Entreprise", name: "company", value: client.details?.company },
                { label: "Contact", name: "contact_name", value: client.details?.contact_name || client.details?.contact_person },
                { label: "Email", name: "email", value: client.details?.email },
                { label: "Téléphone", name: "phone", value: client.details?.phone },
                { label: "Adresse", name: "address", value: client.details?.address },
                { label: "Code Postal", name: "zip", value: client.details?.zip || client.details?.postal_code },
                { label: "Ville", name: "city", value: client.details?.city },
                { label: "SIRET", name: "siret", value: client.details?.siret },
                { label: "TVA Intra.", name: "tva", value: client.details?.tva },
                { label: "IBAN", name: "iban", value: client.details?.iban },
              ].map((field) => (
                <div key={field.name} className={`rounded-2xl p-3.5 border ${isEditing ? 'border-slate-200 bg-white shadow-sm' : 'bg-slate-50 border-transparent'} transition-all`}>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{field.label}</div>
                  {isEditing ? (
                    <input
                      className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                      value={field.value || ""}
                      onChange={e => handleDetailChange(field.name, e.target.value)}
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-900">{field.value || "—"}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes CRM */}
            <div className="mt-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes CRM internes</div>
              <textarea
                rows={3}
                className={`w-full rounded-2xl p-4 text-sm ${isEditing ? 'border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5' : 'border border-transparent bg-slate-50'} transition-all`}
                placeholder="Notes internes sur le client…"
                value={client.details?.notes || ""}
                onChange={e => handleDetailChange("notes", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            {/* Actions CRM */}
            <div className="mt-4 flex flex-wrap gap-2">
              {mailto ? (
                <a href={mailto} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-orange-500 transition-all">
                  <Mail size={14} /> Relance email (1 clic)
                </a>
              ) : (
                <button disabled className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-400 cursor-not-allowed">
                  <Mail size={14} /> Relance email
                </button>
              )}
              <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-all">
                <MessageSquare size={14} /> Message tchat
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commandes du client</div>
              <div className="flex gap-2 flex-wrap">
                {["Tous", "À dispatcher", "En cours", "Terminée"].map(s => (
                  <button key={s} onClick={() => setFilter(s)} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 border-b border-slate-50">
                    <th className="px-6 py-3">Commande</th>
                    <th className="px-6 py-3">Trajet</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-sm font-bold text-slate-300">Aucune commande dans cette catégorie.</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-all group">
                      <td className="px-6 py-4 font-black text-slate-900 group-hover:text-orange-500 transition-colors">#{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{o.pickup_city} → {o.delivery_city}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString('fr-FR') : "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${o.status === "delivered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {o.status === "delivered" ? "Terminée" : o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 tabular-nums">{Number(o.price_ht || 0).toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Risk */}
          <div className={`rounded-[2rem] border p-6 ${riskBg}`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Indice de solvabilité</div>
            <div className="w-full h-2 rounded-full bg-white/50 overflow-hidden mb-3">
              <div className={`h-full rounded-full ${risk.level === "Élevé" ? "bg-rose-500" : risk.level === "Moyen" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${risk.score}%` }} />
            </div>
            <div className={`text-3xl font-black ${riskColor}`}>{risk.score}<span className="text-base">/100</span></div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                { label: "Factures impayées", value: risk.unpaid.length },
                { label: "En retard", value: risk.overdue.length },
                { label: "Montant impayé", value: `${risk.unpaidAmount.toFixed(2)}€` },
                { label: "Montant en retard", value: `${risk.overdueAmount.toFixed(2)}€` },
                { label: "Retard max", value: risk.worstLateDays > 0 ? `${risk.worstLateDays} jours` : "—" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500">{item.label}</span>
                  <span className={`text-xs font-black ${risk.level === "Élevé" && i > 1 ? "text-rose-700" : "text-slate-700"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factures panel */}
          <AdminClientInvoicesPanel invoices={invoicesAll} ordersAll={ordersAll} />

          {/* Account management */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-slate-400" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gestion du compte</div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Rôle utilisateur</label>
              <select
                value={client.role || 'client'}
                disabled={!isEditing}
                onChange={async e => {
                  const newRole = e.target.value;
                  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', client.id);
                  if (error) alert("Erreur: " + error.message);
                  else { setClient({ ...client, role: newRole }); }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold focus:outline-none disabled:opacity-50 transition-all"
              >
                <option value="client">Client</option>
                <option value="courier">Chauffeur (Courier)</option>
                <option value="admin">Administrateur</option>
              </select>
              <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">Changer le rôle modifie les permissions immédiatement.</p>
            </div>
            <button
              onClick={async () => {
                if (confirm(`Supprimer définitivement le compte de ${clientName} ? Cette action est irréversible.`)) {
                  const { error } = await supabase.from('profiles').delete().eq('id', client.id);
                  if (error) alert("Erreur : " + error.message);
                  else { navigate("/admin/clients"); }
                }
              }}
              className="mt-4 flex items-center gap-2 w-full justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition-all"
            >
              <Trash2 size={14} /> Supprimer ce compte
            </button>
          </div>
        </div>
      </div>

      {/* Chat modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Message tchat</div>
                <div className="text-lg font-black text-slate-900">{clientName}</div>
              </div>
              <button onClick={() => setChatOpen(false)} className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><X size={16} /></button>
            </div>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              placeholder="Votre message pour le client…"
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
            />
            <button
              onClick={handleSendChat}
              disabled={sending || !chatMsg.trim()}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-black text-white hover:bg-orange-500 transition-all disabled:opacity-50"
            >
              {sending ? "Envoi…" : "Envoyer le message"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
