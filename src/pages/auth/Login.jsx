import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Package, FileText, MessageSquare, Loader2 } from "lucide-react";

const PERKS = [
  { icon: Package, text: "Commande en 3 clics depuis votre dashboard" },
  { icon: FileText, text: "Facture mensuelle unique & automatisée" },
  { icon: MessageSquare, text: "Suivi live & preuve de livraison (POD)" },
  { icon: CheckCircle2, text: "Dispatch disponible 24h/7j, week-ends inclus" },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      if (authError.message === "Invalid login credentials") {
        setError("Email ou mot de passe incorrect.");
      } else if (authError.message.includes("fetch")) {
        setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
      } else {
        setError(authError.message);
      }
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();

    if (profile?.role === 'courier') {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Accès refusé : les chauffeurs utilisent l'application mobile dédiée.");
      return;
    }

    setLoading(false);
    navigate(profile?.role === 'admin' ? '/admin' : '/dashboard-client');
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-100" />

        {/* Logo */}
        <Logo variant="light" size="lg" className="relative z-10" />

        {/* Center content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#ed5518]">
              Plateforme B2B
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Votre logistique,<br />
              <span className="text-[#ed5518] italic">enfin maîtrisée.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
              Gérez toutes vos expéditions depuis un seul espace. Simple, rapide, traçable.
            </p>
          </div>
          <ul className="space-y-4">
            {PERKS.map((p, i) => (
              <li key={i} className="flex items-center gap-4 text-sm font-medium text-slate-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#ed5518]">
                  <p.icon size={18} />
                </div>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-slate-600">
          © 2026 One Connexion. Tous droits réservés.
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex w-full flex-col items-center justify-center bg-white p-6 lg:w-1/2 lg:p-14">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Logo size="md" className="flex items-center gap-3 mb-10 lg:hidden" />

          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bon retour 👋</h1>
            <p className="mt-2 text-slate-500 text-sm">Connectez-vous à votre espace professionnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
              <input
                type="email"
                required
                placeholder="vous@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#ed5518] hover:text-[#ed5518] transition-colors">Oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all hover:bg-[#ed5518] hover:-translate-y-0.5 hover:shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Se connecter <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <Link
            to="/commande-sans-compte"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
          >
            Commander sans compte
          </Link>

          <p className="mt-8 text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="font-black text-slate-900 hover:text-[#ed5518] transition-colors hover:underline">
              Créer un compte pro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

