import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { fetchSiret } from "../../lib/siret.js";
import {
    Eye, EyeOff, ArrowRight, CheckCircle2, Building2, User,
    Mail, Phone, MapPin, Lock, Loader2, ShieldCheck
} from "lucide-react";
import Logo from "../../components/ui/Logo";

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
                        company_name: form.companyName,
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
            <div className="min-h-screen font-body flex items-center justify-center bg-cream p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ed5518]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                <div className="w-full max-w-xl bg-noir rounded-[2rem] p-12 md:p-20 shadow-2xl text-center relative z-10 animate-in fade-in zoom-in duration-700">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#ed5518]/10 mb-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ed5518] text-white">
                            <CheckCircle2 size={32} />
                        </div>
                    </div>

                    <div className="space-y-6 mb-12">
                        <h1 className="text-4xl md:text-5xl font-display italic text-white leading-tight">
                            Bienvenue dans <br />
                            <span className="text-[#ed5518]">le futur.</span>
                        </h1>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-loose">
                            Votre compte entreprise a été initialisé.
                            Vérifiez l'email envoyé à <br />
                            <span className="text-white mt-2 block">{form.email}</span>
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={() => navigate('/connexion')}
                            className="group w-full flex items-center justify-center gap-3 rounded-xl bg-[#ed5518] py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                        >
                            Accéder à mon espace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex font-body bg-cream">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-[40%] relative flex-col justify-between p-16 overflow-hidden bg-noir">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80"
                        alt="Expertise One"
                        className="h-full w-full object-cover opacity-10 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-noir/50 via-noir to-noir" />
                </div>

                <Logo variant="light" size="lg" className="relative z-10" />

                <div className="relative z-10 space-y-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-px w-6 bg-[#ed5518]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">
                                Partenariat Stratégique
                            </span>
                        </div>
                        <h2 className="text-5xl font-display text-white leading-tight">
                            Rejoignez le réseau<br />
                            <span className="text-[#ed5518] italic">One Connexion</span>
                        </h2>
                        <p className="text-white/30 text-sm leading-relaxed max-w-xs font-light italic">
                            Votre accès gratuit à une logistique premium. Inscription en 2 minutes.
                        </p>
                    </div>
                    <ul className="space-y-4">
                        {BENEFITS.map((b, i) => (
                            <li key={i} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ed5518]">
                                    <CheckCircle2 size={10} className="text-white" />
                                </div>
                                {b}
                            </li>
                        ))}
                    </ul>

                    <div className="rounded-xl bg-white/5 border border-white/5 p-6 space-y-4 backdrop-blur-sm">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => <span key={i} className="text-[#ed5518] text-xs">★</span>)}
                        </div>
                        <p className="text-xs text-white/60 italic leading-relaxed">
                            "Une réactivité sans faille et une interface intuitive. One Connexion est devenu notre partenaire de confiance."
                        </p>
                        <div className="text-[9px] text-[#ed5518] font-bold uppercase tracking-widest">— Groupe Logistique IDF</div>
                    </div>
                </div>

                <div className="relative z-10 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 italic">
                    One Connexion · L'Excellence du Dernier Kilomètre
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex w-full flex-col bg-cream overflow-y-auto lg:w-[60%] relative">
                <div className="absolute top-0 left-0 w-64 h-64 bg-noir/5 blur-3xl rounded-full"></div>

                <div className="mx-auto w-full max-w-2xl px-6 py-16 lg:px-20 relative z-10">
                    <div className="lg:hidden mb-12">
                        <Logo size="lg" variant="dark" />
                    </div>

                    <div className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-display italic text-noir leading-none">Créer un compte pro.</h1>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="h-px w-4 bg-noir/20"></div>
                            <p className="text-noir/40 text-[10px] font-bold uppercase tracking-[0.2em]">Inscrivez votre entreprise en quelques instants</p>
                        </div>
                        <p className="mt-6 text-sm text-noir/60 leading-relaxed font-light max-w-lg">
                            Rejoignez le réseau exclusif One Connexion et bénéficiez d'une facturation centralisée, de tarifs négociés et d'un tableau de bord professionnel dédié pour piloter l'ensemble de vos flux logistiques.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Section: Entreprise */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518] flex items-center gap-3">
                                <span className="h-1 w-1 bg-[#ed5518] rounded-full"></span>
                                Informations Entreprise
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <Field label="Raison Sociale" placeholder="Nom de l'entreprise" type="text" value={form.companyName} onChange={set('companyName')} icon={<Building2 size={16} />} required />
                                <Field label="Contact Référent" placeholder="Nom Complet" type="text" value={form.contactName} onChange={set('contactName')} icon={<User size={16} />} required />
                            </div>
                        </div>

                        {/* Section: Contact */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518] flex items-center gap-3">
                                <span className="h-1 w-1 bg-[#ed5518] rounded-full"></span>
                                Coordonnées Directes
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <Field label="Email Professionnel" placeholder="contact@entreprise.com" type="email" value={form.email} onChange={set('email')} icon={<Mail size={16} />} required />
                                <Field label="Téléphone Mobile" placeholder="06 00 00 00 00" type="tel" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} />
                            </div>
                        </div>

                        {/* Section: Adresse */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518] flex items-center gap-3">
                                <span className="h-1 w-1 bg-[#ed5518] rounded-full"></span>
                                Siège & Facturation
                            </h3>
                            <div className="space-y-8">
                                <Field label="Adresse" placeholder="Voie, numéro, complément" type="text" value={form.billingAddress} onChange={set('billingAddress')} icon={<MapPin size={16} />} required />
                                <div className="grid grid-cols-2 gap-8">
                                    <Field label="Code Postal" placeholder="75001" type="text" value={form.zip} onChange={set('zip')} required />
                                    <Field label="Ville" placeholder="Paris" type="text" value={form.city} onChange={set('city')} required />
                                </div>
                            </div>
                        </div>

                        {/* Section: Sécurité */}
                        <div className="space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518] flex items-center gap-3">
                                <span className="h-1 w-1 bg-[#ed5518] rounded-full"></span>
                                Accès Sécurisé
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <PasswordField label="Mot de passe" placeholder="Minimum 8 caractères" value={form.password} onChange={set('password')} show={showPassword} onToggle={() => setShowPassword(v => !v)} required />
                                <PasswordField label="Confirmation" placeholder="Re-saisir" value={form.confirmPassword} onChange={set('confirmPassword')} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} required />
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border border-noir/5 bg-white/30">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded-sm border-noir/20 text-noir focus:ring-noir cursor-pointer transition-all"
                                checked={form.acceptTerms}
                                onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))}
                                required
                            />
                            <span className="text-[11px] text-noir/50 leading-relaxed uppercase tracking-wider">
                                J'accepte la politique de confidentialité de One Connexion.
                            </span>
                        </label>

                        {/* Error */}
                        {error && (
                            <div className="p-5 rounded-xl border border-rose-100 bg-rose-50 text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-loose">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full flex items-center justify-center gap-4 rounded-xl bg-noir py-6 text-[11px] font-bold uppercase tracking-[0.4em] text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-[#ed5518] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <Loader2 className="animate-spin" size={20} />
                                : <><ShieldCheck size={18} /> Initialiser le compte <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            }
                        </button>

                        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-noir/30">
                            Déjà partenaire ?{" "}
                            <Link to="/connexion" className="text-noir hover:text-[#ed5518] transition-colors underline underline-offset-4">
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
        <div className="space-y-3">
            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40 ml-1">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-noir/20 group-focus-within:text-[#ed5518] transition-colors">{icon}</span>
                )}
                <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full rounded-xl border border-noir/5 bg-white py-4 ${icon ? "pl-14" : "px-5"} text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm`}
                />
            </div>
        </div>
    );
}

function PasswordField({ label, placeholder, value, onChange, show, onToggle, required }) {
    return (
        <div className="space-y-3">
            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-noir/40 ml-1">{label}</label>
            <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-noir/20" size={16} />
                <input
                    type={show ? "text" : "password"}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-xl border border-noir/5 bg-white py-4 pl-14 pr-14 text-sm font-medium text-noir placeholder:text-noir/20 focus:border-[#ed5518] focus:ring-0 transition-all shadow-sm"
                />
                <button type="button" onClick={onToggle} className="absolute right-5 top-1/2 -translate-y-1/2 text-noir/20 hover:text-noir transition-colors">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

