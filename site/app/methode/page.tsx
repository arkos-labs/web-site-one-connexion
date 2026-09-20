import Methode from "@/components/sections/Methode";
import Contact from "@/components/sections/Contact";
import { ShieldCheck, Zap, PhoneCall, Smartphone } from "lucide-react";

export const metadata = {
  title: "Notre méthode de livraison express par coursier — ONE CONNEXION",
  description: "Découvrez le fonctionnement de One Connexion pour vos livraisons express à Paris et en Île-de-France. Coursier moto, transport urgent et suivi en temps réel B2B.",
  alternates: { canonical: "/methode" },
};

const ENGAGEMENTS = [
  {
    icon: <Smartphone className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Technologie embarquée",
    desc: "Suivi GPS en temps réel, signature électronique et horodatage. Vous savez exactement où se trouve votre pli à chaque instant, sans avoir à nous appeler.",
  },
  {
    icon: <ShieldCheck className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Sécurité & Confidentialité",
    desc: "Vos plis confidentiels sont traités avec le plus grand soin. Nos coursiers sont sensibilisés aux exigences juridiques et médicales, assurant une discrétion absolue.",
  },
  {
    icon: <Zap className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Réactivité optimale",
    desc: "En 2 minutes votre commande est validée. Le coursier le plus proche est dépêché sur place immédiatement pour garantir un enlèvement dans les plus brefs délais.",
  },
  {
    icon: <PhoneCall className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />,
    title: "Interlocuteur unique",
    desc: "Fini les standards téléphoniques interminables. Vous disposez d'une ligne directe avec votre dispatcheur qui connaît votre dossier et vos habitudes.",
  }
];

export default function MethodePage() {
  return (
    <main>
      <section className="relative bg-ink text-white" style={{ backgroundImage: "url('/images/methode-bg-new.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-ink/85"></div>
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pt-20 pb-16">
          <h1 className="mb-6 text-[clamp(40px,5vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
            Notre Méthode
          </h1>
          <p className="max-w-[60ch] text-[17px] leading-[1.6] text-white/70">
            Chez One Connexion, nous croyons que la transparence et la fiabilité sont les clés d'une livraison réussie. 
            C'est pourquoi nous avons mis en place un processus clair, de la prise de commande à la remise en main propre. 
            Découvrez notre méthodologie éprouvée pour garantir des livraisons toujours à l'heure et en toute sécurité.
          </p>
        </div>
      </section>
      
      <Methode hideHeader={true} />

      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] py-10">
        <div className="mb-5 font-mono text-[11px] tracking-[0.16em] text-accent-dark uppercase">
          Nos engagements
        </div>
        <h2 className="mb-14 max-w-[24ch] text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-0.03em]">
          Bien plus qu'un simple transport.
        </h2>
        
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {ENGAGEMENTS.map((item, index) => (
            <div key={index} className="flex flex-col">
              {item.icon}
              <h3 className="mb-3 text-lg font-bold tracking-[-0.01em]">{item.title}</h3>
              <p className="text-[14.5px] leading-[1.6] text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,28px)] pb-10">
        <div className="border-t border-line pt-20">
          <h2 className="mb-8 text-[clamp(24px,2.5vw,32px)] font-bold leading-[1.2] tracking-[-0.02em]">
            L'excellence logistique au service des professionnels franciliens
          </h2>
          <div className="grid gap-8 md:grid-cols-2 text-[15.5px] leading-[1.7] text-muted">
            <div>
              <p className="mb-4">
                La gestion des flux urgents au sein de la métropole parisienne exige une rigueur opérationnelle absolue. En tant que partenaire stratégique des entreprises, <strong>One Connexion</strong> déploie une infrastructure de <strong>transport express</strong> dédiée aux professionnels. Notre flotte de <strong>coursiers moto et deux-roues</strong> est calibrée pour répondre aux impératifs de délais les plus stricts, sécurisant ainsi votre chaîne de valeur.
              </p>
              <p>
                Notre offre de <strong>coursier B2B</strong> s'adresse spécifiquement aux cabinets d'avocats, aux établissements de santé et aux directions générales. Chaque <strong>course urgente en Île-de-France</strong> fait l'objet d'un suivi télématique rigoureux, garantissant une traçabilité et une confidentialité totales de vos flux documentaires ou matériels, de l'enlèvement jusqu'à la certification de la remise en main propre.
              </p>
            </div>
            <div>
              <p className="mb-4">
                Confier l'externalisation de votre logistique du dernier kilomètre à notre société de <strong>coursiers parisiens</strong> constitue un véritable levier de performance. Nos dispatcheurs assurent une supervision en temps réel et une allocation dynamique des ressources, garantissant une réactivité optimale pour toute <strong>livraison dans la journée</strong> (same-day delivery) ou urgence absolue nécessitant un coursier dédié.
              </p>
              <p>
                L'intégration de nos solutions de <strong>livraison express à Paris</strong> sécurise vos opérations critiques. Nous prenons en charge cette composante essentielle avec un professionnalisme, une ponctualité et une discrétion irréprochables, vous permettant de vous recentrer sereinement sur votre cœur de métier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
