import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function CoursierB2BParis() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <h1 className="text-3xl font-bold">Coursier B2B à Paris</h1>
        <p className="mt-2 text-sm text-slate-500">Publié le 20/01/2026 • Par One Connexion</p>
        <p className="mt-6 text-slate-600">
          One Connexion accompagne les entreprises parisiennes avec un service de messagerie B2B rapide,
          fiable et traçable. Notre flotte 2‑roues et véhicules adaptés permet d’acheminer plis, colis
          et marchandises urgentes dans Paris intra‑muros avec preuve de livraison (POD).
        </p>
        <p className="mt-4 text-slate-600">
          Les secteurs optique, dentaire, juridique, santé, événementiel et automobile ont des contraintes
          spécifiques (délais serrés, documents sensibles, pièces critiques). Nous proposons des courses
          urgentes à la demande, des navettes régulières, et des circuits optimisés pour limiter les coûts.
        </p>
        <p className="mt-4 text-slate-600">
          Demandez un devis instantané ou planifiez vos tournées récurrentes. Nous couvrons Paris et l’Île‑de‑France
          avec une prise en charge rapide et une facturation claire.
        </p>
      
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Pourquoi choisir One Connexion ?</h2>
          <ul className="mt-4 list-disc pl-6 space-y-2"><li className="text-slate-600">Délais courts, prise en charge rapide et délais maîtrisés pour vos flux critiques.</li><li className="text-slate-600">POD numérique et facturation mensuelle claire pour simplifier l’administratif.</li><li className="text-slate-600">Flotte adaptée : moto, voiture, utilitaire selon le gabarit et l’urgence.</li></ul>
          <p className="mt-4 text-slate-600">Contactez-nous pour un devis rapide et une prise en charge immédiate.</p>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Cas d’usage B2B</h2>
          <p className="mt-3 text-slate-600">Nos clients utilisent le service pour la messagerie quotidienne, les urgences et les tournées régulières. Nous adaptons les véhicules et les délais à chaque besoin.</p>
        </section>
      
        <section className="mt-8"><p className="mt-3 text-slate-600">En cœur de ville, chaque minute compte. Nous proposons des créneaux immédiats, un dispatch optimisé et un pilotage centralisé pour les directions logistiques et services administratifs. La preuve de livraison est horodatée et centralisée.</p><p className="mt-3 text-slate-600">Nous opérons sur l’ensemble de Paris intra‑muros et adaptons la prise en charge selon la criticité : course urgente, envoi planifié, ou navette récurrente. Vous gardez la maîtrise de vos coûts avec une facturation mensuelle claire.</p>
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
