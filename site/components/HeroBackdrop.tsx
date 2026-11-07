/**
 * components/HeroBackdrop.tsx
 * Photo de fond d'un hero sombre : image libre de droits, voile sombre pour la lisibilité.
 * À placer en premier enfant d'une section `relative overflow-hidden`, le contenu en `relative`.
 */
export default function HeroBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
      <div className="absolute inset-0 bg-ink/80" />
    </div>
  );
}
