
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import {
  Zap,
  Shield,
  MapPin,
  Clock,
  ArrowRight,
  Stethoscope,
  Scale,
  Calendar,
  Car
} from "lucide-react";
import heroImage from "@/assets/hero-delivery-paris.jpg";

import PricingSimulator from "@/components/client/PricingSimulator";

const Home = () => {
  const expertises = [
    {
      title: "Médical",
      icon: Stethoscope,
      description: "Transport dédié pour les professionnels de santé : laboratoires, hôpitaux, cliniques, EFS, pharmacies.",
      link: "/expertises/medical"
    },
    {
      title: "Juridique",
      icon: Scale,
      description: "Acheminement confidentiel pour avocats, notaires, huissiers, tribunaux : dossiers sensibles, plis urgents, documents sous chaîne de traçabilité.",
      link: "/expertises/juridique"
    },
    {
      title: "Événementiel",
      icon: Calendar,
      description: "Livraison rapide pour agences, productions et marques : invitations, badges, kits presse, éléments scéniques légers, documents VIP.",
      link: "/expertises/evenementiel"
    },
    {
      title: "Automobile",
      icon: Car,
      description: "Acheminement express de pièces auto, outillages, documents de concession, cartes grises et éléments techniques.",
      link: "/expertises/automobile"
    },
  ];

  const advantages = [
    {
      icon: Zap,
      title: "Rapidité Express",
      description: "Livraison en moins de 2h dans toute l'Île-de-France",
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "Assurance tous risques et chauffeurs vérifiés",
    },
    {
      icon: MapPin,
      title: "Suivi Temps Réel",
      description: "Géolocalisation en direct de votre livraison",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <Badge className="mb-4 bg-cta text-cta-foreground">
              Livraison Express Île-de-France
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Vos livraisons urgentes en{" "}
              <span className="text-cta">moins de 2h</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Service premium de coursier express pour professionnels et particuliers.
              Disponible 24/7 dans toute l'Île-de-France.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/commande-sans-compte">
                <Button variant="cta" size="xl" className="group">
                  Commander maintenant
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/tarifs">
                <Button variant="outline" size="xl" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-strong transition-all duration-300 animate-fade-in-up border-0 shadow-soft"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-hero flex items-center justify-center">
                  <advantage.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-primary">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertises */}
      {/* Expertises */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">Nos Secteurs</Badge>
            <h2 className="text-4xl font-display font-bold mb-4 text-primary font-poppins">
              Nos Expertises
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-poppins">
              Des solutions dédiées pour chaque secteur d'activité
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertises.map((expertise, index) => (
              <Card
                key={index}
                className="flex flex-col h-full p-6 bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <expertise.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3 font-poppins">
                    {expertise.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-poppins">
                    {expertise.description}
                  </p>
                </div>

                <div className="mt-auto pt-4">
                  <Link to={expertise.link} className="w-full">
                    <Button
                      className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-bold py-2 rounded-lg transition-colors duration-300"
                    >
                      En savoir plus
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-cta text-cta-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Devis Instantané
              </Badge>
              <h2 className="text-4xl font-display font-bold mb-4 text-primary">
                Calculateur de Tarifs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estimez le coût de votre livraison en quelques clics grâce à notre système de Bons transparent.
              </p>
            </div>

            <PricingSimulator />
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

export default Home;
