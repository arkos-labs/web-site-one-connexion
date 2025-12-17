import { Card } from "@/components/ui/card";
import PricingSimulator from "@/components/client/PricingSimulator";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";

const Tarifs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fade-in-up">
            Des tarifs <span className="text-cta">clairs</span> et transparents
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
            Choisissez la formule adaptée à vos besoins. Pas de frais cachés, vous savez exactement ce que vous payez avant de commander.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 -mt-10">


        {/* Simulator Section */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-primary mb-4">Simulateur de coût</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Notre tarification est basée sur un système de <strong>Bons</strong> transparent.
              <br />
              <span className="inline-block mt-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/10">
                1 Bon = 5.50€ HT
              </span>
            </p>
          </div>

          <PricingSimulator />
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-primary mb-8 text-center">Questions fréquentes sur la facturation</h2>
          <div className="grid gap-6">
            {[
              {
                q: "Comment sont calculés les kilomètres ?",
                a: "Nous utilisons l'API Google Maps pour calculer la distance réelle la plus rapide entre le point d'enlèvement et le point de livraison au moment de la commande."
              },
              {
                q: "Puis-je payer sur facture ?",
                a: "Oui, les comptes professionnels bénéficient de la facturation mensuelle avec un délai de paiement à 30 jours. Pour les particuliers, le paiement se fait à la commande."
              },
              {
                q: "Y a-t-il des frais d'attente ?",
                a: "Les 10 premières minutes d'attente au point d'enlèvement ou de livraison sont gratuites. Au-delà, nous facturons 0,50€ par minute supplémentaire."
              },
              {
                q: "La TVA est-elle récupérable ?",
                a: "Absolument. Toutes nos courses sont soumises à la TVA (20%) et vous recevez une facture détaillée pour chaque prestation permettant la récupération de la TVA."
              }
            ].map((item, i) => (
              <Card key={i} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg text-primary mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tarifs;
