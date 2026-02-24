import SEOPageLayout from "../components/SEOPageLayout";

export default function TarifsCoursierParis() {
  return (
    <SEOPageLayout
      title="Tarifs Coursier Paris & Île-de-France"
      subtitle="Une tarification transparente, sans frais cachés, adaptée aux volumes des professionnels."
      heroImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80"
      description={`
        Chez One Connexion, nous croyons que la clarté tarifaire est la base d'un partenariat B2B durable. Nos tarifs sont calculés de manière équitable en fonction de la distance réelle, du type de véhicule requis et du degré d'urgence de la mission.

        Pas de frais de dossier, pas d'abonnement obligatoire. Vous payez ce que vous consommez, avec la garantie d'un service premium et d'une traçabilité totale incluse dans chaque course.
      `}
      benefits={[
        "Prix ferme annoncé avant la commande",
        "Pas de frais d'ouverture de compte",
        "Remises automatiques selon votre volume mensuel",
        "Facturation consolidée en fin de mois",
        "Assurance ad valorem incluse par défaut"
      ]}
      useCases={[
        "Courses en urgence immédiate (Paris intra-muros)",
        "Livraisons programmées à l'avance",
        "Tournées de distribution multi-points",
        "Liaisons régulières banlieue-banlieue"
      ]}
      seoText={(
        <>
          <p>Le <strong>prix d'un coursier à Paris</strong> varie selon plusieurs critères logistiques. One Connexion s'engage à offrir le meilleur rapport qualité/prix du marché B2B en optimisant les trajets de ses chauffeurs pour réduire les coûts et l'empreinte carbone.</p>
          <p>Découvrez nos solutions de <strong>messagerie économique</strong> pour vos envois moins urgents et optimisez votre budget transport dès aujourd'hui.</p>
        </>
      )}
      faqs={[
        {
          q: "Comment est calculé le prix d'une course ?",
          a: "Notre algorithme prend en compte la distance via Google Maps, le type de véhicule (moto, voiture, utilitaire) et le délai choisi (Normal, Urgent, Flash)."
        },
        {
          q: "Y a-t-il des majorations de nuit ou le week-end ?",
          a: "Oui, une majoration s'applique pour les interventions en dehors des heures de bureau (8h-19h) et les jours fériés, afin de garantir la disponibilité de nos coursiers."
        },
        {
          q: "Proposez-vous une facturation au forfait ?",
          a: "Absolument. Pour les tournées régulières ou les navettes quotidiennes, nous établissons un forfait fixe mensuel très avantageux."
        }
      ]}
    />
  );
}
