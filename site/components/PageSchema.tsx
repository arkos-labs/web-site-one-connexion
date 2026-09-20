/**
 * components/PageSchema.tsx
 * Fil d'Ariane (BreadcrumbList) + type de page schema.org pour les pages
 * institutionnelles. Server Component : données issues de nos propres fichiers.
 */
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-content";

type Props = {
  path: string;
  name: string;
  /** Type schema.org de la page (WebPage par défaut). */
  pageType?: "WebPage" | "AboutPage" | "ContactPage";
  children: React.ReactNode;
};

export default function PageSchema({ path, name, pageType = "WebPage", children }: Props) {
  const url = `${SITE_URL}${path}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
            { "@type": "ListItem", position: 2, name, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": pageType,
          "@id": `${url}#webpage`,
          url,
          name,
          inLanguage: "fr-FR",
          isPartOf: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      {children}
    </>
  );
}
