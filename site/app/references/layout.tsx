import PageSchema from "@/components/PageSchema";

export default function ReferencesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/references" name="Nos références">
      {children}
    </PageSchema>
  );
}
