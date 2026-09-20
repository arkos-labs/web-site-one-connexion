"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-emerald-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Commande confirmée !
        </h1>
        
        <p className="text-gray-500 text-lg mb-6">
          Votre paiement a bien été traité (ou votre carte enregistrée). Un dispatcheur va vous contacter dans les plus brefs délais pour confirmer l'enlèvement.
        </p>

        {orderId && (
          <div className="mb-8 inline-block rounded-xl border border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">ID Commande</p>
            <p className="text-lg font-extrabold text-gray-900">{orderId}</p>
          </div>
        )}

        <Link
          href="/"
          className="block w-full bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
