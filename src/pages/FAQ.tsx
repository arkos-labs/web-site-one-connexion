import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";
import SEO from "@/components/SEO";

const FAQ = () => {
  const categories = [
    {
      title: "Commandes et livraisons",
      questions: [
        {
          q: "Comment passer une commande ?",
          a: "Vous pouvez passer commande de trois façons : via votre espace client en ligne, par téléphone au 01 XX XX XX XX, ou sans compte sur notre page de commande rapide.",
        },
        {
          q: "Quels sont les délais de livraison ?",
          a: "Nous proposons trois formules : Standard (sous 2h), Express (sous 1h) et Flash Express (sous 30min). Les délais sont garantis selon la formule choisie.",
        },
        {
          q: "Puis-je suivre ma livraison en temps réel ?",
          a: "Oui, toutes nos livraisons sont équipées d'un suivi GPS en temps réel. Vous recevez un lien de suivi dès l'attribution du chauffeur.",
        },
        {
          q: "Quelle est la zone de couverture ?",
          a: "Nous couvrons toute l'Île-de-France : Paris et les départements 92, 93, 94, 95, 77, 78 et 91.",
        },
      ],
    },
    {
      title: "Tarifs et paiement",
      questions: [
        {
          q: "Comment sont calculés les tarifs ?",
          a: "Nos tarifs dépendent de la distance (base 0-10km puis 2€/km supplémentaire) et de la formule choisie. Des majorations s'appliquent pour les livraisons de nuit (+20%) et les dimanches/jours fériés (+25%).",
        },
        {
          q: "Quels moyens de paiement acceptez-vous ?",
          a: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements et les prélèvements SEPA pour les comptes professionnels.",
        },
        {
          q: "Proposez-vous des forfaits mensuels ?",
          a: "Oui, nous avons trois forfaits : Starter (50 courses/mois), Business (200 courses/mois) et Enterprise (illimité). Contactez-nous pour un devis personnalisé.",
        },
        {
          q: "Y a-t-il des frais cachés ?",
          a: "Non, tous nos tarifs sont transparents. Le prix affiché au moment de la commande est le prix final, majorations comprises.",
        },
      ],
    },
    {
      title: "Sécurité et assurance",
      questions: [
        {
          q: "Mes colis sont-ils assurés ?",
          a: "Oui, tous nos colis sont assurés. L'assurance de base est incluse (jusqu'à 500€). Pour des valeurs supérieures, une assurance complémentaire est disponible.",
        },
        {
          q: "Comment garantissez-vous la confidentialité ?",
          a: "Nos chauffeurs sont formés aux protocoles de confidentialité, notamment pour les secteurs sensibles (santé, juridique). Nous respectons le RGPD et toutes vos données sont chiffrées.",
        },
        {
          q: "Que faire en cas de problème lors de la livraison ?",
          a: "Contactez immédiatement notre support au 01 XX XX XX XX ou via la messagerie de votre espace client. Nous intervenons en temps réel pour résoudre tout incident.",
        },
      ],
    },
    {
      title: "Compte et services",
      questions: [
        {
          q: "Dois-je créer un compte pour commander ?",
          a: "Non, vous pouvez commander sans compte via notre formulaire de commande rapide. Cependant, un compte vous permet de suivre vos commandes, accéder à vos factures et gérer vos adresses favorites.",
        },
        {
          q: "Comment modifier mes informations de compte ?",
          a: "Connectez-vous à votre espace client et accédez à la section 'Paramètres' pour modifier vos informations personnelles, adresses et préférences.",
        },
        {
          q: "Proposez-vous un service client dédié ?",
          a: "Oui, notre équipe support est disponible 7j/7 par téléphone, email et messagerie instantanée via votre espace client.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="FAQ - Questions Fréquentes Transport"
        description="Retrouvez toutes les réponses à vos questions sur nos services de transport : délais, tarifs, assurance, suivi colis et ouverture de compte."
        keywords="Assurance transport ad valorem, Questions fréquentes livraison express, Aide expédition colis, FAQ transporteur logistique, Comment suivre mon colis One Connexion ?, Délais livraison urgence, Paiement facture transport"
      />
      <Header />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-center">
            Questions fréquentes
          </h1>
          <p className="text-xl text-center max-w-2xl mx-auto opacity-90">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {categories.map((category, index) => (
            <Card key={index} className="p-8 shadow-soft border-0">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((item, qIndex) => (
                  <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

      </div>


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
    </div >
  );
};

export default FAQ;
