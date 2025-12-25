import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import { MousePointerClick, Truck, PackageCheck, ArrowRight, Clock, Shield, MapPin } from "lucide-react";
import SEO from "@/components/SEO";

const HowItWorks = () => {
    const steps = [
        {
            icon: MousePointerClick,
            title: "1. Commandez en quelques clics",
            description: "Saisissez vos adresses, choisissez votre urgence et validez. Pas besoin de création de compte pour commencer.",
            color: "text-[#D4AF37]",
            bg: "bg-[#D4AF37]/10"
        },
        {
            icon: Truck,
            title: "2. Prise en charge immédiate",
            description: "Un de nos chauffeurs experts accepte la course instantanément. Vous recevez son nom et son temps d'approche.",
            color: "text-[#D4AF37]",
            bg: "bg-[#D4AF37]/10"
        },
        {
            icon: PackageCheck,
            title: "3. Livraison en temps réel",
            description: "Suivez le trajet sur la carte. Une preuve de livraison photo et signature vous est envoyée dès la remise au destinataire.",
            color: "text-[#D4AF37]",
            bg: "bg-[#D4AF37]/10"
        }
    ];

    const features = [
        {
            icon: Clock,
            title: "Disponibilité 24/7",
            description: "Nos services sont accessibles à toute heure, dimanches et jours fériés, pour vos urgences critiques."
        },
        {
            icon: Shield,
            title: "Transport Sécurisé",
            description: "Chaque course est assurée. Vos marchandises précieuses sont manipulées avec la plus grande attention."
        },
        {
            icon: MapPin,
            title: "Toute l'Île-de-France",
            description: "De Paris centre aux zones industrielles les plus reculées, nous couvrons l'intégralité de la région."
        }
    ];

    return (
        <div className="min-h-screen font-sans bg-gray-50">
            <SEO
                title="Comment ça marche - Traçabilité & Suivi"
                description="Découvrez notre processus d'expédition sécurisée avec traçabilité GPS en temps réel et preuve de livraison dématérialisée."
                keywords="Traçabilité GPS colis temps réel, Preuve de livraison dématérialisée (POD), Processus expédition sécurisée, Tracking livraison B2B, Géolocalisation transport, Comment suivre mon colis en temps réel avec One Connexion ?, Garantie de livraison transport express, Sécurité transport colis précieux"
            />
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 bg-[#0B1525] text-white overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-blue-900/20 to-transparent opacity-50 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
                        Simple & Rapide
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-fade-in-up">
                        Comment ça <span className="text-[#D4AF37] italic">marche</span> ?
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up delay-100">
                        Une expérience fluide, pensée pour les professionnels exigeants.
                        De la commande à la livraison, tout est optimisé.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-[50px] left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -z-10 border-t border-dashed border-[#D4AF37]/30" />

                        {steps.map((step, index) => (
                            <div key={index} className="relative group">
                                <div className={`w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100 group-hover:border-[#D4AF37]/30 transition-all duration-300 relative z-10`}>
                                    <step.icon className={`h-8 w-8 text-[#0B1525] stroke-[1.5]`} />
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-2xl font-serif text-[#0B1525] mb-4 group-hover:text-[#D4AF37] transition-colors">{step.title}</h3>
                                    <p className="text-gray-500 font-light leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/commande-sans-compte">
                            <Button size="lg" className="bg-[#0B1525] hover:bg-[#1a2c4e] text-white text-lg font-medium px-10 py-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                Tester maintenant
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50 border-t border-gray-200/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif text-[#0B1525] mb-4">Pourquoi nous choisir ?</h2>
                        <p className="text-gray-500 font-light max-w-xl mx-auto">L'excellence opérationnelle au service de vos urgences, sans compromis.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-8 border border-gray-100 bg-white shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 rounded-xl group">
                                <div className="w-12 h-12 bg-[#0B1525]/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 transition-colors">
                                    <feature.icon className="h-6 w-6 text-[#0B1525] group-hover:text-[#D4AF37] transition-colors" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-[#0B1525] mb-3">{feature.title}</h3>
                                <p className="text-gray-500 font-light leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto bg-[#0B1525] rounded-3xl p-12 relative overflow-hidden shadow-2xl">
                        {/* Background effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-serif text-white mb-6">
                                Un besoin spécifique ?
                            </h2>
                            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto font-light">
                                Notre équipe est à votre disposition pour étudier vos demandes particulières (tournées régulières, objets fragiles, etc.)
                            </p>
                            <Link to="/contact">
                                <Button
                                    variant="outline"
                                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium py-6 px-10 text-lg rounded-full transition-all duration-300 backdrop-blur-sm bg-transparent"
                                >
                                    Nous contacter
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorks;
