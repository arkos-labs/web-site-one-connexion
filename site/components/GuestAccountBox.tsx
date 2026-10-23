"use client";
/**
 * components/GuestAccountBox.tsx
 * Après une commande sans compte : le compte client est créé avec l'e-mail de la commande
 * (/api/orders/guest-account). Le client choisit un mot de passe et « Suivre ma course »
 * le connecte et ouvre le suivi de sa course.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markPasswordSet } from "@/lib/password-set";

type State =
  | { kind: "loading" }
  | { kind: "logged-in"; orderId: string | null }
  | { kind: "created"; email: string; orderId: string; tokenHash: string }
  | { kind: "existing"; email: string }
  | { kind: "none" };

export default function GuestAccountBox({ trackingCode }: { trackingCode: string }) {
  const supabase = createClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Déjà connecté : la course est à lui (ou rattachable si même e-mail) → lien vers sa fiche.
        const res = await fetch("/api/orders/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingCode }),
        }).catch(() => null);
        const data = res ? await res.json().catch(() => ({})) : {};
        if (!cancelled) setState({ kind: "logged-in", orderId: data.orderId ?? null });
        return;
      }
      const res = await fetch("/api/orders/guest-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode }),
      }).catch(() => null);
      const data = res ? await res.json().catch(() => ({})) : {};
      if (cancelled) return;
      if (data.created) setState({ kind: "created", email: data.email, orderId: data.orderId, tokenHash: data.tokenHash });
      else if (data.existing && data.email) setState({ kind: "existing", email: data.email });
      else setState({ kind: "none" });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode]);

  const follow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "created") return;
    if (password.length < 8) { setError("8 caractères minimum."); return; }
    setBusy(true);
    setError("");
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: state.tokenHash, type: "magiclink" });
    if (otpError) { setBusy(false); setError("Lien expiré. Connectez-vous avec « Mot de passe oublié »."); return; }
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) { setBusy(false); setError(pwError.message.includes("weak") ? "Mot de passe trop simple." : "Mot de passe non enregistré, réessayez."); return; }
    await markPasswordSet();
    window.location.href = `/dashboard/suivi/${state.orderId}`;
  };

  // Compte déjà existant : le client entre seulement son mot de passe, puis la course est rattachée.
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "existing" || !password) return;
    setBusy(true);
    setError("");
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: state.email, password });
    if (loginError) { setBusy(false); setError("Mot de passe incorrect."); return; }
    const res = await fetch("/api/orders/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    window.location.href = data.orderId ? `/dashboard/suivi/${data.orderId}` : "/dashboard/suivi";
  };

  if (state.kind === "loading") {
    return (
      <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" /> Création de votre espace de suivi…
      </div>
    );
  }

  if (state.kind === "logged-in") {
    return (
      <Link href={state.orderId ? `/dashboard/suivi/${state.orderId}` : "/dashboard/suivi"} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black">
        <MapPin size={16} /> Suivre ma course
      </Link>
    );
  }

  if (state.kind === "existing") {
    return (
      <form onSubmit={login} className="mb-6 rounded-xl border border-orange-100 bg-orange-50/60 p-4 text-left">
        <p className="text-sm font-bold text-ink">Vous avez déjà un compte</p>
        <p className="mt-1 text-sm text-gray-600">
          Entrez le mot de passe de <strong>{state.email}</strong> pour suivre votre course.
        </p>
        <input type="email" value={state.email} autoComplete="username" readOnly hidden />
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          autoComplete="current-password"
          placeholder="Mot de passe"
          aria-label="Mot de passe"
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          Suivre ma course
        </button>
        <Link href="/mot-de-passe-oublie" className="mt-2 block text-center text-xs font-semibold text-gray-500 hover:text-ink hover:underline">
          Mot de passe oublié ?
        </Link>
      </form>
    );
  }

  if (state.kind === "none") return null;

  return (
    <form onSubmit={follow} className="mb-6 rounded-xl border border-orange-100 bg-orange-50/60 p-4 text-left">
      <p className="text-sm font-bold text-ink">Votre compte a été créé</p>
      <p className="mt-1 text-sm text-gray-600">
        Il est rattaché à <strong>{state.email}</strong> et vous permet de suivre votre course en direct.
        Choisissez un mot de passe pour vous y connecter plus tard.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(""); }}
        autoComplete="new-password"
        minLength={8}
        placeholder="Mot de passe (8 caractères minimum)"
        aria-label="Mot de passe"
        className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white hover:bg-black disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        Suivre ma course
      </button>
    </form>
  );
}
