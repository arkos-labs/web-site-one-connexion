/**
 * components/sections/Contact.tsx
 * Bandeau CTA final — fond orange plein, seule occurrence de l'accent
 * en pleine surface sur toute la page.
 */
import Link from "next/link";

/** Sur l'accueil, le titre suit le plan SEO et le texte renvoie vers /contact ; ailleurs, le bandeau d'origine. */
export default function Contact({
  title,
  devisLink = false,
  titleAs = "h2",
}: { title?: string; devisLink?: boolean; /** « p » quand le plan de la page n'a pas de place pour ce titre. */ titleAs?: "h2" | "p" } = {}) {
  const Title = titleAs;
  return (
    <section id="contact" className="bg-accent text-white py-16">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <Title className="mb-2 text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
            {title ?? "Confiez-nous votre prochaine course."}
          </Title>
          <p className="text-[16px] text-white/90">
            Ouvrez un compte entreprise en 2 minutes, sans engagement.
            {devisLink && (
              <>
                {" "}Pour un volume régulier,{" "}
                <Link href="/contact" className="font-semibold text-white underline decoration-white/60 underline-offset-4 hover:decoration-white">
                  demander un devis
                </Link>
                .
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a
            href="/inscription"
            className="flex items-center gap-2 rounded-[4px] bg-ink px-6 py-3.5 text-[14px] font-bold text-white hover:bg-paper-card hover:text-ink transition-colors"
          >
            Ouvrir un compte
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a
            href="/#commander"
            className="rounded-[4px] border border-white/40 px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Commander une course
          </a>
        </div>
      </div>
    </section>
  );
}
