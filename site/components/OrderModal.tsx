"use client";
/**
 * components/OrderModal.tsx
 * Modal de commande rapide — même form que /dashboard/commander,
 * accessible depuis les CTA publics (Header, Hero, etc.)
 */
import { useState, useEffect, useCallback } from "react";
import { X, Package, Mail, Truck, Zap, Clock, Calendar, User, Building2, ChevronRight, ChevronLeft, CheckCircle2, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { calculatePrice, ServiceLevel } from "@/lib/pricing";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  initialPickup?: string;
  initialDropoff?: string;
}

export default function OrderModal({ open, onClose, initialPickup = "", initialDropoff = "" }: OrderModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [clientType, setClientType] = useState<"entreprise" | "particulier">("entreprise");
  const [format, setFormat] = useState("doc");
  const [delai, setDelai] = useState("standard");
  const [pickupAddress, setPickupAddress] = useState(initialPickup);
  const [dropoffAddress, setDropoffAddress] = useState(initialDropoff);
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

  // Reset quand la modal ouvre
  useEffect(() => {
    if (open) {
      setStep(1);
      setSubmitted(false);
      setPickupAddress(initialPickup);
      setDropoffAddress(initialDropoff);
    }
  }, [open, initialPickup, initialDropoff]);

  // Ferme avec Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, handleKey]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }

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
        client_type: clientType,
        source: "page_publique",
      });

    if (error) {
      console.error("Supabase modal error:", error);
      alert("Erreur : " + error.message);
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

  return (
    <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Conteneur de défilement natif */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

          {/* Panneau principal */}
          <div className="relative transform rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-3xl flex flex-col max-h-[95dvh] sm:max-h-[90vh] overflow-hidden">

            {/* Header (Fixe) */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shrink-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Commander une course</p>
                <h2 className="text-lg font-extrabold text-ink">Course express Paris &amp; IDF</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu (2 colonnes) */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              
              {/* Colonne Gauche (Formulaire) */}
              <div className="flex-1 flex flex-col min-h-0 md:border-r border-gray-100">
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-ink">Demande envoyée !</h3>
              <p className="mb-4 text-muted">
                Un dispatcheur vous contacte dans les 2 prochaines minutes.
              </p>
              {trackingCode && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Code de suivi</p>
                  <p className="text-xl font-extrabold tracking-widest text-ink">{trackingCode}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSubmitted(false); setStep(1); }}
                  className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-ink hover:bg-paper transition-colors"
                >
                  Nouvelle commande
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-dark transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="mb-8 flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-gray-100" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= s ? "bg-accent text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Étape 1 : Itinéraire */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    {/* Entreprise / Particulier */}
                    <div className="flex rounded-xl bg-gray-100 p-1">
                      {(["entreprise", "particulier"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setClientType(t)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${clientType === t ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          {t === "entreprise" ? <Building2 size={15} /> : <User size={15} />}
                          {t === "entreprise" ? "Entreprise" : "Particulier"}
                        </button>
                      ))}
                    </div>

                    {clientType === "particulier" && (
                      <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-800">
                        <CreditCard size={18} className="mt-0.5 shrink-0 text-accent" />
                        <div>
                          <p className="font-bold text-orange-900 mb-1">Paiement direct sécurisé</p>
                          <p>En tant que particulier, le règlement s'effectue par carte bancaire avant la prise en charge de votre course. Vous serez redirigé vers notre partenaire Stripe pour un paiement 100% sécurisé.</p>
                        </div>
                      </div>
                    )}
                    {clientType === "entreprise" && (
                      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                        <CreditCard size={18} className="mt-0.5 shrink-0 text-blue-600" />
                        <div>
                          <p className="font-bold text-blue-900 mb-1">Facturation différée à 30 jours</p>
                          <p>Vous allez être redirigé vers Stripe pour enregistrer votre moyen de paiement en toute sécurité. <strong>Aucun montant ne sera prélevé aujourd'hui.</strong> Vous serez facturé et débité tous les 30 jours pour l'ensemble de vos courses.</p>
                        </div>
                      </div>
                    )}

                    {/* Adresse enlèvement */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-emerald-500 bg-white">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Adresse d'enlèvement <span className="text-accent">*</span>
                      </label>
                      <AddressAutocomplete 
                        value={pickupAddress} 
                        onChange={setPickupAddress} 
                        placeholder="Rue, ville..." 
                        required 
                      />
                    </div>

                    {/* Adresse livraison */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-accent bg-white">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                      </div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">
                        Adresse de livraison <span className="text-accent">*</span>
                      </label>
                      <AddressAutocomplete 
                        value={dropoffAddress} 
                        onChange={setDropoffAddress} 
                        placeholder="Rue, ville..." 
                        required 
                      />
                    </div>
                  </div>
                )}

                {/* Étape 2 : Contact */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 font-bold text-ink">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><User size={16} className="text-accent" /></div>
                      Vos informations
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">
                          {clientType === "entreprise" ? "Nom de la société" : "Nom & Prénom"} <span className="text-accent">*</span>
                        </label>
                        <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={clientType === "entreprise" ? "Acme Corp" : "Jean Dupont"} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Téléphone <span className="text-accent">*</span></label>
                        <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="01 23 45 67 89" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Email <span className="text-accent">*</span></label>
                        <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@societe.fr" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 3 : Colis & délai */}
                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="mb-3 block text-sm font-bold text-ink">Format du courrier</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "doc", label: "Pli / Doc", sub: "< 1 kg", Icon: Mail },
                          { id: "petit", label: "Petit colis", sub: "1–5 kg", Icon: Package },
                          { id: "volumineux", label: "Volumineux", sub: "5–15 kg", Icon: Truck },
                        ].map(({ id, label, sub, Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFormat(id)}
                            className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${format === id ? "border-accent bg-accent/5" : "border-gray-100 bg-white hover:border-gray-200"}`}
                          >
                            <Icon size={20} className={`mb-1 ${format === id ? "text-accent" : "text-gray-400"}`} />
                            <span className={`text-xs font-bold ${format === id ? "text-accent" : "text-gray-700"}`}>{label}</span>
                            <span className={`text-[10px] ${format === id ? "text-accent/70" : "text-gray-400"}`}>{sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-bold text-ink">Délai de prise en charge</label>
                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => setDelai('standard')} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${delai === 'standard' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          <Clock size={16} /> <span>NORMAL : 3h</span>
                        </button>
                        <button type="button" onClick={() => setDelai('urgent')} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${delai === 'urgent' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          <Zap size={16} /> 
                          <div className="flex flex-col text-left">
                            <span className="leading-tight">URGENT : 1h30</span>
                            <span className="text-[10px] opacity-80">+50% du tarif</span>
                          </div>
                        </button>
                        <button type="button" onClick={() => setDelai('flash')} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${delai === 'flash' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          <Zap size={16} className={delai === 'flash' ? "text-white" : "text-red-500"} /> 
                          <div className="flex flex-col text-left">
                            <span className="leading-tight">SUPER : 1h</span>
                            <span className="text-[10px] opacity-80">+100% du tarif</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-ink">Consignes au coursier</label>
                      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Colis à l'accueil, demander M. Martin…" className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                    </div>

                    {/* Récapitulatif Prix (Mobile Uniquement) */}
                    <div className="md:hidden bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mt-2">
                      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#ed5518]" />
                        Récapitulatif de votre commande
                      </h3>
                      <div className="space-y-2 text-[14px] text-gray-600 mb-4">
                        <div className="flex justify-between gap-4">
                          <span>Départ :</span>
                          <span className="font-medium text-gray-900 truncate text-right">{pickupAddress || "À renseigner"}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Arrivée :</span>
                          <span className="font-medium text-gray-900 truncate text-right">{dropoffAddress || "À renseigner"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format :</span>
                          <span className="font-medium text-gray-900">{format === 'doc' ? 'Pli/Doc' : format === 'petit' ? 'Petit Colis' : 'Volumineux'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Délai :</span>
                          <span className="font-medium text-gray-900">{delai === 'standard' ? 'Normal' : delai === 'urgent' ? 'Urgent' : 'Super Urgent'}</span>
                        </div>
                      </div>
                      <div className="border-t border-orange-200/60 pt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600/80 mb-0.5">Tarif estimé (HT)</div>
                          <div className="text-xs text-gray-500">Paiement sécurisé par carte</div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#ed5518]">
                          {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : '-- €'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </>
          )}
                </div>

                {/* Footer Fixe (Navigation) */}
                {!submitted && (
                  <div className="shrink-0 flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
                    {step > 1 ? (
                      <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={16} /> Retour
                      </button>
                    ) : <div />}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="ml-auto flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-dark transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Redirection…" : step < 3 ? "Étape suivante" : "Commander"}
                      {!submitting && (step < 3 ? <ChevronRight size={16} /> : <CheckCircle2 size={16} />)}
                    </button>
                  </div>
                )}
              </div>

              {/* Récapitulatif (Droite - Desktop Uniquement) */}
              <div className="hidden md:flex w-[300px] bg-gray-50 p-6 flex-col shrink-0 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ed5518]" />
                  Récapitulatif de votre commande
                </h3>
                
                <div className="flex-1 space-y-4 text-[14px] text-gray-600">
                  <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Départ</span>
                    <span className="font-medium text-gray-900">{pickupAddress || "À renseigner"}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Arrivée</span>
                    <span className="font-medium text-gray-900">{dropoffAddress || "À renseigner"}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Format</span>
                    <span className="font-medium text-gray-900">{format === 'doc' ? 'Pli/Doc' : format === 'petit' ? 'Petit Colis' : 'Volumineux'}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Délai</span>
                    <span className="font-medium text-gray-900">{delai === 'standard' ? 'Normal (3h)' : delai === 'urgent' ? 'Urgent (1h30)' : 'Super Urgent (1h)'}</span>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-1">Tarif estimé (HT)</div>
                      <div className="text-[10px] text-gray-500">Paiement sécurisé</div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#ed5518]">
                      {estimatedPrice !== null ? `${estimatedPrice.toFixed(2)} €` : '-- €'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
