import SEOPageLayout from "../../components/SEOPageLayout";

export default function CoursierOpticienParis() {
  return (
    <SEOPageLayout
      title="Coursier Opticien Paris"
      subtitle="Transport sécurisé de montures, verres et matériel optique pour les professionnels de la vision."
      heroImage="https://images.unsplash.com/photo-1511556532299-8f660fc56cff?auto=format&fit=crop&q=80"
      description={`
        Dans le secteur de l'optique, la précision et la rapidité sont essentielles. One Connexion propose un service de coursier dédié aux opticiens à Paris et en Île-de-France, assurant le transfert de vos marchandises entre laboratoires, ateliers et points de vente. 

        Que ce soit pour une livraison urgente de verres progressifs ou le transfert quotidien de collections de montures de luxe, nos coursiers sont formés à la manipulation de produits fragiles et précieux.
      `}
      benefits={[
        "Protection maximale des produits fragiles",
        "Livraison express en moins de 45 minutes",
        "Suivi en temps réel de vos marchandises",
        "Preuve de livraison numérique (POD)",
        "Intervention 7j/7 dans tout Paris & IDF"
      ]}
      useCases={[
        "Transfert inter-boutiques de montures",
        "Livraison client final à domicile",
        "Navettes quotidiennes Laboratoire -> Shop",
        "Gestion des urgences (SAV / Erreur commande)"
      ]}
      seoText={(
        <>
          <p>Pour les opticiens parisiens, la gestion du <strong>dernier kilomètre</strong> est un levier de satisfaction client majeur. One Connexion s'intègre comme un partenaire logistique transparent, vous permettant de tenir vos promesses de délais auprès de vos porteurs.</p>
          <p>Nos véhicules adaptés et nos coursiers aguerris au trafic urbain parisien garantissent une ponctualité à toute épreuve pour vos <strong>livraisons optiques urgentes</strong>.</p>
        </>
      )}
      faqs={[
        {
          q: "Quels sont vos délais pour un opticien dans Paris ?",
          a: "Nous intervenons en moyenne en moins de 15 minutes pour l'enlèvement, et la livraison s'effectue directement dans la foulée, soit souvent en moins de 45 minutes pour une course intra-muros."
        },
        {
          q: "Assurez-vous la sécurité des montures de luxe ?",
          a: "Oui, nos coursiers sont équipés de sacs de transport sécurisés et chaque mission est couverte par une assurance transport. Nous sommes habitués à manipuler des articles à haute valeur ajoutée."
        },
        {
          q: "Proposez-vous des tarifs préférentiels pour les opticiens ?",
          a: "Nous proposons des forfaits adaptés au volume ou la possibilité d'ouvrir un compte professionnel avec facturation mensuelle pour les envois récurrents."
        }
      ]}
    />
  );
}

