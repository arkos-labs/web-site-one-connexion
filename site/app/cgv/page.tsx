import type { Metadata } from "next";
import { LEGAL, EMAIL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  alternates: { canonical: "/cgv" },
  robots: { index: true, follow: true },
};

export default function CGV() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-black text-ink sm:text-4xl">Conditions Générales de Vente</h1>
      <p className="mt-2 text-sm text-muted">En vigueur au {new Date().toLocaleDateString("fr-FR")}</p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed text-label">
        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 1 — Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
            entre {LEGAL.denomination} ({LEGAL.forme}, SIRET {LEGAL.siret}), ci-après « le Prestataire »,
            et tout client professionnel ou particulier, ci-après « le Client », dans le cadre des
            prestations de transport et de livraison par coursier à Paris et en Île-de-France.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 2 — Prestations</h2>
          <p>
            Le Prestataire assure des services de coursier incluant : le transport de plis et colis,
            les tournées régulières, les navettes récurrentes, et les livraisons express. Les prestations
            sont réalisées en deux-roues motorisés sur la zone Paris et Île-de-France.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 3 — Tarifs</h2>
          <p>
            Les tarifs sont calculés selon la grille tarifaire en vigueur, basée sur la zone géographique
            de livraison, le type de prestation (course standard ou navette récurrente) et le délai choisi.
            Les prix sont indiqués en euros hors taxes (HT). La TVA applicable est ajoutée au taux en vigueur.
            Le Prestataire se réserve le droit de modifier ses tarifs à tout moment, les prestations étant
            facturées au tarif en vigueur au moment de la commande.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 4 — Commandes</h2>
          <p>
            Toute commande passée via la plateforme en ligne ou par téléphone vaut acceptation des présentes CGV.
            Le Client s&apos;engage à fournir des informations exactes concernant les adresses d&apos;enlèvement
            et de livraison, ainsi que les coordonnées des personnes à contacter.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 5 — Paiement</h2>
          <p>
            Les factures sont payables à réception ou selon les conditions convenues avec le Client
            (paiement à 30 jours pour les comptes entreprise). Tout retard de paiement entraînera
            l&apos;application de pénalités de retard au taux légal en vigueur, ainsi qu&apos;une indemnité
            forfaitaire de 40 € pour frais de recouvrement (art. L.441-10 du Code de commerce).
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 6 — Responsabilité</h2>
          <p>
            Le Prestataire s&apos;engage à assurer le transport des marchandises avec le soin nécessaire.
            Sa responsabilité est limitée conformément aux dispositions du Code de commerce relatives au
            contrat de transport. En cas de perte ou d&apos;avarie, la réclamation doit être formulée par
            écrit dans un délai de 3 jours suivant la livraison. L&apos;indemnisation est plafonnée à la
            valeur déclarée des marchandises, dans la limite de 1 000 € par envoi sauf convention contraire.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 7 — Annulation</h2>
          <p>
            Toute annulation d&apos;une course déjà prise en charge pourra donner lieu à la facturation
            de la prestation. L&apos;annulation avant la prise en charge est gratuite.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 8 — Données personnelles</h2>
          <p>
            Les données collectées sont traitées conformément au RGPD. Pour toute demande relative à vos
            données, contactez-nous à <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold text-ink">Article 9 — Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, les parties s&apos;efforceront
            de trouver une solution amiable. À défaut, le litige sera porté devant les tribunaux compétents
            du ressort du siège social du Prestataire.
          </p>
        </div>
      </section>
    </main>
  );
}
