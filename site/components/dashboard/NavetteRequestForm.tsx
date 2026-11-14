"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Clock, Plus, Trash2, ShieldCheck, AlertTriangle, Loader2, Check } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { isServedAddress, getDepartmentFromAddress, getZoneFromDepartment, extraStopPrice, calculatePrice } from "@/lib/pricing";
import { legDistancesKm } from "@/lib/route-distance";
import { joinNumberSuffix } from "@/lib/address-idf";
import UnservedAddressAlert, { useUnservedAddresses } from "@/components/UnservedAddressAlert";

const OUT_OF_ZONE = "Adresse non reconnue : Paris et Île-de-France uniquement";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Panel, INPUT, LABEL, BTN_PRIMARY } from "@/components/dashboard/ui";

const VOLUME_OPTIONS = [
  { id: "pli", label: "Pli / Enveloppe", points: 1 },
  { id: "petit_colis", label: "Petit Colis (Boîte à chaussures)", points: 10 },
  { id: "sac_moyen", label: "Sac / Colis Moyen", points: 30 },
  { id: "gros_colis", label: "Gros Colis", points: 60 },
] as const;

const DAYS = [
  { id: "mon", label: "L" },
  { id: "tue", label: "M" },
  { id: "wed", label: "M" },
  { id: "thu", label: "J" },
  { id: "fri", label: "V" },
  { id: "sat", label: "S" },
  { id: "sun", label: "D" },
];

const SCOOTER_MAX_POINTS = 100;
const IDF_DEPTS = ["75", "77", "78", "91", "92", "93", "94", "95"];
// Adresse en cours d'identification : une adresse reconnue qui n'alerte pas le client pendant la recherche.
const PENDING_ADDRESS = "75001 Paris";

const stepSchema = z.object({
  address: z.string().min(5, "L'adresse est requise").refine(isServedAddress, OUT_OF_ZONE),
  contactName: z.string().min(2, "Nom requis"),
  contactPhone: z.string().min(10, "Téléphone requis"),
  notes: z.string().optional(),
  volume: z.enum(["pli", "petit_colis", "sac_moyen", "gros_colis"], {
    errorMap: () => ({ message: "Veuillez choisir un volume" }),
  }),
});

const navetteSchema = z.object({
  mainAddress: z.string().min(5, "L'adresse est requise").refine(isServedAddress, OUT_OF_ZONE),
  mainContactName: z.string().min(2, "Nom requis"),
  mainContactPhone: z.string().min(10, "Téléphone requis"),
  mainNotes: z.string().optional(),
  steps: z.array(stepSchema).min(1, "Au moins une adresse secondaire est requise"),
  selectedDays: z.array(z.string()).min(1, "Sélectionnez au moins un jour"),
  startTime: z.string().min(1, "Heure requise"),
  endTime: z.string().min(1, "Heure requise"),
});

type NavetteFormValues = z.infer<typeof navetteSchema>;

type NavetteRequestFormProps = {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
};

export function NavetteRequestForm({ initialData, isEdit, onSuccess }: NavetteRequestFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const defaultValues = useMemo(() => {
    if (initialData) {
      // Itinéraire : point 1 = enlèvement, puis les livraisons dans l'ordre enregistré (stops, puis dropoff).
      const mappedSteps = [
        ...(initialData.stops || []).map((s: any) => ({ ...s, volume: s.volume || "pli" })),
        {
          address: initialData.dropoff_address || "",
          contactName: initialData.dropoff_contact_name || "",
          contactPhone: initialData.dropoff_contact_phone || "",
          notes: initialData.dropoff_notes || "",
          volume: "pli",
        },
      ];

      return {
        mainAddress: initialData.pickup_address,
        mainContactName: initialData.pickup_contact_name,
        mainContactPhone: initialData.pickup_contact_phone,
        mainNotes: initialData.pickup_notes,
        steps: mappedSteps,
        selectedDays: initialData.days_of_week || ["mon", "tue", "wed", "thu", "fri"],
        startTime: initialData.start_time || "08:30",
        endTime: initialData.end_time || "12:00",
      };
    }
    return {
      mainAddress: "",
      mainContactName: "",
      mainContactPhone: "",
      mainNotes: "",
      steps: [{ address: "", contactName: "", contactPhone: "", notes: "", volume: "pli" }],
      selectedDays: ["mon", "tue", "wed", "thu", "fri"],
      startTime: "08:30",
      endTime: "12:00",
    };
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<NavetteFormValues>({
    resolver: zodResolver(navetteSchema),
    defaultValues: defaultValues as NavetteFormValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  const watchSteps = watch("steps");
  const watchMain = watch("mainAddress");
  const watchDays = watch("selectedDays");
  // useWatch suit directement chaque champ, pour que le prix se mette à jour à chaque saisie.
  const [tMain, tSteps] = useWatch({ control, name: ["mainAddress", "steps"] });
  // react-hook-form renvoie la même liste (modifiée sur place) quand une adresse d'étape change : les effets ne
  // se relançaient donc pas. On les déclenche avec une clé texte, qui change à chaque frappe.
  const addrKey = [tMain ?? "", ...(tSteps ?? []).map((s) => s?.address ?? "")].join("\u0001");

  // Une adresse tapée sans ville ni code postal (« 19 rue Cambacérès ») est identifiée toute seule auprès de la
  // Base Adresse Nationale, dès que le client arrête de taper : il n'a pas à choisir une suggestion.
  // Le tarif, l'alerte et le blocage s'appuient sur l'adresse complète trouvée.
  const resolvedRef = useRef<Map<string, string | null>>(new Map());
  const [resolvedVersion, setResolvedVersion] = useState(0);
  useEffect(() => {
    const raws = [tMain ?? "", ...(tSteps ?? []).map((s) => s?.address ?? "")]
      .map((a) => a.trim())
      .filter((a) => a.length >= 5 && !isServedAddress(a) && !resolvedRef.current.has(a));
    if (raws.length === 0) return;
    const timer = setTimeout(async () => {
      await Promise.all(
        raws.map(async (a) => {
          try {
            const res = await fetch(
              `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(joinNumberSuffix(a))}&lat=48.8566&lon=2.3522&limit=1`,
            );
            const f = (await res.json()).features?.[0];
            const label: string | undefined = f?.properties?.label;
            const dept = String(f?.properties?.postcode ?? "").slice(0, 2);
            resolvedRef.current.set(a, label && IDF_DEPTS.includes(dept) ? label : null);
          } catch {
            /* service indisponible : on réessaiera à la prochaine saisie */
          }
        }),
      );
      setResolvedVersion((v) => v + 1);
    }, 450);
    return () => clearTimeout(timer);
  }, [addrKey]);

  /** Adresse utilisable pour le prix : reconnue telle quelle, ou identifiée par la recherche ; sinon null. */
  const effectiveAddress = (a: string): string | null => {
    const t = a.trim();
    if (!t) return null;
    if (isServedAddress(t)) return t;
    return resolvedRef.current.get(t) ?? null;
  };

  // Adresses hors Paris / IDF : pas de tarif, demande bloquée (voir aussi la validation zod).
  const zoneAddresses = [watchMain ?? "", ...(watchSteps ?? []).map((st) => st?.address ?? "")].map((a) => {
    const t = a.trim();
    if (!t || isServedAddress(t)) return a;
    const r = resolvedRef.current.get(t);
    if (r) return r;
    return r === undefined && t.length >= 5 ? PENDING_ADDRESS : a;
  });
  const outOfZone = zoneAddresses.some((a) => a.trim().length > 0 && !isServedAddress(a));
  const showZoneAlert = useUnservedAddresses(zoneAddresses);

  // À l'envoi, les adresses identifiées remplacent le texte tapé, pour passer la validation.
  const commitResolved = () => {
    const main = (getValues("mainAddress") ?? "").trim();
    const rm = resolvedRef.current.get(main);
    if (rm && !isServedAddress(main)) setValue("mainAddress", rm);
    (getValues("steps") ?? []).forEach((s, i) => {
      const t = (s?.address ?? "").trim();
      const r = resolvedRef.current.get(t);
      if (r && !isServedAddress(t)) setValue(`steps.${i}.address`, r);
    });
  };

  // Tarif d'une navette régulière, par passage. Point 1 = enlèvement, point 2 = livraison, points 3 et suivants
  // = livraisons en plus ou retour au départ.
  // - Enlèvement → point 2 : forfait selon la zone la plus éloignée (Paris 25 €, petite couronne 35 €,
  //   grande couronne 55 € TTC), quelle que soit la distance.
  // - À partir du point 3 : chaque trajet (point précédent → point) est facturé au kilomètre, comme les
  //   adresses en plus d'une course normale (extraStopPrice : distance par la route).
  const NAVETTE_FORFAIT = { 0: 25, 1: 35, 2: 55 } as const;
  const [tarif, setTarif] = useState<{ legs: { label: string; price: number }[]; total: number } | null>(null);
  useEffect(() => {
    const pickup = effectiveAddress(tMain ?? "");
    const resolvedDeliveries = (tSteps ?? []).map((s) => effectiveAddress(s?.address ?? ""));
    if (!pickup || resolvedDeliveries.length === 0 || resolvedDeliveries.some((a) => !a)) {
      setTarif(null);
      return;
    }
    const deliveries = resolvedDeliveries as string[];
    const zoneOf = (a: string) => getZoneFromDepartment(getDepartmentFromAddress(a));
    const firstZone = Math.max(zoneOf(pickup), zoneOf(deliveries[0]));
    // Grande couronne : facturée à la distance depuis Paris, comme une course normale, moins 4 € (minimum 55 €).
    const forfait =
      firstZone === 2
        ? Math.max(NAVETTE_FORFAIT[2], calculatePrice(pickup, deliveries[0], "standard") - 4)
        : NAVETTE_FORFAIT[firstZone as 0 | 1];
    if (forfait == null) {
      setTarif(null);
      return;
    }
    const firstLeg = {
      label: firstZone === 2 ? "Enlèvement → livraison (navette, selon la distance)" : "Enlèvement → livraison (forfait navette)",
      price: forfait,
    };
    if (deliveries.length === 1) {
      setTarif({ legs: [firstLeg], total: forfait });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      legDistancesKm(deliveries)
        .then((legKm) => {
          if (cancelled) return;
          const extras = deliveries.slice(1).map((to, i) => {
            const km = legKm[i] ?? 0;
            return { label: `Point ${i + 2} → point ${i + 3} (${km} km)`, price: extraStopPrice(deliveries[i], to, km, "standard") };
          });
          const legs = [firstLeg, ...extras];
          setTarif({ legs, total: Math.round(legs.reduce((s, l) => s + l.price, 0) * 100) / 100 });
        })
        .catch(() => {
          if (!cancelled) setTarif(null);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [addrKey, resolvedVersion]);
  const tarifPassage = tarif?.total ?? null;

  const totalVolumePoints = useMemo(() => {
    return watchSteps.reduce((total, step) => {
      const vol = VOLUME_OPTIONS.find((v) => v.id === step.volume);
      return total + (vol?.points || 0);
    }, 0);
  }, [watchSteps]);

  const capacityExceeded = totalVolumePoints > SCOOTER_MAX_POINTS;

  // La navette est sur devis : One Connexion fixe le prix par passage après avoir étudié la tournée
  // (champ estimated_price, renseigné par l'admin). Une modification ne touche pas au prix déjà fixé.
  const onSubmit = async (data: NavetteFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const daysStr = data.selectedDays.map(d => DAYS.find(x => x.id === d)?.label).join(', ');

      const navettePayload = {
        user_id: user?.id || null,
        name: "Demande de Navette (Itinéraire)",
        pickup_address: data.mainAddress,
        pickup_contact_name: data.mainContactName,
        pickup_contact_phone: data.mainContactPhone,
        pickup_notes: data.mainNotes,
        dropoff_address: data.steps[data.steps.length - 1].address,
        dropoff_contact_name: data.steps[data.steps.length - 1].contactName,
        dropoff_contact_phone: data.steps[data.steps.length - 1].contactPhone,
        dropoff_notes: data.steps[data.steps.length - 1].notes,
        days_of_week: data.selectedDays,
        days_str: daysStr,
        start_time: data.startTime,
        end_time: data.endTime,
        stops: data.steps.slice(0, -1),
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase.from("navettes").update(navettePayload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        // La navette reste en attente : One Connexion rappelle le client pour la confirmer
        const { error } = await supabase.from("navettes").insert({ ...navettePayload, estimated_price: null, status: "en_attente" });
        if (error) throw error;
      }
      
      setSubmitSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const INPUT_SM = INPUT.replace("h-11", "h-10");
  const ADDRESS_WRAP =
    "[&_input]:h-11 [&_input]:rounded-[4px] [&_input]:bg-paper-card [&_input]:py-0 [&_input]:pl-10 [&_input]:pr-3.5 [&_input]:font-medium [&_input]:focus:ring-2 [&_input]:focus:ring-accent/15";
  // Les champs d'adresse (Controller) ne reçoivent pas le focus automatique de react-hook-form :
  // on amène donc la première erreur affichée à l'écran.
  const onInvalid = () => {
    requestAnimationFrame(() => {
      document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const err = (m?: string) => (m ? <span role="alert" className="mt-1 block text-xs font-medium text-red-600">{m}</span> : null);

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[4px] border border-line bg-paper-card px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 ring-8 ring-green-50/60">
          <ShieldCheck size={28} />
        </span>
        <h2 className="mb-2 text-xl font-extrabold tracking-tight text-ink">
          {isEdit ? "Navette modifiée" : "Demande de navette envoyée"}
        </h2>
        <p className="mb-7 max-w-md text-sm leading-relaxed text-muted">
          {isEdit
            ? "Les modifications ont été prises en compte. Si elles changent le prix de la tournée, un conseiller vous envoie un nouveau devis."
            : "Un conseiller One Connexion vous rappelle très prochainement pour préciser votre tournée et vous envoyer le devis."}
        </p>
        <button
          type="button"
          onClick={() => {
            if (isEdit) {
              router.push(`/dashboard/navettes/${initialData?.id}`);
            } else {
              setSubmitSuccess(false);
              onSuccess?.();
            }
          }}
          className={BTN_PRIMARY}
        >
          {isEdit ? "Retour à la navette" : "Retour à mes navettes"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { commitResolved(); return handleSubmit(onSubmit, onInvalid)(e); }} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Itinéraire */}
        <Panel title="Itinéraire" aside={<span className="text-xs font-semibold text-muted">{fields.length + 1} points</span>}>
          <div className="relative flex flex-col gap-5 px-5 py-5 pl-14">
            <span aria-hidden className="absolute bottom-8 left-[31px] top-8 border-l-2 border-dashed border-line" />

            {/* Adresse principale */}
            <div className="relative">
              <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-paper-card text-[11px] font-bold text-ink">A</span>
              <span className={LABEL}>Adresse d&apos;enlèvement (point 1) <span className="text-accent">*</span></span>
              <div className="relative mb-2">
                <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-label" />
                <Controller
                  control={control}
                  name="mainAddress"
                  render={({ field }) => (
                    <div className={ADDRESS_WRAP}>
                      <AddressAutocomplete value={field.value} onChange={field.onChange} placeholder="Ex : siège social, entrepôt…" />
                    </div>
                  )}
                />
              </div>
              {err(errors.mainAddress?.message)}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <input type="text" aria-label="Nom du contact" placeholder="Nom du contact *" {...register("mainContactName")} className={INPUT_SM} />
                  {err(errors.mainContactName?.message)}
                </div>
                <div>
                  <input type="tel" aria-label="Téléphone du contact" placeholder="Téléphone *" {...register("mainContactPhone")} className={INPUT_SM} />
                  {err(errors.mainContactPhone?.message)}
                </div>
              </div>
            </div>

            {/* Points secondaires */}
            {fields.map((field, index) => (
              <div key={field.id} className="relative">
                <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-label bg-paper-card text-[11px] font-bold text-muted">{index + 1}</span>
                <div className="mb-2 flex h-6 items-center justify-between">
                  <span className={LABEL.replace("mb-1.5 block", "")}>
                    {index === 0 ? "Livraison (point 2)" : `Point ${index + 2} (livraison ou retour)`} <span className="text-accent">*</span>
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-1 rounded-[4px] px-2 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="relative mb-2">
                  <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-label" />
                  <Controller
                    control={control}
                    name={`steps.${index}.address`}
                    render={({ field }) => (
                      <div className={ADDRESS_WRAP}>
                        <AddressAutocomplete value={field.value} onChange={field.onChange} placeholder="Adresse de l'étape" />
                      </div>
                    )}
                  />
                </div>
                {err(errors.steps?.[index]?.address?.message)}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <input type="text" aria-label="Nom du contact" placeholder="Nom du contact *" {...register(`steps.${index}.contactName`)} className={INPUT_SM} />
                    {err(errors.steps?.[index]?.contactName?.message)}
                  </div>
                  <div>
                    <input type="tel" aria-label="Téléphone du contact" placeholder="Téléphone *" {...register(`steps.${index}.contactPhone`)} className={INPUT_SM} />
                    {err(errors.steps?.[index]?.contactPhone?.message)}
                  </div>
                  <select aria-label="Volume" {...register(`steps.${index}.volume`)} className={INPUT_SM}>
                    {VOLUME_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ address: "", contactName: "", contactPhone: "", notes: "", volume: "pli" })}
              className="flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-[#c9c5bd] text-xs font-bold text-muted transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent-dark"
            >
              <Plus size={14} strokeWidth={2.5} />
              Ajouter une étape
            </button>
          </div>
        </Panel>
      </div>

      {/* Colonne latérale */}
      <div className="flex min-w-0 flex-col gap-4">
        {capacityExceeded && (
          <div role="alert" className="flex gap-3 rounded-[4px] border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="text-xs leading-snug">
              <p className="font-extrabold">Capacité 2 roues dépassée</p>
              <p className="mt-0.5 opacity-90">Le volume cumulé nécessite un utilitaire ou une division de la tournée.</p>
            </div>
          </div>
        )}

        <Panel title="Planification">
          <div className="flex flex-col gap-4 px-5 py-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted">Jours de passage</p>
              <div className="flex gap-1.5">
                {DAYS.map((day) => {
                  const isSelected = watchDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (isSelected) {
                          setValue("selectedDays", watchDays.filter((d) => d !== day.id), { shouldValidate: true });
                        } else {
                          setValue("selectedDays", [...watchDays, day.id], { shouldValidate: true });
                        }
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-[4px] text-sm font-bold transition-colors ${
                        isSelected ? "bg-ink text-white" : "bg-paper-card text-muted ring-1 ring-line hover:ring-ink hover:text-ink"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {err(errors.selectedDays?.message)}
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Clock size={13} className="text-label" /> Plage horaire
              </p>
              <div className="flex items-center gap-2">
                <input type="time" aria-label="Heure de début" {...register("startTime")} className={INPUT_SM} />
                <span className="text-muted">à</span>
                <input type="time" aria-label="Heure de fin" {...register("endTime")} className={INPUT_SM} />
              </div>
              {(errors.startTime || errors.endTime) && err("Horaires invalides")}
            </div>
          </div>
        </Panel>

        <section className="overflow-hidden rounded-[4px] bg-ink text-white">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="label-mono text-xs font-medium text-white/60">Tarif</h2>
          </div>
          <div className="px-5 py-4">
            {tarifPassage == null ? (
              <p className="text-sm text-white/70">Renseignez les adresses de la navette pour voir le tarif.</p>
            ) : (
              <>
                <div className="text-3xl font-extrabold leading-none tracking-tight">{tarifPassage} € TTC</div>
                <p className="mt-1 text-xs text-white/80">par passage, navette régulière</p>
                {tarif && tarif.legs.length > 1 && (
                  <ul className="mt-3 space-y-1 text-xs text-white/70">
                    {tarif.legs.map((l, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span>{l.label}</span>
                        <span className="tabular-nums">{l.price} €</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-white/60">
                  {watchDays?.length
                    ? `${watchDays.length} passage(s) par semaine, soit environ ${Math.round(tarifPassage * watchDays.length * 52 / 12)} € TTC par mois.`
                    : "Choisissez vos jours de passage pour voir le montant mensuel."}
                </p>
                <p className="mt-2 text-xs text-white/60">Enlèvement → livraison au forfait. À partir du 3e point (livraison ou retour au départ), chaque trajet est facturé au kilomètre.</p>
              </>
            )}
            {showZoneAlert && <UnservedAddressAlert className="mt-4 text-left" />}
            <button
              type="submit"
              disabled={isSubmitting || outOfZone}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-accent text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validation en cours…
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.75} />
                  {isEdit ? "Enregistrer les modifications" : "Valider la demande"}
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
