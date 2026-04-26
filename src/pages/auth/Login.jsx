import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
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
    <div className="min-h-screen flex font-body bg-cream">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-noir">
        {/* Background Subtle Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-noir via-noir to-[#ed5518]/10" />

        {/* Logo */}
        <Logo variant="light" size="lg" className="relative z-10" />

        {/* Center content */}
        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[#ed5518]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">
                Plateforme Logistique B2B
              </span>
            </div>
            <h2 className="text-6xl font-display text-white leading-[1.1]">
              Votre logistique,<br />
              <span className="italic text-[#ed5518]">enfin maîtrisée.</span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm font-light italic">
              L'excellence du transport urbain, pilotée par l'intelligence de demain.
            </p>
          </div>
          <ul className="space-y-6">
            {PERKS.map((p, i) => (
              <li key={i} className="flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#ed5518] border border-white/5 group-hover:border-[#ed5518] transition-all duration-300">
                  <p.icon size={18} />
                </div>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
          © {new Date().getFullYear()} One Connexion. Excellence & Fiabilité.
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:p-20 relative overflow-hidden">
        {/* Subtle decorative background (optional) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ed5518]/5 blur-3xl rounded-full"></div>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Logo size="lg" variant="dark" />
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display italic text-noir leading-none">Bon retour.</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px w-4 bg-noir/20"></div>
              <p className="text-noir/40 text-[10px] font-bold uppercase tracking-[0.2em]">Accédez à votre espace partenaire</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/40 ml-1">Identifiant Email</label>
              <input
                type="email"
                required
                placeholder="votre@entreprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/40">Mot de passe</label>
                <Link to="/forgot-password" size="sm" className="text-[9px] font-bold uppercase tracking-widest text-[#ed5518] hover:underline">Oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-noir/5 bg-white px-5 py-4 pr-14 text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 text-noir/20 hover:text-noir transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50 text-[11px] font-bold text-rose-600 uppercase tracking-widest leading-loose">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 rounded-xl bg-noir py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl transition-all hover:bg-[#ed5518] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Connexion Partenaire <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-10 flex items-center gap-6">
            <div className="flex-1 h-px bg-noir/5" />
            <span className="text-[9px] font-bold text-noir/20 uppercase tracking-[0.4em]">Alternative</span>
            <div className="flex-1 h-px bg-noir/5" />
          </div>

          <Link
            to="/commande-sans-compte"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-noir/10 bg-transparent py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-noir/60 hover:bg-white hover:text-noir hover:border-noir transition-all"
          >
            Commander sans compte
          </Link>

          <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-noir/30">
            Nouveau partenaire ?{" "}
            <Link to="/inscription" className="text-noir hover:text-[#ed5518] transition-colors underline underline-offset-4">
              Créer un compte pro
            </Link>
          </p>

          <div className="mt-10 pt-8 border-t border-noir/5">
            <div className="space-y-4">
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin + '/dashboard-client'
                    }
                  });
                  if (error) setError(error.message);
                }}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-noir/5 bg-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-noir/60 hover:border-noir/20 transition-all shadow-sm group"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Accès via Compte Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

