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

    const steps = [{ title: "Trajet", icon: MapPin }, { title: "Détails", icon: Package }, { title: "Validation", icon: ShieldCheck }];

    return (
        <div className="min-h-screen bg-[#f8fafc] md:p-4 space-y-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <button onClick={() => navigate('/dashboard-client')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={16} /> Retour au tableau de bord</button>
                <CourseStepper step={step} steps={steps} />
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm ring-1 ring-slate-100 relative min-h-[500px]">
                    {step === 1 && <Step1Trajet form={form} setForm={setForm} fetchSuggestions={fetchSuggestions} pickupSuggestions={pickupSuggestions} setPickupSuggestions={setPickupSuggestions} deliverySuggestions={deliverySuggestions} setDeliverySuggestions={setDeliverySuggestions} />}
                    {step === 2 && <Step2Details form={form} setForm={setForm} vehicles={["Moto", "Voiture"]} />}
                    {step === 3 && <Step3Review form={form} price={price} calculatingPrice={calculatingPrice} />}
                </div>
                <div className="flex items-center justify-between pt-4">
                    <button onClick={() => setStep(s => Math.max(s - 1, 1))} className={`px-6 py-3 font-bold text-slate-500 ${step === 1 ? 'invisible' : ''}`}>Retour</button>
                    {step < 3 ? <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold">Continuer <ArrowRight size={18} /></button> : (
                        <button onClick={submitOrder} disabled={!price || isSubmitting} className="px-10 py-4 rounded-2xl bg-[#ed5518] text-white font-black text-lg shadow-xl shadow-[#ed5518]/20">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Valider la commande'}</button>
                    )}
                </div>
            </div>
        </div>
    );
}

