import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, Package, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function SEOPageLayout({
    title,
    subtitle,
    heroImage,
    description,
    benefits,
    useCases,
    seoText,
    faqs
}) {
    return (
        <div className="bg-white text-slate-900 font-sans">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden border-b border-slate-100 bg-slate-50">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt={title}
                        className="h-full w-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-slate-50 to-white" />
                </div>

                <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">
                        Expertise Sectorielle
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl text-slate-600 leading-relaxed">
                        {subtitle}
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link to="/guest-order" className="rounded-full bg-orange-500 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-orange-600 transition-all">
                            Commander une course
                        </Link>
                        <Link to="/contact" className="rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 transition-all">
                            Demander un devis B2B
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <div className="grid gap-16 lg:grid-cols-3">

                        {/* Left Content Column */}
                        <div className="lg:col-span-2 space-y-16">

                            {/* Description */}
                            <div className="prose prose-slate max-w-none">
                                <h2 className="text-3xl font-black text-slate-900 mb-6">Services de transport dédiés</h2>
                                <div className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                                    {description}
                                </div>
                            </div>

                            {/* Special SEO Content block */}
                            <div className="rounded-3xl bg-slate-50 p-10 border border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Notre engagement pour votre métier</h3>
                                <div className="text-slate-600 leading-relaxed space-y-4">
                                    {seoText}
                                </div>
                            </div>

                            {/* Use Cases */}
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-8">Solutions logistiques</h3>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {useCases.map((useCase, idx) => (
                                        <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="h-2 w-12 bg-orange-500 rounded-full mb-4" />
                                            <p className="font-bold text-slate-900">{useCase}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-8">
                            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl sticky top-32">
                                <h3 className="text-xl font-bold mb-6">Pourquoi nous ?</h3>
                                <ul className="space-y-5">
                                    {benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <CheckCircle2 className="text-orange-500 shrink-0 mt-1" size={20} />
                                            <span className="text-slate-300 font-medium">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                                <hr className="my-8 border-white/10" />
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Clock size={24} className="text-orange-500" />
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Disponibilité</p>
                                            <p className="text-sm font-bold">7j/7 - 24h/24</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck size={24} className="text-orange-500" />
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Sécurité</p>
                                            <p className="text-sm font-bold">Assurance Transport Incluse</p>
                                        </div>
                                    </div>
                                </div>
                                <Link to="/contact" className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-4 text-sm font-bold text-white transition-all hover:bg-white hover:text-slate-900">
                                    Devis Personnalisé <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Questions fréquentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="group rounded-2xl bg-white p-2 border border-slate-200 transition-all">
                                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-bold text-slate-900">
                                    {faq.q}
                                    <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
                                </summary>
                                <div className="px-6 pb-6 pt-2 text-slate-600">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
