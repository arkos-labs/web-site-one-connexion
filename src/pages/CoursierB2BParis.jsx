import SEOPageLayout from "../components/SEOPageLayout";

export default function CoursierB2BParis() {
  return (
    <SEOPageLayout
      title="Coursier B2B Paris & IDF"
      subtitle="Solution de transport express et messagerie dédiée aux entreprises parisiennes."
      heroImage="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80"
      description={`
        One Connexion est le partenaire logistique privilégié des entreprises à Paris et en Île-de-France. Nous comprenons que chaque envoi B2B porte un enjeu commercial, juridique ou opérationnel majeur. 

        C'est pourquoi nous avons conçu une offre de messagerie flexible, capable de s'adapter à vos pics d'activité comme à vos besoins récurrents, avec une exigence de fiabilité absolue.
      `}
      benefits={[
        "Réactivité record : Enlèvement en moins de 20 min",
        "Preuve de livraison (POD) numérique instantanée",
        "Facturation mensuelle consolidée pour les pros",
        "Flotte multi-véhicules (Moto, Auto, Camion)",
        "Service client dédié aux comptes entreprises"
      ]}
      useCases={[
        "Livraison urgente de plis et colis",
        "Optimisation de tournées de distribution",
        "Navettes inter-filiales programmées",
        "Gestion des retours et SAV clients"
      ]}
      seoText={(
        <>
          <p>Le <strong>transport B2B à Paris</strong> exige une connaissance parfaite du terrain. Nos coursiers sont des professionnels aguerris qui représentent votre image de marque lors de chaque livraison. En choisissant One Connexion, vous optez pour une <strong>logistique urbaine</strong> performante et décarbonée.</p>
          <p>De la petite PME au grand groupe international, nous accompagnons tous les acteurs économiques de la région parisienne dans leurs défis quotidiens.</p>
        </>
      )}
      faqs={[
        {
          q: "Comment ouvrir un compte professionnel ?",
          a: "L'ouverture se fait en quelques clics. Vous bénéficierez alors d'une interface de gestion dédiée et d'une facturation mensuelle à 30 jours."
        },
        {
          q: "Quelles zones couvrez-vous ?",
          a: "Nous intervenons sur l'ensemble de Paris intra-muros et dans tous les départements d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)."
        },
        {
          q: "Gérez-vous la traçabilité des envois ?",
          a: "Oui, chaque course est suivie en temps réel. Vous recevez une notification dès que le destinataire a signé la preuve de réception numérique."
        }
      ]}
    />
  );
}
