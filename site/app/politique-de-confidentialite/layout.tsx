import PageSchema from "@/components/PageSchema";

export default function PolitiqueConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/politique-de-confidentialite" name="Politique de confidentialité">
      {children}
    </PageSchema>
  );
}
