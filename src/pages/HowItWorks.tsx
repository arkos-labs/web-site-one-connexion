import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import { MousePointerClick, Truck, PackageCheck, ArrowRight, Clock, Shield, MapPin } from "lucide-react";

const HowItWorks = () => {
    const steps = [
        {
            icon: MousePointerClick,
            title: "1. Commandez en quelques clics",
            description: "Saisissez vos adresses de départ et d'arrivée. Obtenez un devis immédiat et validez votre commande, avec ou sans compte.",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: Truck,
            title: "2. Un coursier prend le relais",
            description: "L'un de nos chauffeurs professionnels accepte votre course instantanément et se dirige vers le point de retrait.",
            color: "text-cta",
            bg: "bg-cta/10"
        },
        {
            icon: PackageCheck,
            title: "3. Livraison suivie et sécurisée",
            description: "Suivez votre colis en temps réel jusqu'à sa remise en main propre. Vous recevez une preuve de livraison instantanée.",
            color: "text-success",
            bg: "bg-success/10"
        }
    ];

    const features = [
        {
            icon: Clock,
            title: "Disponibilité 24/7",
            description: "Nos services sont accessibles à toute heure, dimanches et jours fériés inclus."
        },
        {
            icon: Shield,
            title: "Transport Sécurisé",
            description: "Vos marchandises sont assurées et manipulées avec le plus grand soin."
        },
        {
            icon: MapPin,
            title: "Couverture Île-de-France",
            description: "Nous desservons Paris et toute sa banlieue avec la même réactivité."
        }
    ];

    return (
        <div className="min-h-screen font-sans">
            <Header />

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-cta text-cta-foreground hover:bg-cta/90">Simple & Rapide</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">Comment ça marche ?</h1>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                        Une solution de livraison express conçue pour vous simplifier la vie.
                        Pas de complexité, juste de l'efficacité.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10" />

                        {steps.map((step, index) => (
                            <div key={index} className="relative bg-white pt-4">
                                <div className={`w-24 h-24 mx-auto ${step.bg} rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white`}>
                                    <step.icon className={`h-10 w-10 ${step.color}`} />
                                </div>
                                <div className="text-center px-4">
                                    <h3 className="text-xl font-bold text-primary mb-3 font-display">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link to="/commande-sans-compte">
                            <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground font-bold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                                Tester maintenant
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-primary mb-4 font-display">Pourquoi nous choisir ?</h2>
                        <p className="text-muted-foreground">L'excellence opérationnelle au service de vos urgences</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-8 border-none shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-display font-bold text-primary mb-6">
                        Un besoin spécifique ?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Notre équipe est à votre disposition pour étudier vos demandes particulières
                    </p>
                    <Link to="/contact">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
                        >
                            Nous contacter
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorks;
