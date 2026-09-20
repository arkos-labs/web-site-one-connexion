/**
 * components/services/ServiceCta.tsx
 * Bloc de conversion final. Réutilise les points de contact existants
 * (téléphone et courriel) : aucun formulaire dupliqué, un seul canal à tenir.
 */
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function ServiceCta({ serviceTitle }: { serviceTitle: string }) {
  const subject = encodeURIComponent(`Demande de devis — ${serviceTitle}`);

  return (
    <section className="bg-accent text-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-10 px-[clamp(20px,4vw,28px)] py-20">
        <div className="min-w-0">
          <h2 className="mb-3.5 text-balance text-[clamp(26px,3vw,38px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Une course à engager aujourd’hui ?
          </h2>
          <p className="max-w-[46ch] text-[17px] leading-[1.6] text-white/88">
            Appelez-nous pour un départ immédiat, ou demandez un devis : nous
            confirmons la faisabilité avant d’engager la course.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap justify-end gap-3">
          <a
            href={`tel:${PHONE_TEL}`}
            className="rounded-[2px] bg-ink px-[26px] py-4 text-[15px] font-semibold text-white hover:bg-white hover:text-ink"
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href="/#commander"
            className="rounded-[2px] border border-white/60 px-[26px] py-4 text-[15px] font-semibold text-white hover:border-white hover:bg-white hover:text-accent"
          >
            Commander une course
          </a>
        </div>
      </div>
    </section>
  );
}
