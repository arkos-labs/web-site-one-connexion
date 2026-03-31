import SEOPageLayout from "../../components/SEOPageLayout";

export default function DevisCoursierParis() {
  return (
    <SEOPageLayout
      title="Devis Coursier Express Paris"
      subtitle="Réponse garantie en moins de 15 minutes pour vos besoins de transport critiques."
      heroImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80"
      description={`
        Vous avez un besoin urgent ou récurrent de transport en Île-de-France ? Obtenez une estimation précise et personnalisée pour vos courses professionnelles. One Connexion analyse vos contraintes (volume, fragilité, délais) pour vous proposer la solution la plus efficace.

        Que vous soyez une PME ou un grand groupe, nous nous adaptons à vos flux pour optimiser vos coûts logistiques tout en garantissant une qualité de service irréprochable.
      `}
      benefits={[
        "Cotation immédiate via notre simulateur",
        "Remises automatiques pour les comptes pro",
        "Accompagnement dédié pour les gros projets",
        "Zéro surprise : prix TTC tout compris",
        "Expertise sectorielle (Médical, Luxe, Auto)"
      ]}
      useCases={[
        "Demande de prix pour une course unique",
        "Simulation de budget pour tournées régulières",
        "Appel d'offre pour externalisation logistique",
        "Estimation de transport inter-sites régional"
      ]}
      seoText={(
        <>
          <p>Obtenir un <strong>devis coursier à Paris</strong> n'a jamais été aussi simple. Grâce à notre interface intuitive, vous pouvez comparer nos différents niveaux de service et choisir celui qui correspond parfaitement à votre urgence et à votre budget.</p>
          <p>Nos experts logistiques sont également à votre écoute pour établir des <strong>devis sur-mesure</strong> pour vos besoins complexes ou vos missions de longue durée.</p>
        </>
      )}
      faqs={[
        {
          q: "Le devis est-il gratuit ?",
          a: "Absolument. Toutes nos estimations sont gratuites et sans aucun engagement de votre part."
        },
        {
          q: "Combien de temps le devis est-il valable ?",
          a: "Une cotation pour une course ponctuelle est valable 24 heures. Pour un forfait mensuel, le devis est garanti pendant 3 mois."
        },
        {
          q: "Puis-je modifier ma demande après avoir reçu le devis ?",
          a: "Bien sûr. Nos conseillers peuvent ajuster les paramètres (véhicule, horaires) à tout moment pour coller au mieux à vos attentes réelles."
        }
      ]}
    />
  );
}

