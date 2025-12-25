import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle } from "lucide-react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import SEO from "@/components/SEO";

const Evenementiel = () => {
    return (
        <div className="min-h-screen font-sans bg-slate-50">
            <SEO
                title="Logistique Événementielle & Salons"
                description="Logistique événementielle réactive pour salons professionnels. Transport urgent de matériel, goodies et éléments de stand."
                keywords="Logistique salon professionnel Last mile, Transport matériel audiovisuel fragile, Course urgente stand expo, Livraison nuit événementiel, Transport goodies express, Transporteur pour matériel exposition salon, Livraison urgente événementiel week-end"
            />
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0B1525] to-[#0B1525]" />
                <div className="container relative z-10 px-4 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30 mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <Calendar className="h-10 w-10 text-[#D4AF37]" strokeWidth={1} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
                        Transport <span className="text-[#D4AF37] italic">Événementiel</span>
                    </h1>

                    <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                        La logistique agile qui suit le rythme de vos productions.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">

                    {/* Description */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <p className="text-[#0B1525] text-lg md:text-xl font-light leading-relaxed">
                            One Connexion soutient les agences, productions et marques dans toutes leurs opérations terrain : lancements, séminaires, soirées, tournages, salons, conférences.
                            <span className="block mt-4 font-normal">Nous gérons les livraisons urgentes, précises et adaptées à vos plannings serrés.</span>
                        </p>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-10 opacity-30 rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* Services Proposed */}
                        <Card className="p-8 md:p-10 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-2xl group">
                            <h3 className="text-2xl font-bold text-[#0B1525] mb-8 font-serif border-b border-gray-100 pb-4">
                                Services proposés
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Invitations, badges, kits presse",
                                    "Goodies, PLV, éléments scénographiques légers",
                                    "Livraisons express avant ouverture d’événement",
                                    "Courses multi-sites (Paris & IDF)",
                                    "Acheminement VIP et dossiers sensibles"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-4 group/item">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#D4AF37] transition-colors duration-300">
                                            <CheckCircle className="h-3 w-3 text-[#D4AF37] group-hover/item:text-white transition-colors duration-300" />
                                        </div>
                                        <span className="text-slate-600 font-light group-hover/item:text-[#0B1525] transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Why One Connexion */}
                        <Card className="p-8 md:p-10 bg-[#0B1525] text-white border-none shadow-2xl rounded-2xl relative overflow-hidden group">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <h3 className="text-2xl font-bold text-white mb-8 font-serif border-b border-white/10 pb-4">
                                Pourquoi One Connexion ?
                            </h3>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    "Réactivité événementielle",
                                    "Flexibilité haute exigence",
                                    "Livraison dans les délais courts",
                                    "Parfaite connaissance du terrain parisien",
                                    "Fiabilité pour vos opérations critiques"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-4 group/item">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="h-3 w-3 text-[#D4AF37]" />
                                        </div>
                                        <span className="text-slate-300 font-light group-hover/item:text-white transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-20 text-center">
                        <Link to="/contact">
                            <Button className="bg-[#D4AF37] hover:bg-[#B08D1F] text-white text-lg font-bold py-8 px-10 rounded-full shadow-lg hover:shadow-[#D4AF37]/40 transition-all transform hover:-translate-y-1">
                                Demander un devis sur-mesure
                            </Button>
                        </Link>
                        <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-slate-400">
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#D4AF37]" /> Réponse sous 30 min</span>
                            <span className="hidden md:inline">•</span>
                            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#D4AF37]" /> Disponibilité 24/7 (sur contrat)</span>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Evenementiel;
