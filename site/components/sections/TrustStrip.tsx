/**
 * components/sections/TrustStrip.tsx
 * Juste sous l'ouverture de la page d'accueil : ce qui rassure un nouveau visiteur.
 * La note et le lien des avis Google n'apparaissent que si la note est renseignée dans lib/site-content
 * (GOOGLE_RATING), jamais inventée.
 */
import { ShieldCheck, Lock, FileText, MapPin, Star, ExternalLink } from "lucide-react";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from "@/lib/site-content";

const FACTS = [
  { icon: ShieldCheck, title: "Marchandise assurée", desc: "Chaque course est couverte, du départ à la remise." },
  { icon: MapPin, title: "Suivi en direct", desc: "Chaque étape de la course, visible en ligne." },
  { icon: Lock, title: "Paiement sécurisé", desc: "Carte bancaire via Stripe, ou facture à 30 jours pour les pros." },
  { icon: FileText, title: "Facture pour chaque course", desc: "TVA détaillée, envoyée par e-mail à la livraison." },
];

export default function TrustStrip() {
  return (
    <section aria-label="Nos garanties" className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          {GOOGLE_RATING ? (
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-ink hover:text-accent-dark">
              <span className="flex text-[#F5A623]" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={20} fill="currentColor" strokeWidth={0} />)}
              </span>
              <span className="text-[15px] font-bold">
                {GOOGLE_RATING.score.toLocaleString("fr-FR")}/5 sur Google
                <span className="font-medium text-muted"> · {GOOGLE_RATING.count} avis</span>
              </span>
            </a>
          ) : (
            <p className="text-[15px] font-bold text-ink">Pourquoi les entreprises nous confient leurs courses</p>
          )}
          {/* Sans avis, le lien mènerait à une page vide : il n'apparaît qu'avec la note. */}
          {GOOGLE_RATING && (
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Lire nos avis Google <ExternalLink size={13} />
            </a>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
          {FACTS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex flex-col gap-2">
              <Icon size={22} className="text-accent" strokeWidth={1.8} />
              <p className="text-[14px] font-bold text-ink">{title}</p>
              <p className="text-[13px] leading-snug text-muted">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
