import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import PublicHeader from "../components/PublicHeader.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="flex min-h-[calc(100vh-96px)] w-full">
        {/* Left Panel - Branding & Vision */}
        <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-12 text-white lg:flex relative overflow-hidden">
          {/* Photo Background */}
          <div className="absolute inset-0">
            <img src="/connexion-hero.jpg" alt="Livraison" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-slate-950/55"></div>

          {/* Brand moved to header */}

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
            <div className="max-w-lg space-y-8">
              <blockquote className="text-2xl font-medium leading-relaxed text-slate-200">
                "La plateforme de référence pour automatiser vos flux logistiques. Simple, rapide et conforme."
              </blockquote>

              <ul className="space-y-4">
                {[
                  " des livraisons en ",
                  "Facturation 100% automatisée",
                  "Service client dédié 24/7"
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-center gap-3 text-slate-400">
                    <CheckCircle2 className="text-orange-500" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500 text-center">
            © 2026 One Connexion. Tous droits réservés.
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2">
          <div className="w-full max-w-sm">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors lg:hidden">
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900">Connexion</h1>
              <p className="mt-2 text-slate-500">Heureux de vous revoir ! Accédez à votre dashboard.</p>
            </div>

            <form className="space-y-5" onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);

              if (supabase.auth === undefined) {
                setLoading(false);
                setError("Erreur de configuration : Le client Supabase n'est pas initialisé correctement.");
                return;
              }

              const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (authError) {
                setLoading(false);
                console.error("Login error:", authError);

                if (authError.message === "Invalid login credentials") {
                  setError("Identifiants invalides (email ou mot de passe incorrect)");
                } else if (authError.message.includes("fetch")) {
                  setError("Erreur de connexion : Impossible de joindre le serveur. Vérifiez votre connexion internet.");
                } else {
                  setError(authError.message);
                }
                return;
              }

              // Fetch user profile to check role
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

              if (profile?.role === 'courier') {
                await supabase.auth.signOut();
                setLoading(false);
                setError("Accès refusé : Les chauffeurs doivent utiliser l'application mobile dédiée.");
                return;
              }

              setLoading(false);

              if (profile?.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard-client');
              }
            }}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email professionnel</label>
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                  <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">Oublié ?</a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <label htmlFor="remember" className="text-sm text-slate-600 select-none cursor-pointer">Se souvenir de moi</label>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full rounded-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50"
              >
                Accès dashboard admin
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link to="/inscription" className="font-semibold text-slate-900 hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

