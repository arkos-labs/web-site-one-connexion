"use client";
/**
 * components/OrderModal.tsx
 * Modal de commande rapide — même form que /dashboard/commander,
 * accessible depuis les CTA publics (Header, Hero, etc.)
 */
import { useState, useEffect, useCallback } from "react";
import { X, Zap, Clock, User, Building2, ChevronRight, ChevronLeft, CheckCircle2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createAnonClient } from "@/lib/supabase/anon";
import { payWithSavedMethod } from "@/lib/saved-payment";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { checkIdfAddress } from "@/lib/address-idf";
import { splitTTC, isServedAddress, ServiceLevel } from "@/lib/pricing";
import { useRoutePrice } from "@/lib/use-route-price";
import UnservedAddressAlert, { useUnservedAddresses } from "@/components/UnservedAddressAlert";
import LargeParcelAlert from "@/components/LargeParcelAlert";
import { notifyNewOrder } from "@/lib/notify-new-order";
import GuestAccountBox from "@/components/GuestAccountBox";
import DeferredPaymentNote from "@/components/DeferredPaymentNote";
import { saveOrderDraft, loadOrderDraft, clearOrderDraft, checkoutSessionIdFromUrl } from "@/lib/order-draft";
import { ORDER_NATURES, NATURE_DETAIL_MAX, natureLabel } from "@/lib/order-nature";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  initialPickup?: string;
  initialDropoff?: string;
  /** Retour de Stripe sans payer : on remet la commande telle que le client l'avait remplie. */
  restoreDraft?: boolean;
}

// Tarifs TTC (TVA 20 % comprise) pour tous les clients.
const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function OrderModal({ open, onClose, initialPickup = "", initialDropoff = "", restoreDraft = false }: OrderModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [clientType, setClientType] = useState<"entreprise" | "particulier">("entreprise");
  const [format, setFormat] = useState("doc");
  const [nature, setNature] = useState("");
  const [natureDetail, setNatureDetail] = useState("");
  const [delai, setDelai] = useState("standard");
  const [pickupAddress, setPickupAddress] = useState(initialPickup);
  const [dropoffAddress, setDropoffAddress] = useState(initialDropoff);
  const [contactName, setContactName] = useState(""); // nom de la société (pro)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactEmailConfirm, setContactEmailConfirm] = useState("");
  const [notes, setNotes] = useState("");
  // Adresse hors Paris / IDF : blocage immédiat, alerte après une courte pause de frappe.
  const outOfZone = [pickupAddress, dropoffAddress].some((a) => a.trim().length > 0 && !isServedAddress(a));
  const showZoneAlert = useUnservedAddresses([pickupAddress, dropoffAddress]);

  // Champs B2B
  const [siret, setSiret] = useState("");
  const [raisonSociale, setRaisonSociale] = useState("");
  const [adresseFacturation, setAdresseFacturation] = useState("");
  const [tva, setTva] = useState("");
  const [validatingSiret, setValidatingSiret] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"carte" | "fin_de_mois">("carte");
  const [debitMethod, setDebitMethod] = useState<"sepa" | "virement">("sepa");

  const supabase = createClient();

  // Pas de tarif hors Paris / Île-de-France ; petite couronne : prix au km (distance par la route).
  const [returnTrip, setReturnTrip] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);
  // Arrêts intermédiaires, livrés avant l'adresse de livraison finale.
  const [stops, setStops] = useState<string[]>([]);
  const estimatedPrice = useRoutePrice(pickupAddress, dropoffAddress, delai as ServiceLevel, returnTrip, stops);
  // Prix de chaque délai affiché sur les boutons, dès que les adresses sont saisies.
  const priceNormal = useRoutePrice(pickupAddress, dropoffAddress, "standard", returnTrip, stops);
  const priceUrgent = useRoutePrice(pickupAddress, dropoffAddress, "urgent", returnTrip, stops);
  const priceFlash = useRoutePrice(pickupAddress, dropoffAddress, "flash", returnTrip, stops);

  // Reset quand la modal ouvre
  useEffect(() => {
    if (open) {
      setStep(1);
      setSubmitted(false);
      setSubmitting(false);
      setPickupAddress(initialPickup);
      setDropoffAddress(initialDropoff);

      const draft = restoreDraft ? loadOrderDraft() : null;
      if (draft?.source === "modal") {
        const v = draft.values;
        setClientType(v.clientType ?? "entreprise"); setFormat(v.format ?? "doc"); setNature(v.nature ?? "");
        setNatureDetail(v.natureDetail ?? ""); setDelai(v.delai ?? "standard");
        setPickupAddress(v.pickupAddress ?? ""); setDropoffAddress(v.dropoffAddress ?? "");
        setContactName(v.contactName ?? ""); setFirstName(v.firstName ?? ""); setLastName(v.lastName ?? ""); setContactPhone(v.contactPhone ?? "");
        setContactEmail(v.contactEmail ?? ""); setContactEmailConfirm(v.contactEmailConfirm ?? "");
        setNotes(v.notes ?? ""); setSiret(v.siret ?? ""); setRaisonSociale(v.raisonSociale ?? "");
        setAdresseFacturation(v.adresseFacturation ?? ""); setTva(v.tva ?? "");
        setPaymentMode(v.paymentMode ?? "carte"); setDebitMethod(v.debitMethod ?? "sepa");
        setStep(3); // dernière étape : il corrige et recommande
      }
    }
  }, [open, initialPickup, initialDropoff, restoreDraft]);

  // Retour arrière depuis Stripe : le navigateur restaure la page telle quelle
  // (bfcache), bouton bloqué sur « Redirection… ». On le débloque.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) setSubmitting(false); };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Valider SIRET via API
  const validateSiretHandler = async () => {
    if (!siret.trim()) return;

    setValidatingSiret(true);
    setFormError("");

    try {
      const response = await fetch("/api/validate-siret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siret,
          email: contactEmail || "verif@siret.fr",
          nom_contact: contactName || "Société",
        }),
      });

      const result = await response.json();

      if (result.valid && result.sireneData) {
        setTva(result.sireneData.tva_number || "");
        // Tout est déduit du SIRET : raison sociale et adresse (modifiable)
        setRaisonSociale(result.sireneData.raison_sociale || "");
        if (result.sireneData.raison_sociale) setContactName(result.sireneData.raison_sociale); // nom officiel Sirene
        if (result.sireneData.adresse) setAdresseFacturation(result.sireneData.adresse);
        setFormError("");
      } else {
        setFormError(result.errors?.join(" ") || "SIRET invalide.");
        setTva("");
      }
    } catch (err) {
      setFormError("Erreur lors de la validation du SIRET.");
      setTva("");
    } finally {
      setValidatingSiret(false);
    }
  };

  // Vérification automatique dès que les 14 chiffres du SIRET sont saisis.
  useEffect(() => {
    if (siret.length === 14 && !tva) validateSiretHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siret]);

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
    setFormError("");

    // Le bouton n'est pas un submit : `required` n'est jamais appliqué. On vérifie à la main,
    // en refusant aussi les valeurs faites uniquement d'espaces.
    if (outOfZone) return; // adresse hors zone : alerte affichée, pas de commande
    if (step === 1 && (!pickupAddress.trim() || !dropoffAddress.trim())) {
      setFormError("Renseignez une adresse d'enlèvement et une adresse de livraison (des caractères, pas seulement des espaces).");
      return;
    }
    if (step === 1) {
      setCheckingAddress(true);
      const [p, d] = await Promise.all([
        checkIdfAddress(pickupAddress, "d'enlèvement"),
        checkIdfAddress(dropoffAddress, "de livraison"),
      ]);
      setCheckingAddress(false);
      if (!p.ok) { setFormError(p.error); return; }
      if (!d.ok) { setFormError(d.error); return; }
      setPickupAddress(p.label);
      setDropoffAddress(d.label);
    }
    if (step === 2) {
      if (!firstName.trim() || !lastName.trim()) {
        setFormError("Renseignez votre prénom et votre nom.");
        return;
      }
      if (clientType === "entreprise" && !contactName.trim()) {
        setFormError("Renseignez le nom de la société.");
        return;
      }
      // Validation téléphone : 10 chiffres (0X...) ou +33 (11 chiffres)
      const phoneDigits = contactPhone.replace(/\D/g, "");
      const isValidFR = (phoneDigits.length === 10 && phoneDigits.startsWith("0")) ||
                        (phoneDigits.length === 11 && contactPhone.trim().startsWith("+33"));
      if (!isValidFR) {
        setFormError("Renseignez un numéro de téléphone valide (0X XX XX XX XX ou +33X XX XX XX XX).");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
        setFormError("Renseignez une adresse email valide.");
        return;
      }

      // Validation B2B si professionnel
      if (clientType === "entreprise") {
        if (!siret.trim()) {
          setFormError("SIRET obligatoire pour une commande professionnelle.");
          return;
        }
        if (!tva) {
          setFormError("SIRET non validé. Cliquez sur 'Vérifier' d'abord.");
          return;
        }
        if (!adresseFacturation.trim()) {
          setFormError("Adresse de facturation obligatoire.");
          return;
        }
      }
    }

    if (step < 3) { setStep(step + 1); return; }
    if (!nature) { setFormError("Choisissez ce que vous envoyez."); return; }
    if (nature === "autre" && !natureDetail.trim()) { setFormError("Précisez ce que vous envoyez."); return; }

    setSubmitting(true);
    let { data: { user } } = await supabase.auth.getUser();
    // Connecté à un compte, mais la commande est passée avec un autre e-mail (autre client, autre
    // entreprise) : elle ne doit pas atterrir dans ce compte. On déconnecte, la commande part comme
    // celle d'un nouveau client et son propre compte est créé à la confirmation.
    if (user && user.email?.toLowerCase() !== contactEmail.trim().toLowerCase()) user = null;
    // Commande « sans compte » : aucune session ne doit rester dans le navigateur, sinon l'insertion
    // part avec le jeton de l'ancien compte et la base la refuse. Déconnexion locale (sans appel réseau,
    // elle ne peut pas échouer), y compris si la vérification du compte a échoué mais qu'un jeton reste.
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await supabase.auth.signOut({ scope: "local" });
    }

    // Code de suivi généré ici : un visiteur non connecté n'a pas le droit
    // de relire la commande après l'avoir créée.
    const trackingCode = `OC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Sans compte : client « visiteur » sans session, la commande part toujours en rôle anon.
    const db = user ? supabase : createAnonClient();
    const { data: orderData, error } = await db
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        tracking_code: trackingCode,
        pickup_address: pickupAddress.trim(),
        dropoff_address: dropoffAddress.trim(),
        stops: stops.map((s) => s.trim()).filter(Boolean).map((address) => ({ address })),
        format,
        nature,
        nature_detail: nature === "autre" ? natureDetail.trim() : null,
        delai,
        notes,
        contact_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        status: "en_attente",
        price_estimate: estimatedPrice,
        return_trip: returnTrip,
        client_type: clientType,
        source: "page_publique",
        // Données B2B
        siret: clientType === "entreprise" ? siret : null,
        raison_sociale: clientType === "entreprise" ? (contactName.trim() || raisonSociale) : null,
        adresse_facturation: clientType === "entreprise" ? adresseFacturation : null,
        tva_number: clientType === "entreprise" ? tva : null,
      });

    if (error) {
      console.error("Supabase modal error:", error);
      alert("Erreur : " + error.message);
      setSubmitting(false);
      return;
    }

    if (clientType === "entreprise") notifyNewOrder(trackingCode); // particulier : alerte et e-mail après paiement (webhook Stripe)

    // Client connecté avec un moyen de paiement enregistré : réglé en 1 clic, sans la page Stripe
    // (sauf virement, qui part par facture). Refus ou authentification bancaire : page Stripe ci-dessous.
    if (user && !(clientType === "entreprise" && paymentMode === "fin_de_mois" && debitMethod === "virement")) {
      const oneClick = await payWithSavedMethod(trackingCode, clientType === "entreprise" && paymentMode === "fin_de_mois" ? "fin_de_mois" : "carte");
      if (oneClick.ok) {
        setTrackingCode(trackingCode);
        setSubmitted(true);
        setSubmitting(false);
        clearOrderDraft();
        return;
      }
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
          paymentMode: clientType === "entreprise" ? paymentMode : "carte",
          debitMethod,
          companyName: clientType === "entreprise" ? (contactName.trim() || raisonSociale.trim()) : "",
          siret: clientType === "entreprise" ? siret : "",
        })
      });

      const data = await res.json();
      
      if (data.invoiceSent) {
        // Virement : pas de passage par Stripe, la facture avec l'IBAN est partie par email.
        setTrackingCode(trackingCode);
        setSubmitted(true);
        clearOrderDraft();
        setSubmitting(false);
      } else if (data.url) {
        // Brouillon : si le client revient de Stripe pour corriger, tout est encore rempli.
        saveOrderDraft({
          source: "modal",
          trackingCode,
          checkoutSessionId: checkoutSessionIdFromUrl(data.url),
          values: {
            clientType, format, nature, natureDetail, delai, pickupAddress, dropoffAddress, contactName, firstName, lastName, contactPhone,
            contactEmail, contactEmailConfirm, notes, siret, raisonSociale, adresseFacturation, tva, paymentMode, debitMethod,
          },
        });
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

  const prices = estimatedPrice === null ? null : splitTTC(estimatedPrice);

  return (
    <div data-lenis-prevent className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Conteneur de défilement natif */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-0 text-center">

          {/* Panneau principal */}
          {/* Téléphone : plein écran, comme une page. Ordinateur : fenêtre centrée. */}
          <div className="relative transform rounded-none sm:rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-3 w-full sm:max-w-3xl flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[96dvh] overflow-hidden">

            {/* Header (Fixe) */}
            <div className="flex flex-col gap-2 border-b border-gray-100 bg-white px-6 py-2 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Commander une course</p>
                  <h2 className="text-base font-extrabold text-ink">Course express Paris &amp; IDF</h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Stepper */}
              <div className="relative flex items-center justify-between px-2">
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-100" />
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-1 rounded-full bg-accent transition-all duration-500"
                  style={{ width: `calc((100% - 1rem) * ${(step - 1) / 2})` }}
                />
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= s ? "bg-accent text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {step > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                ))}
              </div>
            </div>

            {/* Contenu (2 colonnes) */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              
              {/* Colonne Gauche (Formulaire) */}
              <div className="flex-1 flex flex-col min-h-0 md:border-r border-gray-100">
                <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-ink">Demande envoyée !</h3>
              <p className="mb-4 text-muted">
                Un dispatcheur vous contacte dans les 10 prochaines minutes.
              </p>
              {clientType === "entreprise" && paymentMode === "fin_de_mois" && debitMethod === "virement" && (
                <p className="mb-4 text-sm text-muted">
                  <strong>Rien à payer aujourd&apos;hui.</strong> La facture avec nos coordonnées bancaires a été envoyée à <strong>{contactEmail}</strong>. À régler sous 30 jours, par virement ou par carte depuis la facture.
                </p>
              )}
              {trackingCode && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Code de suivi</p>
                  <p className="text-xl font-extrabold tracking-widest text-ink">{trackingCode}</p>
                </div>
              )}
              {trackingCode && <GuestAccountBox trackingCode={trackingCode} />}
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Étape 1 : Itinéraire */}
                {step === 1 && (
                  <div className="flex flex-col gap-4">

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-ink">Délai de prise en charge</span>
                        <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">Garantie ponctualité</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'standard', label: 'Normal : 3h', price: priceNormal, fallback: '—', Icon: Clock },
                          { id: 'urgent', label: 'Urgent : 1h30', price: priceUrgent, fallback: '—', Icon: Zap },
                          { id: 'flash', label: 'Super : 1h', price: priceFlash, fallback: '—', Icon: Zap },
                        ].map(({ id, label, price, fallback, Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setDelai(id)}
                            className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-all ${delai === id ? 'border-accent bg-accent text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                          >
                            {id === 'flash' && (
                              <span className="absolute -top-2 rounded bg-yellow-400 px-1.5 text-[9px] font-bold text-gray-900">EXPRESS</span>
                            )}
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${delai === id ? 'bg-white/20' : 'bg-gray-100'}`}>
                              <Icon size={16} />
                            </span>
                            <span className="text-xs font-bold uppercase leading-tight">{label}</span>
                            <span className="text-sm font-bold">
                              {price !== null ? `${price.toFixed(2).replace('.', ',')} €` : fallback}
                              {price !== null && <span className="ml-1 text-[10px] font-normal opacity-80">TTC</span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Adresse enlèvement */}
                    <div className="relative pl-8" onFocus={() => setAddressFocused(true)} onBlur={() => setAddressFocused(false)}>
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
                        className="w-full rounded-xl border border-line bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    {stops.map((stop, i) => (
                      <div key={i} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-[3px] border-gray-400 bg-white" />
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Arrêt {i + 1}</label>
                          <button type="button" onClick={() => setStops(stops.filter((_, j) => j !== i))} className="text-xs font-semibold text-gray-500 hover:text-red-600">Retirer</button>
                        </div>
                        <AddressAutocomplete
                          value={stop}
                          onChange={(v) => setStops(stops.map((s, j) => (j === i ? v : s)))}
                          placeholder="Adresse de l’arrêt"
                          className="w-full rounded-xl border border-line bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setStops([...stops, ""])}
                      disabled={delai === "flash" && stops.length >= 1}
                      className="self-start pl-8 text-sm font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                    >
                      + Ajouter un arrêt
                    </button>
                    {delai === "flash" && stops.length >= 1 && (
                      <p className="pl-8 text-xs text-gray-500">En Super 1 h, 2 adresses de livraison au maximum : l’arrêt et la livraison finale.</p>
                    )}

                    {/* Adresse livraison */}
                    <div className="relative pl-8" onFocus={() => setAddressFocused(true)} onBlur={() => setAddressFocused(false)}>
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
                        className="w-full rounded-xl border border-line bg-[#FAFAFA] px-4 py-2 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    {/* Pas d'alerte pendant la saisie : seule la liste d'adresses bouge. */}
                    {showZoneAlert && !addressFocused && <UnservedAddressAlert />}

                    {/* Détail du prix (téléphone ; sur ordinateur il est dans le récapitulatif de droite) */}
                    {prices && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm md:hidden">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">Formule sélectionnée</span>
                          <span className="font-semibold text-ink">{delai === 'standard' ? 'Normal (3h)' : delai === 'urgent' ? 'Urgent (1h30)' : 'Super (1h)'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">Sous-total HT</span>
                          <span className="text-gray-700">{eur(prices.ht)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">TVA (20 %)</span>
                          <span className="text-gray-700">{eur(prices.tva)}</span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between border-t border-gray-200 pt-2">
                          <span className="font-bold text-ink">Total TTC</span>
                          <span className="text-xl font-extrabold text-[#ed5518]">{eur(prices.ttc)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 2 : Contact */}
                {step === 2 && (
                  <div className="flex flex-col gap-3">
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
                    <div className="flex items-center gap-3 font-bold text-ink">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><User size={16} className="text-accent" /></div>
                      Vos informations
                    </div>
                    {clientType === "particulier" && (
                      <p className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">Paiement par carte, sécurisé par Stripe, avant la prise en charge.</p>
                    )}
                    {clientType === "entreprise" && (
                      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">Pros : paiement par carte immédiat, ou sur facture à 30 jours. Choix à la dernière étape.</p>
                    )}
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                      {clientType === "entreprise" && (
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">SIRET <span className="text-accent">*</span></label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={siret}
                              onChange={(e) => { setSiret(e.target.value.replace(/\D/g, "").slice(0, 14)); setTva(""); setAdresseFacturation(""); setContactName(""); setRaisonSociale(""); }}
                              maxLength={14}
                              placeholder="14 chiffres"
                              className="w-44 shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                            />
                            {validatingSiret && (
                              <span className="flex items-center whitespace-nowrap px-2 text-xs text-gray-500">Vérification…</span>
                            )}
                          </div>
                          {tva && (
                            <span className="mt-2 inline-flex rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-900">
                              ✓ TVA : {tva}
                            </span>
                          )}
                        </div>
                      )}
                      {clientType === "entreprise" && (
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Nom de la société <span className="text-accent">*</span></label>
                          {/* Nom officiel du SIRET (Sirene), non modifiable. */}
                          <input type="text" required readOnly value={contactName} placeholder="Rempli depuis le SIRET" className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700 focus:outline-none" />
                        </div>
                      )}
                      </div>
                      {clientType === "entreprise" && (
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Adresse de facturation <span className="text-accent">*</span></label>
                          {/* Adresse officielle du SIRET (Sirene), non modifiable : évite une facture adressée ailleurs. */}
                          <input
                            type="text"
                            value={adresseFacturation}
                            readOnly
                            placeholder="Remplie automatiquement depuis le SIRET"
                            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700 focus:outline-none"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Prénom <span className="text-accent">*</span></label>
                          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" placeholder="Jean" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Nom <span className="text-accent">*</span></label>
                          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" placeholder="Dupont" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Téléphone<span className="text-accent">*</span></label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          inputMode="tel" maxLength={12} onChange={(e) => setContactPhone((e.target.value.trim().startsWith("+") ? "+" : "") + e.target.value.replace(/\D/g, "").slice(0, e.target.value.trim().startsWith("+") ? 11 : 10))}
                          placeholder="06 12 34 56 78"
                          pattern="^(0[1-9]|(\+33)[1-9])[0-9 ]{8,9}$"
                          title="Numéro français valide : 06 12 34 56 78"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600">Email <span className="text-accent">*</span></label>
                        <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@societe.fr" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
                      </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Étape 3 : Colis & délai */}
                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink">Que voulez-vous envoyer ? <span className="text-accent">*</span></label>
                        <span className="text-[11px] text-gray-400">Pour préparer le coursier. Même tarif.</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ORDER_NATURES.map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => { setNature(id); setFormError(""); }}
                            aria-pressed={nature === id}
                            className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-all ${nature === id ? "border-accent bg-accent/5 font-semibold text-accent" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
                          >
                            {nature === id && <Check size={14} />}
                            {label}
                          </button>
                        ))}
                      </div>
                      {nature === "autre" && (
                        <input
                          type="text"
                          value={natureDetail}
                          onChange={(e) => { setNatureDetail(e.target.value.slice(0, NATURE_DETAIL_MAX)); setFormError(""); }}
                          maxLength={NATURE_DETAIL_MAX}
                          autoFocus
                          placeholder="Précisez ce que vous envoyez (ex. : clés, maquette, pièce détachée…)"
                          aria-label="Précisez ce que vous envoyez"
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink">Format du courrier <span className="text-accent">*</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "doc", label: "Pli / Doc", sub: "< 1 kg" },
                          { id: "petit", label: "Petit colis", sub: "1–10 kg" },
                          { id: "volumineux", label: "Volumineux", sub: "10–18 kg / encombrant" },
                        ].map(({ id, label, sub }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFormat(id)}
                            className={`relative flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left transition-all ${format === id ? "border-accent bg-accent/5" : "border-gray-200 bg-white hover:border-gray-300"}`}
                          >
                            {format === id && <Check size={14} className="absolute right-2 top-2 text-accent" />}
                            <span className={`text-sm font-semibold ${format === id ? "text-accent" : "text-gray-800"}`}>{label}</span>
                            <span className={`text-[11px] ${format === id ? "text-accent/70" : "text-gray-400"}`}>{sub}</span>
                          </button>
                        ))}
                      </div>
                      {format === "volumineux" && <LargeParcelAlert className="mt-2" />}
                    </div>

                    {clientType === "entreprise" && (
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink">Mode de règlement <span className="text-accent">*</span></label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { id: "carte", label: "Carte bancaire", sub: "Paiement immédiat" },
                            { id: "fin_de_mois", label: "Facture sous 30 jours", sub: "Règlement différé" },
                          ] as const).map(({ id, label, sub }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setPaymentMode(id)}
                              aria-pressed={paymentMode === id}
                              className={`flex flex-col items-center rounded-xl border-2 px-3 py-2.5 text-center transition-all ${paymentMode === id ? "border-accent bg-accent/5" : "border-gray-200 bg-white hover:border-gray-300"}`}
                            >
                              <span className={`flex items-center gap-1 text-sm font-semibold ${paymentMode === id ? "text-accent" : "text-gray-700"}`}>
                                {label}
                                {paymentMode === id && <Check size={14} />}
                              </span>
                              <span className={`text-[11px] ${paymentMode === id ? "text-accent/70" : "text-gray-400"}`}>{sub}</span>
                            </button>
                          ))}
                        </div>

                        {paymentMode === "fin_de_mois" && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Réglé par :</span>
                              {([
                                { id: "sepa", label: "Prélèvement SEPA" },
                                { id: "virement", label: "Virement" },
                              ] as const).map(({ id, label }) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setDebitMethod(id)}
                                  aria-pressed={debitMethod === id}
                                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all ${debitMethod === id ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                  {debitMethod === id && <Check size={12} />}
                                  {label}
                                </button>
                              ))}
                            </div>
                            <DeferredPaymentNote method={debitMethod} />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink">Consignes au coursier <span className="font-normal normal-case text-gray-400">(optionnel)</span></label>
                      <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex : code 4821B, bâtiment C, 3e étage" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" />
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
                        {nature && (
                          <div className="flex justify-between">
                            <span>Envoi :</span>
                            <span className="font-medium text-gray-900">{natureLabel(nature, natureDetail)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Format :</span>
                          <span className="font-medium text-gray-900">{format === 'doc' ? 'Pli/Doc' : format === 'petit' ? 'Petit Colis' : 'Volumineux'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Délai :</span>
                          <span className="font-medium text-gray-900">{delai === 'standard' ? 'Normal' : delai === 'urgent' ? 'Urgent' : 'Super'}</span>
                        </div>
                        {returnTrip && (
                          <div className="flex justify-between">
                            <span>Retour à l’adresse d’enlèvement :</span>
                            <span className="font-medium text-gray-900">oui (40 % de la course)</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-orange-200/60 pt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600/80 mb-0.5">Tarif estimé</div>
                          <div className="text-xs text-gray-500">{clientType === "entreprise" && paymentMode === "fin_de_mois" ? (debitMethod === "virement" ? "Virement sous 30 jours" : "Prélèvement sous 30 jours") : "Règlement sécurisé par carte"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-[#ed5518]">
                            {prices ? `${eur(prices.ttc)} TTC` : "-- €"}
                          </div>
                          {prices && (
                            <div className="text-xs font-semibold text-gray-500">
                              dont TVA {eur(prices.tva)} ({eur(prices.ht)} HT)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </>
          )}
                </div>

                {formError && (
                  <p role="alert" className="mx-6 mb-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                    {formError}
                  </p>
                )}

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
                      disabled={submitting || checkingAddress || outOfZone}
                      className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-dark transition-colors disabled:opacity-60 sm:flex-none sm:rounded-lg sm:py-2.5"
                    >
                      {submitting
                        ? (clientType === "entreprise" && paymentMode === "fin_de_mois" && debitMethod === "virement" ? "Envoi…" : "Redirection…")
                        : step < 3
                          ? "Étape suivante"
                          : clientType === "entreprise" && paymentMode === "fin_de_mois" ? "Valider la commande" : "Commander"}
                      {!submitting && (step < 3 ? <ChevronRight size={16} /> : <CheckCircle2 size={16} />)}
                    </button>
                  </div>
                )}
              </div>

              {/* Récapitulatif (Droite - Desktop Uniquement) */}
              <div className="hidden md:flex w-[300px] bg-gray-50 p-6 flex-col shrink-0 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ed5518]" />
                  Récapitulatif de votre commande
                </h3>

                <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={returnTrip}
                    onChange={(e) => setReturnTrip(e.target.checked)}
                    className="h-4 w-4 accent-[#ed5518]"
                  />
                  <span className="text-xs font-bold text-gray-900">Retour à l’adresse d’enlèvement (40 %)</span>
                </label>

                <div className="mb-3 border-b border-gray-200 pb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 mb-1">Tarif estimé</div>
                  <div className="whitespace-nowrap text-3xl font-extrabold text-[#ed5518]">
                    {prices ? `${eur(prices.ttc)} TTC` : "-- €"}
                  </div>
                  {prices && (
                    <div className="text-xs font-semibold text-gray-500">
                      dont TVA {eur(prices.tva)} ({eur(prices.ht)} HT)
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-gray-500">{clientType === "entreprise" && paymentMode === "fin_de_mois" ? (debitMethod === "virement" ? "Virement sous 30 jours" : "Prélèvement sous 30 jours") : "Règlement sécurisé par carte"}</div>
                </div>

                <div className="flex-1 space-y-1.5 text-[13px] text-gray-600">
                  <div className="flex flex-col gap-0.5 border-b border-gray-200 pb-2">
                    <span className="text-xs font-semibold uppercase text-gray-400">Départ</span>
                    <span className="font-medium text-gray-900">{pickupAddress || "À renseigner"}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Arrivée</span>
                    <span className="font-medium text-gray-900">{dropoffAddress || "À renseigner"}</span>
                  </div>

                  {stops.filter((s) => s.trim()).map((s, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                      <span className="text-xs font-semibold uppercase text-gray-400">Arrêt {i + 1}</span>
                      <span className="font-medium text-gray-900">{s}</span>
                    </div>
                  ))}

                  {returnTrip && (
                    <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                      <span className="text-xs font-semibold uppercase text-gray-400">Retour</span>
                      <span className="font-medium text-gray-900">À l’adresse d’enlèvement (40 % de la course)</span>
                    </div>
                  )}

                  {nature && (
                    <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                      <span className="text-xs font-semibold uppercase text-gray-400">Envoi</span>
                      <span className="font-medium text-gray-900">{natureLabel(nature, natureDetail)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 border-b border-gray-200 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Format</span>
                    <span className="font-medium text-gray-900">{format === 'doc' ? 'Pli/Doc' : format === 'petit' ? 'Petit Colis' : 'Volumineux'}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 pb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">Délai</span>
                    <span className="font-medium text-gray-900">{delai === 'standard' ? 'Normal (3h)' : delai === 'urgent' ? 'Urgent (1h30)' : 'Super (1h)'}</span>
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
