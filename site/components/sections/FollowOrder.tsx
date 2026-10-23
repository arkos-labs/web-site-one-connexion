"use client";
/**
 * components/sections/FollowOrder.tsx
 * Page ouverte par « Suivre ma commande » dans l'e-mail de confirmation (app/api/orders/follow) :
 *  - déjà connecté avec le bon compte → suivi de la course ;
 *  - compte sans mot de passe → le client en choisit un, puis arrive sur le suivi ;
 *  - compte avec mot de passe → le client le tape, puis arrive sur le suivi.
 */
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markPasswordSet } from "@/lib/password-set";

type State =
  | { kind: "loading" }
  | { kind: "set-password"; email: string; orderId: string; tokenHash: string }
  | { kind: "login"; email: string }
  | { kind: "other-account"; email: string }
  | { kind: "error"; message: string };

const INPUT =
  "w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-11 text-[14px] text-ink placeholder:text-label/60 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";
const BUTTON =
  "flex w-full items-center justify-center gap-2 rounded-[6px] bg-accent py-4 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60";

export default function FollowOrder({ trackingCode, token }: { trackingCode: string; token: string }) {
  const supabase = createClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const goToTracking = (orderId: string) => {
    window.location.href = `/dashboard/suivi/${orderId}`;
  };

  // Demande au serveur où envoyer le client (le cookie de session part avec la requête).
  const ask = useCallback(async () => {
    const res = await fetch("/api/orders/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingCode, token }),
    }).catch(() => null);
    return res ? await res.json().catch(() => ({})) : {};
  }, [trackingCode, token]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apply = (data: any) => {
    if (data.orderId && !data.mode) return goToTracking(data.orderId);
    if (data.mode === "set-password") return setState({ kind: "set-password", email: data.email, orderId: data.orderId, tokenHash: data.tokenHash });
    if (data.mode === "login") return setState({ kind: "login", email: data.email });
    if (data.mode === "other-account") return setState({ kind: "other-account", email: data.email });
    setState({
      kind: "error",
      message: data.expired
        ? "Ce lien a expiré. Connectez-vous à votre espace client pour suivre vos courses."
        : data.error === "Lien invalide."
          ? "Ce lien de suivi n'est pas valide. Vérifiez que vous avez ouvert le lien complet reçu par e-mail."
          : "Le suivi est indisponible pour le moment. Réessayez dans un instant.",
    });
  };
  const resolve = async () => apply(await ask());

  useEffect(() => {
    let cancelled = false;
    ask().then((data) => { if (!cancelled) apply(data); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  const choosePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "set-password") return;
    if (password.length < 8) { setError("8 caractères minimum."); return; }
    setBusy(true);
    setError("");
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: state.tokenHash, type: "magiclink" });
    if (otpError) {
      setBusy(false);
      setError("Lien expiré. Rechargez la page pour réessayer.");
      return;
    }
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      setBusy(false);
      setError(pwError.message.includes("weak") ? "Mot de passe trop simple." : "Mot de passe non enregistré, réessayez.");
      return;
    }
    await markPasswordSet();
    goToTracking(state.orderId);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind !== "login" || !password) return;
    setBusy(true);
    setError("");
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: state.email, password });
    if (loginError) { setBusy(false); setError("Mot de passe incorrect."); return; }
    await resolve();
    setBusy(false);
  };

  const switchAccount = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setState({ kind: "loading" });
    resolve();
  };

  const passwordField = (autoComplete: string, placeholder: string) => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
        <Lock size={16} strokeWidth={1.5} />
      </div>
      <input
        id="follow-password"
        type={showPwd ? "text" : "password"}
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(""); }}
        className={INPUT}
      />
      <button
        type="button"
        onClick={() => setShowPwd((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-label transition-colors hover:text-ink"
        aria-label={showPwd ? "Masquer" : "Afficher"}
      >
        {showPwd ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-paper px-[clamp(20px,5vw,72px)] py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Suivi de commande</div>
        <h1 className="mb-2 text-[clamp(26px,3.5vw,36px)] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
          Suivre ma commande
        </h1>
        <p className="mb-6 font-mono text-[15px] font-bold tracking-wider text-ink">{trackingCode}</p>

        {state.kind === "loading" && (
          <p className="flex items-center gap-2 text-[14px] text-muted">
            <Loader2 size={16} className="animate-spin" /> Ouverture de votre suivi…
          </p>
        )}

        {state.kind === "set-password" && (
          <form className="flex flex-col gap-4" onSubmit={choosePassword}>
            <p className="text-[15px] leading-relaxed text-muted">
              Votre espace client est prêt pour <strong className="text-ink">{state.email}</strong>. Choisissez un mot de passe
              pour suivre cette course et retrouver toutes vos commandes.
            </p>
            <input type="email" value={state.email} autoComplete="username" readOnly hidden />
            <label htmlFor="follow-password" className="text-[12px] font-bold uppercase tracking-wider text-ink">Mot de passe</label>
            {passwordField("new-password", "Min. 8 caractères")}
            {error && <p role="alert" className="text-[13px] font-semibold text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className={BUTTON}>
              {busy ? <Loader2 size={17} className="animate-spin" /> : <MapPin size={17} />}
              Enregistrer et suivre ma commande
            </button>
          </form>
        )}

        {state.kind === "login" && (
          <form className="flex flex-col gap-4" onSubmit={login}>
            <p className="text-[15px] leading-relaxed text-muted">
              Entrez le mot de passe de <strong className="text-ink">{state.email}</strong> pour suivre votre course.
            </p>
            <input type="email" value={state.email} autoComplete="username" readOnly hidden />
            <label htmlFor="follow-password" className="text-[12px] font-bold uppercase tracking-wider text-ink">Mot de passe</label>
            {passwordField("current-password", "Votre mot de passe")}
            {error && <p role="alert" className="text-[13px] font-semibold text-red-600">{error}</p>}
            <button type="submit" disabled={busy || !password} className={BUTTON}>
              {busy ? <Loader2 size={17} className="animate-spin" /> : <MapPin size={17} />}
              Suivre ma commande
            </button>
            <Link href="/mot-de-passe-oublie" className="text-center text-[13px] font-semibold text-muted hover:text-ink hover:underline">
              Mot de passe oublié ?
            </Link>
          </form>
        )}

        {state.kind === "other-account" && (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] leading-relaxed text-muted">
              Vous êtes connecté avec <strong className="text-ink">{state.email}</strong>, mais cette commande est rattachée à une
              autre adresse. Déconnectez-vous pour la suivre avec le bon compte.
            </p>
            <button type="button" onClick={switchAccount} disabled={busy} className={BUTTON}>
              {busy && <Loader2 size={17} className="animate-spin" />}
              Changer de compte
            </button>
            <Link href="/dashboard" className="text-center text-[13px] font-semibold text-muted hover:text-ink hover:underline">
              Rester sur mon espace
            </Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col gap-4">
            <p className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">{state.message}</p>
            <Link href="/connexion" className={BUTTON}>
              Me connecter
              <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
