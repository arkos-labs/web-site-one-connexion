import SEOPageLayout from "../../components/SEOPageLayout";

export default function CoursierAutomobileParis() {
  return (
    <SEOPageLayout
      title="Coursier Automobile Paris"
      subtitle="Livraison critique de pièces détachées, cartes grises et documents pour concessions et garages."
      heroImage="https://images.unsplash.com/photo-1492144534655-ad79c964c9d7?auto=format&fit=crop&q=80"
      description={`
        Dans l'industrie automobile, l'immobilisation d'un véhicule est un coût majeur. One Connexion propose un service de coursier spécialisé pour les concessions, les garages et les carrosseries à Paris et en Île-de-France. 

        Nous assurons l'approvisionnement ultra-rapide en pièces de rechange (mécanique, carrosserie) et le transport sécurisé de documents administratifs comme les cartes grises ou les dossiers de financement.
      `}
      benefits={[
        "Réaction flash pour pièces de rechange critiques",
        "Prise en charge de pièces lourdes ou encombrantes",
        "Livraison sécurisée de documents administratifs",
        "Suivi en temps réel pour coordination d'atelier",
        "Couverture totale des pôles automobiles d'IDF"
      ]}
      useCases={[
        "Transfert urgent de pièces (optiques, calculateurs)",
        "Récupération de dossiers de vente originaux",
        "Échanges entre concessions d'un même groupe",
        "Livraison de doubles de clés en urgence"
      ]}
      seoText={(
        <>
          <p>Le <strong>coursier automobile à Paris</strong> doit répondre à des impératifs de flux tendus. Que vous soyez un agent de marque ou une concession indépendante, One Connexion fluidifie votre logistique amont en réduisant les temps d'attente de vos techniciens d'atelier.</p>
          <p>Réduisez le temps d'immobilisation de vos clients grâce à notre <strong>messagerie automobile express</strong> disponible 7j/7.</p>
        </>
      )}
      faqs={[
        {
          q: "Pouvez-vous transporter des pièces volumineuses comme des pare-chocs ?",
          a: "Oui, nous disposons de fourgonnettes et de camions équipés pour transporter des pièces de carrosserie ou de mécanique de grand format."
        },
        {
          q: "Livrez-vous les documents d'immatriculation en mains propres ?",
          a: "Absolument. Les documents sensibles (cartes grises, WW) sont traités avec la plus grande sécurité et remis contre signature obligatoire."
        },
        {
          q: "Quels sont vos tarifs pour les tournées inter-garages ?",
          a: "Nous proposons des forfaits dégressifs pour les groupes automobiles ayant besoin de navettes régulières entre leurs différents sites."
        }
      ]}
    />
  );
}

