import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function DevisCoursierParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Devis coursier Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 01/02/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Obtenez un devis rapide pour une course urgente à Paris. One Connexion calcule le prix selon
          la distance, le véhicule, l’urgence et le gabarit. Transparence totale, sans surprise.
        </p>
        <p className="mt-4 text-slate-600">
          Pour les entreprises, nous proposons aussi des forfaits mensuels et des navettes régulières.
          Contactez‑nous pour une estimation personnalisée.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Devis rapide selon distance, véhicule, urgence et gabarit.</li><li className="text-slate-600">Possibilité de forfaits mensuels pour entreprises régulières.</li><li className="text-slate-600">Engagement de transparence sur les tarifs.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Le devis intègre la distance réelle, le type de véhicule, le niveau d’urgence et les contraintes de livraison. Vous obtenez un prix clair avant validation.</p><p className="mt-3 text-slate-600">Pour les entreprises avec volumes récurrents, nous proposons des forfaits mensuels et des conditions préférentielles.</p>
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
