/**
 * components/HeroBackdrop.tsx
 * Photo de fond d'un hero sombre : image libre de droits, voile sombre pour la lisibilité.
 * À placer en premier enfant d'une section `relative overflow-hidden`, le contenu en `relative`.
 */
export default function HeroBackdrop({ src, position = "center" }: { src: string; position?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url('${src}')`, backgroundPosition: position }} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/45 to-ink/80 md:bg-gradient-to-r md:from-ink/90 md:via-ink/60 md:to-ink/30" />
    </div>
  );
}
