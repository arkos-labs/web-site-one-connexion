/**
 * app/audit-tracabilite/page.tsx
 * Audit gratuit de traçabilité des livraisons urgentes. Le questionnaire
 * tourne entièrement dans le navigateur.
 */
import AuditQuestionnaire from "@/components/audit/AuditQuestionnaire";

const TITLE = "Audit gratuit de traçabilité des livraisons urgentes";
const DESCRIPTION =
  "Mesurez la maturité logistique de vos courses urgentes en Île-de-France : questionnaire gratuit, score par étape et recommandations concrètes.";

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/audit-tracabilite" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/audit-tracabilite",
    type: "website",
    locale: "fr_FR",
  },
};

export default function AuditTracabilitePage() {
  return (
    <>
      <section className="relative bg-ink text-white">
        <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-20 pb-14">
          <h1 className="mb-6 max-w-[22ch] text-[clamp(36px,4.5vw,56px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Audit de traçabilité de vos livraisons urgentes
          </h1>
          <p className="max-w-[60ch] text-[17px] leading-[1.6] text-white/70">
            Un colis urgent qui disparaît du suivi pendant deux heures coûte plus cher que la course elle-même. Ce
            questionnaire objective le problème : un score par étape, puis des recommandations classées par effort et
            par impact.
          </p>
        </div>
      </section>
      <AuditQuestionnaire />
    </>
  );
}
