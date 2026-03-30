import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Password strength checker
    const strength = (() => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const strengthLabel = ["", "Faible", "Moyen", "Bon", "Excellent"][strength];
    const strengthColor = ["", "bg-rose-400", "bg-amber-400", "bg-[#ed5518]", "bg-[#ed5518]"][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
        if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");

        setLoading(true);
        try {
            const { error: supabaseError } = await supabase.auth.updateUser({ password });
            if (supabaseError) throw supabaseError;
            setSuccess(true);
            setTimeout(() => navigate('/connexion'), 3000);
        } catch (err) {
            setError(err.message || "Une erreur est survenue. Le lien a peut-être expiré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans flex">
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
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ed5518] text-white text-sm font-black shadow-lg">OC</div>
                    <span className="text-xl font-black text-white tracking-tight">One Connexion</span>
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ed5518]/15 text-[#ed5518]">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Nouveau mot<br />
                            de <span className="text-[#ed5518] italic">passe</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Choisissez un mot de passe robuste pour sécuriser l'accès à vos données logistiques.
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Conseils de sécurité</div>
                        {[
                            "Au moins 8 caractères",
                            "Une lettre majuscule",
                            "Un chiffre ou symbole",
                            "Différent de votre ancien mot de passe",
                        ].map((tip, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#ed5518] shrink-0" />
                                {tip}
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
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed5518] text-white text-sm font-black">OC</div>
                        <span className="text-lg font-black text-slate-900">One Connexion</span>
                    </div>

                    {!success ? (
                        <>
                            <div className="mb-10">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <Lock size={28} />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nouveau mot de passe</h1>
                                <p className="mt-2 text-slate-500 text-sm">Choisissez un mot de passe sécurisé pour votre compte.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Strength indicator */}
                                    {password && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-slate-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-bold ${["", "text-rose-500", "text-amber-500", "text-[#ed5518]", "text-[#ed5518]"][strength]}`}>
                                                {strengthLabel}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            placeholder="••••••••••••"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`w-full rounded-2xl border bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all
                        ${confirmPassword && password !== confirmPassword
                                                    ? "border-rose-300 focus:ring-rose-500/10"
                                                    : confirmPassword && password === confirmPassword
                                                        ? "border-emerald-400 focus:ring-emerald-500/10"
                                                        : "border-slate-200 focus:ring-slate-900/5 focus:border-slate-900"
                                                }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        {confirmPassword && password === confirmPassword && (
                                            <CheckCircle2 size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-[#ed5518]" />
                                        )}
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs font-bold text-rose-500">Les mots de passe ne correspondent pas.</p>
                                    )}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                        {error}
                                        {error.includes("expiré") && (
                                            <Link to="/mot-de-passe-oublie" className="block mt-1 font-black underline">
                                                Faire une nouvelle demande →
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword}
                                    className="group w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all hover:bg-[#ed5518] hover:-translate-y-0.5 hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? <><Loader2 className="animate-spin" size={18} /> Réinitialisation...</>
                                        : <><ShieldCheck size={16} /> Réinitialiser le mot de passe</>
                                    }
                                </button>
                            </form>

                            <p className="mt-6 text-center text-xs text-slate-400">
                                Lien expiré ?{" "}
                                <Link to="/mot-de-passe-oublie" className="font-bold text-slate-600 hover:text-[#ed5518] transition-colors">
                                    Faire une nouvelle demande
                                </Link>
                            </p>
                        </>
                    ) : (
                        /* ── Success Screen ── */
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ed5518] text-[#ed5518]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mot de passe modifié !</h1>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion dans 3 secondes…
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#ed5518] border border-emerald-100 p-5 text-sm text-[#ed5518] font-medium">
                                <CheckCircle2 size={16} className="inline-block mr-2 text-[#ed5518]" />
                                Vous pouvez désormais vous connecter avec votre nouveau mot de passe sécurisé.
                            </div>

                            <Link
                                to="/connexion"
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-sm font-black text-white hover:bg-[#ed5518] transition-all"
                            >
                                Se connecter maintenant →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
