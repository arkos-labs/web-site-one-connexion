"use client";

import React, { useState, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Truck, MapPin, Clock, Plus, Trash2, ArrowRight, ShieldCheck, AlertTriangle, Loader2, Check } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
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

const stepSchema = z.object({
  address: z.string().min(5, "L'adresse est requise"),
  contactName: z.string().min(2, "Nom requis"),
  contactPhone: z.string().min(10, "Téléphone requis"),
  notes: z.string().optional(),
  volume: z.enum(["pli", "petit_colis", "sac_moyen", "gros_colis"], {
    errorMap: () => ({ message: "Veuillez choisir un volume" }),
  }),
});

const navetteSchema = z.object({
  type: z.enum(["distribution", "collecte"]),
  mainAddress: z.string().min(5, "L'adresse est requise"),
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
      const isDist = initialData.name?.includes("Distribution");
      const mappedSteps = isDist
        ? [
            ...(initialData.stops || []).map((s: any) => ({ ...s, volume: s.volume || "pli" })),
            { 
              address: initialData.dropoff_address || "", 
              contactName: initialData.dropoff_contact_name || "", 
              contactPhone: initialData.dropoff_contact_phone || "", 
              notes: initialData.dropoff_notes || "", 
              volume: "pli" 
            }
          ]
        : [
            { 
              address: initialData.pickup_address || "", 
              contactName: initialData.pickup_contact_name || "", 
              contactPhone: initialData.pickup_contact_phone || "", 
              notes: initialData.pickup_notes || "", 
              volume: "pli" 
            },
            ...(initialData.stops || []).map((s: any) => ({ ...s, volume: s.volume || "pli" }))
          ];

      return {
        type: isDist ? "distribution" : "collecte",
        mainAddress: isDist ? initialData.pickup_address : initialData.dropoff_address,
        mainContactName: isDist ? initialData.pickup_contact_name : initialData.dropoff_contact_name,
        mainContactPhone: isDist ? initialData.pickup_contact_phone : initialData.dropoff_contact_phone,
        mainNotes: isDist ? initialData.pickup_notes : initialData.dropoff_notes,
        steps: mappedSteps,
        selectedDays: initialData.days_of_week || ["mon", "tue", "wed", "thu", "fri"],
        startTime: initialData.start_time || "08:30",
        endTime: initialData.end_time || "12:00",
      };
    }
    return {
      type: "distribution",
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
    formState: { errors },
  } = useForm<NavetteFormValues>({
    resolver: zodResolver(navetteSchema),
    defaultValues: defaultValues as NavetteFormValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "steps",
  });

  const watchType = watch("type");
  const watchSteps = watch("steps");
  const watchDays = watch("selectedDays");

  const totalVolumePoints = useMemo(() => {
    return watchSteps.reduce((total, step) => {
      const vol = VOLUME_OPTIONS.find((v) => v.id === step.volume);
      return total + (vol?.points || 0);
    }, 0);
  }, [watchSteps]);

  const capacityExceeded = totalVolumePoints > SCOOTER_MAX_POINTS;

  const estimatedPrice = useMemo(() => {
    return Math.round(25 + (watchSteps.length * 15) + (totalVolumePoints * 0.8));
  }, [watchSteps.length, totalVolumePoints]);

  const onSubmit = async (data: NavetteFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const daysStr = data.selectedDays.map(d => DAYS.find(x => x.id === d)?.label).join(', ');

      const navettePayload = {
        user_id: user?.id || null,
        estimated_price: estimatedPrice,
        name: `Demande de Navette (${data.type === "distribution" ? "Distribution" : "Collecte"})`,
        pickup_address: data.type === "distribution" ? data.mainAddress : data.steps[0].address,
        pickup_contact_name: data.type === "distribution" ? data.mainContactName : data.steps[0].contactName,
        pickup_contact_phone: data.type === "distribution" ? data.mainContactPhone : data.steps[0].contactPhone,
        pickup_notes: data.type === "distribution" ? data.mainNotes : data.steps[0].notes,
        dropoff_address: data.type === "collecte" ? data.mainAddress : data.steps[data.steps.length - 1].address,
        dropoff_contact_name: data.type === "collecte" ? data.mainContactName : data.steps[data.steps.length - 1].contactName,
        dropoff_contact_phone: data.type === "collecte" ? data.mainContactPhone : data.steps[data.steps.length - 1].contactPhone,
        dropoff_notes: data.type === "collecte" ? data.mainNotes : data.steps[data.steps.length - 1].notes,
        days_of_week: data.selectedDays,
        days_str: daysStr,
        start_time: data.startTime,
        end_time: data.endTime,
        stops: data.type === "distribution" ? data.steps.slice(0, -1) : data.steps.slice(1),
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase.from("navettes").update(navettePayload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        // La navette reste en attente : One Connexion rappelle le client pour la confirmer
        const { error } = await supabase.from("navettes").insert({ ...navettePayload, status: "en_attente" });
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
    "[&_input]:h-11 [&_input]:rounded-lg [&_input]:bg-white [&_input]:py-0 [&_input]:pl-10 [&_input]:pr-3.5 [&_input]:font-medium [&_input]:focus:ring-2 [&_input]:focus:ring-accent/15";
  const err = (m?: string) => (m ? <span role="alert" className="mt-1 block text-xs font-medium text-red-600">{m}</span> : null);

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white px-6 py-14 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 ring-8 ring-green-50/60">
          <ShieldCheck size={28} />
        </span>
        <h2 className="mb-2 text-xl font-extrabold tracking-tight text-ink">
          {isEdit ? "Navette modifiée" : "Demande de navette envoyée"}
        </h2>
        <p className="mb-7 max-w-md text-sm leading-relaxed text-muted">
          {isEdit
            ? `Les modifications ont été prises en compte. Le nouveau tarif est de ${estimatedPrice} € HT par passage.`
            : `Un conseiller One Connexion vous rappellera très prochainement pour obtenir plus d'informations et confirmer votre navette. Tarif estimé : ${estimatedPrice} € HT par passage.`}
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        {/* Type */}
        <Panel title="Type de navette">
          <div role="radiogroup" className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {([
              { v: "distribution", name: "Distribution", text: "1 adresse de retrait fixe → plusieurs points de livraison.", icon: Truck },
              { v: "collecte", name: "Collecte", text: "Plusieurs points de retrait → 1 adresse de livraison finale.", icon: ArrowRight },
            ] as const).map(({ v, name, text, icon: Icon }) => {
              const selected = watchType === v;
              return (
                <label
                  key={v}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-accent/30 ${
                    selected ? "border-accent bg-accent/[0.03]" : "border-line bg-white hover:border-[#c9c5bd]"
                  }`}
                >
                  <input type="radio" value={v} {...register("type")} className="sr-only" />
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-accent text-white" : "bg-paper text-muted"}`}>
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-ink">{name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{text}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Panel>

        {/* Itinéraire */}
        <Panel title="Itinéraire" aside={<span className="text-xs font-semibold text-muted">{fields.length + 1} points</span>}>
          <div className="relative flex flex-col gap-5 px-5 py-5 pl-14">
            <span aria-hidden className="absolute bottom-8 left-[31px] top-8 border-l-2 border-dashed border-line" />

            {/* Adresse principale */}
            <div className="relative">
              <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-[10px] font-bold text-ink">A</span>
              <span className={LABEL}>{watchType === "distribution" ? "Adresse de retrait" : "Adresse de livraison finale"} <span className="text-accent">*</span></span>
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
                <span aria-hidden className="absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-label bg-white text-[10px] font-bold text-muted">{index + 1}</span>
                <div className="mb-2 flex h-6 items-center justify-between">
                  <span className={LABEL.replace("mb-1.5 block", "")}>
                    {watchType === "distribution" ? "Livraison" : "Collecte"} {index + 1} <span className="text-accent">*</span>
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
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
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#c9c5bd] text-xs font-bold text-muted transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent-dark"
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
          <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
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
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        isSelected ? "bg-ink text-white" : "bg-white text-muted ring-1 ring-line hover:ring-ink hover:text-ink"
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

        <section className="overflow-hidden rounded-xl bg-ink text-white">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="label-mono text-xs font-medium text-white/60">Tarif estimé</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold leading-none tracking-tight tabular-nums">{estimatedPrice} €</span>
              <span className="text-sm font-semibold text-white/60">HT / passage</span>
            </div>
            <p className="mt-2 text-xs text-white/60">{(estimatedPrice * 1.2).toFixed(2).replace(".", ",")} € TTC</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
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
