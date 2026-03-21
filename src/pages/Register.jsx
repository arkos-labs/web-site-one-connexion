import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { fetchSiret } from "../lib/siret.js";
import {
    Eye, EyeOff, ArrowRight, CheckCircle2, Building2, User,
    Mail, Phone, MapPin, Lock, Loader2, ShieldCheck
} from "lucide-react";

const BENEFITS = [
    "Dashboard de gestion des commandes",
    "Facturation mensuelle consolidée",
    "Carnet d'adresses sauvegardé",
    "Preuves de livraison (POD) horodatées",
    "Suivi en temps réel de chaque mission",
];

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        billingAddress: "",
        zip: "",
        city: "",
        acceptTerms: false,
    });

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.acceptTerms) return setError("Vous devez accepter la politique de confidentialité.");
        if (form.password !== form.confirmPassword) return setError("Les mots de passe ne correspondent pas.");
        if (form.password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");

        setLoading(true);
        try {
            let autoSiret = "";
            if (form.companyName) {
                try { autoSiret = await fetchSiret(form.companyName, form.zip); } catch { /* non bloquant */ }
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        role: 'client',
                        company: form.companyName,
                        contact_name: form.contactName,
                        full_name: form.contactName,
                        phone: form.phone,
                        phone_number: form.phone,
                        address: form.billingAddress,
                        zip: form.zip,
                        city: form.city,
                        siret: autoSiret,
                    }
                }
            });

            if (authError) throw authError;
            if (authData.user) setSuccess(true);
        } catch (err) {
            if (err.message?.includes("rate limit")) {
                setError("Trop de tentatives. Essayez avec une autre adresse email ou patientez quelques minutes.");
            } else if (err.message?.includes("already registered")) {
                setError("Cette adresse email est déjà associée à un compte. Connectez-vous ou réinitialisez votre mot de passe.");
            } else {
                setError(err.message || "Une erreur est survenue. Réessayez.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div className="min-h-screen font-sans flex items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] p-12 shadow-sm ring-1 ring-slate-100 text-center space-y-6">
                    <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-500">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Compte créé avec succès !</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Un email de confirmation vous a été envoyé à <strong className="text-slate-800">{form.email}</strong>. Cliquez sur le lien pour activer votre compte.
                    </p>
                    <button
                        onClick={() => navigate('/connexion')}
                        className="w-full rounded-full bg-slate-900 py-4 text-sm font-black text-white hover:bg-orange-500 transition-all"
                    >
                        Aller à la connexion →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex font-sans">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80"
                        alt="Équipe professionnelle"
                        className="h-full w-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/80 to-slate-950" />
                </div>

                {/* Logo */}
                <Link to="/" className="relative z-10 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white text-sm font-black shadow-lg">OC</div>
                    <span className="text-xl font-black text-white tracking-tight">One Connexion</span>
                </Link>

                {/* Content */}
                <div className="relative z-10 space-y-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-400">
                            Accès Pro Gratuit
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Rejoignez le réseau<br />
                            <span className="text-orange-400 italic">One Connexion</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Inscription en 2 minutes. Accès immédiat à votre dashboard. Aucun engagement.
                        </p>
                    </div>
                    <ul className="space-y-3">
                        {BENEFITS.map((b, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                                    <CheckCircle2 size={12} className="text-orange-400" />
                                </div>
                                {b}
                            </li>
                        ))}
                    </ul>

                    {/* Testimonial mini */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => <span key={i} className="text-orange-400 text-sm">★</span>)}
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed">
                            "On a réduit de 40% le temps admin grâce à la facturation mensuelle de One Connexion."
                        </p>
                        <div className="text-xs text-slate-500 font-bold">— LogiNord, Client depuis 2025</div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-600">© 2026 One Connexion. Service B2B réservé aux professionnels.</div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex w-full flex-col bg-white overflow-y-auto lg:w-[58%]">
                <div className="mx-auto w-full max-w-xl px-6 py-12 lg:px-12">
                    {/* Mobile logo */}
                    <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white text-sm font-black">OC</div>
                        <span className="text-lg font-black text-slate-900">One Connexion</span>
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Créer un compte pro</h1>
                        <p className="mt-2 text-slate-500 text-sm">Inscrivez votre entreprise pour profiter de tous nos services.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section: Entreprise */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Building2 size={12} /> Informations de l'entreprise
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Nom de l'entreprise *" placeholder="Ex: SARL Dupont Logistique" type="text" value={form.companyName} onChange={set('companyName')} icon={<Building2 size={16} />} required />
                                <Field label="Contact principal *" placeholder="Prénom Nom" type="text" value={form.contactName} onChange={set('contactName')} icon={<User size={16} />} required />
                            </div>
                        </div>

                        {/* Section: Contact */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Mail size={12} /> Coordonnées
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Email professionnel *" placeholder="contact@votre-bo.com" type="email" value={form.email} onChange={set('email')} icon={<Mail size={16} />} required />
                                <Field label="Téléphone" placeholder="06 00 00 00 00" type="tel" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} />
                            </div>
                        </div>

                        {/* Section: Adresse */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <MapPin size={12} /> Adresse de facturation
                            </p>
                            <div className="space-y-4">
                                <Field label="Rue *" placeholder="Numéro et nom de rue" type="text" value={form.billingAddress} onChange={set('billingAddress')} icon={<MapPin size={16} />} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Code postal *" placeholder="75001" type="text" value={form.zip} onChange={set('zip')} required />
                                    <Field label="Ville *" placeholder="Paris" type="text" value={form.city} onChange={set('city')} required />
                                </div>
                            </div>
                        </div>

                        {/* Section: Sécurité */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Lock size={12} /> Sécurité du compte
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <PasswordField label="Mot de passe *" placeholder="8 caractères minimum" value={form.password} onChange={set('password')} show={showPassword} onToggle={() => setShowPassword(v => !v)} required />
                                <PasswordField label="Confirmer *" placeholder="Identique au mot de passe" value={form.confirmPassword} onChange={set('confirmPassword')} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} required />
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                checked={form.acceptTerms}
                                onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))}
                                required
                            />
                            <span className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                                J'accepte la{" "}
                                <Link to="/confidentialite" className="font-bold text-slate-900 hover:text-orange-500 underline underline-offset-2 transition-colors">
                                    politique de confidentialité
                                </Link>{" "}
                                et les conditions générales de vente de One Connexion.
                            </span>
                        </label>

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
                            className="group w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <Loader2 className="animate-spin" size={18} />
                                : <><ShieldCheck size={16} /> Créer mon compte entreprise <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
                            }
                        </button>

                        <p className="text-center text-sm text-slate-500">
                            Déjà un compte ?{" "}
                            <Link to="/connexion" className="font-black text-slate-900 hover:text-orange-500 transition-colors hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ──

function Field({ label, placeholder, type = "text", value, onChange, icon, required }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">{label}</label>
            <div className={`relative ${icon ? "" : ""}`}>
                {icon && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                )}
                <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 ${icon ? "pl-10 pr-4" : "px-4"} text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all`}
                />
            </div>
        </div>
    );
}

function PasswordField({ label, placeholder, value, onChange, show, onToggle, required }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type={show ? "text" : "password"}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
                <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}
