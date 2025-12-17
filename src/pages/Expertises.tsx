import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Scale, Calendar, Car } from "lucide-react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";

const Expertises = () => {
  const expertises = [
    {
      icon: Stethoscope,
      title: "Médical",
      description: "Transport dédié pour les professionnels de santé : laboratoires, hôpitaux, cliniques, EFS, pharmacies.",
      details: "Livraison sécurisée de prélèvements, PSL, dispositifs médicaux et matériel urgent en conformité stricte avec les normes sanitaires.",
      link: "/expertises/medical"
    },
    {
      icon: Scale,
      title: "Juridique",
      description: "Acheminement confidentiel pour avocats, notaires, huissiers, tribunaux : dossiers sensibles, plis urgents, documents sous chaîne de traçabilité.",
      details: "Respect absolu de la confidentialité, horodatage et preuve de remise sécurisée.",
      link: "/expertises/juridique"
    },
    {
      icon: Calendar,
      title: "Événementiel",
      description: "Livraison rapide pour agences, productions et marques : invitations, badges, kits presse, éléments scéniques légers, documents VIP.",
      details: "Service fiable, flexible, capable d'intervenir dans des délais courts pour garantir la fluidité des opérations terrain.",
      link: "/expertises/evenementiel"
    },
    {
      icon: Car,
      title: "Automobile",
      description: "Acheminement express de pièces auto, outillages, documents de concession, cartes grises et éléments techniques.",
      details: "Livraisons optimisées pour garages, concessions, centres techniques et distributeurs spécialisés.",
      link: "/expertises/automobile"
    }
  ];

  return (
    <div className="min-h-screen bg-secondary/30 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Nos Expertises</h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Des solutions de transport sur-mesure pour chaque secteur d'activité
          </p>
        </div>
      </section>

      {/* Expertises Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {expertises.map((expertise, index) => (
              <Card
                key={index}
                className="flex flex-col h-full p-8 bg-white border-none shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <expertise.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-primary mb-4">
                    {expertise.title}
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {expertise.description}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {expertise.details}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <Link to={expertise.link} className="w-full">
                    <Button
                      className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-bold py-6 text-lg transition-colors duration-300"
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

      {/* Bottom CTA */}
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

export default Expertises;
