/**
 * lib/services/types.ts
 * Contrat de données d'une prestation. Une seule source alimente la homepage,
 * l'index /services, les pages de détail, les métadonnées et le sitemap.
 */

export type ServiceStat = { value: string; label: string };
export type ServiceStep = { title: string; body: string };
export type ServiceUseCase = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

export type Service = {
  /** Segment d'URL. Définitif : le modifier après indexation impose une redirection. */
  slug: string;

  /** Carte affichée sur la homepage et sur l'index /services. */
  card: { tag: string; title: string; body: string; note: string };

  /** Métadonnées de référencement. */
  seo: { title: string; description: string; keywords: string[] };

  /** Contenu de la page. */
  h1: string;
  intro: string;
  stats: ServiceStat[];
  context: { title: string; paragraphs: string[] };
  steps: ServiceStep[];
  included: string[];
  useCases: ServiceUseCase[];
  coverage: string;
  faq: FaqItem[];
};
