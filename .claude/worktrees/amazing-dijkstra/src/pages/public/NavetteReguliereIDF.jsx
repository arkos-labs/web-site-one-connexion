import SEOPageLayout from "../../components/SEOPageLayout";

export default function NavetteReguliereIDF() {
  return (
    <SEOPageLayout
      title="Navettes Régulières & Tournées Paris"
      subtitle="Optimisez vos flux internes avec des liaisons programmées à heures fixes dans toute l'Île-de-France."
      heroImage="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80"
      description={`
        La mise en place de navettes régulières est la solution idéale pour les entreprises multisites souhaitant stabiliser leurs coûts logistiques et garantir une fluidité totale de leurs échanges internes.

        One Connexion conçoit pour vous des itinéraires sur-mesure, avec des passages programmés (quotidiens, hebdomadaires ou bi-hebdomadaires) pour le transport de votre courrier, de vos dossiers, de vos échantillons ou de vos petites marchandises.
      `}
      benefits={[
        "Réduction significative des coûts de transport",
        "Passages à heures fixes garantis",
        "Chauffeurs dédiés connaissant vos procédures",
        "Planification flexible selon vos besoins",
        "Facturation mensuelle forfaitaire simplifiée"
      ]}
      useCases={[
        "Liaisons siège social <-> Sites de production",
        "Tournées de ramassage de courrier interne",
        "Approvisionnement régulier de points de vente",
        "Transferts de documents comptables et RH"
      ]}
      seoText={(
        <>
          <p>Le service de <strong>navette régulière en Île-de-France</strong> permet de transformer une logistique subie en un flux maîtrisé. One Connexion devient le trait d'union permanent entre vos différentes implantations géographiques, assurant une continuité de service irréprochable.</p>
          <p>Confiez-nous la gestion de vos <strong>tournées logistiques programmées</strong> pour gagner en efficacité opérationnelle.</p>
        </>
      )}
      faqs={[
        {
          q: "Pouvons-nous modifier la fréquence des passages ?",
          a: "Oui, notre service est évolutif. Vous pouvez augmenter ou réduire le nombre de passages par semaine avec un simple préavis de 48 heures."
        },
        {
          q: "Est-ce le même chauffeur qui intervient à chaque fois ?",
          a: "Dans la mesure du possible, nous assignons un chauffeur attitré à vos tournées régulières pour garantir une parfaite connaissance de vos accès et de vos interlocuteurs."
        },
        {
          q: "Comment sont calculés les forfaits ?",
          a: "Le tarif est basé sur la distance totale de la tournée, le temps de mise à disposition et le type de véhicule requis. C'est la solution la plus économique pour les flux récurrents."
        }
      ]}
    />
  );
}

