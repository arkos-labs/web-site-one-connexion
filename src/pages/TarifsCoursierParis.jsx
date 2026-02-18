import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function TarifsCoursierParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Tarifs coursier Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 04/02/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Les tarifs d’un coursier à Paris dépendent du véhicule, de la distance, du niveau d’urgence
          et de la plage horaire. Nous appliquons une tarification claire et maîtrisée.
        </p>
        <p className="mt-4 text-slate-600">
          Pour les entreprises B2B, des forfaits mensuels et des remises volume sont disponibles.
          Demandez un devis pour optimiser vos coûts logistiques.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Tarification claire basée sur la distance et le niveau d’urgence.</li><li className="text-slate-600">Remises volume et forfaits B2B disponibles.</li><li className="text-slate-600">Comparables aux standards du marché parisien.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Nos tarifs sont alignés sur les standards du marché parisien tout en garantissant un niveau de service premium. Les coûts sont transparents et détaillés.</p><p className="mt-3 text-slate-600">Les clients réguliers bénéficient d’optimisations via des tournées planifiées et des remises volume.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Questions fréquentes</h2>
          <div className="mt-3 space-y-3 text-slate-600">
            <p><strong>Quels délais ?</strong> De l’urgent immédiat aux créneaux planifiés selon vos besoins.</p>
            <p><strong>Preuve de livraison ?</strong> POD numérique horodaté, consultable par votre équipe.</p>
            <p><strong>Facturation ?</strong> Mensuelle et claire, avec récapitulatif détaillé.</p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
