/**
 * lib/services/types.ts
 * Contrat de données d'une prestation. Une seule source alimente la homepage,
 * l'index /services, les pages de détail, les métadonnées et le sitemap.
 */

export type ServiceStat = { value: string; label: string };
export type ServiceStep = { title: string; body: string };
export type ServiceUseCase = { title: string; body: string };
export type FaqItem = { question: string; answer: string };

/** Tarifs propres à la prestation : mêmes prix que la grille, présentés pour ce service. */
export type ServicePricing = {
  title: string;
  intro: string;
  /** Formules mises en avant pour ce service (« navette » : sur devis). */
  recommended: ("standard" | "urgent" | "flash" | "navette")[];
  /** Conseil propre au service, sous la grille. */
  note: string;
};

/** Photo légendée. alt et légende décrivent uniquement ce qui est visible. */
export type ServicePhoto = {
  src: string;
  alt: string;
  caption: string;
  /** Dimensions réelles du fichier. */
  width: number;
  height: number;
};

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
  /** Photos facultatives : sous le titre du contexte et sous celui de la procédure. */
  photos?: { context?: ServicePhoto; steps?: ServicePhoto };
  included: string[];
  useCases: ServiceUseCase[];
  coverage: string;
  pricing: ServicePricing;
  /** Titre de la FAQ, propre au service. */
  faqTitle: string;
  faq: FaqItem[];
  /**
   * Plan SEO de la page : exactement quatre H2, dans l'ordre. Les trois premiers
   * titrent des blocs de contenu, le quatrième l'appel à l'action final. Les
   * autres blocs restent affichés, sans H2. Absent : gabarit d'origine.
   */
  outline?: ServiceOutline;
};

export type ServiceSectionKey = "context" | "steps" | "included" | "useCases";

export type ServiceOutline = {
  sections: [OutlineSection, OutlineSection, OutlineSection];
  cta: { title: string; /** Liens internes au format [ancre](/chemin). */ text: string };
  /** Retire le bloc tarifs de la page. */
  hidePricing?: boolean;
};

type OutlineSection = { key: ServiceSectionKey; title: string };
