import SEOPageLayout from "../components/SEOPageLayout";

export default function CoursierDentisteParis() {
  return (
    <SEOPageLayout
      title="Coursier Dentiste & Prothésiste Paris"
      subtitle="Transport express de prothèses dentaires, empreintes et matériel de santé entre cabinets et laboratoires."
      heroImage="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80"
      description={`
        La logistique dentaire exige une rigueur absolue. One Connexion accompagne les chirurgiens-dentistes et les laboratoires de prothèses dans toute l'Île-de-France pour assurer des transferts rapides et hygiéniques.

        Nous comprenons que chaque minute compte pour vos rendez-vous patients. C'est pourquoi nos coursiers sont formés à la gestion des empreintes fraîches et des travaux de prothèse finis, garantissant une livraison sans accroc.
      `}
      benefits={[
        "Respect strict des horaires de rendez-vous",
        "Transport sécurisé et hygiénique",
        "Coursiers professionnels et discrets",
        "Suivi GPS en temps réel des plis",
        "Service disponible dès 8h le matin"
      ]}
      useCases={[
        "Ramassage d'empreintes matinales",
        "Livraison de prothèses (fixes ou mobiles)",
        "Dépannage urgent de petit matériel",
        "Navettes inter-cabinets ou multi-sites"
      ]}
      seoText={(
        <>
          <p>Le métier de <strong>dentiste à Paris</strong> ou de laboratoires de prothèses nécessite une réactivité sans faille. En externalisant vos courses à One Connexion, vous gagnez en sérénité et pouvez vous concentrer sur le soin de vos patients.</p>
          <p>Nos solutions de <strong>messagerie dentaire</strong> sont pensées pour fluidifier vos échanges quotidiens avec vos partenaires techniques.</p>
        </>
      )}
      faqs={[
        {
          q: "Pouvez-vous passer tous les matins à la même heure ?",
          a: "Absolument. Nous mettons en place des tournées régulières pour le ramassage des empreintes ou la livraison des travaux du jour."
        },
        {
          q: "Comment garantissez-vous que les colis ne sont pas écrasés ?",
          a: "Nos coursiers utilisent des bagageries rigides et compartimentées pour éviter tout choc sur les moulages ou les travaux de précision."
        },
        {
          q: "Couvrez-vous la banlieue proche ?",
          a: "Oui, nous desservons tout Paris ainsi que la petite et grande couronne (92, 93, 94, 77, 78, 91, 95)."
        }
      ]}
    />
  );
}
