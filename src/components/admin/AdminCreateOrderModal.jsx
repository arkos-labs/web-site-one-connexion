import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { autocompleteAddress } from "../../lib/autocomplete";
import {
    X, Loader2, MapPin, Package, Clock, CheckCircle2, UserPlus,
    Users, ChevronDown, Search, Plus, ArrowRight, ArrowLeft,
    Truck, Info, ShieldCheck
} from "lucide-react";

const getPostcode = (str = "") => String(str).match(/\b\d{5}\b/)?.[0] || "";

const INPUT = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-400";
const LABEL = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block";

// ─────────────────────────────────────────────
// Sub-component: AddressSuggest
// ─────────────────────────────────────────────
function AddressSuggest({ label, value, onChange, onSelect, suggestions, loading }) {
    return (
        <div className="relative">
            <label className={LABEL}>{label}</label>
            <div className="relative">
                <input
                    className={INPUT}
                    placeholder="Saisissez l'adresse complète…"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
                {loading && <Loader2 size={14} className="animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />}
            </div>
            {suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl max-h-48 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <button key={i} type="button"
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                            onClick={() => onSelect(s)}
                        >
                            <MapPin size={12} className="text-[#ed5518] shrink-0" />
                            {s.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
export default function AdminCreateOrderModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1=Client, 2=Trajet, 3=Détails, 4=Récap
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientMode, setClientMode] = useState("existing"); // "existing" | "new"
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const [newClient, setNewClient] = useState({ full_name: "", company: "", email: "", phone: "" });
    const [creatingClient, setCreatingClient] = useState(false);

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDelivery, setLoadingDelivery] = useState(false);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [price, setPrice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        // Pickup
        pickup: "", pickupCity: "", pickupPostcode: "",
        pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", pickupAccessCode: "",
        // Delivery
        delivery: "", deliveryCity: "", deliveryPostcode: "",
        deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "", deliveryAccessCode: "",
        // Timing
        date: new Date().toISOString().split('T')[0],
        pickupTime: "09:00", deliveryDeadline: "12:00",
        // Package / service
        vehicle: "moto", service: "normal",
        packageType: "Pli", packageWeight: "", packageDesc: "",
        // Price override (admin can manually set)
        priceOverride: "",
    });

    const setF = (key, value) => setForm(p => ({ ...p, [key]: value }));

    // ── Load clients (same logic as DashboardAdmin)
    useEffect(() => {
        setLoadingClients(true);
        supabase
            .from('profiles')
            .select('id, details, role')
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erreur chargement clients:', error);
                    setLoadingClients(false);
                    return;
                }
                if (data) {
                    const list = data
                        .filter(p => p.id && (!p.role || p.role === 'client'))
                        .map(p => ({
                            id: p.id,
                            name: p.details?.company || p.details?.full_name || p.details?.email || `Client ${p.id.slice(0, 8)}`,
                            email: p.details?.email || '',
                            company: p.details?.company || '',
                            role: p.role || 'client',
                        }));
                    setClients(list);
                    console.log(`✅ ${list.length} client(s) chargé(s)`);
                }
                setLoadingClients(false);
            });
    }, []);





    // ── Auto-service from timing
    useEffect(() => {
        if (!form.pickupTime || !form.deliveryDeadline) return;
        const [ph, pm] = form.pickupTime.split(':').map(Number);
        const [dh, dm] = form.deliveryDeadline.split(':').map(Number);
        let start = new Date(); start.setHours(ph, pm, 0, 0);
        let end = new Date(); end.setHours(dh, dm, 0, 0);
        if (end < start) end.setDate(end.getDate() + 1);
        const diff = (end - start) / 60000;
        const svc = diff <= 90 ? "super" : diff <= 180 ? "exclu" : "normal";
        if (form.service !== svc) setF('service', svc);
    }, [form.pickupTime, form.deliveryDeadline, form.service]);

    // ── Auto-price
    useEffect(() => {
        if (form.priceOverride) { setPrice(Number(form.priceOverride)); return; }
        const pCode = form.pickupPostcode || getPostcode(form.pickup);
        const dCode = form.deliveryPostcode || getPostcode(form.delivery);
        if (!pCode || !dCode) { setPrice(null); return; }
        setCalculatingPrice(true);
        const timer = setTimeout(async () => {
            const { data, error } = await supabase.rpc('calculate_shipping_cost', {
                p_pickup_postal_code: pCode, p_delivery_postal_code: dCode,
                p_vehicle_type: form.vehicle.toLowerCase(), p_service_level: form.service.toLowerCase()
            });
            setPrice(!error && data !== null ? Number(data) : null);
            setCalculatingPrice(false);
        }, 700);
        return () => clearTimeout(timer);
    }, [form.pickup, form.delivery, form.pickupPostcode, form.deliveryPostcode, form.vehicle, form.service, form.priceOverride]);

    const fetchSugg = async (query, set, setLoad) => {
        if (query.trim().length < 3) { set([]); return; }
        setLoad(true);
        try {
            const res = await autocompleteAddress(query);
            set(res.map(s => ({ label: s.full, city: s.city, postcode: s.postcode })));
        } catch { set([]); } finally { setLoad(false); }
    };

    // ── Create new client in Supabase (guest-style profile)
    const handleCreateNewClient = async () => {
        if (!newClient.email) return alert("L'email est requis pour créer un client.");
        setCreatingClient(true);

        // ⚠️ IMPORTANT : sauvegarder la session admin AVANT signUp
        // car signUp() remplace automatiquement la session courante par celle du nouveau user
        const { data: { session: adminSession } } = await supabase.auth.getSession();

        // Étape 1 : créer un compte auth avec mot de passe temporaire aléatoire
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: newClient.email,
            password: tempPassword,
            options: {
                data: {
                    full_name: newClient.full_name,
                    company: newClient.company,
                }
            }
        });

        // ✅ Restaurer immédiatement la session admin (avant tout await ultérieur)
        if (adminSession) {
            await supabase.auth.setSession({
                access_token: adminSession.access_token,
                refresh_token: adminSession.refresh_token,
            });
        }

        if (authError) {
            alert("Erreur lors de la création du compte : " + authError.message);
            setCreatingClient(false);
            return;
        }

        const userId = authData?.user?.id;
        if (!userId) {
            alert("Erreur : impossible de récupérer l'ID utilisateur créé.");
            setCreatingClient(false);
            return;
        }

        // Étape 2 : mettre à jour le profil créé automatiquement par le trigger
        const { error: profileError } = await supabase.from('profiles').update({
            role: 'client',
            details: {
                full_name: newClient.full_name,
                company: newClient.company,
                email: newClient.email,
                phone: newClient.phone,
            }
        }).eq('id', userId);

        if (profileError) {
            // Le profil n'existe pas encore (trigger lent), on tente un upsert
            await supabase.from('profiles').upsert({
                id: userId,
                role: 'client',
                details: {
                    full_name: newClient.full_name,
                    company: newClient.company,
                    email: newClient.email,
                    phone: newClient.phone,
                }
            });
        }

        const created = {
            id: userId,
            name: newClient.company || newClient.full_name || newClient.email,
            email: newClient.email,
            company: newClient.company,
        };
        setClients(prev => [created, ...prev]);
        setSelectedClient(created);
        setClientMode("existing");
        setStep(2);
        setCreatingClient(false);
    };


    const handleSubmit = async () => {
        if (!selectedClient) return alert("Veuillez sélectionner ou créer un client.");
        if (!form.pickup || !form.delivery) return alert("Les adresses sont requises.");
        if (!price && !form.priceOverride) return alert("Le prix n'a pas pu être calculé. Vérifiez les adresses.");

        setSubmitting(true);
        const finalPrice = form.priceOverride ? Number(form.priceOverride) : price;
        const notes = [
            form.pickupName && `Entreprise Pick: ${form.pickupName}`,
            form.pickupContact && `Contact Pick: ${form.pickupContact}`,
            form.pickupPhone && `Phone Pick: ${form.pickupPhone}`,
            form.pickupAccessCode && `Code Enlev: ${form.pickupAccessCode}`,
            form.deliveryName && `Entreprise Deliv: ${form.deliveryName}`,
            form.deliveryContact && `Contact Deliv: ${form.deliveryContact}`,
            form.deliveryPhone && `Phone Deliv: ${form.deliveryPhone}`,
            form.deliveryAccessCode && `Code Dest: ${form.deliveryAccessCode}`,
            (form.pickupInstructions || form.deliveryInstructions) && `Instructions: ${form.pickupInstructions || ''} / ${form.deliveryInstructions || ''}`,
        ].filter(Boolean).join('. ');

        const { error } = await supabase.from('orders').insert({
            client_id: selectedClient.id,
            pickup_address: form.pickup,
            pickup_city: form.pickupCity || form.pickup.split(',').pop()?.trim(),
            pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
            pickup_name: form.pickupName,
            pickup_phone: form.pickupPhone,
            delivery_address: form.delivery,
            delivery_city: form.deliveryCity || form.delivery.split(',').pop()?.trim(),
            delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
            delivery_name: form.deliveryName,
            delivery_phone: form.deliveryPhone,
            pickup_access_code: form.pickupAccessCode,
            delivery_access_code: form.deliveryAccessCode,
            vehicle_type: form.vehicle.toLowerCase(),
            service_level: form.service.toLowerCase(),
            status: 'pending_acceptance',
            price_ht: finalPrice,
            scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
            delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
            package_type: form.packageType,
            package_description: form.packageDesc,
            weight: parseFloat(form.packageWeight) || null,
            notes: notes || null,
        });

        setSubmitting(false);
        if (!error) {
            onSuccess?.();
            onClose();
        }
        else alert("Erreur lors de la création : " + error.message);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(clientSearch.toLowerCase())
    );

    const STEPS = [
        { title: "Client", icon: Users },
        { title: "Trajet", icon: MapPin },
        { title: "Détails", icon: Package },
        { title: "Valider", icon: ShieldCheck },
    ];

    const canGoNext = () => {
        if (step === 1) return !!selectedClient;
        if (step === 2) return !!form.pickup && !!form.delivery;
        if (step === 3) return true;
        return true;
    };

    const serviceColors = {
        super: "bg-rose-50 text-rose-600 border-rose-100",
        exclu: "bg-[#ed5518] text-[#ed5518] border-blue-100",
        normal: "bg-[#ed5518] text-[#ed5518] border-emerald-100",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Créer une mission</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                            {selectedClient ? `Client : ${selectedClient.name}` : "Administration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-8 py-4 border-b border-slate-50 shrink-0">
                    <div className="flex items-center gap-0">
                        {STEPS.map((s, i) => {
                            const done = step > i + 1;
                            const current = step === i + 1;
                            return (
                                <div key={s.title} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center gap-1 flex-1">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${current ? 'bg-[#ed5518] border-[#ed5518] text-white scale-110' : done ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                            {done ? <CheckCircle2 size={13} /> : i + 1}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${current ? 'text-[#ed5518]' : done ? 'text-slate-700' : 'text-slate-300'}`}>{s.title}</span>
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${step > i + 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">

                    {/* ════ STEP 1: CLIENT ════ */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Étape 1 — Sélection du client</div>

                            {/* Mode toggle */}
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                                <button
                                    onClick={() => setClientMode("existing")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${clientMode === "existing" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <Users size={14} /> Client existant
                                </button>
                                <button
                                    onClick={() => setClientMode("new")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${clientMode === "new" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <UserPlus size={14} /> Créer un client
                                </button>
                            </div>

                            {clientMode === "existing" && (
                                <div className="space-y-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                                            placeholder="Rechercher un client par nom ou email…"
                                            value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)}
                                        />
                                    </div>

                                    {/* Client list */}
                                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                        {/* Header count */}
                                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {loadingClients ? "Chargement…" : `${filteredClients.length} client(s)`}
                                            </span>
                                            {loadingClients && <Loader2 size={12} className="animate-spin text-slate-400" />}
                                        </div>
                                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                            {loadingClients ? (
                                                <div className="py-12 text-center">
                                                    <Loader2 size={24} className="animate-spin text-slate-300 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-slate-400">Chargement des clients…</p>
                                                </div>
                                            ) : filteredClients.length === 0 ? (
                                                <div className="py-10 text-center">
                                                    <Users size={24} className="text-slate-200 mx-auto mb-2" />
                                                    <p className="text-sm font-bold text-slate-400">Aucun client trouvé</p>
                                                    {clientSearch && <p className="text-xs text-slate-400 mt-1">Essayez un autre terme de recherche</p>}
                                                </div>
                                            ) : filteredClients.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setSelectedClient(c)}
                                                    className={`w-full flex items-center justify-between px-5 py-3.5 transition-all text-left hover:bg-slate-50 ${selectedClient?.id === c.id ? 'bg-orange-50 border-l-4 border-[#ed5518]' : ''}`}
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <div className={`text-sm font-black truncate ${selectedClient?.id === c.id ? 'text-[#ed5518]' : 'text-slate-900'}`}>{c.name}</div>
                                                        {c.email && <div className="text-xs font-medium text-slate-400 truncate">{c.email}</div>}
                                                        {c.role && c.role !== 'client' && (
                                                            <span className="inline-block mt-0.5 text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{c.role}</span>
                                                        )}
                                                    </div>
                                                    {selectedClient?.id === c.id && <CheckCircle2 size={18} className="text-[#ed5518] shrink-0 ml-2" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedClient && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-[#ed5518] border border-emerald-100 px-5 py-3">
                                            <CheckCircle2 size={18} className="text-[#ed5518] shrink-0" />
                                            <div>
                                                <div className="text-sm font-black text-[#ed5518]">{selectedClient.name}</div>
                                                <div className="text-xs text-[#ed5518]">{selectedClient.email}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {clientMode === "new" && (
                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-[#ed5518] border border-blue-100 p-4 flex items-start gap-3">
                                        <Info size={16} className="text-[#ed5518] shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-[#ed5518] leading-relaxed">
                                            Un nouveau profil client sera créé sans compte. La commande sera liée à ce profil. Vous pourrez compléter le dossier client plus tard.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={LABEL}>Société</label>
                                            <input className={INPUT} placeholder="Nom de l'entreprise" value={newClient.company} onChange={e => setNewClient(p => ({ ...p, company: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className={LABEL}>Nom complet</label>
                                            <input className={INPUT} placeholder="Prénom Nom" value={newClient.full_name} onChange={e => setNewClient(p => ({ ...p, full_name: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className={LABEL}>Email *</label>
                                            <input type="email" className={INPUT} placeholder="contact@societe.fr" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className={LABEL}>Téléphone</label>
                                            <input className={INPUT} placeholder="06 12 34 56 78" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCreateNewClient}
                                        disabled={creatingClient || !newClient.email}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-50"
                                    >
                                        {creatingClient ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        {creatingClient ? "Création en cours…" : "Créer et sélectionner ce client"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════ STEP 2: TRAJET ════ */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Étape 2 — Itinéraire & contacts</div>

                            {/* PICKUP */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">1</div>
                                    <span className="text-sm font-black text-slate-900">Enlèvement</span>
                                </div>
                                <AddressSuggest
                                    label="Adresse d'enlèvement *"
                                    value={form.pickup}
                                    suggestions={pickupSuggestions}
                                    loading={loadingPickup}
                                    onChange={v => { setF('pickup', v); setF('pickupCity', ''); setF('pickupPostcode', ''); fetchSugg(v, setPickupSuggestions, setLoadingPickup); }}
                                    onSelect={s => { setF('pickup', s.label); setF('pickupCity', s.city); setF('pickupPostcode', s.postcode); setPickupSuggestions([]); }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={LABEL}>Société / Enseigne</label>
                                        <input className={INPUT} placeholder="Nom de l'entreprise" value={form.pickupName} onChange={e => setF('pickupName', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Contact sur place</label>
                                        <input className={INPUT} placeholder="Prénom Nom" value={form.pickupContact} onChange={e => setF('pickupContact', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Téléphone</label>
                                        <input className={INPUT} placeholder="06…" value={form.pickupPhone} onChange={e => setF('pickupPhone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Code d'accès / Digicode</label>
                                        <input className={INPUT} placeholder="Ex : 1234A, bâtiment B…" value={form.pickupAccessCode} onChange={e => setF('pickupAccessCode', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={LABEL}>Instructions pour le livreur</label>
                                        <input className={INPUT} placeholder="Étage, interphone, consignes particulières…" value={form.pickupInstructions} onChange={e => setF('pickupInstructions', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* DELIVERY */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-6 w-6 rounded-full bg-[#ed5518] flex items-center justify-center text-white text-[10px] font-black">2</div>
                                    <span className="text-sm font-black text-slate-900">Livraison</span>
                                </div>
                                <AddressSuggest
                                    label="Adresse de livraison *"
                                    value={form.delivery}
                                    suggestions={deliverySuggestions}
                                    loading={loadingDelivery}
                                    onChange={v => { setF('delivery', v); setF('deliveryCity', ''); setF('deliveryPostcode', ''); fetchSugg(v, setDeliverySuggestions, setLoadingDelivery); }}
                                    onSelect={s => { setF('delivery', s.label); setF('deliveryCity', s.city); setF('deliveryPostcode', s.postcode); setDeliverySuggestions([]); }}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={LABEL}>Société / Enseigne</label>
                                        <input className={INPUT} placeholder="Nom de l'entreprise" value={form.deliveryName} onChange={e => setF('deliveryName', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Contact sur place</label>
                                        <input className={INPUT} placeholder="Prénom Nom" value={form.deliveryContact} onChange={e => setF('deliveryContact', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Téléphone</label>
                                        <input className={INPUT} placeholder="06…" value={form.deliveryPhone} onChange={e => setF('deliveryPhone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Code d'accès / Digicode</label>
                                        <input className={INPUT} placeholder="Ex : 1234A, bâtiment B…" value={form.deliveryAccessCode} onChange={e => setF('deliveryAccessCode', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={LABEL}>Instructions pour le livreur</label>
                                        <input className={INPUT} placeholder="Étage, interphone, consignes particulières…" value={form.deliveryInstructions} onChange={e => setF('deliveryInstructions', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 3: DÉTAILS ════ */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Étape 3 — Planification & transport</div>

                            {/* Timing */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Planification</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={LABEL}>Date</label>
                                        <input type="date" className={INPUT} value={form.date} onChange={e => setF('date', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Heure d'enlèvement</label>
                                        <input type="time" className={INPUT} value={form.pickupTime} onChange={e => setF('pickupTime', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Deadline livraison</label>
                                        <input type="time" className={INPUT} value={form.deliveryDeadline} onChange={e => setF('deliveryDeadline', e.target.value)} />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-medium">Formule calculée :</span>
                                    <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${serviceColors[form.service]}`}>
                                        {form.service === 'super' ? '⚡ Super Urgent (1h30)' : form.service === 'exclu' ? '🚀 Exclu (3h)' : '🕐 Normal (4h)'}
                                    </span>
                                </div>
                            </div>

                            {/* Véhicule */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck size={14} className="text-slate-400" />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Type de véhicule</span>
                                </div>
                                <div className="flex gap-3">
                                    {['moto', 'voiture', 'camion'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setF('vehicle', v)}
                                            className={`flex-1 py-3 rounded-2xl border font-black text-sm transition-all capitalize ${form.vehicle === v ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                                        >
                                            {v === 'moto' ? '🏍️ Moto' : v === 'voiture' ? '🚗 Voiture' : '🚛 Camion'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colis */}
                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Nature du transport</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={LABEL}>Type de colis</label>
                                        <select className={INPUT} value={form.packageType} onChange={e => setF('packageType', e.target.value)}>
                                            {['Pli', 'Colis', 'Document', 'Carton', 'Sac', 'Palette', 'Autre'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL}>Poids estimé</label>
                                        <select className={INPUT} value={form.packageWeight} onChange={e => setF('packageWeight', e.target.value)}>
                                            <option value="">Non spécifié</option>
                                            <option value="1">- de 1 kg</option>
                                            <option value="5">1 à 5 kg</option>
                                            <option value="10">5 à 10 kg</option>
                                            <option value="30">10 à 30 kg</option>
                                            <option value="31">+ de 30 kg</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL}>Description du contenu</label>
                                        <input className={INPUT} placeholder="Ordinateur, documents…" value={form.packageDesc} onChange={e => setF('packageDesc', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Prix */}
                            <div className="rounded-2xl bg-slate-900 text-white p-5 flex items-center justify-between">
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prix calculé automatiquement</div>
                                    <div className="text-xs text-slate-400 mt-0.5">Ou saisissez un prix manuel ci-contre</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-28 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white text-right focus:outline-none focus:ring-2 focus:ring-[#ed5518] placeholder:text-slate-500"
                                        placeholder="Prix HT"
                                        value={form.priceOverride}
                                        onChange={e => setF('priceOverride', e.target.value)}
                                    />
                                    <div className="text-right">
                                        {calculatingPrice && !form.priceOverride ? (
                                            <Loader2 size={24} className="animate-spin text-slate-400" />
                                        ) : (
                                            <div className="text-3xl font-black tabular-nums">
                                                {(form.priceOverride ? Number(form.priceOverride) : price) != null
                                                    ? `${(form.priceOverride ? Number(form.priceOverride) : price).toFixed(2)}€`
                                                    : '—'}
                                            </div>
                                        )}
                                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">HT</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 4: RECAP ════ */}
                    {step === 4 && (
                        <div className="space-y-5 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ed5518] text-[#ed5518] mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Résumé de la mission</h3>
                                <p className="text-sm text-slate-500 mt-1">Vérifiez les informations avant de valider.</p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4">
                                {/* Client row */}
                                <div className="flex justify-between pb-4 border-b border-slate-100">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Client</span>
                                    <span className="text-sm font-black text-slate-900">{selectedClient?.name}</span>
                                </div>

                                {/* Route */}
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Enlèvement</div>
                                        <div className="text-sm font-black text-slate-900">{form.pickupName || '—'}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{form.pickup}</div>
                                        {form.pickupPhone && <div className="text-xs text-slate-500">📞 {form.pickupPhone}</div>}
                                        {form.pickupAccessCode && <div className="text-xs text-[#ed5518] font-bold">🔑 {form.pickupAccessCode}</div>}
                                        {form.pickupInstructions && <div className="text-xs text-slate-600 italic mt-1">📝 {form.pickupInstructions}</div>}
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Livraison</div>
                                        <div className="text-sm font-black text-slate-900">{form.deliveryName || '—'}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{form.delivery}</div>
                                        {form.deliveryPhone && <div className="text-xs text-slate-500">📞 {form.deliveryPhone}</div>}
                                        {form.deliveryAccessCode && <div className="text-xs text-[#ed5518] font-bold">🔑 {form.deliveryAccessCode}</div>}
                                        {form.deliveryInstructions && <div className="text-xs text-slate-600 italic mt-1">📝 {form.deliveryInstructions}</div>}
                                    </div>
                                </div>

                                {/* Details row */}
                                <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-100">
                                    {[
                                        { label: "Date", value: new Date(form.date).toLocaleDateString('fr-FR', { dateStyle: 'long' }) },
                                        { label: "Créneau", value: `${form.pickupTime} → ${form.deliveryDeadline}` },
                                        { label: "Formule", value: form.service.toUpperCase() },
                                        { label: "Véhicule", value: form.vehicle.toUpperCase() },
                                        { label: "Colis", value: `${form.packageType}${form.packageWeight ? ` · ${form.packageWeight}kg` : ''}` },
                                        { label: "Contenu", value: form.packageDesc || '—' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                            <div className="text-xs font-bold text-slate-900 mt-0.5">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prix HT</span>
                                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                                        {((form.priceOverride ? Number(form.priceOverride) : price) ?? 0).toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-slate-100 px-8 py-5 flex items-center justify-between bg-white">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={14} /> {step > 1 ? 'Retour' : 'Annuler'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canGoNext()}
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Continuer <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-[#ed5518] px-8 py-3 text-sm font-black text-white hover:bg-[#ed5518] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            {submitting ? "Création en cours…" : "Créer la mission"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


