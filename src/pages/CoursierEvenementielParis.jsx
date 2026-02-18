import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function CoursierEvenementielParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Coursier événementiel Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 16/02/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Livraison express de matériel, stands, badges et supports pour vos événements. Interventions
          rapides, y compris en horaires étendus.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Livraison de matériel, badges, stands et supports.</li><li className="text-slate-600">Interventions rapides y compris hors horaires classiques.</li><li className="text-slate-600">Coordination pour éviter les ruptures sur site.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">En événementiel, le moindre retard peut impacter l’organisation. Nous livrons supports, badges, matériel et urgences de dernière minute.</p><p className="mt-3 text-slate-600">Interventions possibles tôt le matin, tard le soir et le week‑end.</p>
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
