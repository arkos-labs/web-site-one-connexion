import type { Metadata } from "next";
import { LEGAL, EMAIL, SITE_URL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

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
            SIREN : {LEGAL.siren}<br />
            SIRET : {LEGAL.siret}<br />
            TVA intracommunautaire : {LEGAL.tva}<br />
            Code NAF : {LEGAL.naf} — {LEGAL.activite}<br />
            Date de création : {LEGAL.dateCreation}
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Contact</h2>
          <p>
            Email : <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a><br />
            Site web : <a href={SITE_URL} className="text-accent hover:underline">{SITE_URL}</a>
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          </p>
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
            Les informations recueillies via les formulaires du site sont destinées à {LEGAL.denomination}
            pour le traitement de vos demandes. Conformément au Règlement Général sur la Protection des
            Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
            de vos données personnelles. Pour exercer ce droit, contactez-nous à{" "}
            <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Cookies</h2>
          <p>
            Ce site utilise des cookies strictement nécessaires à son fonctionnement et, avec votre
            accord, des cookies de mesure d&apos;audience. Détails dans notre{" "}
            <a href="/politique-de-confidentialite" className="text-accent hover:underline">
              politique de confidentialité
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
