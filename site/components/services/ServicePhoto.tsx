/**
 * components/services/ServicePhoto.tsx
 * Photo légendée d'une page de prestation, au format 3:2. Toujours sous la
 * ligne de flottaison : chargement différé, jamais prioritaire.
 */
import Image from "next/image";
import type { ServicePhoto as ServicePhotoData } from "@/lib/services/types";

export default function ServicePhoto({
  photo,
  className = "",
}: {
  photo: ServicePhotoData;
  className?: string;
}) {
  return (
    <figure className={`w-full ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        sizes="(max-width: 1024px) 100vw, 440px"
        className="block aspect-[3/2] h-auto w-full rounded-lg border border-line object-cover"
      />
      <figcaption className="mt-3 text-[13.5px] leading-[1.45] text-muted">
        {photo.caption}
      </figcaption>
    </figure>
  );
}
