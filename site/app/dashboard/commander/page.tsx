"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Check,
  CheckCircle2,
  Package,
  Box,
  Truck,
  Clock,
  Zap,
  CalendarClock,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Star,
  Plus,
  X,
  Loader2,
  Radio,
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { createClient } from "@/lib/supabase/client";
import { calculatePrice, ServiceLevel } from "@/lib/pricing";

/* ── Données métier ───────────────────────────────────────────────────── */

const STEPS = ["Trajet", "Format", "Délai", "Validation"] as const;

const FORMATS = [
  { id: "pli", name: "Pli / Document", weight: "Jusqu'à 1 kg", example: "Enveloppe, contrat, clé", vehicle: "Moto express", icon: Package },
  { id: "petit", name: "Petit colis", weight: "Jusqu'à 8 kg", example: "Format boîte à chaussures", vehicle: "Moto ou scooter", icon: Box },
  { id: "volumineux", name: "Volumineux", weight: "Jusqu'à 30 kg+", example: "Cartons multiples", vehicle: "Moto ou fourgonnette 100 % électrique", icon: Truck },
] as const;

const DELAIS = [
  { id: "flash", name: "Super Urgent 1h", hint: "+100% du tarif", icon: Zap },
  { id: "urgent", name: "Urgent 1h30", hint: "+50% du tarif", icon: Zap },
  { id: "standard", name: "Normal 3h", hint: "Tarif de base", icon: Clock },
] as const;

/* Tarif d'affichage (dynamique) */
const eur = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Styles partagés ──────────────────────────────────────────────────── */

const INPUT =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink placeholder:text-label transition-colors hover:border-[#c9c5bd] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";
const INPUT_SM = INPUT.replace("h-11", "h-10");
const ADDRESS_WRAP =
  "[&_input]:h-11 [&_input]:rounded-lg [&_input]:bg-white [&_input]:py-0 [&_input]:pl-10 [&_input]:pr-3.5 [&_input]:font-medium [&_input]:transition-colors [&_input]:hover:border-[#c9c5bd] [&_input]:focus:ring-2 [&_input]:focus:ring-accent/15";
const LABEL = "label-mono text-xs font-medium text-muted";

type Favorite = { id: string; label: string; address: string };
type Stop = { id: string; address: string; contactName?: string; contactPhone?: string };

/* ── Point de l'itinéraire (défini hors de la page pour ne pas perdre le focus) ── */

function RoutePoint({
  kind,
  label,
  address,
  onAddress,
  contactName,
  contactPhone,
  onContactName,
  onContactPhone,
  favorites,
  onRemove,
}: {
  kind: "start" | "stop" | "end";
  label: string;
  address: string;
  onAddress: (v: string) => void;
  contactName: string;
  contactPhone: string;
  onContactName: (v: string) => void;
  onContactPhone: (v: string) => void;
  favorites?: Favorite[];
  onRemove?: () => void;
}) {
  const [favOpen, setFavOpen] = useState(false);
  const node =
    kind === "start"
      ? "border-ink bg-white"
      : kind === "end"
      ? "border-accent bg-accent"
      : "border-label bg-white";

  return (
    <div className="relative">
      <span
        aria-hidden
        className={`absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 ${node}`}
      >
        {kind === "start" && <span className="h-2 w-2 rounded-full bg-ink" />}
        {kind === "end" && <span className="h-2 w-2 rounded-full bg-white" />}
        {kind === "stop" && <span className="h-1.5 w-1.5 rounded-full bg-label" />}
      </span>

      <div className="relative mb-2 flex h-6 items-center justify-between">
        <span className={LABEL}>
          {label} <span className="text-accent">*</span>
        </span>

        {favorites && (
          <>
            <button
              type="button"
              onClick={() => setFavOpen((o) => !o)}
              aria-expanded={favOpen}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-accent-dark transition-colors hover:bg-accent/10"
            >
              <Star size={13} strokeWidth={2.5} />
              Mes favoris
            </button>
            {favOpen && (
              <>
                <button
                  type="button"
                  aria-label="Fermer les favoris"
                  onClick={() => setFavOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 top-8 z-50 w-72 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                  {favorites.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted">
                      Aucune adresse favorite.{" "}
                      <Link href="/dashboard/adresses" className="font-bold text-accent-dark hover:underline">
                        En ajouter
                      </Link>
                    </div>
                  ) : (
                    favorites.map((fav, i) => (
                      <button
                        key={fav.id}
                        type="button"
                        onClick={() => {
                          onAddress(fav.address);
                          setFavOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left transition-colors hover:bg-paper ${
                          i < favorites.length - 1 ? "border-b border-line" : ""
                        }`}
                      >
                        <div className="text-sm font-bold text-ink">{fav.label}</div>
                        <div className="truncate text-xs text-muted">{fav.address}</div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            <X size={13} strokeWidth={2.5} />
            Supprimer
          </button>
        )}
      </div>

      <div className="relative mb-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-label">
          {kind === "start" ? <Search size={16} /> : <MapPin size={16} />}
        </div>
        <div className={ADDRESS_WRAP}>
          <AddressAutocomplete value={address} onChange={onAddress} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          aria-label={`${label} : nom du contact`}
          placeholder="Contact sur place (optionnel)"
          value={contactName}
          onChange={(e) => onContactName(e.target.value)}
          className={INPUT_SM}
        />
        <input
          type="tel"
          aria-label={`${label} : téléphone du contact`}
          placeholder="Téléphone (optionnel)"
          value={contactPhone}
          onChange={(e) => onContactPhone(e.target.value)}
          maxLength={10}
          className={INPUT_SM}
        />
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function CommanderPage() {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<string>("pli");
  const [delai, setDelai] = useState<string>("flash");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffContactName, setDropoffContactName] = useState("");
  const [dropoffContactPhone, setDropoffContactPhone] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [favoriteAddresses, setFavoriteAddresses] = useState<Favorite[]>([]);
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
    supabase.from("addresses").select("id, label, address").then(({ data }: { data: Favorite[] | null }) => {
      if (data) setFavoriteAddresses(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addStop = () => setStops([...stops, { id: Math.random().toString(), address: "" }]);
  const removeStop = (id: string) => setStops(stops.filter((s) => s.id !== id));
  const patchStop = (id: string, patch: Partial<Stop>) =>
    setStops(stops.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitError("Session expirée. Veuillez vous reconnecter."); setSubmitting(false); return; }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        stops: stops.map(s => ({
          address: s.address,
          contact_name: s.contactName,
          contact_phone: s.contactPhone
        })),
        format,
        delai,
        notes: `Enlèvement contact: ${pickupContactName} ${pickupContactPhone}\nLivraison contact: ${dropoffContactName} ${dropoffContactPhone}\nNotes: ${notes}`.trim(),
        contact_name: contactName,
        contact_phone: contactPhone,
        status: "en_attente",
        client_type: "entreprise",
        source: "dashboard",
      })
      .select("tracking_code")
      .single();

    if (error) {
      console.error("Erreur de création de commande:", error);
      setSubmitError(`Erreur: ${error.message || "Une erreur est survenue. Veuillez réessayer."}`);
      setSubmitting(false);
    } else {
      setTrackingCode(data.tracking_code);
      setStep(5);
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setPickupAddress(""); setPickupContactName(""); setPickupContactPhone("");
    setDropoffAddress(""); setDropoffContactName(""); setDropoffContactPhone("");
    setStops([]); setFormat("pli"); setDelai("flash");
    setScheduledDate(""); setScheduledTime("");
    setTrackingCode(null); setNotes(""); setContactName(""); setContactPhone("");
  };

  const currentFormat = FORMATS.find((f) => f.id === format) ?? FORMATS[0];
  const currentDelai = DELAIS.find((d) => d.id === delai) ?? DELAIS[0];
  const delaiDetail = currentDelai.hint;

  const done = step === 5;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink bg-white shadow-[0_12px_40px_-12px_rgba(14,15,16,0.25)] [@media(min-height:760px)_and_(min-width:1024px)]:h-[calc(100dvh-160px)]">
      {/* ── Barre supérieure : titre + progression ───────────────────── */}
      <header className="relative flex flex-col gap-4 bg-ink px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-accent" />
        <div className="min-w-0">
          <div className="label-mono flex items-center gap-2 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Nouvelle course
          </div>
          <h1 className="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
            Commander une course express
          </h1>
        </div>

        <ol className="flex items-center gap-1.5" aria-label="Progression">
          {STEPS.map((name, i) => {
            const n = i + 1;
            const complete = done || step > n;
            const active = step === n;
            const clickable = !done && step > n;
            const body = (
              <>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    complete
                      ? "bg-white text-ink"
                      : active
                      ? "bg-accent text-white"
                      : "border border-white/25 text-white/50"
                  }`}
                >
                  {complete ? <Check size={13} strokeWidth={3} /> : n}
                </span>
                <span
                  className={`text-[13px] font-bold ${active ? "inline text-white" : "hidden lg:inline"} ${
                    !active && complete ? "text-white/80" : ""
                  } ${!active && !complete ? "text-white/45" : ""}`}
                >
                  {name}
                </span>
              </>
            );
            return (
              <li key={name} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className={`h-px w-3 sm:w-5 ${complete || active ? "bg-white/50" : "bg-white/15"}`} />}
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => setStep(n)}
                    className="flex items-center gap-2 rounded-full py-0.5 pr-1 transition-opacity hover:opacity-70"
                  >
                    {body}
                  </button>
                ) : (
                  <span className="flex items-center gap-2 py-0.5 pr-1" aria-current={active ? "step" : undefined}>
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </header>

      {/* ── Confirmation ─────────────────────────────────────────────── */}
      {done && (
        <div className="step-enter flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 ring-8 ring-green-50/60">
            <CheckCircle2 size={32} strokeWidth={2.25} />
          </div>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-ink">Commande validée</h2>
          <p className="mb-6 max-w-md text-[15px] text-muted">
            Le dispatching a bien pris en compte votre course. Un coursier arrivera sur place sous peu.
          </p>
          {trackingCode && (
            <div className="mb-8 rounded-xl border border-line bg-paper px-8 py-4">
              <p className="label-mono mb-1 text-xs font-medium text-muted">Code de suivi</p>
              <p className="font-mono text-2xl font-bold tracking-[0.2em] text-ink">{trackingCode}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/suivi"
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line px-7 text-sm font-bold text-ink transition-colors hover:bg-paper hover:text-ink"
            >
              Suivre la course
            </Link>
            <button
              type="button"
              onClick={resetAll}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              Nouvelle commande
            </button>
          </div>
        </div>
      )}

      {/* ── Corps : formulaire + récapitulatif ───────────────────────── */}
      {!done && (
        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_304px] lg:grid-rows-[minmax(0,1fr)]">
          <form
            onSubmit={step === 4 ? handleConfirm : handleNextStep}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div key={step} data-lenis-prevent className="step-enter no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-32 sm:px-8">
              {/* ÉTAPE 1 — TRAJET */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-ink">Où récupérer et livrer ?</h2>
                    <p className="mt-0.5 text-[13px] text-muted">Paris intra-muros et toute l'Île-de-France.</p>
                  </div>

                  <div className="relative flex flex-col gap-4 pl-9">
                    <span aria-hidden className="absolute bottom-6 left-[11px] top-6 border-l-2 border-dashed border-line" />

                    <RoutePoint
                      kind="start"
                      label="Enlèvement"
                      address={pickupAddress}
                      onAddress={setPickupAddress}
                      contactName={pickupContactName}
                      contactPhone={pickupContactPhone}
                      onContactName={setPickupContactName}
                      onContactPhone={setPickupContactPhone}
                      favorites={favoriteAddresses}
                    />

                    {stops.map((stop, index) => (
                      <RoutePoint
                        key={stop.id}
                        kind="stop"
                        label={`Étape ${index + 1}`}
                        address={stop.address}
                        onAddress={(v) => patchStop(stop.id, { address: v })}
                        contactName={stop.contactName || ""}
                        contactPhone={stop.contactPhone || ""}
                        onContactName={(v) => patchStop(stop.id, { contactName: v })}
                        onContactPhone={(v) => patchStop(stop.id, { contactPhone: v })}
                        onRemove={() => removeStop(stop.id)}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={addStop}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#c9c5bd] text-xs font-bold text-muted transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent-dark"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      Ajouter une étape intermédiaire
                    </button>

                    <RoutePoint
                      kind="end"
                      label="Livraison"
                      address={dropoffAddress}
                      onAddress={setDropoffAddress}
                      contactName={dropoffContactName}
                      contactPhone={dropoffContactPhone}
                      onContactName={setDropoffContactName}
                      onContactPhone={setDropoffContactPhone}
                      favorites={favoriteAddresses}
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 — FORMAT */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-ink">Que faut-il transporter ?</h2>
                    <p className="mt-0.5 text-[13px] text-muted">Le format détermine le véhicule envoyé. Flotte 100 % décarbonée.</p>
                  </div>

                  <div role="radiogroup" aria-label="Format du colis" className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {FORMATS.map((f) => {
                      const selected = format === f.id;
                      const Icon = f.icon;
                      return (
                        <label
                          key={f.id}
                          className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-5 transition-all focus-within:ring-2 focus-within:ring-accent/30 ${
                            selected ? "border-accent bg-accent/[0.03]" : "border-line bg-white hover:border-[#c9c5bd]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={f.id}
                            checked={selected}
                            onChange={() => setFormat(f.id)}
                            className="sr-only"
                          />
                          <span
                            className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              selected ? "border-accent bg-accent text-white" : "border-line bg-white text-transparent"
                            }`}
                          >
                            <Check size={11} strokeWidth={3.5} />
                          </span>
                          <span
                            className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                              selected ? "bg-accent text-white" : "bg-paper text-muted"
                            }`}
                          >
                            <Icon size={22} strokeWidth={2} />
                          </span>
                          <span className="text-base font-extrabold text-ink">{f.name}</span>
                          <span className="mt-1 text-[13px] font-bold text-accent-dark">{f.weight}</span>
                          <span className="mt-0.5 text-[13px] text-muted">{f.example}</span>
                          <span className="mt-5 flex items-center gap-2 border-t border-line pt-3 text-xs font-semibold text-ink">
                            <Truck size={14} className="shrink-0 text-label" />
                            {f.vehicle}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 — DÉLAI & CONSIGNES */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-ink">Pour quand ?</h2>
                    <p className="mt-0.5 text-[13px] text-muted">Choisissez le délai, puis précisez vos consignes.</p>
                  </div>

                  <div role="radiogroup" aria-label="Délai souhaité" className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {DELAIS.map((d) => {
                      const selected = delai === d.id;
                      const Icon = d.icon;
                      return (
                        <label
                          key={d.id}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-3 transition-all focus-within:ring-2 focus-within:ring-accent/30 ${
                            selected ? "border-accent bg-accent/[0.03]" : "border-line bg-white hover:border-[#c9c5bd]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="delai"
                            value={d.id}
                            checked={selected}
                            onChange={() => setDelai(d.id)}
                            className="sr-only"
                          />
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              selected ? "bg-accent text-white" : "bg-paper text-muted"
                            }`}
                          >
                            <Icon size={18} strokeWidth={2.25} />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="text-[13px] font-extrabold leading-tight text-ink">{d.name}</span>
                            <span className={`text-xs font-medium ${selected ? "text-accent-dark" : "text-muted"}`}>{d.hint}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-t border-line pt-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <label htmlFor="notes" className={`${LABEL} mb-1.5 block`}>Consignes au coursier</label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Digicode, remise à l'accueil, étage…"
                        rows={3}
                        className="w-full flex-1 resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-label transition-colors hover:border-[#c9c5bd] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <label htmlFor="contact-name" className={`${LABEL} mb-1.5 block`}>Votre nom (demandeur)</label>
                        <input
                          id="contact-name"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Ex : M. Dupont"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className={`${LABEL} mb-1.5 block`}>Votre téléphone</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          maxLength={10}
                          placeholder="06 12 34 56 78"
                          className={INPUT}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 — VALIDATION */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-ink">Vérifiez votre commande</h2>
                    <p className="mt-0.5 text-[13px] text-muted">Un dernier coup d'œil avant l'envoi au dispatching.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ReviewCard title="Enlèvement" onEdit={() => setStep(1)}>
                      <p className="text-sm font-bold text-ink">{pickupAddress || "Adresse non renseignée"}</p>
                      {(pickupContactName || pickupContactPhone) && (
                        <p className="mt-0.5 text-xs text-muted">{[pickupContactName, pickupContactPhone].filter(Boolean).join(" · ")}</p>
                      )}
                    </ReviewCard>

                    <ReviewCard title="Livraison" onEdit={() => setStep(1)}>
                      <p className="text-sm font-bold text-ink">{dropoffAddress || "Adresse non renseignée"}</p>
                      {(dropoffContactName || dropoffContactPhone) && (
                        <p className="mt-0.5 text-xs text-muted">{[dropoffContactName, dropoffContactPhone].filter(Boolean).join(" · ")}</p>
                      )}
                    </ReviewCard>

                    {stops.length > 0 && (
                      <ReviewCard title={`Étapes intermédiaires (${stops.length})`} onEdit={() => setStep(1)} wide>
                        <ul className="flex flex-col gap-1">
                          {stops.map((s, i) => (
                            <li key={s.id} className="text-sm font-bold text-ink">
                              <span className="mr-2 font-mono text-xs font-medium text-label">{i + 1}.</span>
                              {s.address || "Adresse non renseignée"}
                            </li>
                          ))}
                        </ul>
                      </ReviewCard>
                    )}

                    <ReviewCard title="Format" onEdit={() => setStep(2)}>
                      <p className="text-sm font-bold text-ink">{currentFormat.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{currentFormat.weight} · {currentFormat.vehicle}</p>
                    </ReviewCard>

                    <ReviewCard title="Délai" onEdit={() => setStep(3)}>
                      <p className="text-sm font-bold text-ink">{currentDelai.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{delaiDetail}</p>
                    </ReviewCard>

                    {(notes || contactName || contactPhone) && (
                      <ReviewCard title="Consignes & contact" onEdit={() => setStep(3)} wide>
                        {notes && <p className="text-sm font-medium text-ink">{notes}</p>}
                        {(contactName || contactPhone) && (
                          <p className="mt-0.5 text-xs text-muted">Demandeur : {[contactName, contactPhone].filter(Boolean).join(" · ")}</p>
                        )}
                      </ReviewCard>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div aria-hidden className="pointer-events-none -mt-8 h-8 shrink-0 bg-gradient-to-t from-white to-transparent" />

            {/* ── Pied : navigation ─────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 border-t border-line bg-white px-5 py-3.5 sm:px-8">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    aria-label="Retour"
                    className="flex h-11 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-sm font-bold text-ink transition-colors hover:bg-paper sm:px-4"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Retour</span>
                  </button>
                )}
                <div className="whitespace-nowrap lg:hidden">
                  <span className="label-mono block text-[11px] font-medium text-muted">Tarif estimé</span>
                  <span className="text-base font-extrabold text-ink">{estimatedPrice !== null ? `${eur(estimatedPrice)} €` : '-- €'} <span className="text-xs font-semibold text-muted">HT</span></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {submitError && (
                  <p role="alert" className="hidden max-w-[280px] text-xs font-medium text-red-600 sm:block">{submitError}</p>
                )}
                {step < 4 ? (
                  <button
                    type="submit"
                    className="group flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#25272a]"
                  >
                    Continuer
                    <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-accent px-5 text-sm sm:px-6 font-bold text-white shadow-sm transition-colors hover:bg-accent-dark disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        Confirmer<span className="hidden sm:inline"> la commande</span>
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {submitError && (
              <p role="alert" className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs font-medium text-red-700 sm:hidden">{submitError}</p>
            )}
          </form>

          {/* ── Récapitulatif live ─────────────────────────────────── */}
          <aside className="hidden min-h-0 flex-col bg-ink text-white lg:flex">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="label-mono text-xs font-medium text-white/60">Récapitulatif</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                Dispatch en ligne
              </span>
            </div>

            {/* Trajet */}
            <div data-lenis-prevent className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="relative flex flex-col gap-4 pl-6">
                <span aria-hidden className="absolute bottom-3 left-[7px] top-3 border-l border-dashed border-white/25" />
                <SummaryStop kind="start" label="Enlèvement" value={pickupAddress} />
                {stops.map((s, i) => (
                  <SummaryStop key={s.id} kind="stop" label={`Étape ${i + 1}`} value={s.address} />
                ))}
                <SummaryStop kind="end" label="Livraison" value={dropoffAddress} />
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div>
                  <dt className="label-mono text-[11px] font-medium text-white/50">Format</dt>
                  <dd className="mt-1 text-sm font-bold leading-snug">{currentFormat.name}</dd>
                </div>
                <div>
                  <dt className="label-mono text-[11px] font-medium text-white/50">Délai</dt>
                  <dd className="mt-1 text-sm font-bold leading-snug">{currentDelai.name}</dd>
                </div>
              </dl>
            </div>

            {/* Tarif */}
            <div className="border-t border-white/10 px-6 py-5">
              <span className="label-mono text-xs font-medium text-white/60">Tarif estimé</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[34px] font-extrabold leading-none tracking-tight">{estimatedPrice !== null ? eur(estimatedPrice) : '--'} €</span>
                <span className="text-sm font-semibold text-white/60">HT</span>
              </div>
              <p className="mt-1 text-xs font-medium text-white/60">{estimatedPrice !== null ? eur(estimatedPrice * 1.2) : '--'} € TTC · Facturation différée</p>

              <ul className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-white/60">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0 text-green-400" />
                  Paiement sécurisé SSL 256-bit
                </li>
                <li className="flex items-center gap-2">
                  <Radio size={14} className="shrink-0 text-green-400" />
                  Suivi GPS temps réel · Support 7j/7
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ── Petits composants de présentation ────────────────────────────────── */

function ReviewCard({
  title,
  onEdit,
  wide,
  children,
}: {
  title: string;
  onEdit: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-line bg-paper-card p-4 ${wide ? "md:col-span-2" : ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="label-mono text-xs font-medium text-muted">{title}</span>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md px-1.5 py-0.5 text-xs font-bold text-accent-dark transition-colors hover:bg-accent/10"
        >
          Modifier
        </button>
      </div>
      {children}
    </div>
  );
}

function SummaryStop({ kind, label, value }: { kind: "start" | "stop" | "end"; label: string; value: string }) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className={`absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          kind === "end" ? "border-accent bg-accent" : kind === "start" ? "border-white bg-ink" : "border-white/50 bg-ink"
        }`}
      >
        {kind === "start" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <div className="label-mono text-[11px] font-medium text-white/50">{label}</div>
      <div className={`mt-0.5 line-clamp-2 text-sm font-semibold leading-snug ${value ? "text-white" : "text-white/30"}`}>
        {value || "À renseigner"}
      </div>
    </div>
  );
}
