import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { generateOrderPdf } from "../lib/pdfGenerator";
import { Loader2 } from "lucide-react";

export default function AdminOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [edit, setEdit] = useState({
    pickupTime: "",
    deliveryDeadline: "",
    contactPhone: "",
    accessCode: "",
    dispatchNote: "",
    etaMinutes: "",
    driverId: "",
    serviceLevel: "",
  });

  // Auto-calculate delivery time based on formula in Admin
  useEffect(() => {
    if (!edit.pickupTime || !edit.serviceLevel) return;

    const [h, m] = edit.pickupTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;

    // Add delay based on formula
    const delays = {
      super: 90,   // 1h30
      exclu: 180,  // 3h
      normal: 240  // 4h
    };

    const totalMinutes = (h * 60) + m + (delays[edit.serviceLevel] || 240);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;

    const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    if (edit.deliveryDeadline !== newTime) {
      setEdit(prev => ({ ...prev, deliveryDeadline: newTime }));
    }
  }, [edit.pickupTime, edit.serviceLevel]);

  useEffect(() => {
    fetchOrder();
    fetchDrivers();
  }, [id]);

  const fetchDrivers = async (idToKeep = null) => {
    const { data } = await supabase.from('profiles').select('id, details, is_online').eq('role', 'courier');
    if (data) {
      const currentId = idToKeep || edit.driverId || order?.driver_id;
      const filtered = data
        .filter(d => d.is_online === true || d.id === currentId)
        .map(d => ({
          id: d.id,
          name: d.details?.full_name || d.details?.company || 'Chauffeur inconnu',
          isOnline: d.is_online
        }));
      setDrivers(filtered);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data: ord, error } = await supabase.from('orders').select('*').eq('id', id).single();

      if (error) {
        console.error("Error loading order:", error);
        setLoading(false);
        return;
      }

      if (ord) {
        setOrder(ord);
        // Fetch Client
        if (ord.client_id) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', ord.client_id).single();
          if (profile) setClient(profile);
        }

        const safeTime = (dateStr) => {
          if (!dateStr) return "";
          try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch {
            return "";
          }
        };

        const dDeadline = safeTime(ord.delivery_deadline);
        const pTime = ord.scheduled_at ? new Date(ord.scheduled_at).toLocaleTimeString().slice(0, 5) : "";

        setEdit({
          pickupTime: pTime,
          deliveryDeadline: dDeadline || ord.notes?.match(/Deadline: ([\d:]+)/)?.[1] || "",
          contactPhone: ord.pickup_phone || ord.notes?.match(/Contact: ([\d\s]+)/)?.[1] || "",
          accessCode: ord.pickup_access_code || ord.notes?.match(/Code: (\w+)/)?.[1] || "",
          dispatchNote: ord.notes?.match(/Note: (.*)/)?.[1] || "",
          etaMinutes: "",
          driverId: ord.driver_id || "",
          serviceLevel: ord.service_level || "normal",
        });
        fetchDrivers(ord.driver_id);
      }
    } catch (e) {
      console.error("Crash during fetchOrder:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveEdits = async () => {
    if (!order) return;
    setSaving(true);

    const updates = {
      pickup_phone: edit.contactPhone,
      pickup_access_code: edit.accessCode,
      notes: `${order.notes || ''} | Dispatch: ${edit.dispatchNote}`,
      driver_id: edit.driverId || null, // Update driver
    };

    // Attempt to update deadline if provided
    if (edit.deliveryDeadline && order.created_at) {
      const datePart = order.scheduled_at ? order.scheduled_at.split('T')[0] : order.created_at.split('T')[0];
      updates.delivery_deadline = `${datePart}T${edit.deliveryDeadline}:00`;
    }

    if (edit.serviceLevel) {
      updates.service_level = edit.serviceLevel;
    }

    // Attempt to update pickup time
    if (edit.pickupTime && order.created_at) {
      const datePart = order.scheduled_at ? order.scheduled_at.split('T')[0] : order.created_at.split('T')[0];
      updates.scheduled_at = `${datePart}T${edit.pickupTime}:00`;
    }

    // If driver is set, we can auto-update status to assigned
    // - pending -> assigned
    // - assigned/picked_up + driver change -> reassign to assigned
    if (updates.driver_id) {
      const driverChanged = updates.driver_id !== order.driver_id;
      if (order.status === 'pending' || ((order.status === 'assigned' || order.status === 'picked_up') && driverChanged)) {
        updates.status = 'assigned';
      }
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', order.id);

    if (!error) {
      fetchOrder();
      alert("Enregistré avec succès");
    } else {
      console.error(error);
      alert("Erreur sauvegarde: " + error.message);
    }
    setSaving(false);
  };

  // ...

  const updateStatus = async (newStatus) => {
    setSaving(true);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      await fetchOrder();
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (!order) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-3 text-lg font-bold text-slate-900">Commande introuvable</div>
        <p className="text-sm text-slate-500">L’identifiant {id} n’existe pas.</p>
        <Link to="/admin/orders" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Retour</Link>
      </div>
    );
  }

  const timeline = [
    { label: "Commande créée", value: order.date },
    { label: "Dispatch chauffeur", value: order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleString("fr-FR") : "—" },
    { label: "En cours (au compteur)", value: order.status === "En cours" || order.status === "Terminée" ? "OK" : "—" },
    { label: "Terminée", value: order.status === "Terminée" ? (order.completedAt ? new Date(order.completedAt).toLocaleString("fr-FR") : "OK") : "—" },
  ];

  // ======================
  // Parse order.notes for precise data rendering
  // ======================
  const notesStr = order.notes || "";
  const nEntreprisePick = notesStr.match(/Entreprise Pick: (.*?)(\.|$|Contact)/)?.[1]?.trim();
  const nContactPick = notesStr.match(/Contact Pick: (.*?)(\.|$|Phone|Email)/)?.[1]?.trim();
  const nPhonePick = notesStr.match(/Phone Pick: (.*?)(\.|$|Email|Code)/)?.[1]?.trim();
  const nEmailEnlev = notesStr.match(/Email Enlev: (.*?)(\.|$|Entreprise|Contact|Instructions)/)?.[1]?.trim();
  const pCode = order.pickup_access_code || notesStr.match(/(?:Code Enlev:|Code :|Code:)\s?([^.]+)/)?.[1]?.trim();

  const nEntrepriseDeliv = notesStr.match(/Entreprise Deliv: (.*?)(\.|$|Contact)/)?.[1]?.trim();
  const nContactDeliv = notesStr.match(/Contact Deliv: (.*?)(\.|$|Phone|Instructions)/)?.[1]?.trim();
  const nPhoneDeliv = notesStr.match(/Phone Deliv: (.*?)(\.|$|Code|Instructions)/)?.[1]?.trim();
  const dCode = order.delivery_access_code || notesStr.match(/(?:Code Dest:|Code Deliv:)\s?([^.]+)/)?.[1]?.trim();

  const nInstructions = notesStr.match(/Instructions:\s*(.*?)(?:\.|$)/)?.[1]?.trim();
  const nPNote = notesStr.match(/Instructions:\s*(.*?)\s*\//)?.[1]?.trim() || (nInstructions && !nInstructions.includes('/') ? nInstructions : null);
  const nDNote = notesStr.match(/Instructions:\s*(.*?)\s*\/\s*(.*)(?:\.|$)/)?.[2]?.trim();

  // Guest order parsing
  const gBillingMatch = notesStr.match(/Billing: (.*?) \| (.*?) \| (.*?)$/);
  const gBillingName = gBillingMatch?.[1]?.trim();
  const gBillingCompany = gBillingMatch?.[2]?.trim();
  const gBillingAddress = gBillingMatch?.[3]?.trim();
  const gEmail = notesStr.match(/Email: ([^\s]+)/)?.[1]?.trim();
  const gPhone = notesStr.match(/Phone: ([\d\s]+)/)?.[1]?.trim();
  const gContact = notesStr.match(/Contact: ([^(]+)/)?.[1]?.trim();

  // Pick/Deliv computed values
  const pickupName = order.pickup_name || nEntreprisePick || nContactPick || "—";
  const pickupPhone = order.pickup_phone || nPhonePick || gPhone || "—";

  const deliveryName = order.delivery_name || nEntrepriseDeliv || nContactDeliv || "—";
  const deliveryPhone = order.delivery_phone || nPhoneDeliv || "—";

  // Unified display values for Client/Expediteur
  const displayCompany = client?.details?.company || order.expediteur?.nom || gBillingCompany || nEntreprisePick || "";
  const displayContactName = client?.details?.contact || client?.details?.full_name || order.nom_client || gBillingName || gContact || nContactPick || pickupName || "—";
  const displayEmail = client?.details?.email || order.email_client || order.expediteur?.email || gEmail || nEmailEnlev || "—";
  const displayPhone = client?.details?.phone || order.telephone_client || order.expediteur?.telephone || gPhone || pickupPhone || "—";
  const displayAddress = client?.details?.address || order.facturation?.adresse || gBillingAddress || order.pickup_address || "—";
  const displayTopName = String(displayCompany || displayContactName);

  // Package computed values
  const packageNature = order.package_type || order.delivery_type || order.notes?.split(' - ')?.[0] || "—";
  const gWeight = notesStr.match(/Poids: ([\d\w\s,.<>]+)/)?.[1];
  const packageWeight = order.weight ? String(`${order.weight} kg`) : String(gWeight && gWeight !== "undefined" ? gWeight : "—");
  const gDims = notesStr.match(/Dims: ([\d\w\sxX]+)/)?.[1] || notesStr.match(/Dimensions: ([^.]+)/)?.[1];
  const packageDims = order.package_description || String(gDims && gDims !== "undefined" ? gDims : "");


  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Commande</div>
          <h1 className="text-2xl font-bold text-slate-900">#{order.id.slice(0, 8)}</h1>
          <div className="text-sm text-slate-500">
            {displayTopName}
            {!client?.id && !order.user_id && (
              <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase">
                Invité (Pas de compte)
              </span>
            )}
            • {order.pickup_city} &gt; {order.delivery_city}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-900 ring-1 ring-slate-200">{order.status}</div>

          <button
            onClick={() => generateOrderPdf(order, client)}
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Bon de commande (PDF)
          </button>

          {order.status === "pending" && (
            <button
              onClick={() => updateStatus('assigned')}
              disabled={saving}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Accepter / Assigner
            </button>
          )}

          {order.status === "assigned" && (
            <button
              onClick={() => updateStatus('picked_up')}
              disabled={saving}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Dispatcher (En cours)
            </button>
          )}

          {order.status === "picked_up" && (
            <button
              onClick={() => updateStatus('delivered')}
              disabled={saving}
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              Terminer (livrée)
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Itinéraire</div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Enlèvement</div>
              <div className="mt-2 text-sm font-bold text-slate-900 leading-none mb-1">{pickupName}</div>
              <div className="text-xs text-slate-500 leading-snug mb-2">{order.pickup_address || "—"}</div>
              <div className="text-xs font-semibold text-slate-900">
                {pCode && <span className="font-bold mr-2 text-orange-600">Code: {pCode}</span>}
                {nPNote && nPNote !== "—" ? nPNote : "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Livraison</div>
              <div className="mt-2 text-sm font-bold text-slate-900 leading-none mb-1">{deliveryName}</div>
              <div className="text-xs text-slate-500 leading-snug mb-2">{order.delivery_address || "—"}</div>
              <div className="text-xs font-semibold text-slate-900">
                {dCode && <span className="font-bold mr-2 text-orange-600">Code: {dCode}</span>}
                {nDNote && nDNote !== "—" ? nDNote : "—"}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Formule</div>
                <div className="mt-2 text-sm font-semibold text-slate-900 uppercase">
                  {order.vehicle_type || "—"} {order.service_level ? `${order.service_level}` : ""}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Programmation</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {order.scheduled_at ? new Date(order.scheduled_at).toLocaleString('fr-FR') : "Immédiat"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Heure d’enlèvement</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{order.pickupTime || order.time || edit.pickupTime || "—"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Heure de livraison max</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{order.deliveryDeadline || edit.deliveryDeadline || "—"}</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tél. Enlèvement</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {pickupPhone}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tél. Livraison</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {deliveryPhone}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Détails du Colis</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Nature</div>
                    <div className="text-sm font-bold text-slate-900">
                      {packageNature}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Poids</div>
                    <div className="text-sm font-bold text-slate-900">
                      {packageWeight}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Contenu</div>
                    <div className="text-sm font-bold text-slate-900">
                      {packageDims || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Client Optionnel */}
            {(() => {
              const cleanNote = notesStr
                .replace(/Guest Order\.\s?/g, "")
                .replace(/Entreprise Pick:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Entreprise Deliv:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Contact Pick:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Contact Deliv:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Email Enlev:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Phone Pick:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Phone Deliv:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Code Enlev:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Code Dest:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Instructions :?.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Email:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Phone:.*?(?=\.|$)\.?\s?/g, "")
                .replace(/Billing:.*$/g, "")
                .trim();
              if (cleanNote && cleanNote !== "—" && cleanNote !== "/" && cleanNote.length > 2) {
                return (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Note Client Complémentaire</div>
                    <div className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                      "{cleanNote}"
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Client / Expéditeur</div>
              <div className="mt-2 text-sm font-semibold text-slate-900 leading-snug flex items-center gap-2">
                {displayTopName}
                {!client?.id && !order.user_id && (
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600 border border-orange-200 uppercase">
                    Invité
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                <span className="font-bold text-slate-400">Facturation: </span>
                {displayAddress}
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-400">Email: </span>
                  {displayEmail}
                </div>
                {displayCompany && (
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-400 uppercase text-[9px]">Enseigne: </span>
                    <span className="font-semibold text-slate-900">{displayCompany}</span>
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-400">Contact: </span>
                  {displayContactName !== displayCompany ? displayContactName : "—"}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-400">Tél: </span>
                  {displayPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix HT</div>
          <div className="mt-3 text-4xl font-bold text-slate-900">{Number(order.price_ht || 0).toFixed(2)}€</div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Statut</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{order.status}</div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Infos chauffeur & accès</div>

            <div className="mt-2 grid gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chauffeur assigné</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100"
                  value={edit.driverId}
                  onChange={(e) => setEdit(p => ({ ...p, driverId: e.target.value }))}
                >
                  <option value="">-- Aucun chauffeur --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Formule</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100"
                    value={edit.serviceLevel}
                    onChange={(e) => setEdit(p => ({ ...p, serviceLevel: e.target.value }))}
                  >
                    <option value="normal">Normal (4h)</option>
                    <option value="exclu">Exclu (3h)</option>
                    <option value="super">Super (1h30)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Heure d’enlèvement</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: 14:30"
                    value={edit.pickupTime}
                    onChange={(e) => setEdit((p) => ({ ...p, pickupTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Livraison max (Auto)</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-400 cursor-not-allowed"
                    readOnly
                    value={edit.deliveryDeadline}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Téléphone sur place</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: 06 12 34 56 78"
                    value={edit.contactPhone}
                    onChange={(e) => setEdit((p) => ({ ...p, contactPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Code / infos d’accès</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: digicode 1234, 3e étage"
                    value={edit.accessCode}
                    onChange={(e) => setEdit((p) => ({ ...p, accessCode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note dispatch</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Ex: prioritaire, fragile, etc."
                    value={edit.dispatchNote}
                    onChange={(e) => setEdit((p) => ({ ...p, dispatchNote: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveEdits}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Historique de la commande</div>
        </div>
        <div className="relative grid gap-6">
          <div className="absolute left-3 top-1 h-full w-px bg-slate-200" />
          {timeline.map((t, idx) => (
            <div key={t.label} className="relative flex items-start gap-4">
              <div className={`mt-1 h-3 w-3 rounded-full ${t.value !== "—" ? "bg-slate-900" : "bg-slate-200"}`} />
              {idx < timeline.length - 1 && (
                <div className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />
              )}
              <div className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                <div className="text-xs font-bold text-slate-500">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

