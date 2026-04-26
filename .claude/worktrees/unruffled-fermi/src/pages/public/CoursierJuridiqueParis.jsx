import SEOPageLayout from "../../components/SEOPageLayout";

export default function CoursierJuridiqueParis() {
  return (
    <SEOPageLayout
      title="Coursier Juridique Paris"
      subtitle="Transport sécurisé d'actes, dossiers sensibles et pièces de procédure pour cabinets d'avocats et notaires."
      heroImage="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80"
      description={`
        Dans le domaine juridique, la confidentialité et le respect des délais de procédure sont non-négociables. One Connexion propose un service de coursier spécialisé pour les professionnels du droit à Paris et en Île-de-France. 

        Qu'il s'agisse de déposer une assignation au Tribunal de Grande Instance, de transférer des dossiers de plaidoirie ou de faire signer des actes notariés en urgence, nos coursiers garantissent une discrétion absolue et un horodatage précis.
      `}
      benefits={[
        "Confidentialité et discrétion garantie",
        "Respect strict des délais de procédure (TGI, Palais)",
        "Preuve de remise avec signature et horodatage",
        "Coursiers habitués aux lieux institutionnels",
        "Disponibilité immédiate pour les urgences"
      ]}
      useCases={[
        "Dépôt de dossiers aux Greffes et Tribunaux",
        "Échanges inter-cabinets d'avocats",
        "Transport d'actes notariés originaux",
        "Formalités administratives urgentes"
      ]}
      seoText={(
        <>
          <p>Le <strong>coursier juridique à Paris</strong> est un maillon essentiel de la chaîne de procédure. One Connexion s'engage à être votre bras droit logistique, vous évitant les déplacements chronophages et sécurisant vos envois les plus critiques.</p>
          <p>Nous comprenons les enjeux liés aux <strong>délais de rigueur</strong> et mettons tout en œuvre pour que vos documents arrivent à destination, en mains propres, sans délai.</p>
        </>
      )}
      faqs={[
        {
          q: "Pouvez-vous déposer des dossiers directement au Palais de Justice ?",
          a: "Oui, nos coursiers connaissent parfaitement les circuits des tribunaux parisiens et de la région pour effectuer vos dépôts en temps et en heure."
        },
        {
          q: "Comment est garantie la confidentialité ?",
          a: "Tous nos plis sont transportés dans des sacoches fermées et remis exclusivement au destinataire désigné ou au service habilité, avec une traçabilité complète."
        },
        {
          q: "Gérez-vous les retours de dossiers ?",
          a: "Absolument, nous pouvons organiser des courses aller-retour pour faire signer des documents et vous les rapporter immédiatement au cabinet."
        }
      ]}
    />
  );
}

