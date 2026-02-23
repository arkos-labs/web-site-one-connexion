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
import heroImage from "@/assets/hero-courier-front.png";
import PricingSimulator from "@/components/client/PricingSimulator";
import SEO from "@/components/SEO";

const Home = () => {
  const expertises = [
    {
      title: "Médical",
      icon: Stethoscope,
      description: "Transport urgent de prélèvements biologiques, sang et matériel médical sous température dirigée. Respect strict des normes d'hygiène et délais critiques.",
      link: "/expertises/medical"
    },
    {
      title: "Juridique",
      icon: Scale,
      description: "Acheminement sécurisé et confidentiel de dossiers sensibles, actes originaux et plis urgents pour cabinets d'avocats, notaires et tribunaux.",
      link: "/expertises/juridique"
    },
    {
      title: "Événementiel",
      icon: Calendar,
      description: "Logistique express pour vos salons et événements. Livraison 24/7 de matériel, stands et supports de communication avec une fiabilité totale.",
      link: "/expertises/evenementiel"
    },
    {
      title: "Automobile",
      icon: Car,
      description: "Livraison critique de pièces détachées pour garages et concessions. Solution immédiate pour éviter l'immobilisation de véhicules (AOG/VOG).",
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
      <SEO
        title="One Connexion - Transport dédié sans rupture de charge"
        description="Transport dédié sans rupture de charge. Solution logistique dernier kilomètre et coursier express national immédiat pour professionnels."
        keywords="Transport dédié sans rupture de charge, Société de transport urgent, Coursier express national immédiat, Solution logistique dernier kilomètre, Transporteur colis urgence critique"
        image={heroImage}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900 pt-20 border-b border-slate-800">
        {/* Background Animation & Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] h-[800px] w-[800px] rounded-full bg-orange-500/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-slate-900/80 [mask-image:linear-gradient(to_bottom,white,transparent)] z-10" />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-2xl py-10 lg:py-0">
              <div className="animate-fade-in-up">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md border border-white/10 shadow-xl shadow-orange-500/10 transition-transform hover:scale-105">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Logistique B2B en temps réel
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                  La vitesse au service de votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 block sm:inline">business.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed font-medium mb-8">
                  One Connexion réinvente la livraison professionnelle. Suivi GPS direct, facturation automatisée et coursiers dédiés disponibles 24/7 en Île-de-France.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/commande-sans-compte" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-14 bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 text-[15px] uppercase tracking-wider rounded-full shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap">
                      Commander une course <ArrowRight size={18} />
                    </button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-14 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white hover:bg-slate-800 px-8 text-[15px] uppercase tracking-wider font-bold rounded-full transition-all duration-300 flex items-center justify-center whitespace-nowrap">
                      Espace Client
                    </button>
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span>Enlèvement &lt; 45min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>Assurance incluse</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Simulator */}
            <div className="lg:pl-8 relative z-30">
              <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
                <PricingSimulator variant="compact" />
              </div>
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


