import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function NavetteReguliereIDF() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Navette régulière Île‑de‑France</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 29/01/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          Mettez en place des tournées régulières entre vos sites en Île‑de‑France. Créneaux fixes,
          itinéraires optimisés et facturation mensuelle simplifiée.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Tournées programmées et créneaux récurrents pour vos flux internes.</li><li className="text-slate-600">Optimisation des coûts avec itinéraires planifiés.</li><li className="text-slate-600">Un interlocuteur dédié pour ajuster le planning.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">Les navettes régulières sont idéales pour les flux quotidiens : courrier, dossiers, échantillons, petites marchandises. Nous planifions des tournées optimisées et un passage à heure fixe.</p><p className="mt-3 text-slate-600">Chaque tournée est e en  et peut être ajustée en fonction de vos pics d’activité. La facturation est mensuelle et prévisible.</p>
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
