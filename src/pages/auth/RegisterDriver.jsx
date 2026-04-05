import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Phone, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicHeader from "../../components/PublicHeader.jsx";

export default function RegisterDriver() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pas d'indexation
  if (typeof document !== 'undefined') {
    let meta = document.querySelector("meta[name='robots']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Inscription Auth avec metadata (géré par le Trigger SQL)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          role: 'courier',
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone_number: formData.phone,
          company: "One Connexion Flotte"
        }
      }
    });

    if (authError) {
      if (authError.message.includes("rate limit")) {
        setError("Trop de tentatives. Veuillez essayer avec une autre adresse email ou patienter.");
      } else {
        setError("Erreur Auth: " + authError.message);
      }
      setLoading(false);
      return;
    }

    if (authData?.user) {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ed5518] text-[#ed5518] mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Compte Créé ! 🎉</h2>
            <p className="mt-2 text-slate-600">
              Bienvenue dans l'équipe. Votre compte chauffeur est actif.
            </p>
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-left">
              <p className="font-bold text-slate-900 mb-2">Prochaines étapes :</p>
              <ul className="space-y-2 text-slate-600">
                <li>1. Téléchargez l'application <strong>Dispatch One Connexion</strong>.</li>
                <li>2. Connectez-vous avec vos identifiants.</li>
                <li>3. Attendez votre première mission !</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/connexion')}
              className="mt-8 w-full rounded-full bg-slate-900 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <div className="flex min-h-[calc(100vh-96px)] w-full bg-slate-50">
        <div className="flex w-full flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-slate-900 to-slate-950"></div>
              <div className="relative z-10">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#ed5518] text-white font-bold text-xl shadow-lg">OC</div>
                <h1 className="text-2xl font-bold text-white">Rejoindre la Flotte</h1>
                <p className="text-slate-400 text-sm mt-1">Créez votre accès chauffeur sécurisé.</p>
              </div>
            </div>

            <div className="p-8">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Nom</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email (Identifiant)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="chauffeur@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      required
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Minimum 6 caractères.</p>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? "Création en cours..." : (
                    <>
                      <UserPlus size={18} />
                      Créer mon compte Chauffeur
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        queryParams: { access_type: 'offline', prompt: 'consent' },
                        redirectTo: window.location.origin + '/dashboard-driver',
                        data: { role: 'courier' }
                      }
                    });
                    if (error) setError(error.message);
                  }}
                  className="w-full flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  S'inscrire avec Google
                </button>
                <p className="mt-4 text-[10px] text-slate-400 font-medium px-6">
                  En vous inscrivant, vous acceptez nos conditions générales de partenariat coursier.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400 text-center max-w-xs">
            Page interne réservée à l'inscription des partenaires.
            <br />Ne pas diffuser publiquement.
          </p>
        </div>
      </div>
    </div>
  );
}
