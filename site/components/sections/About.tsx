import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function About() {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
            Notre Entreprise
          </div>
          <h2 className="mb-8 text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Vos plis urgents, livrés par nos coursiers, pas par une appli.
          </h2>
          <p className="mb-6 text-[16.5px] leading-[1.65] text-muted">
            On est installés à <strong>Saint-Mandé</strong>, juste à côté du 12e. Quand vous nous appelez pour une course, ce n&apos;est pas un inconnu trouvé sur une appli qui vient chercher votre colis : c&apos;est un de nos coursiers, sur un de nos scooters. Il vient le chercher en <strong>moins de 45 minutes</strong>, il le porte directement à destination, sans faire d&apos;autres arrêts en route.
          </p>
          <p className="mb-8 text-[16.5px] leading-[1.65] text-muted">
            Un acte à déposer au <strong>tribunal</strong> avant la fermeture du greffe, un prélèvement à porter au <strong>labo</strong>, un contrat à faire signer à <strong>La Défense</strong> avant midi, un colis oublié à rapporter à <strong>Orly</strong> : c&apos;est notre quotidien. Vous voyez le prix avant de commander, vous suivez la course en ligne, et à l&apos;arrivée on vous envoie l&apos;heure exacte de remise et le nom de la personne qui a signé. Si vous êtes une entreprise, vous réglez sur facture, à 30 jours.
          </p>

          <div className="flex flex-col gap-4">
            {["Un coursier chez vous en moins de 45 minutes", "Paris, 92, 93, 94 et toute l'Île-de-France", "Du lundi au samedi, de 9 h à 19 h"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden bg-ink/5 rounded-[4px] shadow-sm">
          <Image
            src="/images/about-coursier-opt.jpg"
            alt="Coursier B2B professionnel à Paris"
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
