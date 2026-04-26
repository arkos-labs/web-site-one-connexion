import SEOPageLayout from "../../components/SEOPageLayout";

export default function CoursierIDF() {
  return (
    <SEOPageLayout
      title="Coursier Île-de-France"
      subtitle="Transport express et logistique B2B sur toute la région parisienne, du 75 au 95."
      heroImage="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80"
      description={`
        La logistique régionale à l'échelle de l'Île-de-France nécessite une expertise particulière et une flotte diversifiée. One Connexion assure vos livraisons B2B entre Paris, la petite couronne et la grande couronne avec une efficacité constante.

        Que vos sites soient basés à La Défense, Marne-la-Vallée, Évry ou Cergy, nos coursiers optimisent leurs trajets pour garantir des délais maîtrisés malgré les contraintes de trafic de la région capitale.
      `}
      benefits={[
        "Couverture totale des 8 départements d'IDF",
        "Véhicules adaptés aux trajets longue distance",
        "Optimisation d'itinéraires anti-bouchons",
        "Disponibilité étendue pour vos flux régionaux",
        "Tarification zonale transparente et sans surprise"
      ]}
      useCases={[
        "Liaisons quotidiennes Siège-Entrepôt",
        "Distribution multi-points en Île-de-France",
        "Livraison express vers les pôles d'activités",
        "Transferts de stocks urgents entre magasins"
      ]}
      seoText={(
        <>
          <p>Le <strong>coursier en Île-de-France</strong> est le trait d'union entre vos différents centres opérationnels. One Connexion réduit les distances en proposant des solutions de <strong>messagerie régionale</strong> performantes, adaptées aux besoins des entreprises multisites.</p>
          <p>Nous desservons quotidiennement les départements du 77, 78, 91, 92, 93, 94 et 95, en complément de nos services intra-muros à Paris.</p>
        </>
      )}
      faqs={[
        {
          q: "Combien de temps faut-il pour une livraison Paris-Grande Couronne ?",
          a: "Pour une course express, nous visons une livraison en 90 à 120 minutes selon la destination finale et les conditions de circulation."
        },
        {
          q: "Proposez-vous des utilitaires pour les gros volumes ?",
          a: "Oui, notre flotte comprend des breaks, des fourgonnettes et des camions 14m3 pour vos envois volumineux à travers toute l'IDF."
        },
        {
          q: "Gérez-vous les tournées régulières en banlieue ?",
          a: "C'est l'une de nos spécialités. Nous pouvons mettre en place des chauffeurs dédiés pour vos navettes quotidiennes ou hebdomadaires."
        }
      ]}
    />
  );
}

