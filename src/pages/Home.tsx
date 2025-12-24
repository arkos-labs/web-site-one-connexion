import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import {
  Zap,
  Shield,
  MapPin,
  Stethoscope,
  Scale,
  Calendar,
  Car,
  Clock,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-delivery-paris.jpg";
import PricingSimulator from "@/components/client/PricingSimulator";

const Home = () => {
  const expertises = [
    {
      title: "Médical",
      icon: Stethoscope,
      description: "Lorem ipsum dolor sit amet, consectetuer or adipiscing elit, sed d...",
      link: "/expertises/medical"
    },
    {
      title: "Juridique",
      icon: Scale,
      description: "Lorem ipsum dolor sit amet, consectetuer or adipiscing elit, sed d...",
      link: "/expertises/juridique"
    },
    {
      title: "Événementiel",
      icon: Calendar,
      description: "Lorem ipsum dolor sit amet, consectetuer or adipiscing elit, sed d...",
      link: "/expertises/evenementiel"
    },
    {
      title: "Automobile",
      icon: Car,
      description: "Lorem ipsum dolor sit amet, consectetuer or adipiscing elit, sed d...",
      link: "/expertises/automobile"
    },
  ];

  const services = [
    {
      icon: Zap,
      title: "Rapidité Express",
      description: "Service premium de courser express pour professionnels et particuliers de pourant.",
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "Service premium de courser express pour professionnels et ast particulier na reniorant.",
    },
    {
      icon: MapPin,
      title: "Suivi Temps Réel",
      description: "Service tenihe en estemaire a tirer sus soeriss ness srenitoersons des locaons ont eatnisse.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0B1525]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1525] via-[#0B1525]/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-2xl animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                Vos livraisons urgentes <br />
                en moins de <span className="text-[#D4AF37] italic">2h</span>
              </h1>

              <p className="text-lg text-gray-300 max-w-lg leading-relaxed font-light">
                Service premium de coursier express pour professionnels et particuliers.
                Disponible 24/7 dans toute l'Île-de-France.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link to="/commande-sans-compte">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#C5A028] to-[#E5C558] hover:from-[#B08D1F] hover:to-[#D4B346] text-white border-0 font-medium px-8 h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Commander maintenant
                  </Button>
                </Link>
                <Link to="/tarifs">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-full"
                  >
                    Voir les tarifs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Simulator */}
            <div className="lg:pl-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <PricingSimulator variant="compact" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-gray-50 to-transparent opacity-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-[#0B1525] mb-6">Nos Services d'Excellence</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Une logistique de pointe pensée pour les exigences des professionnels.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="p-10 text-center bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 rounded-2xl group cursor-default">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border-[0.5px] border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-500">
                <Zap className="h-10 w-10 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" strokeWidth={0.8} />
              </div>
              <h3 className="text-2xl font-serif text-[#0B1525] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                Rapidité Express
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px] px-2 mb-8 font-light">
                Livraison en <strong className="font-medium text-gray-900">moins de 2h</strong> sur tout Paris et l'Île-de-France. Nos coursiers sont disponibles immédiatement 24h/7j pour vos plis urgents et colis critiques.
              </p>
              <div className="w-16 h-px bg-[#D4AF37] mx-auto opacity-30 group-hover:w-24 group-hover:opacity-100 transition-all duration-500" />
            </Card>

            <Card className="p-10 text-center bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 rounded-2xl group cursor-default">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border-[0.5px] border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-500">
                <Shield className="h-10 w-10 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" strokeWidth={0.8} />
              </div>
              <h3 className="text-2xl font-serif text-[#0B1525] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                Sécurité Maximale
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px] px-2 mb-8 font-light">
                Transport sécurisé et confidentiel. Chaque mission est couverte par notre <strong className="font-medium text-gray-900">assurance ad-valorem</strong>. Nos chauffeurs sont formés, vérifiés et dédiés à l'intégrité de vos biens.
              </p>
              <div className="w-16 h-px bg-[#D4AF37] mx-auto opacity-30 group-hover:w-24 group-hover:opacity-100 transition-all duration-500" />
            </Card>

            <Card className="p-10 text-center bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 rounded-2xl group cursor-default">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border-[0.5px] border-[#D4AF37]/30 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-500">
                <MapPin className="h-10 w-10 text-[#D4AF37] transition-transform duration-500 group-hover:scale-110" strokeWidth={0.8} />
              </div>
              <h3 className="text-2xl font-serif text-[#0B1525] mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                Suivi Temps Réel
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px] px-2 mb-8 font-light">
                Gardez le contrôle grâce à notre technologie de <strong className="font-medium text-gray-900">géolocalisation live</strong>. Recevez des notifications à chaque étape : enlèvement, trajet et preuve de livraison signée.
              </p>
              <div className="w-16 h-px bg-[#D4AF37] mx-auto opacity-30 group-hover:w-24 group-hover:opacity-100 transition-all duration-500" />
            </Card>
          </div>
        </div>
      </section>

      {/* Expertises Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#0B1525] mb-6">Nos Expertises</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertises.map((expertise, index) => (
              <Card
                key={index}
                className="flex flex-col h-full p-8 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group"
              >
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <expertise.icon className="h-10 w-10 text-[#D4AF37]" strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-[#0B1525] mb-4">
                    {expertise.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {expertise.description}
                  </p>
                </div>

                <div className="mt-auto text-center">
                  <Link to={expertise.link}>
                    <Button
                      className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#967D2B] font-medium px-6 rounded-full transition-colors duration-300"
                      size="sm"
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

      <Footer />
    </div>
  );
};

export default Home;
