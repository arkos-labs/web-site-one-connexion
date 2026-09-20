/**
 * components/JsonLd.tsx
 * Injecte un bloc JSON-LD. Le contenu est sérialisé côté serveur : les données
 * proviennent exclusivement de nos propres fichiers, jamais d'une saisie externe.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
