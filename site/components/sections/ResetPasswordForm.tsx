"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";

export default function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Le client Supabase échange automatiquement le lien de l'email contre une session ;
  // getSession() attend la fin de cet échange, puis getUser() vérifie la session côté serveur
  // (une session périmée restée dans le navigateur ne doit pas ouvrir le formulaire).
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setStatus("invalid");
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (active) setStatus(userData.user ? "ready" : "invalid");
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(
        error.message.toLowerCase().includes("different")
          ? "Choisissez un mot de passe différent de l'ancien."
          : "Impossible de modifier le mot de passe. Le lien a peut-être expiré : refaites une demande."
      );
      setLoading(false);
      return;
    }
    // /connexion redirige un utilisateur connecté vers son espace (client ou admin).
    router.push("/connexion");
    router.refresh();
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-paper px-[clamp(20px,5vw,72px)] py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Espace client sécurisé</div>
        <h1 className="mb-3 text-[clamp(26px,3.5vw,36px)] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
          Nouveau mot de passe
        </h1>

        {status === "checking" && <p className="mt-6 text-[14px] text-muted">Vérification du lien…</p>}

        {status === "invalid" && (
          <div className="mt-6 flex flex-col gap-4">
            <p className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
              Ce lien est invalide ou a expiré. Les liens de réinitialisation ne sont valables que peu de temps et une seule fois, et doivent
              être ouverts dans le même navigateur que celui de la demande.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="flex items-center justify-center gap-2 rounded-[6px] bg-accent py-4 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark"
            >
              Demander un nouveau lien
              <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <p className="mb-6 text-[15px] text-muted">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-[12px] font-bold uppercase tracking-wider text-ink">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
                    <Lock size={16} strokeWidth={1.5} />
                  </div>
                  <input
                    id="new-password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Min. 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-11 text-[14px] text-ink placeholder:text-label/60 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-[12px] font-bold uppercase tracking-wider text-ink">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
                    <Lock size={16} strokeWidth={1.5} />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-4 text-[14px] text-ink transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
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
                {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
                {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
