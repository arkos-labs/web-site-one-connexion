"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Settings,
  Building2,
  Package,
  Mail,
  Truck,
  Zap,
  Clock,
  Calendar,
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { calculatePrice, ServiceLevel } from "@/lib/pricing";

export default function OrderForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  // Form state
  const [clientType, setClientType] = useState<'entreprise' | 'particulier'>('entreprise');
  const [format, setFormat] = useState('doc');
  const [delai, setDelai] = useState('standard');
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (pickupAddress && dropoffAddress) {
      setEstimatedPrice(calculatePrice(pickupAddress, dropoffAddress, delai as ServiceLevel));
    } else {
      setEstimatedPrice(null);
    }
  }, [pickupAddress, dropoffAddress, delai]);

  useEffect(() => {
    const search = window.location.search;
    if (search) {
      const params = new URLSearchParams(search);
      const p = params.get('pickup');
      const d = params.get('dropoff');
      if (p) setPickupAddress(p);
      if (d) setDropoffAddress(d);
    }

    if (clientType === 'particulier' && delai === 'navette') {
      setDelai('standard');
    }

    const handleUpdate = (e: any) => {
      if (e.detail?.pickup) setPickupAddress(e.detail.pickup);
      if (e.detail?.dropoff) setDropoffAddress(e.detail.dropoff);
    };

    window.addEventListener('update-order-form', handleUpdate);
    return () => window.removeEventListener('update-order-form', handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Code de suivi généré ici : un visiteur non connecté n'a pas le droit
    // de relire la commande après l'avoir créée.
    const trackingCode = `OC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const { data: orderData, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        tracking_code: trackingCode,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        stops: [],
        format,
        delai,
        notes,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        status: "en_attente",
        price_estimate: estimatedPrice,
        client_type: clientType,
        source: "page_publique",
      });

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Erreur lors de l'envoi : " + error.message);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientType,
          service: delai,
          format,
          pickupAddress,
          dropoffAddress,
          orderId: trackingCode,
          email: contactEmail,
        })
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (err: any) {
      console.error("Stripe Checkout Error:", err);
      alert("Erreur lors de l'initialisation du paiement : " + err.message);
      setSubmitting(false);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <section id="commander" className="border-y border-line bg-[#F8F9FA]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            2h chrono
          </div>
          <h2 className="text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em] text-gray-900">
            Commander une course.
          </h2>
          <p className="mt-4 text-[16.5px] text-gray-500 max-w-xl mx-auto">
            Service de coursier express. Remplissez ce formulaire pour une estimation et une prise en charge rapide.
          </p>
        </div>

        <div id="commander-form" className="mx-auto max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 relative scroll-mt-24 pb-32">
          {submitted ? (
            <div className="text-center py-16">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-emerald-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-3xl font-bold text-gray-900">
                Demande envoyée !
              </h3>
              <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                Un dispatcheur va vous contacter dans les 2 prochaines minutes pour confirmer l'enlèvement.
              </p>
              {trackingCode && (
                <div className="mb-8 inline-block rounded-xl border border-gray-200 bg-gray-50 px-6 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Code de suivi</p>
                  <p className="text-xl font-extrabold tracking-widest text-gray-900">{trackingCode}</p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setSubmitted(false); setStep(1); setPickupAddress(""); setDropoffAddress(""); setTrackingCode(null); }}
                  className="bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  Nouvelle commande
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper Header */}
              <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#ed5518] rounded-full z-0 transition-all duration-500"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
                
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                      step >= s ? 'bg-[#ed5518] text-white shadow-md shadow-accent/20' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="min-h-[350px] flex flex-col">
                
                {/* Step 1: Itinéraire */}
                {step === 1 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="mb-8 flex p-1 bg-gray-100 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setClientType('entreprise')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${clientType === 'entreprise' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Building2 className="w-4 h-4" /> Entreprise
                      </button>
                      <button 
                        type="button"
                        onClick={() => setClientType('particulier')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${clientType === 'particulier' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <User className="w-4 h-4" /> Particulier
                      </button>
                    </div>

                    {clientType === 'particulier' && (
                      <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 text-sm text-orange-800">
                        <CreditCard className="w-5 h-5 text-orange-500 shrink-0" />
                        <p>En tant que particulier, <strong>le paiement devra être effectué par carte bancaire</strong> avant la prise en charge de la course.</p>
                      </div>
                    )}
                    {clientType === 'entreprise' && (
                      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800">
                        <CreditCard className="w-5 h-5 text-blue-500 shrink-0" />
                        <p>En tant que professionnel, <strong>vous serez facturé à 30 jours</strong>. Veuillez enregistrer une carte bancaire (ou un RIB) pour le prélèvement automatique.</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-gray-900 font-bold text-lg">
                        <div className="p-2 bg-orange-50 rounded-lg"><MapPin className="w-5 h-5 text-[#ed5518]" /></div>
                        Itinéraire de livraison
                      </div>
                      <div className="hidden sm:block bg-orange-50 text-[#ed5518] px-3 py-1.5 rounded-md text-xs font-semibold">
                        Paris & Île-de-France
                      </div>
                    </div>

                    <div className="relative pl-10 space-y-8">
                      <div className="absolute left-[15px] top-8 bottom-10 border-l-2 border-dashed border-gray-200"></div>

                      <div className="relative">
                        <div className="absolute -left-[38px] top-1.5 w-6 h-6 rounded-full border-[3px] border-emerald-500 bg-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Adresse d'enlèvement <span className="text-[#ed5518]">*</span>
                        </label>
                        <div className="relative mb-3">
                          <AddressAutocomplete 
                            value={pickupAddress} 
                            onChange={setPickupAddress} 
                            placeholder="75008 Paris..." 
                            required 
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-1 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-colors">
                          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                          <input type="text" placeholder="Étage, Digicode ou Bureau..." className="w-full bg-transparent py-3 text-sm focus:outline-none" />
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[38px] top-1.5 w-6 h-6 rounded-full border-[3px] border-[#ed5518] bg-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ed5518]"></div>
                        </div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Adresse de livraison <span className="text-[#ed5518]">*</span>
                        </label>
                        <div className="relative mb-3">
                          <AddressAutocomplete 
                            value={dropoffAddress} 
                            onChange={setDropoffAddress} 
                            placeholder="92100 Boulogne..." 
                            required 
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-1 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-colors">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          <input type="text" placeholder="Destinataire sur place (Nom, Accueil)..." className="w-full bg-transparent py-3 text-sm focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Société & Contact */}
                {step === 2 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 text-gray-900 font-bold text-lg mb-6">
                      <div className="p-2 bg-orange-50 rounded-lg"><User className="w-5 h-5 text-[#ed5518]" /></div>
                      Vos informations
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          {clientType === 'entreprise' ? 'Nom de la société' : 'Nom et Prénom'} <span className="text-[#ed5518]">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            {clientType === 'entreprise' ? (
                              <Building2 className="h-5 w-5 text-gray-400" />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={clientType === 'entreprise' ? "Ex: Acme Corp" : "Ex: Jean Dupont"}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Téléphone <span className="text-[#ed5518]">*</span>
                        </label>
                        <div className="flex">
                          <div className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-4 py-3 flex items-center justify-center gap-2">
                            <span className="text-lg">🇫🇷</span>
                            <span className="text-sm font-medium text-gray-600">+33</span>
                          </div>
                          <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="01 23 45 67 89" className="w-full bg-gray-50 border border-gray-200 rounded-r-xl px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Email <span className="text-[#ed5518]">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@masociete.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Détails du colis */}
                {step === 3 && (
                  <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3 text-gray-900 font-bold text-lg">
                        <div className="p-2 bg-orange-50 rounded-lg"><Package className="w-5 h-5 text-[#ed5518]" /></div>
                        Détails du pli / colis
                      </div>
                      <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Max 15kg</span>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Format du courrier</label>
                        <div className="grid grid-cols-3 gap-3">
                          <button type="button" onClick={() => setFormat('doc')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'doc' ? 'border-[#ed5518] bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                            <Mail className={`w-6 h-6 mb-2 ${format === 'doc' ? 'text-[#ed5518]' : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${format === 'doc' ? 'text-[#ed5518]' : 'text-gray-700'}`}>Pli / Doc</span>
                            <span className={`text-xs mt-1 ${format === 'doc' ? 'text-orange-400/80' : 'text-gray-400'}`}>{'< 1 kg'}</span>
                          </button>
                          <button type="button" onClick={() => setFormat('petit')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'petit' ? 'border-[#ed5518] bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                            <Package className={`w-6 h-6 mb-2 ${format === 'petit' ? 'text-[#ed5518]' : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${format === 'petit' ? 'text-[#ed5518]' : 'text-gray-700'}`}>Petit colis</span>
                            <span className={`text-xs mt-1 ${format === 'petit' ? 'text-orange-400/80' : 'text-gray-400'}`}>1 à 5 kg</span>
                          </button>
                          <button type="button" onClick={() => setFormat('volumineux')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'volumineux' ? 'border-[#ed5518] bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                            <Truck className={`w-6 h-6 mb-2 ${format === 'volumineux' ? 'text-[#ed5518]' : 'text-gray-400'}`} />
                            <span className={`text-sm font-bold ${format === 'volumineux' ? 'text-[#ed5518]' : 'text-gray-700'}`}>Volumineux</span>
                            <span className={`text-xs mt-1 ${format === 'volumineux' ? 'text-orange-400/80' : 'text-gray-400'}`}>5 à 15 kg</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">Délai de prise en charge</label>
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={() => setDelai('standard')} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${delai === 'standard' ? 'bg-[#ed5518] text-white shadow-md shadow-accent/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold">NORMAL : 3h</span>
                          </button>
                          <button type="button" onClick={() => setDelai('urgent')} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${delai === 'urgent' ? 'bg-[#ed5518] text-white shadow-md shadow-accent/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <Zap className="w-5 h-5" />
                            <div className="flex flex-col text-left">
                              <span className="font-semibold leading-tight">URGENT : 1h30</span>
                              <span className="text-xs opacity-80">+50% du tarif</span>
                            </div>
                          </button>
                          <button type="button" onClick={() => setDelai('flash')} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${delai === 'flash' ? 'bg-[#ed5518] text-white shadow-md shadow-accent/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            <Zap className="w-5 h-5 text-red-500" />
                            <div className="flex flex-col text-left">
                              <span className="font-semibold leading-tight">SUPER : 1h</span>
                              <span className="text-xs opacity-80">+100% du tarif</span>
                            </div>
                          </button>
                          {clientType === 'entreprise' && (
                            <button type="button" onClick={() => setDelai('navette')} className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${delai === 'navette' ? 'bg-[#ed5518] text-white shadow-md shadow-accent/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              <Calendar className="w-5 h-5" />
                              <span className="font-semibold">Navette (Programmé)</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {delai === 'navette' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Date d'enlèvement</label>
                            <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ed5518] transition-colors" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Heure</label>
                            <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ed5518] transition-colors" required />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Consignes au coursier</label>
                        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Le colis est à l'accueil, demander M. Martin..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 resize-none transition-colors"></textarea>
                      </div>

                      {/* Récapitulatif Prix */}
                      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mt-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#ed5518]" />
                          Récapitulatif de votre commande
                        </h3>
                        <div className="space-y-2 text-[14px] text-gray-600 mb-4">
                          <div className="flex justify-between">
                            <span>Départ :</span>
                            <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">{pickupAddress || "À renseigner"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Arrivée :</span>
                            <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">{dropoffAddress || "À renseigner"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format :</span>
                            <span className="font-medium text-gray-900">{format === 'doc' ? 'Pli/Doc' : format === 'petit' ? 'Petit Colis' : 'Volumineux'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Délai :</span>
                            <span className="font-medium text-gray-900">{delai === 'standard' ? 'Normal' : delai === 'urgent' ? 'Urgent' : delai === 'flash' ? 'Super Urgent' : 'Navette'}</span>
                          </div>
                        </div>
                        <div className="border-t border-orange-200/60 pt-4 flex items-end justify-between">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600/80 mb-0.5">Tarif estimé (HT)</div>
                            <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Paiement sécurisé</div>
                            <div className="text-xs text-gray-600 font-medium">Vos transactions protégées</div>
                          </div>
                          <div className="text-2xl font-extrabold text-[#ed5518]">
                            {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : '-- €'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                  {step > 1 ? (
                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" /> Retour
                    </button>
                  ) : <div></div>}

                  <button
                    id="submit-btn"
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ml-auto disabled:opacity-60"
                  >
                    {submitting
                      ? 'Redirection paiement…'
                      : step < 3
                        ? 'Étape suivante'
                        : 'Commander la course'
                    }
                    {!submitting && (step < 3 ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 ml-1" />
                    ))}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

