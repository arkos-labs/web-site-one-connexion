import PageSchema from "@/components/PageSchema";

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageSchema path="/mentions-legales" name="Mentions légales">
      {children}
    </PageSchema>
  );
}
