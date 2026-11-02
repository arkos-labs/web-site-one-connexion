/**
 * app/methode/page.tsx
 * Requête visée : « société de coursier Paris ». « coursier Paris » appartient
 * à /zones/paris ; le détail des véhicules vit sur /flotte.
 */
import Link from "next/link";
import { STEPS } from "@/components/sections/Methode";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/JsonLd";
import { ShieldCheck, Zap, PhoneCall, Smartphone } from "lucide-react";
import { SITE_URL } from "@/lib/site-content";

const TITLE = "Société de coursier Paris : notre méthode de course";
const DESCRIPTION =
  "Société de coursier à Paris : découvrez notre méthode, de la prise en charge à la remise, et l'organisation d'une course dédiée pour les entreprises.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/methode" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
    url: "/methode",
    type: "website",
    locale: "fr_FR",
  },
};

const ENGAGEMENTS = {
  suivi: {
    icon: <Smartphone className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Suivi et preuve de remise",
    desc: "L'avancement de votre course est visible en ligne à chaque étape, et la remise est horodatée avec le nom du destinataire. Vous n'avez pas à nous appeler pour savoir où en est votre pli.",
  },
  securite: {
    icon: <ShieldCheck className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Sécurité & Confidentialité",
    desc: "Vos plis confidentiels sont traités avec le plus grand soin. Nos coursiers sont sensibilisés aux exigences juridiques et médicales, assurant une discrétion absolue.",
  },
  reactivite: {
    icon: <Zap className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Réactivité optimale",
    desc: "En 2 minutes votre commande est validée. Le coursier le plus proche est dépêché sur place immédiatement pour garantir un enlèvement dans les plus brefs délais.",
  },
  interlocuteur: {
    icon: <PhoneCall className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Interlocuteur unique",
    desc: "Fini les standards téléphoniques interminables. Vous disposez d'une ligne directe avec votre dispatcheur qui connaît votre dossier et vos habitudes.",
  },
};

// Le fil d'Ariane (BreadcrumbList) est émis par le layout via PageSchema : ne pas le dupliquer ici.

// Les 4 étapes affichées sur la page, décrites pour les moteurs et les assistants IA.
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Commander une course express avec ONE CONNEXION",
  description: "De la commande à la preuve de remise : comment une course est traitée à Paris et en Île-de-France.",
  url: `${SITE_URL}/methode`,
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.body,
  })),
};

const H2 = "mb-14 max-w-[24ch] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]";
const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

function Engagements({ items }: { items: (typeof ENGAGEMENTS)[keyof typeof ENGAGEMENTS][] }) {
  return (
    <div className="grid gap-12 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col">
          {item.icon}
          <p className="mb-3 text-lg font-bold tracking-[-0.01em]">{item.title}</p>
          <p className="text-[14.5px] leading-[1.6] text-muted">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function MethodePage() {
  return (
    <>
      <JsonLd data={howToSchema} />
    <main>
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/methode-bg-opt.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-20 pb-16">
          <h1 className="mb-6 text-[clamp(40px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Société de coursier Paris : notre méthode
          </h1>
          <p className="max-w-[60ch] text-[17px] leading-[1.6] text-white/70">
            Chez One Connexion, nous croyons que la transparence et la fiabilité sont les clés d&apos;une livraison réussie.
            C&apos;est pourquoi nous avons mis en place un processus clair, de la prise de commande à la remise en main propre.
          </p>
        </div>
      </section>

      {/* 1. Notre organisation */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Nos engagements</div>
        <h2 className={H2}>Société de coursier Paris : notre organisation</h2>
        <p className="mb-12 max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          One Connexion est une société de coursier installée à Saint-Mandé, à côté du 12e arrondissement, qui
          intervient à Paris, en petite couronne et dans le reste de l&apos;Île-de-France. Notre organisation tient
          en une règle : un envoi, un coursier, un trajet direct. Quand vous commandez, le dispatcheur qui connaît
          votre dossier affecte le coursier le plus proche, et vous gardez le même interlocuteur de la commande à
          la remise. Le prix s&apos;affiche avant de commander ; notre{" "}
          <Link href="/tarifs" className={LINK}>grille de tarifs</Link> détaille chaque formule.
        </p>
        <Engagements items={[ENGAGEMENTS.reactivite, ENGAGEMENTS.interlocuteur]} />
      </section>

      {/* 2. Les 4 étapes (= étapes du HowTo) */}
      <section id="methode" className="border-y border-line bg-paper-card">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">Méthode</div>
          <h2 className={H2}>Les 4 étapes d&apos;une course dédiée</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-10">
            {STEPS.map((item) => (
              <div key={item.step} className="border-t-2 border-ink pt-[22px]">
                <div className="mb-3.5 font-mono text-[11px] tracking-[0.14em] text-label">{item.step}</div>
                <h3 className="mb-2.5 text-lg font-bold tracking-[-0.01em]">{item.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Flotte propre */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <h2 className={H2}>Une flotte propre, pas une plateforme</h2>
        <div className="grid max-w-[68ch] gap-5 text-[15.5px] leading-[1.7] text-muted">
          <p>
            Une plateforme de mise en relation distribue vos courses à des livreurs qui changent d&apos;un jour à
            l&apos;autre. Nous faisons l&apos;inverse : vos courses sont assurées par nos coursiers, en deux-roues,
            avec un dispatcheur qui les connaît et suit chaque trajet. Pas de regroupement d&apos;envois, pas de
            détour : le coursier prend en charge votre pli en moins de 45 minutes, 7j/7 de 8h à 19h, et le
            conduit directement à destination.
          </p>
          <p>
            Ce fonctionnement explique la ponctualité, mais aussi la discrétion : le même coursier garde votre
            envoi de l&apos;enlèvement à la remise, sans le confier à un tiers. Le détail des véhicules et de la
            couverture se trouve sur la page{" "}
            <Link href="/flotte" className={LINK}>flotte de coursiers moto</Link>. Pour les entreprises qui
            commandent régulièrement, cette organisation se traduit par des tournées prévisibles, des délais
            tenus et une facturation unique.
          </p>
        </div>
      </section>

      {/* 4. Traçabilité */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-10">
        <h2 className={H2}>Traçabilité et preuve de remise</h2>
        <p className="mb-12 max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          Chaque course est visible en ligne de l&apos;enlèvement à la remise. Au moment de la remise, nous
          enregistrons le nom du destinataire, l&apos;heure exacte et le lieu ; le justificatif vous est transmis
          puis archivé sur votre compte, et peut être restitué pour être versé à un dossier. Pour les documents
          sensibles, notre service de{" "}
          <Link href="/services/plis-confidentiels" className={LINK}>pli confidentiel</Link> ajoute la remise en
          main propre au seul destinataire désigné, sans regroupement. En cas d&apos;imprévu, nous appelons avant
          que vous ayez à le faire.
        </p>
        <Engagements items={[ENGAGEMENTS.suivi, ENGAGEMENTS.securite]} />
      </section>

      {/* 5. Compte entreprise */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-10">
        <div className="border-t border-line pt-20">
          <h2 className="mb-8 text-[clamp(24px,2.5vw,32px)] font-bold leading-[1.2] tracking-[-0.02em]">
            Travailler avec nous : compte entreprise
          </h2>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <div>
              <p className="mb-4">
                La gestion des flux urgents au sein de la métropole parisienne exige une rigueur opérationnelle absolue. En tant que partenaire des entreprises, <strong>One Connexion</strong> s&apos;appuie sur{" "}
                <Link href="/flotte" className={LINK}>notre flotte de deux-roues</Link>{" "}
                pour répondre aux délais les plus stricts.
              </p>
              <p>
                Notre offre s&apos;adresse aux cabinets d&apos;avocats, aux établissements de santé et aux directions générales. Chaque <strong>course urgente en Île-de-France</strong> est suivie de l&apos;enlèvement jusqu&apos;à la remise en main propre. Découvrez{" "}
                <Link href="/services" className={LINK}>nos services de coursier</Link>.
              </p>
            </div>
            <div>
              <p className="mb-4">
                Nos dispatcheurs suivent chaque course en temps réel et affectent le coursier le plus adapté, pour toute <strong>livraison dans la journée</strong> ou urgence nécessitant un coursier dédié. Un{" "}
                <Link href="/services/compte-entreprise" className={LINK}>compte entreprise</Link>{" "}
                regroupe les courses de vos collaborateurs, avec des factures à régler sous 30 jours.
              </p>
              <p>
                Vous vous recentrez sur votre cœur de métier, nous tenons les délais. Les entreprises qui nous font confiance sont présentées dans{" "}
                <Link href="/references" className={LINK}>nos références</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Contact titleAs="p" />
    </main>
    </>
  );
}
