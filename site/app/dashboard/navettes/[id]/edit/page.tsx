"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NavetteRequestForm } from "@/components/dashboard/NavetteRequestForm";
import { PageShell, ErrorState, LoadingState } from "@/components/dashboard/ui";

export default function EditNavettePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const supabase = createClient();

  const [navette, setNavette] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInProgressToday, setIsInProgressToday] = useState(false);

  useEffect(() => {
    const loadNavette = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
          const todayIso = new Date().toISOString().slice(0, 10);
          const todayStr = new Date().toDateString();

          const isDispatchedToday = data.driver_id && data.last_dispatch_date === todayIso;
          const lastCompletedAt = data.point_progress?.last_completed_at;
          const isCompletedToday = lastCompletedAt && new Date(lastCompletedAt).toDateString() === todayStr;

          if (isDispatchedToday && !isCompletedToday) {
            setIsInProgressToday(true);
          }

          setNavette(data);
        }
      } catch (err) {
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadNavette();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const back = { href: `/dashboard/navettes/${id}`, label: "Retour à la navette" };

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white">
        <LoadingState text="Chargement de la navette…" />
      </div>
    );
  }

  if (error || !navette) {
    return <ErrorState text={error || "Navette non trouvée"} back={back} />;
  }

  if (isInProgressToday) {
    return (
      <PageShell back={back} eyebrow="Navette récurrente" title="Modification impossible" subtitle="Cette navette est en cours de livraison aujourd'hui.">
        <div className="flex flex-col items-center gap-4 bg-paper-card px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle size={26} />
          </span>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Cette navette est en cours de livraison par un chauffeur pour aujourd&apos;hui. Afin de ne pas perturber la
            tournée en cours, veuillez patienter jusqu&apos;à la fin de la livraison pour la modifier.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      back={back}
      eyebrow="Navette récurrente"
      title="Modifier la navette"
      subtitle="Le tarif sera automatiquement recalculé en fonction des nouvelles adresses ou du volume."
    >
      <div className="bg-paper-card p-4 sm:p-6">
        <NavetteRequestForm initialData={navette} isEdit={true} />
      </div>
    </PageShell>
  );
}
