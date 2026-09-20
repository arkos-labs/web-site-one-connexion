import Contact from "@/components/sections/Contact";
import { ShieldCheck, MapPin, Gauge, Zap, Clock, Award, Route, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";
import { PHONE_TEL, PHONE_DISPLAY } from "@/lib/site-content";

export const metadata = {
  title: "Notre flotte de coursiers moto — ONE CONNEXION",
  description: "Flotte exclusive de deux-roues optimisée pour la livraison express à Paris et en Île-de-France. Scooters agiles et motos routières, équipés et assurés.",
  alternates: { canonical: "/flotte" },
};

const STATS = [
  { value: "120+", label: "Coursiers actifs" },
  { value: "99,4%", label: "Taux de ponctualité" },
  { value: "< 45 min", label: "Prise en charge moyenne" },
  { value: "7j/7", label: "Disponibilité" },
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
    tags: ["Top-cases sécurisés", "GPS temps réel", "Étanche & verrouillé"],
    desc: "Chaque véhicule est équipé d'un top-case verrouillé et étanche (jusqu'à 18 kg), d'un traceur GPS pour le suivi en direct, et d'une tablette de signature électronique pour la preuve de remise.",
  },
  {
    icon: MapPin,
    title: "Couverture régionale totale",
    tags: ["Paris 1–20e", "Petite couronne", "Grande couronne"],
    desc: "De Paris intramuros à l'ensemble des départements d'Île-de-France — 75, 92, 93, 94, 77, 78, 91, 95 — sans rupture de charge ni prestataire intermédiaire. Un seul contact pour toute l'IDF.",
  },
];

const FEATURES = [
  { Icon: Award, title: "Assurance professionnelle", desc: "Tous nos coursiers sont couverts par une assurance RC Pro et marchandises transportées." },
  { Icon: Route, title: "Optimisation d'itinéraire", desc: "Algorithme de dispatch en temps réel pour affecter le coursier le plus proche." },
  { Icon: Clock, title: "Disponibilité étendue", desc: "Plages horaires 7h–23h en standard, interventions d'urgence nocturnes sur accord." },
  { Icon: CheckCircle2, title: "Coursiers vérifiés", desc: "Permis et casier judiciaire vérifiés, formation interne obligatoire avant prise de poste." },
];

const ZONES = [
  { dept: "75", name: "Paris", detail: "Tous arrondissements, intramuros" },
  { dept: "92", name: "Hauts-de-Seine", detail: "Boulogne, Nanterre, Neuilly, Levallois…" },
  { dept: "93", name: "Seine-Saint-Denis", detail: "Saint-Denis, Montreuil, Pantin…" },
  { dept: "94", name: "Val-de-Marne", detail: "Vincennes, Créteil, Ivry…" },
  { dept: "77", name: "Seine-et-Marne", detail: "Melun, Marne-la-Vallée — sur devis" },
  { dept: "78", name: "Yvelines", detail: "Versailles, Saint-Quentin — sur devis" },
  { dept: "91", name: "Essonne", detail: "Évry, Massy — sur devis" },
  { dept: "95", name: "Val-d'Oise", detail: "Cergy, Pontoise — sur devis" },
];

export default function FlottePage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/flotte-bg-new.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative z-10 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Flotte &amp; Couverture
          </div>
          <h1 className="mb-6 max-w-[18ch] text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Une flotte dédiée à l'urgence.
          </h1>
          <p className="max-w-[55ch] text-[17px] leading-[1.65] text-white/65">
            120 coursiers deux-roues déployés sur Paris et toute l'Île-de-France. Chaque véhicule est tracé en temps réel, chaque livraison horodatée et signée électroniquement.
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
        <h2 className="mb-16 max-w-[22ch] text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Le bon véhicule pour chaque mission.
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {VEHICLES.map((v) => {
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

      {/* ── Garanties ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Nos garanties
          </div>
          <h2 className="mb-14 text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
            Un standard professionnel sans compromis.
          </h2>
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
        <h2 className="mb-14 text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
          Île-de-France entière, sans exception.
        </h2>
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
          * Les départements 77, 78, 91 et 95 sont disponibles sur devis. Contactez notre dispatch pour un tarif adapté.
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="bg-accent text-white py-16">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="mb-2 text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
              Rejoignez nos clients.
            </h2>
            <p className="text-[16px] text-white/90">
              Ouvrez un compte entreprise en 2 minutes, sans engagement.
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

    </main>
  );
}
