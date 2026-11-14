"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import GuestAccountBox from "@/components/GuestAccountBox";
import { clearOrderDraft } from "@/lib/order-draft";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  // Commande payée : plus besoin du brouillon gardé pour un éventuel retour arrière.
  useEffect(() => { clearOrderDraft(); }, []);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-paper-card rounded-[4px] p-8 shadow-sm border border-line text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-emerald-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h1 className="mb-3 text-3xl font-bold text-ink">
          Commande confirmée !
        </h1>
        
        <p className="text-muted text-lg mb-6">
          Votre paiement est validé, ou votre RIB est enregistré pour le règlement à 30 jours. Un coordinateur va vous contacter dans les 10 prochaines minutes pour confirmer l'enlèvement.
        </p>

        {orderId && (
          <div className="mb-8 inline-block rounded-[4px] border border-line bg-paper px-6 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-label mb-1">Code de suivi</p>
            <p className="text-lg font-extrabold text-ink">{orderId}</p>
          </div>
        )}

        {orderId && <GuestAccountBox trackingCode={orderId} />}

        <Link
          href="/"
          className="block w-full bg-black text-white px-8 py-3.5 rounded-[4px] font-semibold hover:bg-gray-800 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-muted font-semibold animate-pulse">Chargement de votre commande...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
