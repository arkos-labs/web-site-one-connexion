import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { Mail, ArrowLeft, CheckCircle2, Loader2, ShieldCheck, RefreshCw } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Veuillez entrer une adresse email valide.");
            return;
        }

        setLoading(true);
        try {
            const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
            });

            // On n'expose pas si l'email existe ou non (bonne pratique de sécurité)
            if (supabaseError && !supabaseError.message.includes("User not found")) {
                throw supabaseError;
            }

            setSent(true);
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans flex font-sans">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80"
                        alt="Sécurité"
                        className="h-full w-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950" />
                </div>

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white text-sm font-black shadow-lg">OC</div>
                    <span className="text-xl font-black text-white tracking-tight">One Connexion</span>
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Votre compte,<br />
                            <span className="text-orange-400 italic">bien protégé.</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Un lien de réinitialisation vous sera envoyé par email. Il est valide pendant 1 heure.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {[
                            { num: "01", text: "Saisissez votre adresse email professionnelle" },
                            { num: "02", text: "Cliquez sur le lien reçu par email" },
                            { num: "03", text: "Choisissez un nouveau mot de passe sécurisé" },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-orange-400">
                                    {step.num}
                                </div>
                                <p className="text-sm text-slate-300 font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-600">© 2026 One Connexion. Tous droits réservés.</div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex w-full flex-col items-center justify-center bg-white p-6 lg:w-[55%] lg:p-14">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white text-sm font-black">OC</div>
                        <span className="text-lg font-black text-slate-900">One Connexion</span>
                    </div>

                    <Link to="/connexion" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>

                    {!sent ? (
                        <>
                            <div className="mb-10">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <Mail size={28} />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mot de passe oublié ?</h1>
                                <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                                    Pas de panique. Entrez votre email et nous vous enverrons un lien de réinitialisation.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Adresse email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="vous@entreprise.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><Loader2 className="animate-spin" size={18} /> Envoi en cours...</>
                                        : <><Mail size={16} /> Envoyer le lien de réinitialisation</>
                                    }
                                </button>

                                <p className="text-center text-xs text-slate-400 leading-relaxed">
                                    Vous recevrez un email si cette adresse est associée à un compte. Vérifiez aussi vos spams.
                                </p>
                            </form>
                        </>
                    ) : (
                        /* ── Success State ── */
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email envoyé !</h1>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Si un compte existe pour <strong className="text-slate-800">{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-3 text-sm text-slate-600">
                                <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">Que faire si je ne reçois pas l'email ?</div>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Vérifiez votre dossier <strong>Spams / Indésirables</strong></li>
                                    <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Assurez-vous d'utiliser l'email de votre compte pro</li>
                                    <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">→</span> Le lien expire dans <strong>1 heure</strong></li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setSent(false); setEmail(""); }}
                                    className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                                >
                                    <RefreshCw size={16} /> Renvoyer un email
                                </button>
                                <Link
                                    to="/connexion"
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-black text-white hover:bg-orange-500 transition-all"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>

                            <p className="text-center text-xs text-slate-400">
                                Besoin d'aide ?{" "}
                                <a href="mailto:support@oneconnexion.fr" className="font-bold text-slate-600 hover:text-orange-500 transition-colors">
                                    support@oneconnexion.fr
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
