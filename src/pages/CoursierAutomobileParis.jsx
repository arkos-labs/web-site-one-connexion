import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function CoursierAutomobileParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Coursier automobile Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 19/02/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Livraison critique de pièces détachées pour garages et concessions. Réactivité maximale pour
          éviter l’immobilisation de véhicules (AOG/VOG).
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Livraison de pièces pour éviter l’immobilisation de véhicules.</li><li className="text-slate-600">Courses urgentes entre fournisseurs et garages.</li><li className="text-slate-600"> en  pour coordination atelier.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Pour éviter l’immobilisation de véhicules, nous livrons pièces et documents en urgence entre fournisseurs, garages et concessions.</p><p className="mt-3 text-slate-600"> en  et coordination atelier pour une meilleure planification.</p>
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
