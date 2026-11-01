/**
 * components/TrustBlock.tsx
 * Coordonnées légales visibles en bas des pages service et zone : raison
 * sociale, SIRET, adresse et téléphone, repris de lib/site-content (mêmes
 * valeurs que le pied de page et les mentions légales). Intitulé en gras,
 * pas de H2 : il ne compte pas dans le plan de la page.
 */
import Link from "next/link";
import { LEGAL, PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";

export default function TrustBlock() {
  return (
    <section aria-label="Nos coordonnées" className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <p className="mb-4 text-[15px] font-bold text-ink">Nos coordonnées</p>
        <dl className="grid gap-x-10 gap-y-3 text-[14.5px] leading-[1.6] text-muted sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">Raison sociale</dt>
            <dd className="text-ink">{LEGAL.denomination}, SAS</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">SIRET</dt>
            <dd className="text-ink tabular-nums">{LEGAL.siret}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">Adresse</dt>
            <dd className="text-ink">{LEGAL.adresse}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-label uppercase">Téléphone</dt>
            <dd>
              <a href={`tel:${PHONE_TEL}`} className="text-ink tabular-nums hover:text-accent-dark">{PHONE_DISPLAY}</a>
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-[13.5px]">
          <Link href="/mentions-legales" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent-dark">
            Mentions légales
          </Link>
        </p>
      </div>
    </section>
  );
}
