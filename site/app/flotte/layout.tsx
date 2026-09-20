import PageSchema from "@/components/PageSchema";

export default function FlotteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/flotte" name="Notre flotte">
      {children}
    </PageSchema>
  );
}
