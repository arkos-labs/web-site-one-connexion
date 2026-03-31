import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { generateOrderPdf } from "../../lib/pdfGenerator";
import { autocompleteAddress } from "../../lib/autocomplete";
import PublicHeader from "../../components/PublicHeader.jsx";
import PublicFooter from "../../components/PublicFooter.jsx";
import { ArrowLeft, ArrowRight, MapPin, Package, User, ShieldCheck, Loader2 } from "lucide-react";

// Modular Components
import { Stepper } from "./guest-order/Stepper";
import { OrderSuccess } from "./guest-order/OrderSuccess";
import { Step1Trajet } from "./guest-order/Step1Trajet";
import { Step2Details } from "./guest-order/Step2Details";
import { Step3Contact } from "./guest-order/Step3Contact";
import { Step4Resume } from "./guest-order/Step4Resume";

const getPostcode = (str = "") => str.match(/\b\d{5}\b/)?.[0] || "";

export default function GuestOrder() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [price, setPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [billingSuggestions, setBillingSuggestions] = useState([]);

    const [form, setForm] = useState({
        pickup: "", pickupCity: "", pickupPostcode: "", pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", pickupAccessCode: "",
        delivery: "", deliveryCity: "", deliveryPostcode: "", deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "", deliveryAccessCode: "",
        date: new Date().toISOString().split('T')[0], pickupTime: "09:00", deliveryDeadline: "12:00", vehicle: "moto", service: "normal",
        packageType: "Pli", packageWeight: "", packageDesc: "",
        guestName: "", guestEmail: "", guestPhone: "", guestCompany: "",
        billingAddress: "", billingCity: "", billingPostcode: "",
    });

    useEffect(() => {
        const calc = async () => {
            const pCode = getPostcode(form.pickup);
            const dCode = getPostcode(form.delivery);
            if (!pCode || !dCode) return setPrice(null);
            setCalculatingPrice(true);
            const { data, error } = await supabase.rpc('calculate_shipping_cost', {
                p_pickup_postal_code: pCode, p_delivery_postal_code: dCode,
                p_vehicle_type: form.vehicle.toLowerCase(), p_service_level: form.service.toLowerCase()
            });
            setCalculatingPrice(false);
            setPrice(error ? null : data);
        };
        const timer = setTimeout(calc, 600);
        return () => clearTimeout(timer);
    }, [form.pickup, form.delivery, form.vehicle, form.service]);

    useEffect(() => {
        if (!form.pickupTime || !form.deliveryDeadline) return;
        const [ph, pm] = form.pickupTime.split(':').map(Number);
        const [dh, dm] = form.deliveryDeadline.split(':').map(Number);
        let start = new Date(); start.setHours(ph, pm, 0, 0);
        let end = new Date(); end.setHours(dh, dm, 0, 0);
        if (end < start) end.setDate(end.getDate() + 1);
        const diffMinutes = (end - start) / 60000;
        const autoService = diffMinutes <= 90 ? "super" : diffMinutes <= 180 ? "exclu" : "normal";
        if (form.service !== autoService) setForm(prev => ({ ...prev, service: autoService }));
    }, [form.pickupTime, form.deliveryDeadline]);

    const fetchSuggestions = async (query, setS) => {
        if (query.trim().length < 3) return setS([]);
        const results = await autocompleteAddress(query);
        setS(results.map(s => ({ label: s.full, city: s.city, postcode: s.postcode })));
    };

    const submitOrder = async () => {
        if (!price) return alert("Prix indisponible.");
        setIsSubmitting(true);
        const { data, error } = await supabase.from('orders').insert({
            pickup_address: form.pickup, pickup_city: form.pickupCity, pickup_postal_code: form.pickupPostcode,
            delivery_address: form.delivery, delivery_city: form.deliveryCity, delivery_postal_code: form.deliveryPostcode,
            vehicle_type: form.vehicle.toLowerCase(), service_level: form.service.toLowerCase(),
            price_ht: price, scheduled_at: `${form.date}T${form.pickupTime}:00`, delivery_deadline: `${form.date}T${form.deliveryDeadline}:00`,
            package_type: form.packageType, weight: parseFloat(form.packageWeight) || null,
            notes: `[GUEST] ${form.guestName} | ${form.guestEmail} | ${form.guestPhone}`,
        }).select().single();

        if (!error && data) await generateOrderPdf(data, { name: form.guestName, email: form.guestEmail }, { upload: true });
        setIsSubmitting(false);
        error ? alert(error.message) : setSuccess(true);
    };

    const steps = [{ title: "Trajet", icon: MapPin }, { title: "Détails", icon: Package }, { title: "Contact", icon: User }, { title: "Validation", icon: ShieldCheck }];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            <PublicHeader />
            <div className="flex-1 px-4 pt-32 pb-20">
                {success ? <OrderSuccess form={form} price={price} /> : (
                    <div className="mx-auto max-w-4xl space-y-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={16} /> Retour à l'accueil
                        </Link>
                        <Stepper currentStep={step} steps={steps} />
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm ring-1 ring-slate-100 relative overflow-hidden min-h-[500px]">
                            {step === 1 && <Step1Trajet form={form} setForm={setForm} fetchSuggestions={fetchSuggestions} pickupSuggestions={pickupSuggestions} setPickupSuggestions={setPickupSuggestions} deliverySuggestions={deliverySuggestions} setDeliverySuggestions={setDeliverySuggestions} />}
                            {step === 2 && <Step2Details form={form} setForm={setForm} price={price} calculatingPrice={calculatingPrice} />}
                            {step === 3 && <Step3Contact form={form} setForm={setForm} fetchSuggestions={fetchSuggestions} billingSuggestions={billingSuggestions} setBillingSuggestions={setBillingSuggestions} />}
                            {step === 4 && <Step4Resume form={form} price={price} calculatingPrice={calculatingPrice} />}
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <button onClick={() => setStep(s => Math.max(s - 1, 1))} className={`px-6 py-3 font-bold text-slate-500 ${step === 1 ? 'invisible' : ''}`}>Retour</button>
                            {step < 4 ? <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold">Continuer <ArrowRight size={18} /></button> : (
                                <button onClick={submitOrder} disabled={!price || isSubmitting} className="px-10 py-4 rounded-2xl bg-[#ed5518] text-white font-black text-lg">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Valider la commande'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <PublicFooter />
        </div>
    );
}

