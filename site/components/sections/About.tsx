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
            Société de coursiers experts à Paris et en Île-de-France.
          </h2>
          <p className="mb-6 text-[16.5px] leading-[1.65] text-muted">
            Fondée sur l'exigence absolue de la ponctualité, <strong>One Connexion</strong> s'est imposée comme le partenaire logistique de référence pour vos livraisons urgentes à <strong>Paris (75)</strong> et dans toute l'agglomération parisienne. En tant que <strong>coursier professionnel B2B</strong>, nous ne sommes pas une simple plateforme : nous opérons notre propre flotte de motos et scooters pour déjouer le trafic saturé de la capitale.
          </p>
          <p className="mb-8 text-[16.5px] leading-[1.65] text-muted">
            Qu'il s'agisse d'un <strong>transport express de plis confidentiels</strong> dans le quartier d'affaires de <strong>La Défense (92)</strong>, d'une urgence vers les aéroports de <strong>Roissy-CDG ou Orly</strong>, ou d'une livraison <em>same-day</em> couvrant la petite couronne (<strong>Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne</strong>), notre infrastructure garantit une couverture géographique sans faille. Externaliser votre logistique du dernier kilomètre francilien avec nous, c'est choisir l'efficacité locale.
          </p>
          
          <div className="flex flex-col gap-4">
            {["Dispatcheurs basés au cœur de Paris", "Couverture intégrale 75, 92, 93, 94", "Accès privilégié ZTL (Zones à Trafic Limité)"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden bg-ink/5 rounded-[4px] shadow-sm">
          <Image
            src="/images/about-coursier.jpg"
            alt="Coursier B2B professionnel à Paris"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
