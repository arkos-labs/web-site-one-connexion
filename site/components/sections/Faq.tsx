/**
 * components/sections/Faq.tsx
 * FAQ de l'accueil : texte visible + JSON-LD FAQPage générés depuis la même
 * source, pour qu'ils ne divergent jamais. Uniquement des faits déjà publiés
 * ailleurs sur le site (délais, amplitude, zones, tarification).
 */
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-content";

const FAQ = [
  {
    q: "Quelles zones couvre ONE CONNEXION ?",
    a: "Paris intramuros (1er au 20e arrondissement), La Défense, la petite couronne (92, 93, 94) et l'ensemble de l'Île-de-France. Roissy-CDG et Orly sont accessibles sur devis spécifique.",
  },
  {
    q: "En combien de temps un coursier vient-il enlever mon pli ?",
    a: "Le coursier le plus proche est dispatché dès la confirmation de la course. L'enlèvement se fait en moins de 45 minutes à Paris intramuros et en petite couronne.",
  },
  {
    q: "Quels sont vos horaires (nuit, weekend, jours fériés) ?",
    a: "Le service est ouvert 7j/7, de 7h à 23h, jours fériés inclus. Ouvert le samedi, le dimanche et les jours fériés avec un régulateur dédié joignable en permanence. Les courses de nuit (après 23h) sont accessibles sur devis spécifique.",
  },
  {
    q: "Comment obtenir un devis, et sous quel délai ?",
    a: "Par téléphone, par e-mail ou via le formulaire du site. Les entreprises reçoivent un devis en moins de 2 heures. La zone et la distance déterminent la base tarifaire.",
  },
  {
    q: "Quels types de courses prenez-vous en charge ?",
    a: "Plis confidentiels pour cabinets juridiques et notariaux, transport médical (prélèvements, échantillons), livraison e-commerce le jour même, tournées régulières et navettes inter-sites, transport événementiel et compte entreprise.",
  },
  {
    q: "Ma course est-elle dédiée ou regroupée avec d'autres ?",
    a: "Chaque course est dédiée : un coursier prend en charge votre envoi de l'enlèvement jusqu'à la remise, sans regroupement avec d'autres colis.",
  },
  {
    q: "Ai-je une preuve de livraison ?",
    a: "Oui. Chaque remise est horodatée et rattachée au nom du destinataire, pour une preuve de livraison fiable.",
  },
  {
    q: "Comment payer, et existe-t-il une facturation mensuelle ?",
    a: "Vous pouvez payer à la course (carte bancaire, Apple Pay, Google Pay, prélèvement SEPA) ou ouvrir un compte entreprise avec facturation mensuelle centralisée.",
  },
];

export default function Faq() {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${SITE_URL}/#faq`,
          inLanguage: "fr-FR",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
        Questions fréquentes
      </div>
      <h2 className="mb-8 max-w-[720px] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
        Coursier B2B à Paris : les réponses avant votre première course.
      </h2>
      <div className="max-w-[860px] divide-y divide-line border-y border-line">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16.5px] font-semibold text-ink">
              {q}
              <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[16px] leading-[1.65] text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
