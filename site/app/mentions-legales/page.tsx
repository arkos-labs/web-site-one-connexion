import type { Metadata } from "next";
import { LEGAL, EMAIL, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site ONE CONNEXION : éditeur, directeur de la publication, hébergeur, assurance transport Helvetia et données personnelles.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

const link = "text-accent hover:underline";

export default function MentionsLegales() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black text-ink sm:text-4xl">Mentions légales</h1>

      <section className="mt-10 space-y-6 text-sm leading-relaxed text-label">
        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Éditeur du site</h2>
          <p>
            <strong>{LEGAL.denomination}</strong><br />
            Forme juridique : {LEGAL.forme}<br />
            Capital social : {LEGAL.capital}<br />
            Siège social : {LEGAL.adresse}<br />
            RCS : Créteil {LEGAL.siren}<br />
            SIREN : {LEGAL.siren}<br />
            SIRET : {LEGAL.siret}<br />
            TVA intracommunautaire : {LEGAL.tva}<br />
            Code NAF : {LEGAL.naf} - {LEGAL.activite}<br />
            Téléphone : <a href={`tel:${PHONE_TEL}`} className={link}>{PHONE_DISPLAY}</a><br />
            Email : <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a><br />
            Date de création : {LEGAL.dateCreation}
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Directeur de la publication</h2>
          <p>Directeur de la publication : Keisha KHOTO-THINU, présidente de {LEGAL.denomination}.</p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Contact</h2>
          <p>
            Téléphone : <a href={`tel:${PHONE_TEL}`} className={link}>{PHONE_DISPLAY}</a><br />
            Email : <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a><br />
            Site web : <a href={SITE_URL} className={link}>{SITE_URL}</a>
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Assurance</h2>
          <p>
            {LEGAL.denomination} est assurée auprès de Helvetia Compagnie Suisse d&apos;Assurance, police
            n° 31.209.565, souscrite par l&apos;intermédiaire du courtier CAT Gestion (ORIAS 07 005 491),
            pour son activité de transporteur public de marchandises, y compris en véhicules deux roues.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Responsabilité civile contractuelle du transporteur : jusqu&apos;à 33 000 € par sinistre.</li>
            <li>Franchise : 1 000 € en cas de vol des marchandises en transit, 150 € pour les autres dommages.</li>
            <li>
              Une assurance de la marchandise à sa valeur réelle (« ad valorem ») peut être souscrite sur
              demande, avant la prise en charge, avec une cotisation calculée au cas par cas.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes) est la propriété
            exclusive de {LEGAL.denomination}, sauf mention contraire. Toute reproduction, représentation,
            modification, publication ou adaptation de tout ou partie des éléments du site est interdite,
            sauf autorisation écrite préalable de {LEGAL.denomination}.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Données personnelles</h2>
          <p>
            Les informations recueillies via les formulaires du site et à l&apos;occasion d&apos;une commande
            sont destinées à {LEGAL.denomination}, responsable de traitement, pour les finalités suivantes :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>répondre aux demandes de contact et de devis ;</li>
            <li>exécuter les prestations de transport commandées et en assurer le suivi ;</li>
            <li>établir, facturer et recouvrer les prestations ;</li>
            <li>gérer le compte client et la relation commerciale ;</li>
            <li>respecter les obligations légales, comptables et fiscales.</li>
          </ul>
          <p className="mt-2">
            Ces traitements reposent sur l&apos;exécution du contrat ou de mesures précontractuelles, sur
            l&apos;intérêt légitime de {LEGAL.denomination} à développer son activité et sur le respect
            d&apos;obligations légales.
          </p>
          <p className="mt-2">Durées de conservation :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>demandes de contact sans suite : 3 ans à compter du dernier échange ;</li>
            <li>données de commande et de livraison : 5 ans à compter de la clôture de l&apos;exercice ;</li>
            <li>factures et pièces comptables : 10 ans ;</li>
            <li>cookies de mesure d&apos;audience : 13 mois maximum.</li>
          </ul>
          <p className="mt-2">
            Conformément au Règlement général sur la protection des données (RGPD), vous disposez d&apos;un
            droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de
            portabilité de vos données. Pour exercer ces droits, écrivez à{" "}
            <a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a>. Vous pouvez introduire une réclamation
            auprès de la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou sur{" "}
            <a href="https://www.cnil.fr" className={link} target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
            Le détail des traitements figure dans notre{" "}
            <a href="/politique-de-confidentialite" className={link}>politique de confidentialité</a>.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Cookies</h2>
          <p>
            Ce site utilise des cookies strictement nécessaires à son fonctionnement, qui ne requièrent pas
            votre consentement. La mesure d&apos;audience est soumise à votre consentement préalable : aucun
            cookie de mesure d&apos;audience n&apos;est déposé avant votre accord, recueilli via le bandeau
            affiché lors de votre première visite. Vous pouvez retirer ce choix à tout moment. Détails dans
            notre{" "}
            <a href="/politique-de-confidentialite" className={link}>politique de confidentialité</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
