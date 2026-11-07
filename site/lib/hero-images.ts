/**
 * lib/hero-images.ts
 * Photos de hero, clé = slug de la prestation ou de la page.
 * Toutes proviennent d'Unsplash (licence Unsplash, usage libre). Chaque photo a été vérifiée
 * visuellement pour correspondre au sujet de la page. Les communes n'ont pas encore de photo.
 */
export const HERO_IMAGES: Record<string, { src: string; credit: string; position?: string }> = {
  "plis-confidentiels": { src: "/images/hero/plis-confidentiels.jpg", credit: "Unsplash" },
  "transport-medical": { src: "/images/hero/transport-medical.jpg", credit: "Unsplash" },
  "livraison-e-commerce": { src: "/images/hero/livraison-e-commerce.jpg", credit: "Unsplash" },
  "tournees-regulieres": { src: "/images/hero/tournees-regulieres.jpg", credit: "Unsplash" },
  "transport-evenementiel": { src: "/images/hero/transport-evenementiel.jpg", credit: "Unsplash" },
  "compte-entreprise": { src: "/images/hero/compte-entreprise.jpg", credit: "Unsplash" },
  "coursier-express-paris": { src: "/images/hero/coursier-express-paris.jpg", credit: "Unsplash" },
  "coursier-moto-paris": { src: "/images/hero/coursier-moto-paris.jpg", credit: "Unsplash", position: "center 92%" },
  paris: { src: "/images/hero/paris.jpg", credit: "Unsplash" },
  "ile-de-france": { src: "/images/hero/ile-de-france.jpg", credit: "Unsplash" },
  tarifs: { src: "/images/hero/tarifs.jpg", credit: "Unsplash" },
  secteurs: { src: "/images/hero/secteurs.jpg", credit: "Unsplash" },
};
