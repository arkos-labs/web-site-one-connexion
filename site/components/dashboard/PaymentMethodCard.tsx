"use client";
/**
 * Moyen de paiement enregistré (carte ou RIB) : affichage, ajout via la page Stripe sécurisée, retrait.
 * Une fois enregistré, les commandes sont réglées en 1 clic, sans repasser par Stripe.
 */
import { useEffect, useState } from "react";
import { CreditCard, Landmark, Loader2, Plus, Trash2 } from "lucide-react";
import { fetchSavedMethod, type SavedMethod } from "@/lib/saved-payment";

export default function PaymentMethodCard({ cardOnly = false }: { cardOnly?: boolean }) {
  const [method, setMethod] = useState<SavedMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedMethod().then((m) => { setMethod(m); setLoading(false); });
  }, []);

  const add = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/payment-method", { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (data.url) { window.location.href = data.url; return; }
    setBusy(false);
    setError("Impossible d'ouvrir la page d'enregistrement. Réessayez.");
  };

  const remove = async () => {
    if (!confirm("Retirer ce moyen de paiement ? Vos prochaines commandes passeront par la page de paiement.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/payment-method", { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (res?.ok) setMethod(null);
    else setError("Retrait impossible. Réessayez.");
  };

  const Icon = method?.type === "sepa_debit" ? Landmark : CreditCard;

  return (
    <div className="rounded-xl border border-line bg-paper-card p-5">
      <h3 className="text-sm font-extrabold text-ink">Moyen de paiement</h3>
      {loading ? (
        <p className="mt-2 flex items-center gap-2 text-[13px] text-muted"><Loader2 size={14} className="animate-spin" /> Chargement…</p>
      ) : method ? (
        <>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-ink"><Icon size={18} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink">{method.label}</div>
              {method.detail && <div className="text-xs text-muted">{method.detail}</div>}
            </div>
            <button type="button" onClick={remove} disabled={busy} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 size={14} /> Retirer
            </button>
          </div>
          <p className="mt-2 text-[13px] text-muted">Vos commandes sont réglées en 1 clic avec ce moyen de paiement, sans repasser par la page de paiement.</p>
          <button type="button" onClick={add} disabled={busy} className="mt-3 text-[13px] font-semibold text-accent-dark hover:underline disabled:opacity-50">
            {cardOnly ? "Remplacer par une autre carte" : "Remplacer par une autre carte ou un autre RIB"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-[13px] text-muted">
            {cardOnly
              ? "Enregistrez une carte bancaire : vos prochaines commandes seront réglées en 1 clic."
              : "Enregistrez une carte bancaire ou un RIB (prélèvement) : vos prochaines commandes seront réglées en 1 clic."}
          </p>
          <button type="button" onClick={add} disabled={busy} className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white hover:bg-[#25272a] disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {cardOnly ? "Ajouter une carte" : "Ajouter une carte ou un RIB"}
          </button>
        </>
      )}
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
