"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AtSign,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PERKS = [
  { title: "Commander en quelques clics", sub: "Course flash prise en charge en moins de 45 min." },
  { title: "Suivi GPS en temps réel", sub: "Localisation live du coursier et preuve de signature." },
  { title: "Factures & reporting centralisé", sub: "Relevés mensuels détaillés par centre de coût." },
  { title: "Dispatch 7j/7 · 7h–23h", sub: "Un régulateur dédié, joignable en permanence." },
];

export default function AuthForm() {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else if (authData.user) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
        
      if (profile?.role === "admin" || authData.user.email === "cherkinicolas@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-paper">
      <div className="mx-auto grid max-w-[1240px] min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-2">

        {/* ── Colonne gauche : Formulaire ── */}
        <div className="flex flex-col justify-center px-[clamp(20px,5vw,72px)] py-8 lg:py-16">

          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Espace client sécurisé
          </div>
          <h1 className="mb-3 text-[clamp(28px,3.5vw,40px)] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
            Connectez-vous à votre compte.
          </h1>
          <p className="mb-6 text-[15px] text-muted">
            Gérez vos courses, suivez vos livraisons et accédez à vos factures.
          </p>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-ink">
                Email professionnel
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
                  <AtSign size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  placeholder="contact@votre-entreprise.fr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-4 text-[14px] text-ink placeholder:text-label/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold uppercase tracking-wider text-ink">Mot de passe</label>
                <Link href="#" className="text-[12px] font-semibold text-accent hover:text-accent-dark hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-label">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[6px] border border-line bg-white py-3.5 pl-11 pr-11 text-[14px] text-ink placeholder:text-label/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-label hover:text-ink transition-colors"
                  aria-label={showPwd ? "Masquer" : "Afficher"}
                >
                  {showPwd ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex items-center justify-center gap-2 rounded-[6px] bg-accent py-4 text-[14px] font-bold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
            >
              {loading ? "Connexion en cours…" : "Se connecter"}
              {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
            </button>
          </form>



          <p className="mt-8 text-center text-[13px] text-muted">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-bold text-accent hover:text-accent-dark hover:underline">
              Créer un compte entreprise
            </Link>
          </p>

          {/* Badges sécurité */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-8">
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <ShieldCheck size={14} className="text-green-600" strokeWidth={2.5} />
              SSL 256-bit
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <CheckCircle2 size={14} className="text-green-600" strokeWidth={2.5} />
              Données hébergées en France
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <CheckCircle2 size={14} className="text-green-600" strokeWidth={2.5} />
              Conforme RGPD
            </div>
          </div>
        </div>

        {/* ── Colonne droite : bénéfices ── */}
        <div className="hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between px-[clamp(40px,6vw,80px)] py-16">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Pourquoi ONE CONNEXION
            </div>
            <h2 className="mb-10 text-[clamp(22px,2.5vw,32px)] font-bold leading-[1.2] tracking-[-0.02em]">
              Votre logistique express, pilotée depuis un seul endroit.
            </h2>

            <div className="flex flex-col gap-6">
              {PERKS.map((p, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <CheckCircle2 size={13} className="text-accent" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-white">{p.title}</p>
                    <p className="mt-0.5 text-[13px] text-white/55">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Témoignage */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" strokeWidth={0} />
              ))}
            </div>
            <p className="mb-4 text-[14px] leading-[1.7] text-white/75 italic">
              "One Connexion est devenu notre prestataire exclusif pour tous les dépôts urgents en juridiction. Fiabilité et ponctualité irréprochables depuis 3 ans."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                CF
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Maître Claire Fontaine</p>
                <p className="text-[11px] text-white/50">Cabinet Fontaine &amp; Moreau — Paris 8e</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
