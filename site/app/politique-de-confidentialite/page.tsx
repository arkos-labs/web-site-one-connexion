import type { Metadata } from "next";
import { LEGAL, EMAIL, SITE_LAST_UPDATED_LABEL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment ONE CONNEXION collecte, utilise et protège vos données personnelles : finalités, destinataires, durées de conservation et exercice de vos droits (RGPD).",
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: true, follow: true },
};

export default function PolitiqueConfidentialite() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black text-ink sm:text-4xl">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : {SITE_LAST_UPDATED_LABEL}</p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed text-label">
        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">1. Responsable du traitement</h2>
          <p>
            {LEGAL.denomination}, {LEGAL.forme}, dont le siège est situé {LEGAL.adresse} (SIREN {LEGAL.siren}).
            Contact :{" "}
            <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">2. Données collectées et finalités</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Demandes de devis et de contact</strong> (nom, société, e-mail, téléphone, contenu du
              message, adresses de course) : répondre à votre demande. Base légale : mesures
              précontractuelles et intérêt légitime.
            </li>
            <li>
              <strong>Compte client et commandes</strong> (identifiants, adresses, historique des courses,
              facturation) : exécuter le contrat, assurer le suivi des courses et la facturation. Base
              légale : exécution du contrat et obligation légale.
            </li>
            <li>
              <strong>Paiement</strong> : traité par notre prestataire Stripe ; ONE CONNEXION ne conserve
              pas vos numéros de carte bancaire.
            </li>
            <li>
              <strong>Mesure d&apos;audience</strong> (cookies et identifiants de navigation) : mieux
              comprendre l&apos;usage du site. Base légale : votre consentement.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">3. Destinataires et sous-traitants</h2>
          <p>
            Vos données sont accessibles aux personnes habilitées de {LEGAL.denomination} et à nos
            prestataires techniques, dans la limite de leurs missions : Vercel (hébergement du site),
            Supabase (authentification et base de données), Stripe (paiement) et Google (mesure
            d&apos;audience, uniquement si vous l&apos;acceptez). Certains de ces prestataires peuvent
            traiter des données hors de l&apos;Union européenne, dans le cadre de garanties appropriées
            (clauses contractuelles types ou décision d&apos;adéquation).
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">4. Durées de conservation</h2>
          <p>
            Les données sont conservées le temps nécessaire aux finalités ci-dessus, puis archivées ou
            supprimées. Les pièces comptables (factures) sont conservées 10 ans, conformément aux
            obligations légales. Les demandes de contact sans suite ne sont pas conservées au-delà de
            3 ans après le dernier échange.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">5. Cookies</h2>
          <p>
            Le site utilise des cookies strictement nécessaires à son fonctionnement (session de
            connexion, sécurité). Les cookies de mesure d&apos;audience ne sont déposés qu&apos;après
            votre accord via le bandeau affiché à votre première visite ; vous pouvez les refuser sans
            conséquence sur l&apos;accès au site. Vous pouvez modifier votre choix en effaçant les
            données de ce site dans votre navigateur, ce qui fait réapparaître le bandeau.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">6. Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
            d&apos;opposition, de limitation et de portabilité de vos données, ainsi que du droit de
            retirer votre consentement à tout moment. Pour les exercer, écrivez à{" "}
            <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>. Vous pouvez
            également introduire une réclamation auprès de la CNIL (
            <a href="https://www.cnil.fr" className="text-accent hover:underline" rel="noopener noreferrer">
              cnil.fr
            </a>
            ).
          </p>
        </div>
      </section>
    </main>
  );
}
