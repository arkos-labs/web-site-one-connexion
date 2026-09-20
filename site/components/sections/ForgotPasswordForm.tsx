"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, AtSign, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });

    setLoading(false);
    // Réponse identique que le compte existe ou non : on ne révèle pas quelles adresses sont inscrites.
    if (error && error.status === 429) {
      setError("Trop de demandes. Réessayez dans quelques minutes.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-paper px-[clamp(20px,5vw,72px)] py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Espace client sécurisé</div>
        <h1 className="mb-3 text-[clamp(26px,3.5vw,36px)] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
          Mot de passe oublié ?
        </h1>

        {sent ? (
          <div className="mt-6 flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-[6px] border border-green-200 bg-green-50 px-4 py-3.5 text-[14px] text-green-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" strokeWidth={2.25} />
              <p>
                Si un compte existe pour <strong>{email}</strong>, un email vient d&apos;être envoyé avec un lien pour choisir un nouveau
                mot de passe. Pensez à vérifier vos courriers indésirables.
              </p>
            </div>
            <p className="text-[13px] text-muted">
              Ouvrez le lien depuis le même navigateur que celui utilisé pour cette demande.
            </p>
            <Link href="/connexion" className="text-[13px] font-bold text-accent hover:text-accent-dark hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-[15px] text-muted">
              Saisissez l&apos;adresse email de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-[12px] font-bold uppercase tracking-wider text-ink">
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
                    <AtSign size={16} strokeWidth={1.5} />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="contact@votre-entreprise.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-4 text-[14px] text-ink placeholder:text-label/60 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-2 rounded-[6px] bg-accent py-4 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
              >
                {loading ? "Envoi en cours…" : "Recevoir le lien"}
                {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-muted">
              <Link href="/connexion" className="font-bold text-accent hover:text-accent-dark hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
