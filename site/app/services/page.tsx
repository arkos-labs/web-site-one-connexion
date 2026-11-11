/**
 * app/services/page.tsx
 * Index des prestations. Requête visée : « service de coursier Paris ».
 * Le hub renvoie vers les pages service, il ne raconte pas leur contenu.
 */
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ServiceCta from "@/components/services/ServiceCta";
import { SERVICES } from "@/lib/services";
import { SITE_URL } from "@/lib/site-content";
import { gridPrice } from "@/lib/pricing";

const FAQ = [
  {
    question: "Quelle est la différence entre une course dédiée et une course groupée ?",
    answer:
      "Une course dédiée transporte un seul envoi, du point d’enlèvement jusqu’à la remise, sans arrêt intermédiaire. Une course groupée regroupe plusieurs envois sur un même trajet, avec plusieurs arrêts : elle coûte souvent moins cher, mais l’heure d’arrivée dépend des autres envois.",
  },
  {
    question: "En combien de temps un coursier prend-il l’envoi en charge ?",
    answer:
      "En moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Nous confirmons la faisabilité avant d’engager la course.",
  },
  {
    question: "Combien coûte une course à Paris ?",
    answer: `Le prix dépend de la zone et du délai, jamais de la nature de l’envoi. À Paris, une course Normal (sous 3 h) coûte ${gridPrice("standard", 0)} € TTC, une course Urgent (sous 1 h 30) ${gridPrice("urgent", 0)} € TTC et une course Super (sous 1 h) ${gridPrice("flash", 0)} € TTC.`,
  },
  {
    question: "Quel service choisir pour un envoi confidentiel ?",
    answer:
      "Le pli confidentiel : le document est remis en main propre au destinataire désigné, avec le nom de la personne et l’heure enregistrés. Toutes nos prestations partent en course dédiée.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const TITLE = "Services de coursier express à Paris et en Île-de-France";
const DESCRIPTION =
  "Plis confidentiels, documents juridiques, prélèvements médicaux, e-commerce : une course dédiée par envoi, prise en charge en moins de 45 minutes.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
    url: "/services",
    type: "website",
    locale: "fr_FR",
  },
};

const H2_CLASS = "mb-5 text-[clamp(24px,2.5vw,32px)] font-bold leading-[1.2] tracking-[-0.02em]";
const LINK_CLASS = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

export default function ServicesIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prestations",
        item: `${SITE_URL}/services`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/services-bg-opt.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-16 pt-12">
          <nav
            aria-label="Fil d’Ariane"
            className="mb-9 font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase"
          >
            <Link href="/" className="text-white/40 hover:text-white">
              Accueil
            </Link>
            <span className="px-2 text-white/25">›</span>
            <span className="text-white/70">Prestations</span>
          </nav>

          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            <span className="h-px w-6 bg-accent" />
            Prestations
          </div>

          <h1 className="mb-6 max-w-[20ch] text-balance text-[clamp(32px,4.4vw,58px)] font-bold leading-[1.05] tracking-[-0.035em]">
            Service de coursier Paris : nos courses dédiées
          </h1>

          <p className="max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-white/66">
            Plis confidentiels, prélèvements médicaux, colis e-commerce, tournées
            régulières : choisissez votre besoin pour voir comment se déroule la
            course. Le tarif, lui, ne change pas : il dépend seulement de la zone
            et du délai.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <h2 className={H2_CLASS}>Quel service pour quel envoi</h2>
        <p className="mb-10 max-w-[62ch] text-[15.5px] leading-[1.7] text-muted">
          Chaque prestation a sa propre procédure. Toutes partent en course
          dédiée : un coursier, un envoi, un trajet direct. Vous n’êtes pas une entreprise ? Voyez notre{" "}
          <Link href="/services/coursier-express-paris" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">coursier pour particulier</Link>.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="flex flex-col gap-3.5 border border-line bg-paper-card px-[30px] pb-[30px] pt-[34px] text-ink hover:border-ink hover:text-ink"
            >
              <div className="font-mono text-[10px] tracking-[0.16em] text-label uppercase">
                {service.card.tag}
              </div>
              <h3 className="text-xl font-bold tracking-[-0.02em]">
                {service.card.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-muted">
                {service.card.body}
              </p>
              <div className="mt-auto pt-5 font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase">
                Voir la prestation →
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-[clamp(20px,4vw,28px)] py-[72px] md:grid-cols-3">
          <div>
            <h2 className={H2_CLASS}>Coursier express et coursier moto</h2>
            <p className="text-[15.5px] leading-[1.7] text-muted">
              Pour un envoi urgent, le{" "}
              <Link href="/services/coursier-express-paris" className={LINK_CLASS}>coursier express Paris</Link>{" "}
              part dès la confirmation. Pour comprendre comment travaillent nos
              deux-roues, voyez notre{" "}
              <Link href="/services/coursier-moto-paris" className={LINK_CLASS}>coursier moto Paris</Link>.
            </p>
          </div>
          <div>
            <h2 className={H2_CLASS}>Plis confidentiels et transport médical</h2>
            <p className="text-[15.5px] leading-[1.7] text-muted">
              Un acte ou un contrat part en{" "}
              <Link href="/services/plis-confidentiels" className={LINK_CLASS}>pli confidentiel</Link>,
              remis en main propre. Un prélèvement ou du matériel de laboratoire
              est confié à notre{" "}
              <Link href="/services/transport-medical" className={LINK_CLASS}>coursier médical moto</Link>.
            </p>
          </div>
          <div>
            <h2 className={H2_CLASS}>Livraison e-commerce et tournées régulières</h2>
            <p className="text-[15.5px] leading-[1.7] text-muted">
              Pour les commandes de vos clients, voyez la{" "}
              <Link href="/services/livraison-e-commerce" className={LINK_CLASS}>livraison e-commerce</Link>.
              Pour des passages fixes entre vos sites, les{" "}
              <Link href="/services/tournees-regulieres" className={LINK_CLASS}>tournées régulières</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-[72px]">
        <JsonLd data={faqSchema} />
        <h2 className={H2_CLASS}>Questions fréquentes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="mb-2 text-[17px] font-bold tracking-[-0.01em]">{item.question}</h3>
              <p className="text-[15.5px] leading-[1.7] text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <ServiceCta serviceTitle="toutes prestations" titleAs="p" />
    </>
  );
}
