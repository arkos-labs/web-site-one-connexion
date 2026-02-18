import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";
import AdminClientInvoicesPanel from "./AdminClientInvoicesPanel.jsx";

function buildReminderEmail({ client, overdue, totals }) {
  const name = client.details?.company || client.details?.full_name || client.id;
  const subject = `Relance facture(s) — ${name}`;

  const lines = [
    `Bonjour ${client.details?.contact_name || client.details?.contact_person || name},`,
    ``,
    `Sauf erreur de notre part, des factures sont en attente de règlement :`,
    ``,
    ...overdue.map((i) => `- ${i.id.slice(0, 8)} (${new Date(i.period_start).toLocaleDateString()}) • ${Number(i.total_ttc || 0).toFixed(2)}€ • Échéance: ${new Date(i.due_date).toLocaleDateString()} • Statut: ${i.status}`),
    ``,
    `Total dû : ${totals.overdueAmount.toFixed(2)}€`,
    ``,
    `Merci de nous confirmer la date de règlement ou de procéder au paiement.`,
    ``,
    `Cordialement,`,
    `One Connexion`,
  ];

  return { subject, body: lines.join("\n") };
}

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((b - a) / ms);
}

function computeClientRisk(invoices) {
  const today = new Date();
  const unpaid = invoices.filter((i) => i.status !== "paid");
  const overdue = unpaid.filter((i) => i.due_date && new Date(i.due_date) < today);

  const unpaidAmount = unpaid.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const overdueAmount = overdue.reduce((s, i) => s + Number(i.total_ttc || 0), 0);
  const worstLateDays = overdue.length
    ? Math.max(...overdue.map((i) => daysBetween(new Date(i.due_date), today)))
    : 0;

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

export default function AdminClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [ordersAll, setOrdersAll] = useState([]);
  const [invoicesAll, setInvoicesAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [action, setAction] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

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
    return ordersAll.filter((o) => {
      if (filter === "Terminée") return o.status === "delivered";
      if (filter === "En cours") return o.status === "picked_up";
      if (filter === "À dispatcher") return o.status === "assigned";
      return o.status === filter;
    });
  }, [ordersAll, filter]);

  const spend = ordersAll.reduce((sum, o) => sum + Number(o.price_ht || 0), 0);
  const risk = useMemo(() => computeClientRisk(invoicesAll), [invoicesAll]);

  const mailto = useMemo(() => {
    if (!client || !risk.overdue.length) return null;
    const today = new Date();
    const eligible = risk.overdue.filter((i) => {
      const due = new Date(i.due_date);
      const daysLate = Math.floor((today.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
      return daysLate >= 30;
    });

    if (!eligible.length) return null;

    const totals = { overdueAmount: eligible.reduce((s, i) => s + Number(i.total_ttc || 0), 0) };
    const { subject, body } = buildReminderEmail({ client, overdue: eligible, totals });

    const to = client.details?.email || "";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [client, risk]);

  const handleSendChat = async () => {
    if (!chatMsg.trim()) return;
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: id,
        content: chatMsg,
        is_admin_message: true
      });

      if (error) throw error;
      alert("Message envoyé !");
      setChatMsg("");
      setAction(null);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;
  if (!client) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Client introuvable</h1>
        <Link to="/admin/clients" className="mt-4 inline-block rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Retour aux clients</Link>
      </div>
    );
  }

  const clientName = client.details?.company || client.details?.full_name || "Client";

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{clientName}</h1>
          <p className="text-sm text-slate-500">SIRET {client.details?.siret || "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Dépenses</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{spend.toFixed(2)}€</div>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Risque</div>
            <div className={`mt-1 text-xl font-bold ${risk.level === "Élevé" ? "text-rose-600" : risk.level === "Moyen" ? "text-amber-600" : "text-emerald-600"}`}>Risque {risk.level} • {risk.score}/100</div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="text-sm font-bold text-slate-900">Fiche client (CRM)</div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="space-y-3">
              <Info label="Contact" value={client.details?.contact_name || client.details?.contact_person || "—"} />
              <Info label="Email" value={client.details?.email || "—"} />
              <Info label="Téléphone" value={client.details?.phone || "—"} />
              <Info label="Adresse" value={client.details?.address || "—"} />
            </div>
            <div className="space-y-3">
              <Info label="SIRET" value={client.details?.siret || "—"} />
              <Info label="TVA" value={client.details?.tva || "—"} />
              <Info label="IBAN" value={client.details?.iban || "—"} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {mailto ? (
              <a href={mailto} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Relance email (1 clic)</a>
            ) : (
              <button disabled className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed">Relance email</button>
            )}
            <button onClick={() => setAction("sms")} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Relance SMS</button>
            <button onClick={() => setAction("tchat")} className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 border border-blue-100 italic transition-all hover:bg-blue-100">Message Tchat</button>
          </div>
          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes CRM</label>
            <textarea className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100" rows={3} placeholder="Notes sur le client..." />
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Gestion du compte</h3>
            <div className="bg-slate-50 rounded-2xl p-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Rôle Utilisateur</label>
              <div className="flex gap-2">
                <select
                  value={client.role || 'client'}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', client.id);
                    if (error) alert("Erreur: " + error.message);
                    else {
                      setClient({ ...client, role: newRole });
                      alert("Rôle mis à jour !");
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="client">Client</option>
                  <option value="courier">Chauffeur (Courier)</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Attention : Changer un rôle modifie les permissions d'accès immédiatement.
                <br />• <strong>Chauffeur</strong> : Accès à l'app mobile Dispatch.
                <br />• <strong>Admin</strong> : Accès complet au dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="text-sm font-bold text-slate-900">Résumé financiers</div>
            <div className="mt-4 grid gap-3 text-sm">
              <Info label="Commandes" value={ordersAll.length} />
              <Info label="Factures impayées" value={risk.unpaid.length} />
              <Info label="Montant impayé" value={`${risk.unpaidAmount.toFixed(2)}€`} />
            </div>
          </div>
          <AdminClientInvoicesPanel invoices={invoicesAll} ordersAll={ordersAll} />
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-900">Commandes du client</div>
          <div className="flex flex-wrap gap-2">
            {["Tous", "À dispatcher", "En cours", "Terminée"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-2 text-xs font-bold ${filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2">Commande</th>
                <th className="py-2">Trajet</th>
                <th className="py-2">Date</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">#{o.id.slice(0, 8)}</td>
                  <td className="py-3 text-slate-700">{o.pickup_city} → {o.delivery_city}</td>
                  <td className="py-3 text-slate-500">{o.scheduled_at ? new Date(o.scheduled_at).toLocaleDateString() : "—"}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${o.status === "delivered" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900">{Number(o.price_ht || 0).toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {
        action && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  {action === 'tchat' ? 'Envoyer un message interne' : `Relance ${action.toUpperCase()}`}
                </div>
                <button onClick={() => setAction(null)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>

              {action === 'tchat' ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    rows={4}
                    placeholder="Votre message pour le client..."
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={sending || !chatMsg.trim()}
                    className="w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    {sending ? "Envoi..." : "Envoyer le message au tchat"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm text-slate-600">Action: {action} sur {client.details?.phone || "numéro inconnu"}.</div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button onClick={() => setAction(null)} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Fermer</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}


