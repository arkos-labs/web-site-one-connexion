/**
 * components/services/ServiceSteps.tsx
 * Procédure numérotée. <ol> réel : l'ordre porte du sens.
 */
import type { ServiceStep } from "@/lib/services";

export default function ServiceSteps({ steps }: { steps: ServiceStep[] }) {
  return (
    <ol className="grid gap-px border border-line bg-line">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid gap-4 bg-paper-card px-[30px] py-[26px] sm:grid-cols-[64px_1fr]"
        >
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent-dark tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3 className="mb-2 text-[17px] font-bold tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="max-w-[64ch] text-[15px] leading-[1.6] text-muted">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
