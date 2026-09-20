import Contact from "@/components/sections/Contact";
import { Scale, Activity, Briefcase, ShoppingBag, Star, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Nos références clients — ONE CONNEXION",
  description: "Cabinets juridiques, laboratoires, agences et e-commerçants : découvrez les entreprises qui font confiance à One Connexion pour leurs livraisons express en Île-de-France.",
  alternates: { canonical: "/references" },
};

const SECTEURS = [
  {
    Icon: Scale,
    title: "Cabinets juridiques",
    subtitle: "Documents, actes & significations",
    desc: "Acheminement sécurisé de dossiers confidentiels, significations d'actes notariés et dépôts en juridiction. Preuve de remise électronique horodatée incluse.",
    clients: ["Cabinets d'avocats", "Notaires", "Huissiers de justice", "Cours d'appel"],
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
  },
  {
    Icon: Activity,
    title: "Secteur médical & laboratoires",
    subtitle: "Prélèvements, matériel & urgences",
    desc: "Transport urgent de prélèvements biologiques, d'échantillons et de matériel médical sensible. Protocoles de manutention stricts et chaîne du froid maîtrisée.",
    clients: ["Laboratoires d'analyses", "Cliniques privées", "Pharmacies", "CHU / hôpitaux"],
    color: "bg-green-50 text-green-700",
    border: "border-green-100",
  },
  {
    Icon: Briefcase,
    title: "Corporate & agences",
    subtitle: "Maquettes, contrats & cadeaux",
    desc: "Livraison de maquettes, prototypes, contrats signés ou cadeaux d'affaires pour les directions, agences de publicité et cabinets de conseil.",
    clients: ["Agences de communication", "Directions générales", "Cabinets de conseil", "Studios créatifs"],
    color: "bg-purple-50 text-purple-700",
    border: "border-purple-100",
  },
  {
    Icon: ShoppingBag,
    title: "E-commerce & retail luxe",
    subtitle: "Dernier kilomètre premium",
    desc: "Logistique du dernier kilomètre pour les boutiques de luxe et l'e-commerce exigeant. Remise en main propre avec signature, pour une expérience client irréprochable.",
    clients: ["Maisons de luxe", "Boutiques en ligne", "Showrooms", "Places de marché"],
    color: "bg-amber-50 text-amber-700",
    border: "border-amber-100",
  },
];

const TEMOIGNAGES = [
  {
    nom: "Maître Claire Fontaine",
    poste: "Associée — Cabinet Fontaine & Moreau",
    texte: "One Connexion gère tous nos dépôts urgents en juridiction. Leurs coursiers connaissent les procédures, respectent les délais et nous envoient une preuve de remise dans la foulée. Indispensable.",
    note: 5,
  },
  {
    nom: "Dr. Marc Tessier",
    poste: "Directeur — Laboratoire Tessier Analyses",
    texte: "Nous leur faisons confiance pour le transport de prélèvements biologiques dès l'ouverture. Rigueur, ponctualité et discrétion. Jamais une défaillance sur des centaines de missions.",
    note: 5,
  },
  {
    nom: "Sarah Kone",
    poste: "Head of Operations — Agence Lumière",
    texte: "Pour nos envois de maquettes ou de dossiers sensibles, One Connexion est notre réflexe. Le suivi en temps réel rassure nos clients et le service client est vraiment disponible.",
    note: 5,
  },
];

const CHIFFRES = [
  { value: "2 500+", label: "Entreprises partenaires" },
  { value: "98 %", label: "Taux de satisfaction" },
  { value: "Depuis 2026", label: "Expertise B2B IDF" },
  { value: "0", label: "Pli perdu depuis l'ouverture" },
];

export default function ReferencesPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/references-bg-new.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative z-10 mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-20 pt-16">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Références &amp; Clients
          </div>
          <h1 className="mb-6 max-w-[20ch] text-[clamp(36px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Ceux qui nous font confiance.
          </h1>
          <p className="max-w-[55ch] text-[17px] leading-[1.65] text-white/65">
            Cabinets d'avocats, laboratoires, agences et e-commerçants font confiance à One Connexion pour leurs livraisons les plus critiques en Île-de-France.
          </p>
        </div>

      </section>

      {/* ── Chiffres (Carousel) ── */}
      <section className="bg-white border-b border-gray-100 py-10 overflow-hidden relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 20s linear infinite;
          }
          @media (max-width: 768px) {
            .animate-marquee {
              animation-duration: 15s;
            }
          }
        `}</style>
        
        {/* Dégradés pour l'effet de fondu sur les bords */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-32 bg-gradient-to-r from-white to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-32 bg-gradient-to-l from-white to-transparent"></div>
        
        <div className="animate-marquee hover:[animation-play-state:paused]">
          {[...CHIFFRES, ...CHIFFRES, ...CHIFFRES].map((c, i) => (
            <div key={i} className="flex flex-col items-center justify-center px-10 md:px-20 text-center shrink-0">
              <span className="text-[clamp(24px,3vw,36px)] font-bold text-ink">{c.value}</span>
              <span className="mt-1 text-[11px] md:text-[12px] font-bold text-muted uppercase tracking-wider">{c.label}</span>
            </div>
          ))}
        </div>
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
              <div key={s.title} className={`flex flex-col gap-5 rounded-2xl border p-8 ${s.border} bg-white shadow-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
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
                    <span key={c} className="rounded-full bg-paper px-3 py-1 text-[11.5px] font-semibold text-muted">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Témoignages
          </div>
          <h2 className="mb-16 text-[clamp(26px,3vw,38px)] font-bold leading-[1.15] tracking-[-0.02em]">
            Ce que disent nos clients.
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-white p-7 shadow-sm">
                <div>
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: t.note }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" strokeWidth={0} />
                    ))}
                  </div>
                  <Quote size={20} className="mb-3 text-accent/30" />
                  <p className="text-[14.5px] leading-[1.7] text-muted italic">{t.texte}</p>
                </div>
                <div className="border-t border-line pt-4">
                  <p className="font-bold text-ink">{t.nom}</p>
                  <p className="text-[12px] text-muted">{t.poste}</p>
                </div>
              </div>
            ))}
          </div>
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
              La confiance des décideurs franciliens.
            </h2>
            <p className="mb-6 text-[15.5px] leading-[1.7] text-muted">
              Dans un environnement où chaque minute compte, One Connexion s'est imposée comme la référence du transport express B2B en Île-de-France. Notre modèle — flotte exclusive, dispatcheurs dédiés, suivi en temps réel — garantit des performances constantes, quelle que soit la complexité de la mission.
            </p>
            <p className="text-[15.5px] leading-[1.7] text-muted">
              La fidélité de nos clients atteste de cette constance. Notre taux de recommandation avoisine les 95 % et notre dispatch répond en moins de 2 minutes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: "78 %", label: "de clients fidèles" },
              { val: "95 %", label: "de taux de recommandation" },
              { val: "< 2 min", label: "temps de réponse dispatch" },
              { val: "0 perte", label: "de marchandises depuis l'ouverture" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-6 shadow-sm">
                <span className="text-[clamp(22px,2.5vw,32px)] font-bold text-accent">{item.val}</span>
                <span className="text-[13px] leading-[1.5] text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      <Contact />
    </main>
  );
}
