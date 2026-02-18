import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import {
    Users,
    Target,
    Heart,
    Clock,
    Shield,
    Award,
    Truck,
    MapPin,
    ArrowRight
} from "lucide-react";
import SEO from "@/components/SEO";

const About = () => {
    const values = [
        {
            icon: Clock,
            title: "Rapidité",
            description: "Nous comprenons l'urgence de vos besoins. Notre réseau de chauffeurs professionnels assure des livraisons en moins de 2h sur toute l'Île-de-France.",
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            icon: Shield,
            title: "Fiabilité",
            description: "Chaque colis est traité avec le plus grand soin. Suivi GPS en temps réel, assurance incluse et preuve de livraison systématique.",
            color: "text-success",
            bgColor: "bg-success/10"
        },
        {
            icon: Heart,
            title: "Engagement",
            description: "Votre satisfaction est notre priorité. Une équipe support réactive disponible 7j/7 pour répondre à toutes vos questions.",
            color: "text-cta",
            bgColor: "bg-cta/10"
        },
        {
            icon: Award,
            title: "Excellence",
            description: "Plus de 10 000 livraisons réussies et une note de satisfaction client de 4.9/5. L'excellence au quotidien.",
            color: "text-accent-main",
            bgColor: "bg-accent/10"
        }
    ];

    const stats = [
        { value: "10 000+", label: "Livraisons réalisées" },
        { value: "500+", label: "Clients professionnels" },
        { value: "50+", label: "Chauffeurs partenaires" },
        { value: "4.9/5", label: "Satisfaction client" }
    ];

    const team = [
        {
            name: "Équipe Direction",
            role: "Stratégie & Vision",
            description: "Une équipe expérimentée en logistique et technologie pour piloter la croissance de One Connexion."
        },
        {
            name: "Équipe Opérations",
            role: "Coordination & Dispatch",
            description: "Nos coordinateurs gèrent en temps réel l'attribution des courses et le suivi des livraisons."
        },
        {
            name: "Équipe Support",
            role: "Service Client",
            description: "Disponible 7j/7, notre équipe support vous accompagne à chaque étape de vos livraisons."
        }
    ];

    return (
        <div className="min-h-screen font-sans">
            <SEO
                title="À Propos - Expert Logistique Flux Tendu"
                description="Expert logistique flux tendu. Société de transport française indépendante et partenaire logistique B2B premium."
                keywords="Expert logistique flux tendu, Transporteur agréé, Société de transport française indépendante, Partenaire logistique B2B premium, Flotte chauffeurs qualifiés, Avis fiabilité One Connexion transport, Histoire entreprise One Connexion, Qui est derrière One Connexion"
            />
            <Header />

            {/* Hero Section */}
            <section className="bg-primary text-primary-foreground py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-cta text-cta-foreground hover:bg-cta/90">Notre Histoire</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">
                        À propos de One Connexion
                    </h1>
                    <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
                        Née de la conviction que la livraison express peut être simple, fiable et accessible,
                        One Connexion révolutionne le transport de colis en Île-de-France depuis 2022.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-4 bg-primary/10 text-primary">Notre Mission</Badge>
                            <h2 className="text-3xl font-bold text-primary mb-6 font-display">
                                Simplifier la livraison express pour les professionnels
                            </h2>
                            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                                Chez One Connexion, nous avons une mission claire : permettre aux professionnels
                                de tous secteurs de faire livrer leurs colis urgents rapidement, en toute sécurité,
                                avec une transparence totale sur les tarifs et le suivi.
                            </p>
                            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                Que vous soyez un cabinet médical, un cabinet d'avocats, un garage automobile
                                ou un organisateur d'événements, nous comprenons vos contraintes et adaptons
                                notre service à vos besoins spécifiques.
                            </p>
                            <Link to="/contact">
                                <Button variant="cta" size="lg" className="gap-2">
                                    Nous contacter
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <Card key={index} className="p-6 text-center border-0 shadow-soft hover:shadow-medium transition-shadow">
                                    <p className="text-3xl font-bold text-primary font-display mb-2">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-primary/10 text-primary">Nos Valeurs</Badge>
                        <h2 className="text-3xl font-bold text-primary mb-4 font-display">
                            Ce qui nous guide au quotidien
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Chaque livraison est une promesse. Voici les valeurs qui nous permettent de la tenir.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card key={index} className="p-6 border-0 shadow-soft hover:shadow-medium transition-all bg-white">
                                <div className={`w-12 h-12 rounded-lg ${value.bgColor} flex items-center justify-center mb-4`}>
                                    <value.icon className={`h-6 w-6 ${value.color}`} />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-primary/10 text-primary">Notre Équipe</Badge>
                        <h2 className="text-3xl font-bold text-primary mb-4 font-display">
                            Des experts à votre service
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Une équipe passionnée, dédiée à faire de chaque livraison une réussite.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <Card key={index} className="p-8 border-0 shadow-soft hover:shadow-medium transition-all text-center">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                                <p className="text-sm text-cta font-medium mb-3">{member.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coverage Section */}
            <section className="py-20 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <MapPin className="h-8 w-8 text-cta" />
                        <h2 className="text-3xl font-bold font-display">Notre zone de couverture</h2>
                    </div>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                        Nous desservons Paris et l'ensemble de l'Île-de-France avec la même réactivité,
                        que vous soyez au cœur de la capitale ou en grande couronne.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Seine-et-Marne", "Yvelines", "Essonne", "Val-d'Oise"].map((dept, index) => (
                            <Badge key={index} className="bg-white/10 text-white border-white/20 px-4 py-2">
                                {dept}
                            </Badge>
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

export default About;
