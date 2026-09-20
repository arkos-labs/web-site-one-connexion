import PageSchema from "@/components/PageSchema";

export default function MethodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/methode" name="Notre méthode">
      {children}
    </PageSchema>
  );
}
