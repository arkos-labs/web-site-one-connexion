import SEOPageLayout from "../components/SEOPageLayout";

export default function CoursierEvenementielParis() {
  return (
    <SEOPageLayout
      title="Coursier Événementiel Paris"
      subtitle="Livraison haute priorité de supports marketing, badges, stands et matériel technique pour salons et conférences."
      heroImage="https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?auto=format&fit=crop&q=80"
      description={`
        Dans le monde de l'événementiel, l'imprévu est la seule certitude. One Connexion accompagne les agences, les exposants et les organisateurs pour relever tous les défis logistiques de dernière minute à Paris et en Île-de-France.

        Qu'il s'agisse de livrer des brochures oubliées, du matériel informatique critique ou des éléments de décoration pour un stand, nos coursiers interviennent 24h/24 et 7j/7 pour garantir le succès de vos événements.
      `}
      benefits={[
        "Intervention 24h/24 et 7j/7 (nuit et week-end)",
        "Accès prioritaire aux parcs d'expositions (Viparis, etc.)",
        "Véhicules adaptés (du deux-roues au fourgon)",
        "Coordination directe avec les équipes sur site",
        "Suivi en temps réel pour une sérénité totale"
      ]}
      useCases={[
        "Oublis de dernière minute (badges, catalogues)",
        "Transfert de matériel technique fragile",
        "Réapprovisionnement de stands en cours de salon",
        "Livraison de cadeaux clients pour soirées VIP"
      ]}
      seoText={(
        <>
          <p>La réussite d'un <strong>événement à Paris</strong> (Porte de Versailles, Villepinte, Palais des Congrès) repose sur une logistique millimétrée. Un <strong>coursier événementiel</strong> réactif est votre meilleur allié pour pallier les urgences sans stress.</p>
          <p>One Connexion dispose de l'expérience nécessaire pour naviguer dans les accès complexes des grands centres d'expositions et livrer directement sur votre stand ou en loge.</p>
        </>
      )}
      faqs={[
        {
          q: "Pouvez-vous livrer tard le soir ou le dimanche ?",
          a: "Oui, nous savons que l'événementiel ne dort jamais. Nos équipes sont mobilisables à toute heure pour vos livraisons critiques."
        },
        {
          q: "Livrez-vous directement sur les stands à Expo Porte de Versailles ?",
          a: "Absolument. Nos coursiers connaissent les accès et peuvent livrer vos colis directement à l'adresse précise de votre stand."
        },
        {
          q: "Gérez-vous le transport de matériel volumineux ?",
          a: "Oui, nous disposons d'une flotte variée capable de transporter aussi bien une enveloppe de badges que des éléments de mobilier ou des écrans géants."
        }
      ]}
    />
  );
}
