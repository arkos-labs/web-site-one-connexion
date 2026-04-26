import SEOPageLayout from "../../components/SEOPageLayout";

export default function MessagerieExpressIDF() {
  return (
    <SEOPageLayout
      title="Messagerie Express Paris & IDF"
      subtitle="Service de livraison ultra-rapide pour vos plis, colis et marchandises critiques en Île-de-France."
      heroImage="https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80"
      description={`
        La messagerie express One Connexion est conçue pour les entreprises qui ne peuvent pas attendre. Nous offrons une solution de transport point-à-point sans rupture de charge, garantissant l'intégrité de vos envois et le respect strict de vos impératifs horaires.

        De l'enlèvement immédiat à la remise en mains propres, notre service de messagerie allie technologie de suivi de pointe et savoir-faire logistique pour une expérience client irréprochable.
      `}
      benefits={[
        "Enlèvement prioritaire en moins de 30 minutes",
        "Zéro rupture de charge pour une sécurité maximale",
        "Traçabilité GPS de l'enlèvement à la livraison",
        "Accès à tous types de véhicules (Motos à Camions)",
        "Assurance transport ad valorem disponible"
      ]}
      useCases={[
        "Envois de documents originaux signés",
        "Expédition d'échantillons commerciaux",
        "Logistique de pièces détachées urgentes",
        "Livraisons VIP pour clients stratégiques"
      ]}
      seoText={(
        <>
          <p>Opter pour une <strong>messagerie express à Paris</strong> avec One Connexion, c'est choisir la tranquillité d'esprit. Nos processus sont optimisés pour les flux <strong>B2B urgents</strong>, vous permettant de suivre chaque étape de la mission via notre plateforme digitale dédiée.</p>
          <p>Nous intervenons sur tous les secteurs d'activité nécessitant une distribution rapide et fiable en région parisienne.</p>
        </>
      )}
      faqs={[
        {
          q: "Quelle est la taille maximale des colis ?",
          a: "Nous pouvons transporter tout type d'envoi, du simple pli jusqu'à la palette européenne (80x120), grâce à notre flotte variée."
        },
        {
          q: "Assurez-vous des livraisons le samedi ?",
          a: "Oui, notre service de messagerie express est opérationnel 7 jours sur 7 pour répondre aux besoins de continuité de nos clients pro."
        },
        {
          q: "Comment obtenir une preuve de livraison ?",
          a: "Dès que le colis est livré, vous recevez instantanément par email la preuve de livraison (POD) avec signature et nom du réceptionnaire."
        }
      ]}
    />
  );
}

