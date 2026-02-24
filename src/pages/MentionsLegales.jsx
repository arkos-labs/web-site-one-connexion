import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { Building2, User, Globe, Shield, Mail, Scale } from "lucide-react";

export default function MentionsLegales() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PublicHeader />

            <section className="pt-32 pb-16 md:pt-48 md:pb-24 bg-white border-b border-slate-100">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                            <Scale size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 md:text-5xl tracking-tight">
                            Mentions Légales
                        </h1>
                    </div>
                    <p className="text-xl text-slate-600 leading-relaxed font-light">
                        Informations juridiques concernant l'édition, l'hébergement et la propriété intellectuelle du site One Connexion.
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-4xl px-6 py-20">
                <div className="space-y-16">
                    {/* Éditeur */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 text-slate-900">
                            <Building2 size={20} className="text-orange-500" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Éditeur du Site</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 text-slate-600">
                            <div className="space-y-2">
                                <p><strong>Raison sociale :</strong> One Connexion SAS</p>
                                <p><strong>Capital social :</strong> 10 000 €</p>
                                <p><strong>SIRET :</strong> 123 456 789 00012</p>
                            </div>
                            <div className="space-y-2">
                                <p><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris</p>
                                <p><strong>TVA Intracommunautaire :</strong> FR12 123456789</p>
                            </div>
                        </div>
                    </section>

                    {/* Publication */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 text-slate-900">
                            <User size={20} className="text-orange-500" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Direction de Publication</h2>
                        </div>
                        <p className="text-slate-600"><strong>Directeur :</strong> M. Jean Dupont, en qualité de Président de One Connexion.</p>
                    </section>

                    {/* Hébergement */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 text-slate-900">
                            <Globe size={20} className="text-orange-500" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Hébergement</h2>
                        </div>
                        <p className="text-slate-600">
                            Le site est hébergé par <strong>Vercel Inc.</strong><br />
                            Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
                            Site web : <a href="https://vercel.com" className="text-orange-600 hover:underline">vercel.com</a>
                        </p>
                    </section>

                    {/* Propriété Intellectuelle */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 text-slate-900">
                            <Shield size={20} className="text-orange-500" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Propriété Intellectuelle</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            L'intégralité du site One Connexion (structure, textes, logos, images, identité sonore) est protégée par les législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.
                        </p>
                    </section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
