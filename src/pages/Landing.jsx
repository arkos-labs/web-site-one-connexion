import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { ArrowUpRight, Package, FileText, MessageSquare, CreditCard, Stethoscope, Scale, Calendar, Car, Plus, Facebook, Twitter, Instagram, Linkedin, ShoppingCart, Star } from "lucide-react";

const benefits = [
  { title: "Bon de commande & Suivi", desc: <span>Génération automatique PDF et traçabilité complète de chaque envoi. <Link to="/register" className="underline decoration-orange-500/30 hover:decoration-orange-500">Ouvrir un compte</Link></span> },
  { title: "Facturation Logistique", desc: <span>Mensuelle, détaillée et conforme <a href="https://fnfe-mpe.org/factur-x/" target="_blank" rel="noopener noreferrer" className="underline decoration-orange-500/30 hover:decoration-orange-500">Factur-X</a> pour simplifier votre comptabilité.</span> },
  { title: "Suivi Transport Live", desc: "Notifications temps réel à l'enlèvement et à la livraison du colis." },
  { title: "Tout Type de Fret", desc: "Du pli urgent à la palette, transport sécurisé partout en Île-de-France." },
];

const expertises = [
  {
    icon: Stethoscope,
    title: "Transport Médical",
    desc: "Acheminement urgent de prélèvements, sang et matériel médical sous température dirigée. Respect des normes d'hygiène.",
    link: "/coursier-dentiste-paris"
  },
  {
    icon: Scale,
    title: "Courses Juridiques",
    desc: "Transport sécurisé et confidentiel de dossiers sensibles et actes originaux pour avocats et notaires.",
    link: "/coursier-juridique-paris"
  },
  {
    icon: Calendar,
    title: "Logistique Événementielle",
    desc: "Livraison express 24/7 de matériel, stands et supports pour vos salons et événements urgents.",
    link: "/coursier-evenementiel-paris"
  },
  {
    icon: Car,
    title: "Pièces Auto Urgent",
    desc: "Livraison critique de pièces détachées pour garages. Solution immédiate (AOG/VOG) pour éviter l'immobilisation.",
    link: "/coursier-automobile-paris"
  }
];

const steps = [
  { num: "01", title: "Commande Express", desc: "Saisie rapide, carnet d’adresses et choix du véhicule (moto, camion)." },
  { num: "02", title: "Assignation Chauffeur", desc: "Un coursier qualifié prend en charge votre mission immédiatement." },
  { num: "03", title: "Livraison & Preuve", desc: "Remise en main propre sécurisée et validation instantanée par photo." },
  { num: "04", title: "Facture Unique", desc: "Toutes vos courses regroupées en une seule facture mensuelle détaillée." },
];

const testimonials = [
  { name: "LogiNord", text: "On a réduit de 40% le temps admin grâce à la facturation mensuelle." },
  { name: "Industrie Atlas", text: "Le   a fait disparaître les appels de relance." },
  { name: "Groupe Delta", text: "Commande en 3 clics, tout est clair et rapide." },
  { name: "BioLab Paris", text: "Transport médical fiable, respect des délais pour les prélèvements urgents." },
];

const faqs = [
  { q: "Comment fonctionne le bon de commande ?", a: <span>C'est simple et automatique : dès que votre course est validée par notre système, un Bon de Commande (BC) officiel est généré. Il est instantanément accessible dans votre <Link to="/login" className="text-orange-600 font-medium hover:underline">espace client</Link> et envoyé par email. Ce document comprend tous les détails logistiques et fait foi de l'ordre de mission.</span> },
  { q: "La facturation est-elle compatible avec les normes 2026 ?", a: "Oui, nous sommes prêts. Toutes nos factures sont émises au format électronique structuré. Cela garantit une conformité totale avec les nouvelles obligations fiscales et facilite l'import automatique dans votre logiciel comptable." },
  { q: "Puis-je avoir une estimation rapide du prix ?", a: <span>Absolument. Notre <Link to="/guest-order" className="text-orange-600 font-medium hover:underline">simulateur en ligne</Link> vous donne un prix ferme et définitif en quelques secondes. Il prend en compte le type de véhicule (moto, voiture), la distance réelle et le niveau d'urgence. Pas de mauvaises surprises à l'arrivée.</span> },
  { q: "Quels sont les délais de prise en charge à Paris ?", a: "Pour les courses 'Urgentes', nous nous engageons sur une prise en charge en moins de 45 minutes dans Paris intra-muros. Grâce à notre flotte répartie stratégiquement, un chauffeur est toujours à proximité de vos bureaux ou entrepôts." },
  { q: "Puis-je ouvrir un compte pro sans engagement ?", a: <span>Oui, la création d'un <Link to="/register" className="text-orange-600 font-medium hover:underline">compte professionnel</Link> est 100% gratuite et sans aucun engagement de durée. Vous ne payez que ce que vous consommez. Pas d'abonnement mensuel caché, pas de frais de dossier.</span> },
  { q: "Les marchandises sont-elles assurées ?", a: <span>Votre sérénité est notre priorité. Chaque transport réalisé via One Connexion est couvert par notre assurance ad valorem jusqu'à 50 000€, incluse dans le prix. Vos marchandises précieuses ou sensibles sont protégées contre la perte et les dommages.</span> },
  { q: "Proposez-vous des tournées régulières ?", a: "Tout à fait. En plus des courses à la demande, nous organisons des tournées programmées (navettes inter-sites, ramassage courrier, livraisons e-commerce). Contactez notre service commercial pour mettre en place un plan de transport sur-mesure." },
];

export default function Landing() {
  return (
    <div className="bg-white text-slate-900">
      {/* Header */}
      <PublicHeader />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-900 px-4 py-32 text-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80"
            alt="Livraison professionnelle : remise de colis et documents"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl">

          <h1 className="mb-8 font-serif text-5xl font-medium tracking-tight text-white md:text-7xl">
            Envoyez vos colis & marchandises <br className="hidden md:block" />
            dans <span className="italic text-orange-500">tout Paris</span> et l’Île‑de‑France
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-200">
            Messagerie B2B et coursier express à Paris & Île‑de‑France : envois rapides, plis urgents,
            colis sensibles et tournées régulières avec facturation claire.
            <br className="hidden md:block" /> Idéal pour dentistes, opticiens, juridique, santé, événementiel et automobile.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register" className="group relative flex items-center gap-3 rounded-full bg-orange-500 px-8 py-4 text-white shadow-xl transition-all hover:bg-orange-600 hover:scale-105">
              <span className="text-base font-bold">Créer un compte pro</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <ArrowUpRight size={16} />
              </div>
            </Link>
            <Link to="/guest-order" className="group relative flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-white backdrop-blur-sm transition-all hover:bg-white/10">
              <span className="text-base font-bold">Commander sans compte</span>
              <ShoppingCart size={18} className="text-orange-400" />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-md border border-white/5">
              <Package className="text-orange-500" size={18} />
              <span>Commandes 24/7</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-md border border-white/5">
              <CreditCard className="text-orange-500" size={18} />
              <span>Facturation Mensuelle</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-md border border-white/5">
              <MessageSquare className="text-orange-500" size={18} />
              <span> des étapes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-5xl">
              Pourquoi choisir One Connexion ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Des solutions de transport sur-mesure pour les professionnels exigeants. Fiabilité, transparence et réactivité pour accompagner le développement de votre activité.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <div key={i} className="group relative rounded-3xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {i === 0 && <FileText size={24} />}
                  {i === 1 && <CreditCard size={24} />}
                  {i === 2 && <MessageSquare size={24} />}
                  {i === 3 && <Package size={24} />}
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-slate-900">{b.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
              Découvrir toutes les fonctionnalités →
            </button>
          </div>
        </div>
      </section>

      {/* Expertises */}
      <section id="expertises" className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-5xl">Nos Expertises</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Des solutions sur-mesure pour chaque secteur d'activité exigeant.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {expertises.map((e, i) => (
              <div key={i} className="group flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 rounded-full bg-amber-50 p-4 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <e.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 font-serif text-xl font-bold text-slate-900">{e.title}</h3>
                <p className="mb-8 text-sm leading-relaxed text-slate-500">
                  {e.desc}
                </p>
                <Link to={e.link} className="mt-auto rounded-full bg-amber-50 px-6 py-2 text-xs font-bold uppercase tracking-wide text-amber-900 transition-colors hover:bg-amber-100">
                  En savoir plus
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-5xl">
              Un parcours maîtrisé, de la commande à la facturation
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              4 étapes structurées pour une logistique fiable, conforme et transparente — avec un seul interlocuteur.
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-orange-600">
              Service opérationnel 24/7
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="group relative flex flex-col rounded-3xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {s.num}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Étape</span>
                </div>

                <h3 className="mb-3 font-serif text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-5xl">
              Ils nous font confiance
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Des retours d'expérience concrets de nos partenaires logistiques.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6 flex gap-1 text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="mb-8 flex-1 text-lg leading-relaxed text-slate-600 italic">
                  “{t.text}”
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${i === 0 ? 'bg-slate-900' : i === 1 ? 'bg-orange-500' : 'bg-slate-700'}`}>
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Client Vérifié</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-3xl font-medium text-slate-900 md:text-5xl">Questions fréquentes</h2>
            <p className="mt-4 text-slate-500">Tout ce que vous devez savoir pour démarrer avec One Connexion.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl bg-slate-50 p-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between rounded-xl px-6 py-4 font-medium text-slate-900 transition-colors hover:bg-slate-100">
                  <span className="text-lg">{f.q}</span>
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition-transform group-open:rotate-45">
                    <Plus size={20} />
                  </div>
                </summary>
                <div className="px-6 pb-4 pt-2 text-slate-600">
                  <p className="leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}


