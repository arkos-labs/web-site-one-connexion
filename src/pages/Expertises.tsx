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
      <section className="bg-[#0B1525] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-blue-900/20 to-transparent opacity-50 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif mb-6">Nos Domaines d'Expertise</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Des solutions logistiques de haute précision, adaptées aux contraintes spécifiques de chaque secteur d'activité.
          </p>
        </div>
      </section>

      {/* Expertises Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expertises.map((expertise, index) => (
              <Card
                key={index}
                className="p-8 flex flex-col items-center text-center bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 rounded-2xl group"
              >
                <div className="w-20 h-20 mb-6 rounded-full border-[0.5px] border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-500">
                  <expertise.icon className="h-8 w-8 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" strokeWidth={0.8} />
                </div>

                <h3 className="text-2xl font-serif text-[#0B1525] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                  {expertise.title}
                </h3>

                <div className="w-12 h-px bg-[#D4AF37] opacity-30 my-4 group-hover:w-20 group-hover:opacity-100 transition-all duration-500" />

                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-light flex-grow">
                  {expertise.description}
                </p>

                <Link to={expertise.link} className="w-full mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full border border-[#D4AF37]/30 text-[#0B1525] hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition-all duration-300 font-light tracking-wide rounded-lg"
                  >
                    En savoir plus
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-[#0B1525] mb-6">
            Une demande spécifique ?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto font-light">
            Notre équipe logistique analyse votre besoin et vous propose une solution sur-mesure sous 30 minutes.
          </p>
          <Link to="/contact">
            <Button
              className="bg-[#0B1525] text-white px-8 py-6 rounded-xl hover:bg-[#1a2c4e] transition-all shadow-lg hover:shadow-xl text-lg font-light tracking-wide transform hover:-translate-y-1"
            >
              Contactez notre équipe
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Expertises;
