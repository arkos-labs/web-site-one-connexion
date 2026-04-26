import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { autocompleteAddress } from "@/lib/autocomplete";
import { ArrowLeft, ArrowRight, MapPin, Package, ShieldCheck, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { generateOrderPdf } from "@/lib/pdf-generator";

// Modular Components
import { CourseStepper } from "./nouvelle-course/CourseStepper";
import { Step1Trajet } from "./nouvelle-course/Step1Trajet";
import { Step2Details } from "./nouvelle-course/Step2Details";
import { Step3Review } from "./nouvelle-course/Step3Review";

const getPostcode = (str = "") => str.match(/\b\d{5}\b/)?.[0] || "";

export default function NouvelleCourse() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [price, setPrice] = useState(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const { profile: _profile } = useProfile();

    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);

    const [form, setForm] = useState({
        pickup: "", pickupCity: "", pickupPostcode: "", pickupName: "", pickupContact: "", pickupPhone: "", pickupInstructions: "", pickupAccessCode: "",
        delivery: "", deliveryCity: "", deliveryPostcode: "", deliveryName: "", deliveryContact: "", deliveryPhone: "", deliveryInstructions: "", deliveryAccessCode: "",
        date: new Date().toISOString().split('T')[0], pickupTime: "09:00", deliveryDeadline: "12:00", vehicle: "moto", service: "normal",
        packageType: "Pli", packageWeight: "", packageDesc: "",
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
        const autoS = diffMinutes <= 90 ? "super" : diffMinutes <= 180 ? "exclu" : "normal";
        if (form.service !== autoS) setForm(prev => ({ ...prev, service: autoS }));
    }, [form.pickupTime, form.deliveryDeadline]);

    const fetchSuggestions = async (query, setS) => {
        if (query.trim().length < 3) return setS([]);
        const results = await autocompleteAddress(query);
        setS(results.map(s => ({ label: s.full, city: s.city, postcode: s.postcode })));
    };

    const submitOrder = async () => {
        if (!price) return alert("Prix indisponible.");
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utilisateur non connecté");

            const { data, error } = await supabase.from('orders').insert({
                client_id: user.id,
                pickup_address: form.pickup,
                pickup_city: form.pickupCity,
                pickup_postal_code: form.pickupPostcode,
                delivery_address: form.delivery,
                delivery_city: form.deliveryCity,
                delivery_postal_code: form.deliveryPostcode,
                vehicle_type: form.vehicle.toLowerCase(),
                service_level: form.service.toLowerCase(),
                status: 'pending_acceptance',
                price_ht: price,
                scheduled_at: `${form.date}T${form.pickupTime}:00`,
                delivery_deadline: `${form.date}T${form.deliveryDeadline}:00`,
                delivery_schedule_notes: form.deliveryScheduleNotes || "",
                package_type: form.packageType || "Pli",
                package_description: form.packageDesc || "",
                weight: parseFloat(form.packageWeight) || null,
                notes: `Pick: ${form.pickupName || '—'} | Del: ${form.deliveryName || '—'} | ${form.pickupInstructions || ''}`,
                billing_name: _profile?.details?.full_name || _profile?.details?.contact_name || user.email?.split('@')[0],
                billing_company: _profile?.details?.company || _profile?.company_name || "",
                billing_address: _profile?.details?.address || _profile?.address || _profile?.details?.billing_address || "",
                billing_city: _profile?.city || _profile?.details?.city || _profile?.details?.billing_city || "",
                billing_zip: _profile?.postal_code || _profile?.details?.zip || _profile?.details?.postal_code || _profile?.details?.billing_zip || "",
                sender_email: user.email,
                pickup_name: form.pickupName,
                delivery_name: form.deliveryName,
                pickup_phone: form.pickupPhone,
                delivery_phone: form.deliveryPhone,
                pickup_access_code: form.pickupAccessCode,
                delivery_access_code: form.deliveryAccessCode
            }).select().single();

            if (error) throw error;
            if (data) {
                try {
                    // We attempt to generate the PDF but don't let it block the navigation if it fails
                    const clientInfo = {
                        name: _profile?.details?.full_name || _profile?.details?.contact_name || user.email?.split('@')[0] || "Client",
                        email: user.email || _profile?.details?.email || "",
                        phone: _profile?.details?.phone || _profile?.details?.phone_number || "",
                        company: _profile?.details?.company || _profile?.company_name || "",
                        billingAddress: _profile?.details?.address || _profile?.address || _profile?.details?.billing_address || "",
                        billingCity: _profile?.city || _profile?.details?.city || _profile?.details?.billing_city || "",
                        billingZip: _profile?.postal_code || _profile?.details?.zip || _profile?.details?.postal_code || _profile?.details?.billing_zip || ""
                    };
                    await generateOrderPdf(data, clientInfo);
                } catch (pdfErr) {
                    console.error("Erreur PDF:", pdfErr);
                }
                navigate('/dashboard-client/orders', { state: { flash: "Course validée !" } });
            }
        } catch (error) {
            console.error("Exception submitOrder:", error);
            alert(error.message || "Une erreur est survenue lors de la validation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [{ title: "Trajet", icon: MapPin }, { title: "Détails", icon: Package }, { title: "Lancement", icon: ShieldCheck }];

    return (
        <div className="min-h-screen bg-cream md:p-8 space-y-12 font-body">
            <div className="mx-auto max-w-4xl space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/dashboard-client')}
                            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-noir/40 hover:text-[#ed5518] transition-all"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                            Retour Dashboard
                        </button>
                        <h1 className="text-5xl font-display italic text-noir leading-none">
                            Nouvelle <span className="text-[#ed5518]">Course.</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 text-noir/40">
                        <div className="h-px w-8 bg-noir/10"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Planification Premium</span>
                    </div>
                </div>

                <CourseStepper step={step} steps={steps} />

                <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-noir/5 relative min-h-[500px]">
                    <div className="absolute top-0 right-10 w-24 h-24 bg-[#ed5518]/5 blur-3xl rounded-full"></div>

                    {step === 1 && <Step1Trajet form={form} setForm={setForm} fetchSuggestions={fetchSuggestions} pickupSuggestions={pickupSuggestions} setPickupSuggestions={setPickupSuggestions} deliverySuggestions={deliverySuggestions} setDeliverySuggestions={setDeliverySuggestions} />}
                    {step === 2 && <Step2Details form={form} setForm={setForm} vehicles={["Moto", "Voiture"]} />}
                    {step === 3 && <Step3Review form={form} price={price} calculatingPrice={calculatingPrice} />}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setStep(s => Math.max(s - 1, 1))}
                        className={`px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-noir/40 hover:text-noir transition-all ${step === 1 ? 'invisible' : ''}`}
                    >
                        Étape précédente
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="group flex items-center gap-3 px-10 py-5 rounded-xl bg-noir text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#ed5518] transition-all shadow-xl shadow-noir/10"
                        >
                            Étape suivante <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    ) : (
                        <button
                            onClick={submitOrder}
                            disabled={!price || isSubmitting}
                            className="group relative overflow-hidden px-14 py-6 rounded-xl bg-[#ed5518] text-white text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-orange-500/30 disabled:opacity-50 disabled:grayscale transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Finaliser la Réservation <div className="h-4 w-px bg-white/30 mx-1"></div> {price ? `${price}€` : '...'}</>}
                            </span>
                            <div className="absolute inset-0 bg-noir opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </button>
                    )}
                </div>
            </div>

            {/* Minimal support footer */}
            <div className="max-w-4xl mx-auto pt-10 border-t border-noir/5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/20 italic">
                    Assistance One Connexion 24/7 · +33 1 00 00 00 00
                </p>
            </div>
        </div>
    );
}

