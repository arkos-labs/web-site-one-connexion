/**
 * components/services/ServiceUseCases.tsx
 * Situations concrètes. Fort levier sur les requêtes longue traîne et sur
 * les réponses générées par IA, qui reprennent volontiers ce format.
 */
import type { ServiceUseCase } from "@/lib/services";

export default function ServiceUseCases({
  useCases,
}: {
  useCases: ServiceUseCase[];
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {useCases.map((useCase) => (
        <article
          key={useCase.title}
          className="border border-line bg-paper-card px-[26px] pb-[26px] pt-[28px]"
        >
          <h3 className="mb-2.5 text-[16px] font-bold tracking-[-0.02em]">
            {useCase.title}
          </h3>
          <p className="text-[15px] leading-[1.6] text-muted">{useCase.body}</p>
        </article>
      ))}
    </div>
  );
}
