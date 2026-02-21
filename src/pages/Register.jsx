import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Building2, User, Mail, Phone, Lock, ArrowRight, MapPin, CreditCard } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import PublicHeader from "../components/PublicHeader.jsx";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.acceptTerms) {
            setError("Vous devez accepter la politique de confidentialité.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        try {
            // 1. Sign up user with all metadata for the public.profiles trigger
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
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                setSuccess(true);
                setTimeout(() => navigate('/connexion'), 3000);
            }
        } catch (err) {
            console.error("Registration error:", err);
            if (err.message?.includes("rate limit")) {
                setError("Trop de tentatives. Veuillez essayer avec une autre adresse email ou patienter.");
            } else if (err.message?.includes("fetch")) {
                setError("Erreur de connexion au serveur Supabase. Vérifiez votre configuration.");
            } else {
                setError(err.message || "Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white">
                <PublicHeader />
                <div className="flex min-h-[calc(100vh-96px)] items-center justify-center p-6">
                    <div className="w-full max-w-md text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Compte créé !</h1>
                        <p className="mt-4 text-slate-500 leading-relaxed">
                            Votre inscription a été enregistrée avec succès. <br />
                            Redirection vers la page de connexion...
                        </p>
                        <button
                            onClick={() => navigate('/connexion')}
                            className="mt-8 w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800"
                        >
                            Se connecter maintenant
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />
            <div className="flex min-h-[calc(100vh-96px)] w-full">
                {/* Left Panel - Information */}
                <div className="hidden w-1/2 flex-col items-center justify-center bg-slate-950 p-12 text-white lg:flex relative overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
                            alt="Background"
                            className="h-full w-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/60" />
                    </div>



                    <div className="relative z-10 max-w-lg space-y-12">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold leading-tight">
                                Rejoignez le réseau logistique <span className="text-orange-500 italic">One Connexion</span>
                            </h2>
                            <p className="mt-6 text-lg text-slate-400">
                                Inscrivez votre entreprise en moins de 2 minutes et commencez à expédier partout en Île-de-France.
                            </p>
                        </div>

                        <div className="grid gap-6 text-left">
                            {[
                                { title: "Dashboard intuitif", desc: "Gérez vos expéditions depuis une interface moderne." },
                                { title: "Facturation simplifiée", desc: "Recevez une facture unique pour tous vos envois du mois." },
                                { title: "Preuves de livraison", desc: "Accédez aux POD signés et photos instantanément." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-orange-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-12 z-10 text-xs text-slate-500">
                        © 2026 One Connexion. Service B2B réservé aux professionnels.
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex w-full flex-col bg-white p-8 lg:w-1/2 lg:p-12 overflow-y-auto">
                    <div className="mx-auto w-full max-w-lg">
                        <Link to="/connexion" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft size={16} />
                            Retour à la connexion
                        </Link>

                        <div className="mb-10">
                            <h1 className="text-3xl font-bold text-slate-900">Créer un compte pro</h1>
                            <p className="mt-2 text-slate-500">Inscrivez votre entreprise pour profiter de nos tarifs B2B.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Nom de l'entreprise</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: SARL Logistique"
                                            value={form.companyName}
                                            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Contact principal</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Prénom Nom"
                                            value={form.contactName}
                                            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Email professionnel</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="contact@votre-entreprise.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Téléphone de contact</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="06 00 00 00 00"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Adresse de facturation</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Numéro et nom de rue"
                                        value={form.billingAddress}
                                        onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Code postal</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: 75001"
                                        value={form.zip}
                                        onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Ville</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Paris"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••••••"
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="flex items-start gap-3">
                                <input
                                    required
                                    type="checkbox"
                                    id="terms"
                                    checked={form.acceptTerms}
                                    onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <label htmlFor="terms" className="text-sm text-slate-500 leading-tight select-none cursor-pointer">
                                    J'accepte la <span className="font-bold text-slate-900">politique de confidentialité</span> et les conditions générales de One Connexion.
                                </label>
                            </div>

                            {error && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full rounded-full bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                {loading ? (
                                    "Création du compte..."
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Créer mon compte entreprise <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500">
                                Déjà un compte ?{" "}
                                <Link to="/connexion" className="font-bold text-slate-900 hover:underline">
                                    Se connecter
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div >
        </div >
    );
}

