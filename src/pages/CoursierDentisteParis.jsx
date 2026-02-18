import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function CoursierDentisteParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Coursier dentiste Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 10/02/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Transport urgent de prothèses et dossiers dentaires entre cabinets et laboratoires. Service
          rapide, sécurisé et traçable pour les professionnels de santé.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Transport sécurisé de prothèses et dossiers médicaux.</li><li className="text-slate-600">Livraisons urgentes entre cabinets et laboratoires.</li><li className="text-slate-600">Service discret et traçable.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Les cabinets dentaires exigent une précision logistique pour les prothèses et dossiers. Notre messagerie garantit sécurité, confidentialité et ponctualité.</p><p className="mt-3 text-slate-600">Nous proposons également des navettes entre laboratoires et cabinets pour sécuriser les délais.</p>
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
