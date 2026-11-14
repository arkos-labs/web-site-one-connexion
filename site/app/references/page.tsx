import Contact from "@/components/sections/Contact";
import { Scale, Activity, Briefcase, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Nos références clients",
  description: "Cabinets juridiques, laboratoires, agences et e-commerçants : les secteurs pour lesquels One Connexion assure des livraisons express en Île-de-France.",
  alternates: { canonical: "/references" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION - Coursier B2B Paris & Île-de-France" }],
    title: "Nos références clients - ONE CONNEXION",
    description:
      "Cabinets juridiques, laboratoires, agences et e-commerçants qui confient leurs livraisons express à One Connexion.",
    url: "/references",
    type: "website",
    locale: "fr_FR",
  },
};

const SECTEURS = [
  {
    Icon: Scale,
    title: "Cabinets juridiques",
    subtitle: "Documents, actes & significations",
    desc: "Acheminement sécurisé de dossiers confidentiels, significations d'actes notariés et dépôts en juridiction. Preuve de remise électronique horodatée incluse.",
    clients: ["Cabinets d'avocats", "Notaires", "Huissiers de justice", "Cours d'appel"],
    color: "bg-ink text-white",
    border: "border-line",
  },
  {
    Icon: Activity,
    title: "Secteur médical & laboratoires",
    subtitle: "Prélèvements, matériel & urgences",
    desc: "Transport urgent de prélèvements biologiques, d'échantillons et de matériel médical sensible. Protocoles de manutention stricts et chaîne du froid maîtrisée.",
    clients: ["Laboratoires d'analyses", "Cliniques privées", "Pharmacies", "CHU / hôpitaux"],
    color: "bg-ink text-white",
    border: "border-line",
  },
  {
    Icon: Briefcase,
    title: "Corporate & agences",
    subtitle: "Maquettes, contrats & cadeaux",
    desc: "Livraison de maquettes, prototypes, contrats signés ou cadeaux d'affaires pour les directions, agences de publicité et cabinets de conseil.",
    clients: ["Agences de communication", "Directions générales", "Cabinets de conseil", "Studios créatifs"],
    color: "bg-ink text-white",
    border: "border-line",
  },
  {
    Icon: ShoppingBag,
    title: "E-commerce & retail luxe",
    subtitle: "Dernier kilomètre premium",
    desc: "Logistique du dernier kilomètre pour les boutiques de luxe et l'e-commerce exigeant. Remise en main propre, pour une expérience client irréprochable.",
    clients: ["Maisons de luxe", "Boutiques en ligne", "Showrooms", "Places de marché"],
    color: "bg-ink text-white",
    border: "border-line",
  },
];

const CHIFFRES = [
  { value: "7j/7", label: "Tous les jours, 7h–23h" },
  { value: "< 45 min", label: "Enlèvement après confirmation" },
  { value: "Dès 28 €", label: "TTC, une course dans Paris" },
  { value: "10 ans+", label: "D’expérience du coursier B2B en Île-de-France" },
];

export default function ReferencesPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/references-bg-opt.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative z-10 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Références &amp; Clients
          </div>
          <h1 className="mb-6 max-w-[20ch] text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Les entreprises qui nous confient leurs livraisons.
          </h1>
          <p className="max-w-[55ch] text-[17px] leading-[1.65] text-white/65">
            Cabinets d'avocats, laboratoires, agences et e-commerçants font confiance à One Connexion pour leurs livraisons les plus critiques en Île-de-France.
          </p>
        </div>

      </section>

      {/* ── Chiffres : grille fixe, lisible d'un coup d'œil ── */}
      <section className="border-b border-line bg-paper-card">
        <ul className="mx-auto grid max-w-[1240px] grid-cols-2 md:grid-cols-4">
          {CHIFFRES.slice(0, 4).map((c, i) => (
            <li
              key={c.label}
              className={`flex flex-col items-center justify-center border-line px-3 py-6 text-center md:border-l md:py-8 md:first:border-l-0 ${i % 2 === 1 ? "border-l" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}
            >
              <span className="text-[clamp(24px,3vw,36px)] font-bold leading-none text-ink">{c.value}</span>
              <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted md:text-[12px]">{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Secteurs ── */}
      <section className="bg-paper mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-20 pb-12">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Secteurs d'expertise
        </div>
        <h2 className="mb-16 max-w-[22ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Des solutions sur-mesure pour chaque industrie.
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          {SECTEURS.map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.title} className={`flex flex-col gap-5 rounded-[4px] border p-8 ${s.border} bg-paper-card shadow-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] ${s.color}`}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-ink">{s.title}</h3>
                    <p className="text-[12.5px] font-medium text-muted">{s.subtitle}</p>
                  </div>
                </div>
                <p className="text-[14.5px] leading-[1.65] text-muted">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.clients.map((c) => (
                    <span key={c} className="rounded-[2px] border border-line bg-paper px-3 py-1 text-[12px] font-semibold text-muted">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pourquoi nous choisir ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Notre engagement
            </div>
            <h2 className="mb-6 text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
              Nos engagements de service.
            </h2>
            <p className="mb-6 text-[15.5px] leading-[1.7] text-muted">
              Dans un environnement où chaque minute compte, One Connexion met au service des entreprises d'Île-de-France un modèle simple : une course dédiée par pli, des dispatcheurs joignables et un suivi en ligne de chaque course.
            </p>
            <p className="text-[15.5px] leading-[1.7] text-muted">
              Nos engagements : un enlèvement en moins de 45 minutes, un prix affiché avant de commander et 100% de la Marchandise assurée.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: "7j/7", label: "tous les jours, 7h–23h" },
              { val: "< 45 min", label: "enlèvement après confirmation" },
              { val: "10 ans+", label: "d’expérience du coursier B2B" },
              { val: "100%", label: "Marchandise assurée" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2 rounded-[4px] border border-line bg-paper-card p-6 shadow-sm">
                <span className="text-[clamp(22px,2.5vw,32px)] font-bold text-accent">{item.val}</span>
                <span className="text-[13px] leading-[1.5] text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secteurs servis, demandes, compte ── */}
      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Secteurs servis</h2>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Nous travaillons pour trois grandes familles de clients professionnels : le juridique (cabinets d&apos;avocats, études notariales, huissiers), la santé (laboratoires, cliniques, pharmacies) et le commerce en ligne ou de luxe. Ce qui les réunit n&apos;est pas le contenu de l&apos;envoi, mais l&apos;exigence qui l&apos;accompagne : un délai à tenir, un destinataire précis, une preuve de remise.
            </p>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Chaque secteur a ses envois types : pièces de procédure et actes pour le juridique, prélèvements et matériel pour la santé, colis de valeur pour le commerce. Le principe reste le même partout : une course dédiée, un coursier pour un seul envoi, détaillée dans{" "}
              <Link href="/methode" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">notre méthode</Link>.
            </p>
          </div>
          <div>
            <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Ce que nos clients nous demandent</h2>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Les demandes se ressemblent d&apos;un secteur à l&apos;autre : savoir à quelle heure le coursier arrive, suivre la course en ligne, obtenir le nom de la personne qui a reçu l&apos;envoi et l&apos;heure de remise, puis retrouver ces informations au moment de facturer. Un prix affiché avant de commander et un interlocuteur unique complètent la liste.
            </p>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Cette page décrit des secteurs et des cas d&apos;usage, pas une liste nominative de clients.
            </p>
          </div>
          <div>
            <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em]">Ouvrir un compte</h2>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Pour des envois réguliers, vous pouvez{" "}
              <Link href="/services/compte-entreprise" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">ouvrir un compte entreprise</Link>
              {" "}: les courses de vos collaborateurs sont regroupées, avec un suivi centralisé.
            </p>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-muted">
              Pour vérifier qu&apos;une adresse est desservie avant de commander, consultez{" "}
              <Link href="/zones" className="font-medium text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">nos zones de livraison</Link>.
            </p>
          </div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
