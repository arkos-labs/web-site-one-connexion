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
    q: "Quelles zones couvrez-vous ?",
    a: "Tout Paris, les 20 arrondissements, La Défense, le 92, le 93, le 94, et le reste de l'Île-de-France. On va aussi à Roissy-CDG et à Orly, au tarif de leur zone.",
  },
  {
    q: "En combien de temps un coursier vient-il chercher mon pli ?",
    a: "Dès que vous confirmez, on envoie le coursier le plus proche. À Paris et en petite couronne, il est chez vous en moins de 45 minutes.",
  },
  {
    q: "Quels sont vos horaires ?",
    a: "Du lundi au samedi, de 9 h à 19 h. On est fermés le dimanche et les jours fériés. Besoin d'une course en dehors de ces horaires ? Appelez-nous, on regarde ce qu'on peut faire.",
  },
  {
    q: "Comment connaître le prix d’une course ?",
    a: "Entrez les deux adresses et le délai : le prix s’affiche tout de suite, avant de commander. Il dépend seulement de la distance et du délai choisi, jamais de ce que vous envoyez.",
  },
  {
    q: "Quels types de courses prenez-vous ?",
    a: "Des plis et actes pour les avocats, notaires et huissiers, des prélèvements pour les labos, des colis e-commerce à livrer le jour même, des navettes régulières entre vos sites, et du matériel pour vos salons et événements.",
  },
  {
    q: "Ma course est-elle partagée avec d'autres ?",
    a: "Non. Le coursier prend votre envoi et va directement à destination. Il ne transporte rien d'autre en même temps.",
  },
  {
    q: "Ai-je une preuve de livraison ?",
    a: "Oui. À la livraison, vous recevez l'heure exacte de remise et le nom de la personne qui a réceptionné.",
  },
  {
    q: "Comment payer, et peut-on régler à 30 jours ?",
    a: "Vous pouvez payer chaque course par carte bancaire, Apple Pay ou Google Pay. Si vous êtes une entreprise, vous pouvez aussi régler sur facture, à 30 jours, par prélèvement ou par virement.",
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
        Vous vous posez sûrement ces questions.
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
