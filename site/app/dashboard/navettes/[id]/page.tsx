"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Trash2, Check, Phone, User, Clock, Camera, Pencil, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageShell, DetailBody, Panel, Fact, NoteBox, StatusPill, ErrorState, LoadingState } from "@/components/dashboard/ui";

const DAYS = [
  { id: "mon", fr: "lundi", label: "L", full: "Lun" },
  { id: "tue", fr: "mardi", label: "M", full: "Mar" },
  { id: "wed", fr: "mercredi", label: "M", full: "Mer" },
  { id: "thu", fr: "jeudi", label: "J", full: "Jeu" },
  { id: "fri", fr: "vendredi", label: "V", full: "Ven" },
  { id: "sat", fr: "samedi", label: "S", full: "Sam" },
  { id: "sun", fr: "dimanche", label: "D", full: "Dim" },
];

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function NavetteDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const supabase = createClient();
  const [navette, setNavette] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    const loadNavette = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Non authentifié");
          setLoading(false);
          return;
        }

        const { data, error: err } = await supabase
          .from("navettes")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (err) {
          setError("Navette non trouvée");
        } else {
          setNavette(data);
        }
      } catch {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadNavette();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleStatus = async () => {
    if (!navette) return;
    setTogglingStatus(true);
    try {
      const newStatus = navette.status === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("navettes")
        .update({ status: newStatus })
        .eq("id", navette.id);
      if (error) setError("Erreur lors de la mise à jour");
      else setNavette({ ...navette, status: newStatus });
    } catch {
      setError("Erreur inattendue");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!navette || !confirm("Supprimer définitivement cette navette ?"))
      return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("navettes")
        .delete()
        .eq("id", navette.id);
      if (error) setError("Erreur lors de la suppression");
      else router.push("/dashboard/navettes");
    } catch {
      setError("Erreur inattendue");
    } finally {
      setDeleting(false);
    }
  };

  const back = { href: "/dashboard/navettes", label: "Navettes récurrentes" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la navette…" />
      </div>
    );
  }

  if (error || !navette) {
    return <ErrorState text={error || "Navette non trouvée"} back={{ href: back.href, label: "Retour aux navettes" }} />;
  }

  const stops =
    Array.isArray(navette.stops)
      ? navette.stops
      : typeof navette.stops === "string"
        ? (() => {
            try {
              const p = JSON.parse(navette.stops);
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          })()
        : [];

  // Les jours sont enregistrés sous forme d'identifiants (mon, tue…) et d'un
  // texte abrégé ; on accepte aussi d'anciens enregistrements en toutes lettres.
  const dayIds: string[] = Array.isArray(navette.days_of_week) ? navette.days_of_week : [];
  const dayNames: string[] = navette.days_str ? navette.days_str.split(",").map((d: string) => d.trim().toLowerCase()) : [];
  const isDayActive = (d: (typeof DAYS)[number]) => dayIds.includes(d.id) || dayNames.includes(d.fr);

  const hm = (t?: string) => (t ? String(t).slice(0, 5) : t);
  const isActive = navette.status === "active";
  const isPending = navette.status === "en_attente";

  const renderProgress = (index: number) => {
    const pData = navette?.point_progress?.[index] || {};
    const isPickedUp = !!pData.pickedUpAt;
    const isDelivered = !!pData.deliveredAt;
    const photoUrl = pData.photoUrl;

    if (!isPickedUp && !isDelivered && !photoUrl) return null;

    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {isPickedUp && !isDelivered && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
            <Clock size={11} />
            Enlevé {hhmm(pData.pickedUpAt)}
          </span>
        )}
        {isDelivered && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
            <Check size={11} strokeWidth={3} />
            Livré {hhmm(pData.deliveredAt)}
          </span>
        )}
        {photoUrl && (
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <Camera size={11} />
            Voir la photo
          </a>
        )}
        {(pData.pickupRecipient || pData.pickupDescription) && (
          <div className="w-full">
            <NoteBox>
              {pData.pickupRecipient && <Fact k="Remis par">{pData.pickupRecipient}</Fact>}
              {pData.pickupDescription && <Fact k="Récupéré">{pData.pickupDescription}</Fact>}
            </NoteBox>
          </div>
        )}
        {isDelivered && (pData.deliveryRecipient || pData.deliveryDepartment || navette?.delivery_recipient || navette?.delivery_department) && (
          <div className="w-full">
            <NoteBox tone="success">
              {(pData.deliveryRecipient || navette?.delivery_recipient) && (
                <Fact k="Réceptionné par" tone="success">{pData.deliveryRecipient || navette.delivery_recipient}</Fact>
              )}
              {(pData.deliveryDepartment || navette?.delivery_department) && (
                <Fact k="Lieu / service" tone="success">{pData.deliveryDepartment || navette.delivery_department}</Fact>
              )}
              {(pData.deliveryComment || navette?.delivery_comment) && (
                <p className="text-xs italic text-muted">{pData.deliveryComment || navette.delivery_comment}</p>
              )}
            </NoteBox>
          </div>
        )}
      </div>
    );
  };

  const points: {
    label: string;
    kind: "start" | "stop" | "end";
    address: string;
    contactName?: string;
    contactPhone?: string;
    notes?: string;
    progressIndex: number;
  }[] = [
    { label: "Enlèvement", kind: "start", address: navette.pickup_address, contactName: navette.pickup_contact_name, contactPhone: navette.pickup_contact_phone, notes: navette.pickup_notes, progressIndex: 0 },
    ...stops.map((stop: any, i: number) => ({
      label: `Étape ${i + 1}`,
      kind: "stop" as const,
      address: stop.address,
      contactName: stop.contactName,
      contactPhone: stop.contactPhone,
      notes: stop.notes,
      progressIndex: i + 1,
    })),
    { label: "Livraison", kind: "end", address: navette.dropoff_address, contactName: navette.dropoff_contact_name, contactPhone: navette.dropoff_contact_phone, notes: navette.dropoff_notes, progressIndex: stops.length + 1 },
  ];

  const btnDark =
    "flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/[0.07] px-4 text-sm font-bold text-white transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50";

  return (
    <PageShell
      back={back}
      eyebrow="Navette récurrente"
      title={
        <>
          <span>{navette.name}</span>
          <StatusPill tone={isActive ? "green" : isPending ? "amber" : "gray"}>
            {isActive ? "Active" : isPending ? "En attente" : "Inactive"}
          </StatusPill>
        </>
      }
      subtitle={`Créée le ${new Date(navette.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
      actions={
        <>
          {isPending ? (
            <span className="max-w-[260px] rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-snug text-amber-800">
              En attente de confirmation — One Connexion va vous rappeler
            </span>
          ) : (
            <button type="button" onClick={handleToggleStatus} disabled={togglingStatus} className={btnDark}>
              <RefreshCw size={15} className={togglingStatus ? "animate-spin" : ""} />
              {isActive ? "Désactiver" : "Activer"}
            </button>
          )}
          <Link href={`/dashboard/navettes/${navette.id}/edit`} className={btnDark}>
            <Pencil size={15} />
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Supprimer
          </button>
        </>
      }
    >
      <DetailBody
        main={
          <>
            <Panel title="Itinéraire complet" aside={<span className="text-xs font-semibold text-muted">{points.length} points</span>}>
              <ol className="relative flex flex-col gap-5 px-5 py-5 pl-14">
                <span aria-hidden className="absolute bottom-8 left-[31px] top-8 border-l-2 border-dashed border-line" />
                {points.map((pt, i) => (
                  <li key={i} className="relative">
                    <span
                      aria-hidden
                      className={`absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                        pt.kind === "end"
                          ? "border-accent bg-accent text-white"
                          : pt.kind === "start"
                          ? "border-ink bg-white text-ink"
                          : "border-label bg-white text-muted"
                      }`}
                    >
                      {pt.kind === "start" ? "A" : pt.kind === "end" ? "B" : i}
                    </span>
                    <div className="label-mono text-[10.5px] font-medium text-muted">{pt.label}</div>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{pt.address}</p>
                    {(pt.contactName || pt.contactPhone) && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted">
                        {pt.contactName && <span className="inline-flex items-center gap-1.5"><User size={12} className="text-label" />{pt.contactName}</span>}
                        {pt.contactPhone && <span className="inline-flex items-center gap-1.5"><Phone size={12} className="text-label" />{pt.contactPhone}</span>}
                      </p>
                    )}
                    {pt.notes && <p className="mt-1 text-xs italic text-muted">{pt.notes}</p>}
                    {renderProgress(pt.progressIndex)}
                  </li>
                ))}
              </ol>
            </Panel>

            {navette.delivered_at && (
              <Panel
                tone="success"
                title="Dernière livraison"
                aside={
                  <span className="text-xs font-bold text-green-700">
                    {new Date(navette.delivered_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à {hhmm(navette.delivered_at)}
                  </span>
                }
              >
                <div className="flex flex-col gap-2 px-5 py-4">
                  {navette.delivery_recipient && <Fact k="Réceptionné par" tone="success">{navette.delivery_recipient}</Fact>}
                  {navette.delivery_department && <Fact k="Lieu / service" tone="success">{navette.delivery_department}</Fact>}
                  {navette.delivery_comment && <p className="text-sm italic text-muted">{navette.delivery_comment}</p>}
                  {navette.delivery_photo_url && (
                    <a href={navette.delivery_photo_url} target="_blank" rel="noreferrer" className="inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={navette.delivery_photo_url} alt="Photo de livraison" className="h-28 rounded-lg border border-line object-cover" />
                    </a>
                  )}
                </div>
              </Panel>
            )}
          </>
        }
        side={
          <>
            <section className="overflow-hidden rounded-xl bg-ink text-white">
              <div className="border-b border-white/10 px-5 py-3">
                <h2 className="label-mono text-xs font-medium text-white/60">Tarif estimé</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold leading-none tracking-tight tabular-nums">{navette.estimated_price ?? "—"}</span>
                  {navette.estimated_price != null && <span className="text-sm font-semibold text-white/60">€ HT / passage</span>}
                </div>
                {navette.estimated_price != null && (
                  <p className="mt-2 text-xs text-white/60">{(Number(navette.estimated_price) * 1.2).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € TTC</p>
                )}
              </div>
            </section>

            <Panel title="Planning">
              <div className="flex flex-col gap-4 px-5 py-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted">Jours de passage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <span
                        key={d.id}
                        title={d.fr}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                          isDayActive(d) ? "bg-ink text-white" : "bg-paper-card text-label ring-1 ring-line"
                        }`}
                      >
                        {d.full}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted">Créneau horaire</p>
                  <p className="inline-flex items-center gap-2 text-base font-extrabold tabular-nums text-ink">
                    <Clock size={15} className="text-label" />
                    {hm(navette.start_time) || "08:30"} – {hm(navette.end_time) || "12:00"}
                  </p>
                </div>
              </div>
            </Panel>
          </>
        }
      />
    </PageShell>
  );
}
