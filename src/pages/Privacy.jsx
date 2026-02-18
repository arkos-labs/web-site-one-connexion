import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";

export default function Privacy() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main className="blog-page">
        <p className="text-xs text-slate-500">Publié le <time dateTime="2026-01-26">26/01/2026</time> • Par One Connexion</p>
        <h1>Politique de confidentialité</h1>
        <p>
          La protection de vos données est une priorité. One Connexion collecte uniquement les informations
          nécessaires au traitement des commandes, à la communication et à la facturation.
        </p>

        <h2>Données collectées</h2>
        <ul>
          <li>Données d'identification (nom, email, téléphone).</li>
          <li>Données liées aux livraisons (adresses, créneaux, POD).</li>
          <li>Données de facturation (entreprise, références, montants).</li>
        </ul>

        <h2>Finalités</h2>
        <p>
          Ces données permettent d'assurer la prise en charge et la preuve de livraison, ainsi que la
          facturation mensuelle. Elles ne sont jamais revendues.
        </p>

        <h2>Durée de conservation</h2>
        <p>
          Les données opérationnelles sont conservées selon les obligations légales. Vous pouvez demander
          la suppression ou la rectification de vos données à tout moment.
        </p>

        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression.
          Vous pouvez aussi demander la portabilité de vos données.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute demande liée à la confidentialité : contact@oneconnexion.fr
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
