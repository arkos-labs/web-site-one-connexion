import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function MessagerieExpressIDF() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Messagerie express Île‑de‑France</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 26/01/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          One Connexion propose une messagerie express B2B en Île‑de‑France : livraisons rapides,
          POD et facturation mensuelle claire. Idéal pour les plis urgents, échantillons,
          pièces techniques et marchandises sensibles.
        </p>
        <p className="mt-4 text-slate-600">
          Nos équipes optimisent vos trajets pour réduire les délais et les coûts, avec des créneaux adaptés
          à vos contraintes opérationnelles.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Transport express de plis, colis, échantillons et pièces sensibles.</li><li className="text-slate-600">Service B2B conçu pour la réactivité et la traçabilité.</li><li className="text-slate-600">Option de créneaux fixes pour une organisation régulière.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Notre messagerie express cible les entreprises ayant besoin de fiabilité et d’une traçabilité complète. Les envois sont sécurisés, les livraisons confirmées par POD et les incidents gérés.</p><p className="mt-3 text-slate-600">Des options de créneaux fixes et de priorisation garantissent la continuité d’activité. Vous bénéficiez d’un interlocuteur dédié pour ajuster le planning.</p>
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
