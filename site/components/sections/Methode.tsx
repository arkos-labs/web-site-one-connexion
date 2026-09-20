/**
 * components/sections/Methode.tsx
 * "Méthode" — les quatre étapes, de l'appel à la preuve de livraison.
 */
const STEPS = [
  {
    step: "ÉTAPE 01",
    title: "Commande en 2 minutes",
    body: "Par téléphone, e-mail ou depuis votre compte. Adresse, contenu, contrainte horaire : c'est tout ce qu'il nous faut.",
  },
  {
    step: "ÉTAPE 02",
    title: "Affectation du coursier",
    body: "Le coursier le plus proche est engagé et vous recevez son identité, son heure d'arrivée et son numéro direct.",
  },
  {
    step: "ÉTAPE 03",
    title: "Suivi pendant la course",
    body: "Position live partageable avec votre destinataire. En cas d'imprévu, nous appelons avant que vous ayez à le faire.",
  },
  {
    step: "ÉTAPE 04",
    title: "Preuve de livraison",
    body: "Signature, photo et horodatage transmis dans la minute, puis archivés sur votre compte pendant 12 mois.",
  },
];

export default function Methode({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  return (
    <section id="methode" className="border-y border-line bg-paper-card">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        {!hideHeader && (
          <>
            <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
              Méthode
            </div>
            <h2 className="mb-14 max-w-[24ch] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
              De l&rsquo;appel à la preuve de livraison.
            </h2>
          </>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-10">
          {STEPS.map((item) => (
            <div key={item.step} className="border-t-2 border-ink pt-[22px]">
              <div className="mb-3.5 font-mono text-[11px] tracking-[0.14em] text-label">
                {item.step}
              </div>
              <h3 className="mb-2.5 text-lg font-bold tracking-[-0.01em]">{item.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
