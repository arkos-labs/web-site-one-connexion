import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { autocompleteAddress } from "../lib/autocomplete";
import { sendTelegramMessage } from "../lib/telegram";
import { ArrowLeft, ArrowRight, Truck, MapPin, Package, Clock, ShieldCheck, CheckCircle2, Loader2, Info } from "lucide-react";

const VEHICLES = ["Moto", "Voiture"];

const getPostcode = (str = "") => {
    const match = String(str).match(/\b\d{5}\b/);
    return match ? match[0] : "";
};

export default function NouvelleCourse() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [price, setPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    const [form, setForm] = useState({
        pickup: "", pickupCity: "", pickupPostcode: "", pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", pickupAccessCode: "",
        delivery: "", deliveryCity: "", deliveryPostcode: "", deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "", deliveryAccessCode: "",
        date: new Date().toISOString().split('T')[0],
        pickupTime: "09:00",
        deliveryDeadline: "12:00",
        vehicle: "moto",
        service: "normal",
        packageType: "Pli",
        packageWeight: "",
        packageDesc: "",
    });

    // Calculate Price when inputs change
    useEffect(() => {
        const calc = async () => {
            const pCode = getPostcode(form.pickup);
            const dCode = getPostcode(form.delivery);

            if (!pCode || !dCode || !form.vehicle) {
                setPrice(null);
                return;
            }

            setCalculatingPrice(true);
            const { data, error } = await supabase.rpc('calculate_shipping_cost', {
                p_pickup_postal_code: pCode,
                p_delivery_postal_code: dCode,
                p_vehicle_type: form.vehicle.toLowerCase(),
                p_service_level: form.service.toLowerCase()
            });

            setCalculatingPrice(false);
            if (!error) {
                setPrice(data);
            } else {
                setPrice(null);
            }
        };

        const timer = setTimeout(calc, 600);
        return () => clearTimeout(timer);
    }, [form.pickup, form.delivery, form.vehicle, form.service]);

    // Formula Calculation based on Deadline
    useEffect(() => {
        if (!form.pickupTime || !form.deliveryDeadline) return;

        const [ph, pm] = form.pickupTime.split(':').map(Number);
        const [dh, dm] = form.deliveryDeadline.split(':').map(Number);

        let start = new Date();
        start.setHours(ph, pm, 0, 0);
        let end = new Date();
        end.setHours(dh, dm, 0, 0);

        if (end < start) end.setDate(end.getDate() + 1);
        const diffMinutes = (end - start) / (1000 * 60);

        let autoService = "normal";
        if (diffMinutes <= 0) autoService = "normal";
        else if (diffMinutes <= 90) autoService = "super";
        else if (diffMinutes <= 180) autoService = "exclu";
        else autoService = "normal";

        if (form.service !== autoService) {
            setForm(prev => ({ ...prev, service: autoService }));
        }
    }, [form.pickupTime, form.deliveryDeadline]);

    const fetchSuggestions = async (query, setSuggestions, setLoading) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            setLoading(true);
            const results = await autocompleteAddress(query);
            const list = results.map(s => ({
                label: s.full,
                city: s.city,
                postcode: s.postcode
            }));
            setSuggestions(list);
        } catch (err) {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const submitOrder = async () => {
        if (!price) {
            alert("Le prix n'a pas pu être calculé. Vérifiez vos adresses.");
            return;
        }
        setIsSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();

        const notes = `Entreprise Pick: ${form.pickupName}. Contact Pick: ${form.pickupContact}. Phone Pick: ${form.pickupPhone}. Code Enlev: ${form.pickupAccessCode}. Entreprise Deliv: ${form.deliveryName}. Contact Deliv: ${form.deliveryContact}. Phone Deliv: ${form.deliveryPhone}. Code Dest: ${form.deliveryAccessCode}. Instructions: ${form.pickupInstructions} / ${form.deliveryInstructions}`;

        const { error } = await supabase.from('orders').insert({
            client_id: user.id,
            pickup_address: form.pickup,
            pickup_city: form.pickupCity || form.pickup.split(',').pop()?.trim(),
            pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
            pickup_name: form.pickupName,
            pickup_phone: form.pickupPhone,
            delivery_address: form.delivery,
            delivery_city: form.deliveryCity || form.delivery.split(',').pop()?.trim(),
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
            alert("Erreur lors de la validation : " + error.message);
        } else {
            // Notification Telegram (Non bloquante)
            sendTelegramMessage(
                `📦 <b>NOUVELLE COMMANDE !</b>\n\n` +
                `<b>Client :</b> ${profile?.full_name || 'Client Web'}\n` +
                `<b>Départ :</b> ${form.pickupCity || form.pickup}\n` +
                `<b>Arrivée :</b> ${form.deliveryCity || form.delivery}\n` +
                `<b>Véhicule :</b> ${form.vehicle}\n` +
                `<b>Prix estimé :</b> ${Number(price).toFixed(2)}€ HT`
            );

            navigate('/dashboard-client/orders', { state: { flash: "Course validée avec succès !" } });
        }
    };

    const steps = [
        { title: "Trajet", icon: MapPin },
        { title: "Détails", icon: Package },
        { title: "Validation", icon: ShieldCheck },
    ];

    const nextStep = () => {
        if (step === 1) {
            if (!form.pickup || !form.delivery) return alert("Veuillez renseigner les adresses d'enlèvement et de livraison.");
        }
        setStep(s => Math.min(s + 1, 3));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen bg-[#f8fafc] md:p-4">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard-client')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} /> Retour au tableau de bord
                    </button>
                </div>

                {/* Stepper Header */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm ring-1 ring-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 w-full md:w-auto">
                        <h1 className="text-3xl font-black text-slate-900">Nouvelle Course</h1>
                        <p className="text-sm font-medium text-slate-500 mt-2">Programmez votre expédition en quelques secondes.</p>
                    </div>

                    <div className="relative z-10 flex w-full md:w-auto items-center justify-between md:gap-8">
                        {steps.map((s, i) => {
                            const active = step === i + 1;
                            const passed = step > i + 1;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 relative">
                                    {/* Connector Line */}
                                    {i < steps.length - 1 && (
                                        <div className={`hidden md:block absolute top-[18px] left-[50%] w-[200%] h-[2px] transition-colors duration-500 ${passed ? 'bg-orange-500' : 'bg-slate-100'}`} style={{ transform: 'translateX(20px)' }} />
                                    )}
                                    <div className={`grid h-10 w-10 place-items-center rounded-2xl font-bold transition-all duration-300 relative z-10 ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                                        : passed ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>
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
                    {/* Step 1: Trajet */}
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
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm({ ...form, pickup: val });
                                                    fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                                                }}
                                            />
                                            {pickupSuggestions.length > 0 && (
                                                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl overflow-hidden scale-in-center">
                                                    {pickupSuggestions.map((s, i) => (
                                                        <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                                            onClick={() => {
                                                                const city = s.city || s.label.split(',')[0];
                                                                setForm({ ...form, pickup: s.label, pickupCity: city, pickupPostcode: s.postcode });
                                                                setPickupSuggestions([]);
                                                            }}
                                                        >
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
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Infos utiles</label>
                                                <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Digicode, étage..." value={form.pickupInstructions} onChange={e => setForm({ ...form, pickupInstructions: e.target.value })} />
                                            </div>
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
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm({ ...form, delivery: val });
                                                    fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                                                }}
                                            />
                                            {deliverySuggestions.length > 0 && (
                                                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl overflow-hidden scale-in-center">
                                                    {deliverySuggestions.map((s, i) => (
                                                        <button key={i} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                                            onClick={() => {
                                                                const city = s.city || s.label.split(',')[0];
                                                                setForm({ ...form, delivery: s.label, deliveryCity: city, deliveryPostcode: s.postcode });
                                                                setDeliverySuggestions([]);
                                                            }}
                                                        >
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
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Infos utiles</label>
                                                <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-slate-900" placeholder="Digicode, étage..." value={form.deliveryInstructions} onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Détails */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Temps */}
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
                                            Une livraison express est déterminée automatiquement selon l'écart entre l'enlèvement et la livraison max. Le niveau de service (Normal, Super, Exclu) sera calculé.
                                        </p>
                                    </div>
                                </div>

                                {/* Colis */}
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
                                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                                            }`}
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
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Poids total estimé</label>
                                                <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium" value={form.packageWeight} onChange={e => setForm({ ...form, packageWeight: e.target.value })}>
                                                    <option value="">Non spécifié</option>
                                                    <option value="1">- de 1 kg</option>
                                                    <option value="5">1 à 5 kg</option>
                                                    <option value="10">5 à 10 kg</option>
                                                    <option value="30">10 à 30 kg</option>
                                                    <option value="+30">+ de 30 kg</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Description du contenu</label>
                                            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-slate-900" placeholder="Ex: Ordinateur portable, documents confidentiels..." value={form.packageDesc} onChange={e => setForm({ ...form, packageDesc: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Validation */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto">
                            <div className="text-center space-y-2">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-500 mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">Résumé de la commande</h2>
                                <p className="text-sm font-medium text-slate-500">Vérifiez vos informations avant de valider l'expédition.</p>
                            </div>

                            <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="text-slate-400" size={24} />
                                        <div>
                                            <div className="font-bold text-slate-900">{form.vehicle.charAt(0).toUpperCase() + form.vehicle.slice(1)} • {form.service.charAt(0).toUpperCase() + form.service.slice(1)}</div>
                                            <div className="text-xs text-slate-500">Le {new Date(form.date).toLocaleDateString()} de {form.pickupTime} à {form.deliveryDeadline}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold uppercase text-slate-400 mb-1">Total HT</div>
                                        {calculatingPrice ? (
                                            <Loader2 className="animate-spin text-slate-400 w-6 h-6 ml-auto" />
                                        ) : price ? (
                                            <div className="text-3xl font-black text-slate-900 tabular-nums">{Number(price).toFixed(2)}€</div>
                                        ) : (
                                            <div className="text-sm font-bold text-red-500">Erreur de prix</div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Enlèvement</div>
                                            <div className="text-sm font-bold text-slate-900">{form.pickupName || 'Société non spécifiée'}</div>
                                            <div className="text-xs text-slate-600 mb-2">{form.pickup}</div>
                                            {form.pickupContact && <div className="text-xs text-slate-700"><span className="font-semibold">Contact:</span> {form.pickupContact}</div>}
                                            {form.pickupPhone && <div className="text-xs text-slate-700"><span className="font-semibold">Tél:</span> {form.pickupPhone}</div>}
                                            {form.pickupInstructions && <div className="text-xs text-slate-600 mt-2 p-2.5 bg-white rounded-xl border border-slate-200"><span className="font-semibold text-slate-700 block mb-1">Infos utiles:</span> {form.pickupInstructions}</div>}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Livraison</div>
                                            <div className="text-sm font-bold text-slate-900">{form.deliveryName || 'Société non spécifiée'}</div>
                                            <div className="text-xs text-slate-600 mb-2">{form.delivery}</div>
                                            {form.deliveryContact && <div className="text-xs text-slate-700"><span className="font-semibold">Contact:</span> {form.deliveryContact}</div>}
                                            {form.deliveryPhone && <div className="text-xs text-slate-700"><span className="font-semibold">Tél:</span> {form.deliveryPhone}</div>}
                                            {form.deliveryInstructions && <div className="text-xs text-slate-600 mt-2 p-2.5 bg-white rounded-xl border border-slate-200"><span className="font-semibold text-slate-700 block mb-1">Infos utiles:</span> {form.deliveryInstructions}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 pt-4 mt-2">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Informations colis</div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Package className="text-slate-400" size={16} />
                                        <span className="text-sm font-bold text-slate-900">{form.packageType} {form.packageWeight ? `(Jusqu'à ${form.packageWeight} kg)` : ''}</span>
                                    </div>
                                    {form.packageDesc && <div className="text-xs text-slate-600 ml-6">{form.packageDesc}</div>}
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
                    ) : <div></div>}

                    {step < 3 ? (
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
            </div>
        </div>
    );
}
