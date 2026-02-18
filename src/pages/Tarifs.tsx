import { Card } from "@/components/ui/card";
import PricingSimulator from "@/components/client/PricingSimulator";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import SEO from "@/components/SEO";

const Tarifs = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO
        title="Tarifs Transport Express 2025"
        description="Grille tarifaire transport express 2025. Coût au kilomètre et devis transport sur mesure. Transparence totale."
        keywords="Grille tarifaire transport express 2025, Coût au kilomètre véhicule léger, Tarif course urgente, Comparatif prix coursier, Devis transport sur mesure, Combien coûte une livraison urgente de 50km ?, Prix moyen transport dédié véhicule utilitaire, Tarifs transparence transporteur"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 bg-[#0B1525] text-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-blue-900/20 to-transparent opacity-50 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif mb-6 animate-fade-in-up">
            Des tarifs <span className="text-[#D4AF37] italic">clairs</span> et transparents
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up delay-100">
            Choisissez la formule qui correspond à votre urgence. Pas de frais cachés, vous maîtrisez votre budget avant chaque commande.
          </p>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
          {/* Simulator Section */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-12">
              <span className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest mb-2 block">Estimation Immédiate</span>
              <h2 className="text-3xl font-serif text-[#0B1525] mb-4">Simulateur de coût</h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-light">
                Notre tarification fonctionne par système de <strong>Bons</strong> pour une transparence totale.
                <br />
                <span className="inline-block mt-4 bg-white px-4 py-2 rounded-full text-sm font-medium border border-[#D4AF37]/30 text-[#0B1525] shadow-sm">
                  1 Bon = 5.00€ HT
                </span>
              </p>
            </div>

            {/* Simulator Widget */}
            <div className="flex justify-center mb-16">
              <PricingSimulator variant="compact" />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif text-[#0B1525] mb-12 text-center">Questions Fréquentes</h2>
            <div className="grid gap-6">
              {[
                {
                  q: "Comment sont calculés les kilomètres ?",
                  a: "Nous utilisons l'API Google Maps pour calculer la distance réelle optimale (temps/trafic) entre l'enlèvement et la livraison au moment précis de votre commande."
                },
                {
                  q: "Puis-je payer sur facture ?",
                  a: "Oui, tous nos comptes professionnels bénéficient automatiquement de la facturation mensuelle récapitulative (fin de mois) avec un délai de paiement à 30 jours."
                },
                {
                  q: "Y a-t-il des frais d'attente ?",
                  a: "Les 10 premières minutes d'attente sont offertes. Au-delà, une facturation de 0,50€/min s'applique pour rémunérer le temps du chauffeur immobilisé."
                },
                {
                  q: "La TVA est-elle récupérable ?",
                  a: "Absolument. Toutes nos prestations sont soumises à la TVA (20%). Vous recevez une facture acquittée détaillée pour vos déclarations."
                }
              ].map((item, i) => (
                <Card key={i} className="p-8 border border-gray-100 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300 rounded-xl">
                  <h3 className="font-serif text-lg text-[#0B1525] mb-3">{item.q}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tarifs;
