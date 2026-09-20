"use client";
/**
 * components/OrderModal.tsx
 * Modal de commande rapide — même form que /dashboard/commander,
 * accessible depuis les CTA publics (Header, Hero, etc.)
 */
import { useState, useEffect, useCallback } from "react";
import { X, Package, Mail, Truck, Zap, Clock, Calendar, User, Building2, ChevronRight, ChevronLeft, CheckCircle2, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [delai, setDelai] = useState("urgent");
  const [pickupAddress, setPickupAddress] = useState(initialPickup);
  const [dropoffAddress, setDropoffAddress] = useState(initialDropoff);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");

  const supabase = createClient();

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
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
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

    const { error } = await supabase
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
      });

    setSubmitting(false);

    if (error) {
      console.error("Supabase modal error:", error);
      alert("Erreur : " + error.message);
      return;
    }

    setTrackingCode(trackingCode);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panneau */}
      <div className="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
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

        <div className="px-6 py-6">
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
                        <p>En tant que particulier, <strong>le paiement s'effectue par carte bancaire</strong> avant la prise en charge.</p>
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
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        required
                        placeholder="Rue, ville..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
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
                      <input
                        type="text"
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        required
                        placeholder="Rue, ville..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
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
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "urgent", label: "Urgent (< 1h)", Icon: Zap },
                          { id: "standard", label: "Standard (3h)", Icon: Clock },
                          { id: "direct", label: "Programmé", Icon: Calendar },
                        ].map(({ id, label, Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setDelai(id)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${delai === id ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            <Icon size={16} /> {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {delai === "direct" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Date</label>
                          <input type="date" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Heure</label>
                          <input type="time" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-ink">Consignes au coursier</label>
                      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Colis à l'accueil, demander M. Martin…" className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  {step > 1 ? (
                    <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                      <ChevronLeft size={16} /> Retour
                    </button>
                  ) : <div />}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-white hover:bg-accent-dark transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Envoi…" : step < 3 ? "Étape suivante" : "Commander"}
                    {!submitting && (step < 3 ? <ChevronRight size={16} /> : <CheckCircle2 size={16} />)}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
