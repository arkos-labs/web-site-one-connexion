import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { autocompleteAddress } from "../lib/autocomplete";
import { sendTelegramMessage, notifyNewOrder } from "../lib/telegram";
import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import {
    ArrowLeft, ArrowRight, Truck, MapPin, Package, Clock,
    ShieldCheck, CheckCircle2, Loader2, Info, User, Mail, Phone
} from "lucide-react";

const VEHICLES = ["Moto", "Voiture"];

const getPostcode = (str = "") => {
    const match = String(str).match(/\b\d{5}\b/);
    return match ? match[0] : "";
};

export default function GuestOrder() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [price, setPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    const [form, setForm] = useState({
        // Adresses
        pickup: "", pickupCity: "", pickupPostcode: "",
        pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", pickupAccessCode: "",
        delivery: "", deliveryCity: "", deliveryPostcode: "",
        deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "", deliveryAccessCode: "",
        // Timing
        date: new Date().toISOString().split('T')[0],
        pickupTime: "09:00",
        deliveryDeadline: "12:00",
        // Transport
        vehicle: "moto",
        service: "normal",
        packageType: "Pli",
        packageWeight: "",
        packageDesc: "",
        // Contact invité
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        guestCompany: "",
    });

    // Auto-calcul du prix
    useEffect(() => {
        const calc = async () => {
            const pCode = getPostcode(form.pickup);
            const dCode = getPostcode(form.delivery);
            if (!pCode || !dCode || !form.vehicle) { setPrice(null); return; }

            setCalculatingPrice(true);
            const { data, error } = await supabase.rpc('calculate_shipping_cost', {
                p_pickup_postal_code: pCode,
                p_delivery_postal_code: dCode,
                p_vehicle_type: form.vehicle.toLowerCase(),
                p_service_level: form.service.toLowerCase()
            });
            setCalculatingPrice(false);
            setPrice(error ? null : data);
        };
        const timer = setTimeout(calc, 600);
        return () => clearTimeout(timer);
    }, [form.pickup, form.delivery, form.vehicle, form.service]);

    // Auto-détection du niveau de service selon les horaires
    useEffect(() => {
        if (!form.pickupTime || !form.deliveryDeadline) return;
        const [ph, pm] = form.pickupTime.split(':').map(Number);
        const [dh, dm] = form.deliveryDeadline.split(':').map(Number);
        let start = new Date(); start.setHours(ph, pm, 0, 0);
        let end = new Date(); end.setHours(dh, dm, 0, 0);
        if (end < start) end.setDate(end.getDate() + 1);
        const diffMinutes = (end - start) / (1000 * 60);
        let autoService = diffMinutes <= 90 ? "super" : diffMinutes <= 180 ? "exclu" : "normal";
        if (form.service !== autoService) setForm(prev => ({ ...prev, service: autoService }));
    }, [form.pickupTime, form.deliveryDeadline]);

    const fetchSuggestions = async (query, setSuggestions, setLoading) => {
        if (query.trim().length < 3) { setSuggestions([]); return; }
        try {
            setLoading(true);
            const results = await autocompleteAddress(query);
            setSuggestions(results.map(s => ({ label: s.full, city: s.city, postcode: s.postcode })));
        } catch { setSuggestions([]); }
        finally { setLoading(false); }
    };

    const submitOrder = async () => {
        if (!price) return alert("Le prix n'a pas pu être calculé. Vérifiez les codes postaux.");
        if (!form.guestEmail) return alert("Veuillez renseigner votre email pour recevoir la confirmation.");
        setIsSubmitting(true);

        const notes = `[COMMANDE SANS COMPTE]\nContact: ${form.guestName} (${form.guestCompany || ''})\nEmail: ${form.guestEmail} | Tél: ${form.guestPhone}\n---\nEnlev: ${form.pickupName} | ${form.pickupContact} | ${form.pickupPhone} | Digicode: ${form.pickupAccessCode}\nInstr Enlev: ${form.pickupInstructions}\nLivr: ${form.deliveryName} | ${form.deliveryContact} | ${form.deliveryPhone} | Digicode: ${form.deliveryAccessCode}\nInstr Livr: ${form.deliveryInstructions}`;

        const { error } = await supabase.from('orders').insert({
            client_id: null,
            pickup_address: form.pickup,
            pickup_city: form.pickupCity || getPostcode(form.pickup),
            pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
            pickup_name: form.pickupName,
            pickup_phone: form.pickupPhone,
            delivery_address: form.delivery,
            delivery_city: form.deliveryCity,
            delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
            delivery_name: form.deliveryName,
            vehicle_type: form.vehicle.toLowerCase(),
            service_level: form.service.toLowerCase(),
            status: 'pending_acceptance',
            price_ht: price,
            scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
            delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
            package_type: form.packageType,
            package_description: form.packageDesc,
            weight: parseFloat(String(form.packageWeight).replace(',', '.')) || null,
            notes: notes,
        });

        setIsSubmitting(false);
        if (error) {
            alert("Erreur lors de la soumission : " + error.message);
        } else {
            try {
                notifyNewOrder({
                    pickup_address: form.pickup,
                    delivery_address: form.delivery,
                    pickup_city: form.pickupCity,
                    delivery_city: form.deliveryCity,
                    vehicle_type: form.vehicle,
                    service_level: form.service,
                    price_ht: price,
                    scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
                    delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
                }, `${form.guestName || 'Invité'} (${form.guestEmail})`);
            } catch { /* Non-bloquant */ }
            setSuccess(true);
        }
    };

    const steps = [
        { title: "Trajet", icon: MapPin },
        { title: "Détails", icon: Package },
        { title: "Contact", icon: User },
        { title: "Validation", icon: ShieldCheck },
    ];

    const nextStep = () => {
        if (step === 1 && (!form.pickup || !form.delivery)) return alert("Veuillez renseigner les adresses d'enlèvement et de livraison.");
        if (step === 3 && !form.guestEmail) return alert("Veuillez renseigner votre email.");
        setStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col">
                <PublicHeader />
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-32">
                    <div className="max-w-lg w-full bg-white rounded-[2.5rem] p-12 shadow-sm ring-1 ring-slate-100 text-center space-y-6">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-500 mx-auto">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Commande bien reçue !</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Votre demande a été transmise. Un email de confirmation sera envoyé à <strong>{form.guestEmail}</strong>.<br />
                            Notre équipe de dispatch prend en charge votre mission.
                        </p>
                        <div className="bg-slate-50 rounded-2xl p-4 text-sm font-medium text-slate-600 text-left space-y-1">
                            <div className="flex gap-2"><MapPin size={14} className="text-slate-400 mt-0.5" /><span>{form.pickup} → {form.delivery}</span></div>
                            <div className="flex gap-2"><Clock size={14} className="text-slate-400 mt-0.5" /><span>Le {new Date(form.date).toLocaleDateString('fr-FR')} de {form.pickupTime} à {form.deliveryDeadline}</span></div>
                            <div className="flex gap-2"><Truck size={14} className="text-slate-400 mt-0.5" /><span>{form.vehicle.charAt(0).toUpperCase() + form.vehicle.slice(1)} • {Number(price).toFixed(2)}€ HT</span></div>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            <Link to="/" className="w-full rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white text-center hover:bg-orange-500 transition-all">
                                Retour à l'accueil
                            </Link>
                            <Link to="/inscription" className="w-full rounded-full border border-slate-200 py-3.5 text-sm font-bold text-slate-700 text-center hover:bg-slate-50 transition-all">
                                Créer un compte pro pour plus de fonctionnalités →
                            </Link>
                        </div>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <PublicHeader />

            <div className="flex-1 px-4 pt-32 pb-20">
                <div className="mx-auto max-w-4xl space-y-8">

                    {/* Back link */}
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>

                    {/* Stepper Header */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm ring-1 ring-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                        <div className="relative z-10 w-full md:w-auto">
                            <h1 className="text-3xl font-black text-slate-900">Commander sans compte</h1>
                            <p className="text-sm font-medium text-slate-500 mt-2">Programmez votre expédition en quelques secondes.</p>
                        </div>

                        <div className="relative z-10 flex w-full md:w-auto items-center justify-between md:gap-10">
                            {steps.map((s, i) => {
                                const active = step === i + 1;
                                const passed = step > i + 1;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 relative">
                                        {i < steps.length - 1 && (
                                            <div className={`hidden md:block absolute top-[18px] left-[50%] w-[160%] h-[2px] transition-colors duration-500 ${passed ? 'bg-orange-500' : 'bg-slate-100'}`} style={{ transform: 'translateX(20px)' }} />
                                        )}
                                        <div className={`grid h-10 w-10 place-items-center rounded-2xl font-bold transition-all duration-300 relative z-10
                      ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                                                : passed ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-100 text-slate-400'}`}>
                                            {passed ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-orange-500' : passed ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {s.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Form Content */}
                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm ring-1 ring-slate-100 relative overflow-hidden min-h-[500px]">

                        {/* ── Step 1: Trajet ── */}
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Pickup */}
                                    <div className="space-y-5 relative">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">1</div>
                                            <h2 className="text-xl font-bold text-slate-900">Enlèvement</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse de départ *</label>
                                                <input
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                                    placeholder="Saisissez l'adresse complète"
                                                    value={form.pickup}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setForm({ ...form, pickup: val });
                                                        fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                                                    }}
                                                />
                                                {pickupSuggestions.length > 0 && (
                                                    <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl overflow-hidden">
                                                        {pickupSuggestions.map((s, i) => (
                                                            <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                                                onClick={() => {
                                                                    setForm({ ...form, pickup: s.label, pickupCity: s.city, pickupPostcode: s.postcode });
                                                                    setPickupSuggestions([]);
                                                                }}>
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Société</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Nom de l'entreprise" value={form.pickupName} onChange={e => setForm({ ...form, pickupName: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Contact</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Nom complet" value={form.pickupContact} onChange={e => setForm({ ...form, pickupContact: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Téléphone</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="06..." value={form.pickupPhone} onChange={e => setForm({ ...form, pickupPhone: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Digicode / Étage</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Ex: B1234" value={form.pickupAccessCode} onChange={e => setForm({ ...form, pickupAccessCode: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Instructions d'enlèvement</label>
                                                <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Infos spécifiques pour le coursier..." value={form.pickupInstructions} onChange={e => setForm({ ...form, pickupInstructions: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery */}
                                    <div className="space-y-5 relative">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                            <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">2</div>
                                            <h2 className="text-xl font-bold text-slate-900">Livraison</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Adresse d'arrivée *</label>
                                                <input
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                                    placeholder="Saisissez l'adresse complète"
                                                    value={form.delivery}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setForm({ ...form, delivery: val });
                                                        fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                                                    }}
                                                />
                                                {deliverySuggestions.length > 0 && (
                                                    <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl overflow-hidden">
                                                        {deliverySuggestions.map((s, i) => (
                                                            <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                                                onClick={() => {
                                                                    setForm({ ...form, delivery: s.label, deliveryCity: s.city, deliveryPostcode: s.postcode });
                                                                    setDeliverySuggestions([]);
                                                                }}>
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Société</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Nom de l'entreprise" value={form.deliveryName} onChange={e => setForm({ ...form, deliveryName: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Contact</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Nom complet" value={form.deliveryContact} onChange={e => setForm({ ...form, deliveryContact: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Téléphone</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="06..." value={form.deliveryPhone} onChange={e => setForm({ ...form, deliveryPhone: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Digicode / Étage</label>
                                                    <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Ex: A4567" value={form.deliveryAccessCode} onChange={e => setForm({ ...form, deliveryAccessCode: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Instructions de livraison</label>
                                                <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Infos spécifiques pour le coursier..." value={form.deliveryInstructions} onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Détails ── */}
                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Planification */}
                                    <div className="space-y-5">
                                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Planification</h2>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Date</label>
                                                <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Enlèvement</label>
                                                <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Livraison max</label>
                                                <input type="time" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none" value={form.deliveryDeadline} onChange={e => setForm({ ...form, deliveryDeadline: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100 flex items-start gap-3 mt-4">
                                            <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
                                            <p className="text-xs font-medium text-orange-800 leading-relaxed">
                                                Le niveau de service (Normal, Super, Exclu) est déterminé automatiquement par l'écart entre l'heure d'enlèvement et la deadline de livraison.
                                            </p>
                                        </div>
                                        {price !== null && (
                                            <div className="rounded-2xl bg-slate-900 p-5 text-white flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prix estimé</div>
                                                    <div className="text-xs text-slate-400 mt-1">Service : <span className="text-white font-bold capitalize">{form.service}</span></div>
                                                </div>
                                                {calculatingPrice ? (
                                                    <Loader2 className="animate-spin text-slate-400" size={24} />
                                                ) : (
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black tabular-nums">{Number(price).toFixed(2)}€</div>
                                                        <div className="text-xs text-slate-400">HT</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nature du transport */}
                                    <div className="space-y-5">
                                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Nature du transport</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Type de véhicule</label>
                                                <div className="flex gap-4">
                                                    {VEHICLES.map(v => (
                                                        <button
                                                            key={v}
                                                            onClick={() => setForm({ ...form, vehicle: v.toLowerCase() })}
                                                            className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all ${form.vehicle === v.toLowerCase()
                                                                ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Format</label>
                                                    <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.packageType} onChange={e => setForm({ ...form, packageType: e.target.value })}>
                                                        {["Pli", "Colis", "Document", "Carton", "Palette"].map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Poids estimé</label>
                                                    <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.packageWeight} onChange={e => setForm({ ...form, packageWeight: e.target.value })}>
                                                        <option value="">Non spécifié</option>
                                                        <option value="1">Moins de 1 kg</option>
                                                        <option value="5">1 à 5 kg</option>
                                                        <option value="10">5 à 10 kg</option>
                                                        <option value="30">10 à 30 kg</option>
                                                        <option value="99">Plus de 30 kg</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Description du contenu</label>
                                                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-slate-900" placeholder="Ex: Documents confidentiels, ordinateur portable..." value={form.packageDesc} onChange={e => setForm({ ...form, packageDesc: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Contact invité ── */}
                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in-up max-w-xl mx-auto">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 mb-4">
                                        <User size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Vos coordonnées</h2>
                                    <p className="text-sm font-medium text-slate-500">Pour vous envoyer la confirmation et le bon de commande.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Prénom & Nom *</label>
                                            <input
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                                placeholder="Jean Dupont"
                                                value={form.guestName}
                                                onChange={e => setForm({ ...form, guestName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Société</label>
                                            <input
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                                placeholder="Votre entreprise"
                                                value={form.guestCompany}
                                                onChange={e => setForm({ ...form, guestCompany: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                            placeholder="vous@entreprise.com"
                                            value={form.guestEmail}
                                            onChange={e => setForm({ ...form, guestEmail: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Téléphone</label>
                                        <input
                                            type="tel"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                            placeholder="06 12 34 56 78"
                                            value={form.guestPhone}
                                            onChange={e => setForm({ ...form, guestPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100 flex items-start gap-3">
                                        <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs font-medium text-orange-800 leading-relaxed">
                                            Vos données ne sont utilisées que pour cette commande et pour envoyer la confirmation. Pour un carnet d'adresses et la facturation mensuelle, <Link to="/inscription" className="underline font-bold">créez un compte professionnel</Link>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Résumé ── */}
                        {step === 4 && (
                            <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
                                <div className="text-center space-y-2">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-500 mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Résumé de la commande</h2>
                                    <p className="text-sm font-medium text-slate-500">Vérifiez vos informations avant de valider l'expédition.</p>
                                </div>

                                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 space-y-6">
                                    {/* Prix & service */}
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Truck className="text-slate-400" size={24} />
                                            <div>
                                                <div className="font-bold text-slate-900">{form.vehicle.charAt(0).toUpperCase() + form.vehicle.slice(1)} • {form.service.charAt(0).toUpperCase() + form.service.slice(1)}</div>
                                                <div className="text-xs text-slate-500">Le {new Date(form.date).toLocaleDateString('fr-FR')} de {form.pickupTime} à {form.deliveryDeadline}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase text-slate-400 mb-1">Total HT</div>
                                            {calculatingPrice
                                                ? <Loader2 className="animate-spin text-slate-400 w-6 h-6 ml-auto" />
                                                : price
                                                    ? <div className="text-3xl font-black text-slate-900 tabular-nums">{Number(price).toFixed(2)}€</div>
                                                    : <div className="text-sm font-bold text-red-500">Prix indisponible</div>
                                            }
                                        </div>
                                    </div>

                                    {/* Adresses */}
                                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                                        {[
                                            { label: "Enlèvement", name: form.pickupName, address: form.pickup, contact: form.pickupContact, phone: form.pickupPhone, info: form.pickupInstructions },
                                            { label: "Livraison", name: form.deliveryName, address: form.delivery, contact: form.deliveryContact, phone: form.deliveryPhone, info: form.deliveryInstructions }
                                        ].map((loc, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{loc.label}</div>
                                                <div className="text-sm font-bold text-slate-900">{loc.name || '—'}</div>
                                                <div className="text-xs text-slate-600">{loc.address}</div>
                                                {loc.contact && <div className="text-xs text-slate-700"><span className="font-semibold">Contact:</span> {loc.contact}</div>}
                                                {loc.phone && <div className="text-xs text-slate-700"><span className="font-semibold">Tél:</span> {loc.phone}</div>}
                                                {loc.info && <div className="text-xs text-slate-600 mt-2 p-2.5 bg-white rounded-xl border border-slate-200"><span className="font-semibold text-slate-700 block mb-1">Infos:</span> {loc.info}</div>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Colis */}
                                    <div className="border-t border-slate-200 pt-4 mt-2">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Colis & Contact</div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className="text-slate-400" size={16} />
                                            <span className="text-sm font-bold text-slate-900">{form.packageType} {form.packageWeight ? `(~${form.packageWeight} kg)` : ''}</span>
                                        </div>
                                        {form.packageDesc && <div className="text-xs text-slate-600 ml-6">{form.packageDesc}</div>}
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                                            <Mail size={14} className="text-slate-400" />
                                            <span>Confirmation → <strong>{form.guestEmail}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all border border-transparent hover:border-slate-200">
                                Retour
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button onClick={nextStep} className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/20 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-slate-900/30">
                                Continuer <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        ) : (
                            <button
                                onClick={submitOrder}
                                disabled={!price || isSubmitting}
                                className="group flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Valider la commande'}
                            </button>
                        )}
                    </div>

                    {/* CTA: créer un compte */}
                    <div className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <div className="font-bold text-slate-900">Vous commandez souvent ?</div>
                            <div className="text-sm text-slate-500 mt-1">Un compte pro vous donne accès à la facturation mensuelle, l'historique et le carnet d'adresses.</div>
                        </div>
                        <Link to="/inscription" className="shrink-0 rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white hover:bg-orange-500 transition-all whitespace-nowrap">
                            Créer un compte →
                        </Link>
                    </div>

                </div>
            </div>

            <PublicFooter />
        </div>
    );
}
