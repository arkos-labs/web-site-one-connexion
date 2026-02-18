import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Truck, Clock, MapPin, Phone, User, ArrowLeft, Loader2, CheckCircle2, ShoppingCart, Info, AlertCircle, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import PublicHeader from "../components/PublicHeader.jsx";

const VEHICLES = ["Moto", "Voiture"];
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

const getPostcode = (str = "") => {
    const match = String(str).match(/\b\d{5}\b/);
    return match ? match[0] : "";
};

const formatAddress = (d) => {
    const a = d.address || {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const city = [a.postcode, a.city || a.town || a.village].filter(Boolean).join(" ");
    if (street && city) return `${street}, ${city}`;
    return d.display_name;
};

export default function GuestOrder() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState("");
    const [seedIndex, setSeedIndex] = useState(0);

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [loadingPickup, setLoadingPickup] = useState(false);
    const [loadingDelivery, setLoadingDelivery] = useState(false);

    const [price, setPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    const [form, setForm] = useState({
        pickup: "",
        pickupName: "",
        pickupContact: "",
        pickupPhone: "",
        pickupInstructions: "",
        pickupDate: new Date().toISOString().split('T')[0],
        pickupTime: "08:00",
        pickupCode: "",
        pickupCity: "",
        pickupPostcode: "",
        delivery: "",
        deliveryName: "",
        deliveryContact: "",
        deliveryPhone: "",
        deliveryInstructions: "",
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: "09:00",
        deliveryCity: "",
        deliveryPostcode: "",
        vehicle: "moto",
        service: "normal",
        packageDesc: "",
        packageWeight: "",
        contactPhone: "",
        guestEmail: "",
        billingName: "",
        billingCompany: "",
        billingAddress: "",
        packageType: "Pli",
        packageTypeOther: "",
    });

    // Auto-calculate delivery time based on formula
    useEffect(() => {
        if (!form.pickupTime || !form.deliveryTime) return;

        const pickup = new Date(`${form.pickupDate}T${form.pickupTime}:00`);
        const delivery = new Date(`${form.deliveryDate}T${form.deliveryTime}:00`);

        // Handle case where delivery is next day automatically if time is earlier? 
        // For now, trust the dates provided.

        const diffMs = delivery - pickup;
        const diffMinutes = diffMs / (1000 * 60);

        let newService = "normal";

        if (diffMinutes <= 0) {
            // Invalid time range (delivery before pickup), default to normal or handle error
            // User feedback: sticky vague hours should default to normal
            newService = "normal";
        } else if (diffMinutes <= 90) { // 1h30
            newService = "super";
        } else if (diffMinutes <= 180) { // 3h (User: Exclu is 3h)
            newService = "exclu";
        } else {
            newService = "normal";
        }

        if (form.service !== newService) {
            setForm(prev => ({ ...prev, service: newService }));
        }
    }, [form.pickupTime, form.pickupDate, form.deliveryTime, form.deliveryDate]);

    // Calculate Price logic
    useEffect(() => {
        const calc = async () => {
            const pCode = form.pickupPostcode || getPostcode(form.pickup);
            const dCode = form.deliveryPostcode || getPostcode(form.delivery);

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
            if (!error) setPrice(data);
        };

        const timer = setTimeout(calc, 500);
        return () => clearTimeout(timer);
    }, [form.pickup, form.delivery, form.vehicle, form.service]);

    const fetchSuggestions = async (query, setSuggestions, setLoading) => {
        if (!LOCATIONIQ_KEY || query.trim().length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            setLoading(true);
            const viewbox = "1.446,49.241,3.559,48.120"; // Île-de-France bbox
            const url = `${LOCATIONIQ_URL}?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&limit=5&format=json&accept-language=fr&countrycodes=fr&viewbox=${viewbox}&bounded=1`;
            const res = await fetch(url);
            const data = await res.json();
            const allowed = ['75', '77', '78', '91', '92', '93', '94', '95'];
            const list = Array.isArray(data)
                ? data
                    .map((d) => ({
                        label: formatAddress(d),
                        city: d.address?.city || d.address?.town || d.address?.village || "",
                        postcode: d.address?.postcode || ""
                    }))
                    .filter(item => allowed.some(prefix => item.postcode.startsWith(prefix)))
                : [];
            setSuggestions(list);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const seedSamples = [
        {
            pickupName: "Entreprise A",
            pickupContact: "Camille",
            pickupPhone: "0600000000",
            pickupCode: "1234, 2ème étage",
            pickup: "10 Rue de la Paix, 75002 Paris",
            pickupInstructions: "devant",
            pickupDate: "2026-02-16",
            pickupTime: "08:00",
            deliveryName: "Cherki",
            deliveryContact: "edi",
            deliveryPhone: "0797545037",
            delivery: "13 Rue de Verdun, 78440 Gargenville",
            deliveryInstructions: "acc",
            deliveryDate: "2026-02-16",
            deliveryTime: "09:00",
            vehicle: "moto",
            packageWeight: "< 1kg",
            packageType: "Pli",
            packageDesc: "Documents juridiques, enveloppe A4",
            billingName: "nicolas",
            billingCompany: "Cherki",
            billingAddress: "5 Rue Nungesser",
            guestEmail: "cherkinicolas@gmail.com",
            contactPhone: "0666026707",
        },
        {
            pickupName: "Entreprise B",
            pickupContact: "Thomas",
            pickupPhone: "0612345678",
            pickupCode: "B2, étage 3",
            pickup: "5 Rue Nungesser, 78960 Voisins-le-Bretonneux",
            pickupInstructions: "sonner interphone",
            pickupDate: "2026-02-16",
            pickupTime: "09:00",
            deliveryName: "SRF",
            deliveryContact: "gigi",
            deliveryPhone: "0666026707",
            delivery: "Avenue Daumesnil, 94160 Saint-Mandé",
            deliveryInstructions: "accueil",
            deliveryDate: "2026-02-16",
            deliveryTime: "10:00",
            vehicle: "moto",
            packageWeight: "1kg - 5kg",
            packageType: "Pli",
            packageDesc: "5 plis",
            billingName: "Nicolas Cherki",
            billingCompany: "One Connexion",
            billingAddress: "5 Rue Nungesser",
            guestEmail: "nicolas@oneconnexion.fr",
            contactPhone: "0666026707",
        }
    ];

    const fillTestData = () => {
        const sample = seedSamples[seedIndex % seedSamples.length];
        setForm(prev => ({
            ...prev,
            ...sample,
            pickupCity: "",
            pickupPostcode: "",
            deliveryCity: "",
            deliveryPostcode: "",
            service: "super",
        }));
        setSeedIndex((i) => i + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!price) return setError("Prix non calculé.");
        setLoading(true);
        setError("");
        try {
            const scheduledAt = `${form.pickupDate}T${form.pickupTime}:00`;
            const deliveryDeadline = `${form.deliveryDate}T${form.deliveryTime}:00`;

            const { data, error: orderError } = await supabase.from('orders').insert({
                client_id: null,
                pickup_address: form.pickup,
                pickup_city: form.pickupCity || getPostcode(form.pickup),
                pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
                pickup_name: form.pickupName,
                pickup_phone: form.pickupPhone,
                pickup_access_code: form.pickupCode,
                delivery_address: form.delivery,
                delivery_city: form.deliveryCity || getPostcode(form.delivery),
                delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
                delivery_name: form.deliveryName,
                vehicle_type: form.vehicle.toLowerCase(),
                service_level: form.service.toLowerCase(),
                status: 'pending',
                price_ht: price,
                package_description: form.packageDesc,
                weight: parseFloat(form.packageWeight) || 0,
                scheduled_at: scheduledAt,
                delivery_deadline: deliveryDeadline,
                package_type: form.packageType === "Autre" ? (form.packageTypeOther || "Autre") : form.packageType,
                notes: `Guest Order. Contact: ${form.pickupContact} (Pick) / ${form.deliveryContact} (Deliv). Instructions: ${form.pickupInstructions} / ${form.deliveryInstructions}. Email: ${form.guestEmail}. Phone: ${form.contactPhone}. Billing: ${form.billingName} | ${form.billingCompany} | ${form.billingAddress}`,
            }).select().single();

            if (orderError) throw orderError;
            setSuccess(data.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white p-6">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Commande validée !</h1>
                    <p className="mt-4 text-slate-500 leading-relaxed">
                        Votre commande <span className="font-bold text-slate-900">#{success.slice(0, 8)}</span> a été transmise à nos équipes.
                        Vous recevrez un email de confirmation sous peu.
                    </p>
                    <div className="mt-8 rounded-3xl bg-slate-50 p-8 text-left ring-1 ring-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Résumé de la course</h3>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Commande #{success.slice(0, 8)}</div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Véhicule</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900 uppercase">{form.vehicle}</div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Formule</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{form.service === 'super' ? 'Super (1h30)' : form.service === 'exclu' ? 'Exclu (3h)' : 'Normal (4h)'}</div>
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Colis</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{form.packageType}{form.packageType === "Autre" && form.packageTypeOther ? ` (${form.packageTypeOther})` : ""}</div>
                                {form.packageWeight && <div className="mt-1 text-xs text-slate-500">Poids : {form.packageWeight}</div>}
                                {form.packageDesc && <div className="mt-1 text-xs text-slate-500">Contenu : {form.packageDesc}</div>}
                            </div>
                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Prix</div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-sm text-slate-500">HT</span>
                                    <span className="text-sm font-semibold text-slate-900">{price}€</span>
                                </div>
                                <div className="mt-1 flex items-baseline justify-between">
                                    <span className="text-sm text-slate-500">TTC</span>
                                    <span className="text-base font-bold text-orange-600">{(price * 1.2).toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Enlèvement</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{form.pickupName}</div>
                                <div className="mt-1 text-sm text-slate-500">{form.pickup}</div>
                                <div className="mt-2 text-sm text-slate-500">{form.pickupDate} • {form.pickupTime}</div>
                                {form.pickupContact && <div className="mt-2 text-xs text-slate-500">Contact : {form.pickupContact} {form.pickupPhone ? `• ${form.pickupPhone}` : ""}</div>}
                                {form.pickupCode && <div className="mt-1 text-xs text-slate-500">Code/étage : {form.pickupCode}</div>}
                                {form.pickupInstructions && <div className="mt-1 text-xs text-slate-500 italic">"{form.pickupInstructions}"</div>}
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Livraison</div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{form.deliveryName}</div>
                                <div className="mt-1 text-sm text-slate-500">{form.delivery}</div>
                                <div className="mt-2 text-sm text-slate-500">{form.deliveryDate} • {form.deliveryTime}</div>
                                {form.deliveryContact && <div className="mt-2 text-xs text-slate-500">Contact : {form.deliveryContact} {form.deliveryPhone ? `• ${form.deliveryPhone}` : ""}</div>}
                                {form.deliveryInstructions && <div className="mt-1 text-xs text-slate-500 italic">"{form.deliveryInstructions}"</div>}
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Infos de facturation</div>
                            <div className="mt-2 text-sm text-slate-500">Nom : <span className="font-medium text-slate-900">{form.billingName}</span></div>
                            <div className="mt-1 text-sm text-slate-500">Entreprise : <span className="font-medium text-slate-900">{form.billingCompany}</span></div>
                            <div className="mt-1 text-sm text-slate-500">Adresse : <span className="font-medium text-slate-900">{form.billingAddress}</span></div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-8 w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <PublicHeader />

            <main className="mx-auto w-full max-w-none px-8 py-12">
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Commander une course</h1>
                        <p className="mt-4 text-lg text-slate-500">Pas besoin de compte. Simple, rapide et fiable.</p>
                    </div>
                    <button
                        type="button"
                        onClick={fillTestData}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                        Remplir avec des données test
                    </button>
                </div>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Pickup Section */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                        <MapPin size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Enlèvement</h2>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom Entreprise</label>
                                            <input
                                                required
                                                placeholder="Ex: Entreprise A"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupName}
                                                onChange={(e) => setForm({ ...form, pickupName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact sur place</label>
                                            <input
                                                required
                                                placeholder="Ex: Camille"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupContact}
                                                onChange={(e) => setForm({ ...form, pickupContact: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Téléphone contact</label>
                                            <input
                                                required
                                                placeholder="06 00 00 00 00"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupPhone}
                                                onChange={(e) => setForm({ ...form, pickupPhone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Code / Étage</label>
                                            <input
                                                placeholder="Ex: 1234, 2ème étage"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupCode}
                                                onChange={(e) => setForm({ ...form, pickupCode: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Adresse exacte</label>
                                        <input
                                            required
                                            placeholder="Ex: 10 Rue de la Paix, 75002 Paris"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.pickup}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setForm({ ...form, pickup: val, pickupCity: "", pickupPostcode: "" });
                                                fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                                            }}
                                        />
                                        {pickupSuggestions.length > 0 && (
                                            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                                {pickupSuggestions.map((s, i) => (
                                                    <button key={i} type="button" className="w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                                                        onClick={() => {
                                                            const city = s.city || s.label.split(",")[0];
                                                            setForm({ ...form, pickup: s.label, pickupCity: city, pickupPostcode: s.postcode });
                                                            setPickupSuggestions([]);
                                                        }}
                                                    >
                                                        <span className="font-medium text-slate-900">{s.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date enlèvement</label>
                                            <input
                                                type="date"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupDate}
                                                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Heure (A partir de)</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.pickupTime}
                                                onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Instructions chauffeur</label>
                                        <input
                                            placeholder="Ex: devant la porte"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.pickupInstructions}
                                            onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Section */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                        <Truck size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Livraison</h2>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom Entreprise</label>
                                            <input
                                                required
                                                placeholder="Ex: Entreprise B"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.deliveryName}
                                                onChange={(e) => setForm({ ...form, deliveryName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact destinataire</label>
                                            <input
                                                required
                                                placeholder="Ex: Thomas"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.deliveryContact}
                                                onChange={(e) => setForm({ ...form, deliveryContact: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Téléphone contact</label>
                                            <input
                                                required
                                                placeholder="06 00 00 00 00"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.deliveryPhone}
                                                onChange={(e) => setForm({ ...form, deliveryPhone: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Adresse exacte</label>
                                            <input
                                                required
                                                placeholder="Ex: 1 Avenue des Champs-Élysées, 75008 Paris"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.delivery}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm({ ...form, delivery: val, deliveryCity: "", deliveryPostcode: "" });
                                                    fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                                                }}
                                            />
                                            {deliverySuggestions.length > 0 && (
                                                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                                                    {deliverySuggestions.map((s, i) => (
                                                        <button key={i} type="button" className="w-full rounded-xl px-3 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                                                            onClick={() => {
                                                                const city = s.city || s.label.split(",")[0];
                                                                setForm({ ...form, delivery: s.label, deliveryCity: city, deliveryPostcode: s.postcode });
                                                                setDeliverySuggestions([]);
                                                            }}
                                                        >
                                                            <span className="font-medium text-slate-900">{s.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Heure (Avant)</label>
                                            <input
                                                type="time"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.deliveryTime}
                                                onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Instructions</label>
                                            <input
                                                placeholder="Ex: Sonner à l'accueil"
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.deliveryInstructions}
                                                onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Package Details */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                        <Package size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Détails de l'envoi</h2>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Type de véhicule</label>
                                        <select
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none"
                                            value={form.vehicle}
                                            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                                        >
                                            {VEHICLES.map(v => <option key={v} value={v.toLowerCase()}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Formule (Délai)</label>
                                        <select
                                            disabled
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-500 cursor-not-allowed appearance-none"
                                            value={form.service}
                                        >
                                            <option value="normal">Normal (4h)</option>
                                            <option value="exclu">Exclu (3h)</option>
                                            <option value="super">Super (1h30)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Poids approximatif</label>
                                        <select
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none"
                                            value={form.packageWeight}
                                            onChange={(e) => setForm({ ...form, packageWeight: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="< 1kg">Moins de 1kg</option>
                                            <option value="1kg - 5kg">1kg - 5kg</option>
                                            <option value="5kg - 10kg">5kg - 10kg</option>
                                            <option value="10kg - 30kg">10kg - 30kg</option>
                                            <option value="+ 30kg">Plus de 30kg</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Type de colis</label>
                                        <select
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none"
                                            value={form.packageType}
                                            onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                                        >
                                            {["Pli", "Colis", "Palette", "Sac", "Matériel", "Autre"].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {form.packageType === "Autre" && (
                                        <div className="md:col-span-2 space-y-1.5 animate-fadeIn">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Précisez le type</label>
                                            <input
                                                required
                                                placeholder="Ex: Tapis, Meuble, etc."
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                                value={form.packageTypeOther}
                                                onChange={(e) => setForm({ ...form, packageTypeOther: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contenu (Description)</label>
                                        <textarea
                                            placeholder="Ex: Documents juridiques, enveloppe A4..."
                                            rows={2}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all resize-none"
                                            value={form.packageDesc}
                                            onChange={(e) => setForm({ ...form, packageDesc: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guest Contact */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Vos informations</h2>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom</label>
                                        <input
                                            required
                                            placeholder="Prénom Nom"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.billingName}
                                            onChange={(e) => setForm({ ...form, billingName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom entreprise</label>
                                        <input
                                            required
                                            placeholder="Nom de l'entreprise"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.billingCompany}
                                            onChange={(e) => setForm({ ...form, billingCompany: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Adresse de facturation</label>
                                        <input
                                            required
                                            placeholder="Adresse complète"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.billingAddress}
                                            onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email pour le </label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="votre@email.com"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.guestEmail}
                                            onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Téléphone de contact</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="06 00 00 00 00"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                                            value={form.contactPhone}
                                            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar / Price Card */}
                    <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                        <div className="rounded-3xl bg-slate-900 p-8 text-slate-100 shadow-2xl">
                            <h3 className="text-2xl font-bold">Récapitulatif</h3>
                            <div className="mt-8 space-y-6 text-lg">
                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Enlèvement</span>
                                    <div className="mt-2 space-y-1 text-lg">
                                        <div className="font-bold text-white">{form.pickupName || "—"}</div>
                                        <div className="text-base text-slate-200">{form.pickup || "Adresse à renseigner"}</div>
                                        <div className="text-base text-slate-300">{form.pickupDate} • {form.pickupTime}</div>
                                        {(form.pickupContact || form.pickupPhone) && (
                                            <div className="text-base text-slate-300">{form.pickupContact || "Contact"} {form.pickupPhone ? `• ${form.pickupPhone}` : ""}</div>
                                        )}
                                        {form.pickupCode && (
                                            <div className="text-base text-slate-300">Code/étage : {form.pickupCode}</div>
                                        )}
                                        {form.pickupInstructions && (
                                            <div className="text-base text-slate-300 italic">"{form.pickupInstructions}"</div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Livraison</span>
                                    <div className="mt-2 space-y-1 text-lg">
                                        <div className="font-bold text-white">{form.deliveryName || "—"}</div>
                                        <div className="text-base text-slate-200">{form.delivery || "Adresse à renseigner"}</div>
                                        <div className="text-base text-slate-300">{form.deliveryDate} • {form.deliveryTime}</div>
                                        {(form.deliveryContact || form.deliveryPhone) && (
                                            <div className="text-base text-slate-300">{form.deliveryContact || "Contact"} {form.deliveryPhone ? `• ${form.deliveryPhone}` : ""}</div>
                                        )}
                                        {form.deliveryInstructions && (
                                            <div className="text-base text-slate-300 italic">"{form.deliveryInstructions}"</div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Véhicule</span>
                                    <div className="mt-1 flex items-center gap-2 text-lg">
                                        <Truck size={18} className="text-orange-500" />
                                        <span className="font-bold uppercase tracking-tight">{form.vehicle}</span>
                                        <span className="text-base font-medium text-slate-300">• {form.service === 'super' ? '1h30' : form.service === 'exclu' ? '3h' : '4h'}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10" />

                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Colis</span>
                                    <div className="mt-1 flex flex-col gap-1 text-lg">
                                        <div className="flex items-center gap-2">
                                            <Package size={18} className="text-orange-500" />
                                            <span className="font-bold">{form.packageType}{form.packageType === "Autre" && form.packageTypeOther ? ` (${form.packageTypeOther})` : ""}</span>
                                        </div>
                                        {form.packageWeight && <div className="text-base text-slate-200 pl-6">Poids: {form.packageWeight}</div>}
                                        {form.packageDesc && <div className="text-base text-slate-300 pl-6 italic">"{form.packageDesc}"</div>}
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Contact</span>
                                    <div className="mt-1 text-lg">
                                        <div className="text-base text-slate-200">{form.guestEmail || "Email à renseigner"}</div>
                                        <div className="text-base text-slate-300">{form.contactPhone || "Téléphone à renseigner"}</div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div>
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-300">Total estimé</span>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        {calculatingPrice ? (
                                            <Loader2 className="animate-spin text-orange-500" size={24} />
                                        ) : price ? (
                                            <>
                                                <span className="text-4xl font-bold">{(price * 1.2).toFixed(2)}€</span>
                                                <span className="text-base font-bold text-slate-200 uppercase">TTC</span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-medium text-slate-200 italic">En attente d'adresses...</span>
                                        )}
                                    </div>
                                    {price && <div className="mt-1 text-base text-slate-200">Soit {price.toFixed(2)}€ HT</div>}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!price || loading}
                                    className="group relative w-full overflow-hidden rounded-full bg-white py-4 text-sm font-black text-slate-900 transition-all hover:bg-orange-500 hover:text-white disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            Validation...
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <ShoppingCart size={18} />
                                            VALIDER LA COMMANDE
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                                <Info size={16} className="mt-0.5 shrink-0 text-orange-500" />
                                <p className="text-[10px] leading-relaxed text-slate-400">
                                    En validant cette commande, vous acceptez nos conditions générales de transport.
                                    Un coursier sera notifié dès validation du paiement (simulation).
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h4 className="font-bold text-slate-900">Besoin d'aide ?</h4>
                            <p className="mt-2 text-xs text-slate-500">Nos équipes sont disponibles 24/7 pour vous accompagner.</p>
                            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors">
                                <Phone size={14} />
                                01 89 20 45 67
                            </button>
                        </div>
                    </div>
                </div >
            </main >

            <footer className="bg-white px-4 pb-6 pt-10">
                <div className="rounded-[2.5rem] bg-black px-8 py-12 text-white shadow-2xl md:px-12 relative overflow-hidden">
                    {/* Top Row: Logo & App Buttons */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white font-bold text-xl">OC</div>
                            <span className="text-xl font-bold tracking-tight">One Connexion</span>
                        </div>

                        {/* App Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    className="h-10"
                                />
                            </a>
                            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download on the App Store"
                                    className="h-10"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Mission Text */}
                    <div className="mt-8 max-w-lg">
                        <p className="text-lg leading-relaxed text-slate-400">
                            Notre mission est de simplifier la logistique B2B pour les entreprises, en offrant une solution rapide, fiable et 100% digitalisée.
                        </p>
                    </div>

                    {/* Nav Links */}
                    <nav className="mt-10 flex flex-wrap gap-8 font-medium text-slate-300">
                        <a href="#" className="hover:text-white transition-colors">Accueil</a>
                        <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
                        <a href="#workflow" className="hover:text-white transition-colors">Services</a>
                        <a href="#expertises" className="hover:text-white transition-colors">Secteurs</a>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </nav>

                    {/* Divider */}
                    <div className="my-10 h-px w-full bg-white/10" />

                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-slate-500 text-sm">
                            Copyright 2026 © One Connexion. All Rights Reserved.
                        </div>
                        <div className="flex gap-6">
                            <a href="#" aria-label="Facebook">
                                <Facebook className="text-slate-500 transition-colors hover:text-white" size={20} />
                            </a>
                            <a href="#" aria-label="Twitter">
                                <Twitter className="text-slate-500 transition-colors hover:text-white" size={20} />
                            </a>
                            <a href="#" aria-label="Instagram">
                                <Instagram className="text-slate-500 transition-colors hover:text-white" size={20} />
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <Linkedin className="text-slate-500 transition-colors hover:text-white" size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
}
