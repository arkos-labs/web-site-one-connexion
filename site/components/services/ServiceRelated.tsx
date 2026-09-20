/**
 * components/services/ServiceRelated.tsx
 * Liens vers les autres prestations : maillage interne et rebond commercial.
 */
import Link from "next/link";
import { SERVICES } from "@/lib/services";

export default function ServiceRelated({ currentSlug }: { currentSlug: string }) {
  const others = SERVICES.filter((service) => service.slug !== currentSlug);

  if (others.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {others.map((service) => (
        <Link
          key={service.slug}
          href={`/services/${service.slug}`}
          className="group border border-line bg-paper-card px-[26px] pb-[26px] pt-[28px] text-ink hover:border-ink hover:text-ink"
        >
          <div className="mb-2.5 font-mono text-[10px] tracking-[0.16em] text-label uppercase">
            {service.card.tag}
          </div>
          <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em]">
            {service.card.title}
          </h3>
          <p className="mb-4 text-[14.5px] leading-[1.6] text-muted">
            {service.card.body}
          </p>
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-accent-dark uppercase">
            Voir la prestation →
          </span>
        </Link>
      ))}
    </div>
  );
}
