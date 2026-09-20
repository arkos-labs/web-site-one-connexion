/**
 * components/services/ServiceFaq.tsx
 * FAQ en <details>/<summary> natifs : pas de JavaScript, réponses présentes
 * dans le HTML servi (condition de l'éligibilité aux extraits enrichis).
 */
import type { FaqItem } from "@/lib/services";

export default function ServiceFaq({ faq }: { faq: FaqItem[] }) {
  return (
    <div className="grid gap-px border border-line bg-line">
      {faq.map((item) => (
        <details key={item.question} className="group bg-paper-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-[26px] py-[20px] text-[16px] font-semibold tracking-[-0.01em] hover:text-accent-dark">
            {item.question}
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[18px] leading-none text-accent-dark group-open:hidden"
            >
              +
            </span>
            <span
              aria-hidden="true"
              className="hidden shrink-0 font-mono text-[18px] leading-none text-accent-dark group-open:block"
            >
              −
            </span>
          </summary>
          <p className="max-w-[76ch] px-[26px] pb-[22px] text-[15px] leading-[1.65] text-muted">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
