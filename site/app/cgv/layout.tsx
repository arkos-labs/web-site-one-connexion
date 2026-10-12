import PageSchema from "@/components/PageSchema";

export default function CgvLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/cgv" name="Conditions générales de vente">
      {children}
    </PageSchema>
  );
}
