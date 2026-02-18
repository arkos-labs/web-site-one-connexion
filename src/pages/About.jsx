import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function About() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <p className="text-xs text-slate-500">Publié le <time dateTime="2026-01-20">20/01/2026</time> • Par One Connexion</p>
        <h1>À propos de One Connexion</h1>
        <p>
          One Connexion est une plateforme de messagerie B2B et de coursier express à Paris et en Île‑de‑France.
          Notre mission est simple : permettre aux entreprises d’envoyer plis urgents, colis sensibles et marchandises
          avec un service rapide, traçable et transparent.
        </p>

        <h2>Notre promesse</h2>
        <p>
          Nous combinons réactivité et preuve de livraison (POD) pour sécuriser vos flux.
          Chaque course est planifiée selon le niveau d’urgence, le gabarit et la destination. Le tout avec une facturation
          mensuelle claire, adaptée aux besoins B2B.
        </p>

        <h2>Pourquoi les entreprises nous choisissent</h2>
        <ul>
          <li>Prise en charge rapide dans Paris et toute l’Île‑de‑France.</li>
          <li>Flotte multi‑véhicules : moto, voiture, utilitaire selon le besoin.</li>
          <li>Notifications et POD horodaté.</li>
          <li>Facturation mensuelle et pilotage centralisé.</li>
          <li>Un interlocuteur dédié pour les comptes professionnels.</li>
        </ul>

        <h2>Nos secteurs clés</h2>
        <p>
          Nous travaillons avec des opticiens, dentistes, cabinets juridiques, entreprises de santé, acteurs de l’événementiel,
          garages et concessions automobiles, ainsi que des e‑commerçants. Chaque secteur impose des contraintes spécifiques :
          délais serrés, confidentialité, ou nécessité d’éviter l’immobilisation d’un véhicule.
        </p>

        <h2>Process simple, efficace</h2>
        <p>
          En quelques clics, vous planifiez une course, suivez le trajet, et recevez une preuve de livraison. Pour les besoins
          récurrents, nous mettons en place des tournées régulières et navettes programmées afin d’optimiser vos coûts.
        </p>

        <h2>Questions fréquentes</h2>
        <p><strong>Intervenez‑vous en dehors de Paris ?</strong> Oui, nous couvrons toute l’Île‑de‑France.</p>
        <p><strong>Proposez‑vous des forfaits ?</strong> Oui, pour les comptes B2B avec volumes réguliers.</p>
        <p><strong>La livraison est‑elle traçable ?</strong> Oui, POD fourni à la livraison.</p>

        <h2>Contact</h2>
        <p>
          Vous souhaitez ouvrir un compte pro ou obtenir un devis ?
          Contactez notre équipe via la page Contact.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
