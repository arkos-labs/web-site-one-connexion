/**
 * app/flotte/page.tsx
 * Requête visée : « flotte de coursiers moto à Paris ». « coursier moto Paris »
 * appartient à /services/coursier-moto-paris.
 */
import { ShieldCheck, MapPin, Gauge, Zap, Clock, Award, Route, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { PHONE_TEL, PHONE_DISPLAY, SITE_URL } from "@/lib/site-content";

const TITLE = "Flotte de coursiers moto à Paris : deux-roues dédiés";
const DESCRIPTION =
  "Notre flotte de coursiers moto à Paris : des deux-roues dédiés aux courses professionnelles, entretenus et affectés à un seul envoi à la fois.";
const H2 = "text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]";

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/flotte" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: TITLE,
    description: DESCRIPTION,
    url: "/flotte",
    type: "website",
    locale: "fr_FR",
  },
};

const STATS = [
  { value: "Dédiée", label: "Une course, un coursier" },
  { value: "18 kg", label: "Charge par course" },
  { value: "< 45 min", label: "Prise en charge moyenne" },
  { value: "7j/7", label: "De 8h à 19h" },
];

const VEHICLES = [
  {
    icon: Zap,
    title: "Scooters agiles 50–125cc",
    tags: ["Hyper-centre Paris", "Zones piétonnes", "Courtes distances"],
    desc: "Nos scooters électriques et 125cc naviguent dans les rues les plus denses de Paris sans être contraints par les restrictions ZFE. Ils assurent les livraisons express intramuros en moins de 30 minutes.",
  },
  {
    icon: Gauge,
    title: "Motos routières 300–600cc",
    tags: ["IDF complète", "Aéroports", "Longues distances"],
    desc: "Pour les missions banlieue, rocades et axes autoroutiers, nos motos routières maintiennent une vitesse commerciale optimale. La flotte idéale pour les livraisons vers La Défense, Roissy ou Orly.",
  },
  {
    icon: ShieldCheck,
    title: "Équipement professionnel",
    tags: ["Top-cases sécurisés", "Preuve de remise", "Étanche & verrouillé"],
    desc: "Chaque véhicule est équipé d'un top-case verrouillé et étanche (jusqu'à 18 kg). Chaque remise est horodatée, avec le nom du destinataire, pour une preuve de livraison fiable.",
  },
  {
    icon: MapPin,
    title: "Couverture régionale totale",
    tags: ["Paris 1–20e", "Petite couronne", "Grande couronne"],
    desc: "De Paris intramuros à l'ensemble des départements d'Île-de-France, 75, 92, 93, 94, 77, 78, 91, 95, sans rupture de charge ni prestataire intermédiaire. Un seul contact pour toute l'IDF.",
  },
];

const FEATURES = [
  { Icon: Award, title: "Discrétion & rigueur", desc: "Nos coursiers sont sensibilisés aux exigences juridiques et médicales et travaillent en toute discrétion." },
  { Icon: Route, title: "Optimisation d'itinéraire", desc: "Dispatch assuré par notre équipe pour affecter le coursier le plus adapté." },
  { Icon: Clock, title: "Horaires d'ouverture", desc: "7j/7, de 8h à 19h." },
  { Icon: CheckCircle2, title: "Coursiers vérifiés", desc: "Permis et casier judiciaire vérifiés, formation interne obligatoire avant prise de poste." },
];

const ZONES = [
  { dept: "75", name: "Paris", detail: "Tous arrondissements, intramuros" },
  { dept: "92", name: "Hauts-de-Seine", detail: "Boulogne, Nanterre, Neuilly, Levallois…" },
  { dept: "93", name: "Seine-Saint-Denis", detail: "Saint-Denis, Montreuil, Pantin…" },
  { dept: "94", name: "Val-de-Marne", detail: "Vincennes, Créteil, Ivry…" },
  { dept: "77", name: "Seine-et-Marne", detail: "Chelles, Melun, Meaux - dès 59 € TTC" },
  { dept: "78", name: "Yvelines", detail: "Versailles, Saint-Quentin - dès 62 € TTC" },
  { dept: "91", name: "Essonne", detail: "Évry, Massy - dès 62 € TTC" },
  { dept: "95", name: "Val-d'Oise", detail: "Cergy, Argenteuil - dès 60 € TTC" },
];

const LINK = "font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark";

const FAQ = [
  {
    q: "Quelle charge peut transporter un coursier moto ?",
    a: "Chaque deux-roues est équipé d'un top-case verrouillé et étanche, qui accepte jusqu'à 18 kg par course.",
  },
  {
    q: "Pouvez-vous transporter un objet volumineux ?",
    a: "Notre flotte est composée de deux-roues (scooters et motos) : elle convient aux plis, colis et matériel léger. Pour un volume ou un gabarit important, contactez-nous avant de commander : nous vous dirons si nous pouvons le prendre en charge.",
  },
  {
    q: "Quel est le délai de prise en charge ?",
    a: "Le coursier prend l'envoi en charge en moins de 45 minutes, 7j/7 de 8h à 19h, sous réserve de disponibilité au moment de la commande. Le délai de livraison dépend de la formule : Normal 3 h, Urgent 1 h 30, Super 1 h.",
  },
  {
    q: "Quelles zones la flotte couvre-t-elle ?",
    a: "Paris intramuros, la petite couronne (92, 93, 94) et la grande couronne (77, 78, 91, 95), y compris Roissy et Orly. Le prix dépend de la zone la plus éloignée du trajet et s'affiche avant la commande.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Flotte de coursiers moto à Paris",
  serviceType: "Coursier moto B2B",
  url: `${SITE_URL}/flotte`,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "AdministrativeArea", name: "Île-de-France" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FlottePage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Hero ── */}
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/flotte-bg-opt.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative z-10 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Flotte &amp; Couverture
          </div>
          <h1 className="mb-6 max-w-[18ch] text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Notre flotte de coursiers moto à Paris
          </h1>
          <p className="max-w-[55ch] text-[17px] leading-[1.65] text-white/65">
            Une flotte de coursiers deux-roues sur Paris et toute l'Île-de-France. Chaque livraison est horodatée, avec une preuve de remise.
            Pour commander, voir notre{" "}
            <Link href="/services/coursier-moto-paris" className="text-white underline decoration-accent underline-offset-4 hover:text-accent">
              coursier moto Paris
            </Link>
            .
          </p>
        </div>

        {/* Bandeau stats */}
        <div className="relative z-10 border-t border-white/10">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-white/10 px-[clamp(20px,4vw,28px)] md:grid-cols-4 md:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-[clamp(28px,3vw,36px)] font-bold text-white">{s.value}</span>
                <span className="mt-1 text-[12px] font-medium text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Véhicules ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Nos véhicules
        </div>
        <h2 className={`mb-6 max-w-[26ch] ${H2}`}>Coursier moto Paris : notre flotte de deux-roues</h2>
        <p className="mb-14 max-w-[68ch] text-[15.5px] leading-[1.7] text-muted">
          Notre flotte associe deux familles de deux-roues, choisies selon la course : des scooters agiles pour
          l&apos;hyper-centre de Paris et des motos routières pour les trajets plus longs. Chaque véhicule est
          affecté à un seul envoi à la fois, de l&apos;enlèvement à la remise, par un coursier que notre dispatcheur
          connaît. Pour commander une course, voyez notre{" "}
          <Link href="/services/coursier-express-paris" className={LINK}>coursier express Paris</Link>. Pour une course en deux-roues, voyez aussi notre <Link href="/services/coursier-moto-paris" className={LINK}>coursier moto à Paris</Link>.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {VEHICLES.slice(0, 2).map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-8 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <Icon size={20} className="text-accent" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="mb-3 text-[17px] font-bold tracking-[-0.01em] text-ink">{v.title}</h3>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {v.tags.map((t) => (
                      <span key={t} className="rounded-full bg-paper px-3 py-1 text-[11px] font-semibold text-muted">{t}</span>
                    ))}
                  </div>
                  <p className="text-[14.5px] leading-[1.65] text-muted">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Motos 300–600cc ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <h2 className={`mb-6 max-w-[26ch] ${H2}`}>Motos 300–600cc : pourquoi ce choix</h2>
        <div className="grid max-w-[68ch] gap-5 text-[15.5px] leading-[1.7] text-muted">
          <p>
            Pour les trajets au-delà de Paris, nous utilisons des motos routières de 300 à 600cc. Ce choix tient
            à trois critères. L&apos;agilité d&apos;abord : une moto traverse la circulation dense là où une
            camionnette reste bloquée, ce qui tient le délai annoncé aux heures de pointe. La capacité
            d&apos;emport ensuite : le top-case verrouillé et étanche accepte jusqu&apos;à 18 kg, de quoi
            transporter plis, dossiers, petits colis et matériel léger. La fiabilité enfin : ces motos
            maintiennent une vitesse commerciale régulière sur les axes autoroutiers (A14, A86, périphérique) qui
            relient Paris à La Défense, à Roissy et à Orly.
          </p>
          <p>
            Les scooters de 50 à 125cc restent réservés à l&apos;hyper-centre, où leur gabarit permet de passer
            dans les rues les plus denses. Pour la couverture de La Défense, voyez notre page{" "}
            <Link href="/zones/la-defense" className={LINK}>coursier La Défense</Link>.
          </p>
        </div>
      </section>

      {/* ── Garanties ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Nos garanties
          </div>
          <h2 className={`mb-6 ${H2}`}>Entretien, équipement et sécurité des coursiers</h2>
          <p className="mb-5 max-w-[66ch] text-[15.5px] leading-[1.7] text-muted">{VEHICLES[2].desc}</p>
          <p className="mb-14 max-w-[66ch] text-[15.5px] leading-[1.7] text-muted">
            Les deux-roues sont entretenus pour tenir les délais annoncés, et chaque coursier suit une formation
            interne avant de prendre un poste. Les envois voyagent fermés dans le top-case, du début à la fin de la
            course, sans passer de main en main : c&apos;est ce qui permet d&apos;établir qui a eu accès à quoi. Pour
            le détail du déroulé d&apos;une course, de la commande à la preuve de remise, lisez{" "}
            <Link href="/methode" className={LINK}>notre méthode</Link>.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm border border-line">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="text-[13.5px] leading-[1.6] text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zones ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Zone de couverture
        </div>
        <h2 className={`mb-6 ${H2}`}>Ce que la flotte permet : délais et zones</h2>
        <p className="mb-14 max-w-[66ch] text-[15.5px] leading-[1.7] text-muted">
          Chaque coursier est affecté à un seul envoi à la fois : il part de l&apos;enlèvement et va directement à la
          remise, sans regroupement. {VEHICLES[3].desc} Pour Paris et ses arrondissements, voyez notre page{" "}
          <Link href="/zones/paris" className={LINK}>coursier Paris</Link>.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z) => (
            <div key={z.dept} className="flex items-start gap-4 rounded-xl border border-line p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-white">
                {z.dept}
              </div>
              <div>
                <p className="font-bold text-ink">{z.name}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">{z.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[13.5px] text-muted">
          * Départements 77, 78, 91 et 95 (grande couronne) : prix selon la distance depuis Paris, à partir de 60 € TTC par course. Le prix de chaque course s&apos;affiche avant la commande ; la grille figure sur
          la page{" "}
          <Link href="/tarifs" className={LINK}>tarif coursier Paris</Link>.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-10">
        <h2 className={`mb-8 ${H2}`}>Questions fréquentes</h2>
        <div className="grid max-w-[780px] gap-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="mb-2 font-bold tracking-[-0.01em] text-ink">{item.q}</h3>
              <p className="text-[15px] leading-[1.65] text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-accent text-white py-16">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="mb-2 text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Réserver une course moto
            </p>
            <p className="text-[16px] text-white/90">
              Ouvrez un compte entreprise en 2 minutes, sans engagement. Pour savoir comment se déroule chaque course,
              voyez{" "}
              <Link href="/methode" className="font-semibold text-white underline decoration-white/60 underline-offset-4 hover:decoration-white">
                notre méthode
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/inscription"
              className="flex items-center gap-2 rounded-[4px] bg-ink px-6 py-3.5 text-[14px] font-bold text-white hover:bg-white hover:text-ink transition-colors"
            >
              Ouvrir un compte
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <Link
              href="/#commander"
              className="rounded-[4px] border border-white/40 px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Commander une course
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
