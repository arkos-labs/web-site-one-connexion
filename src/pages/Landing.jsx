import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { ArrowUpRight, Package, FileText, MessageSquare, CreditCard, Stethoscope, Scale, Calendar, Car, Plus, Facebook, Twitter, Instagram, Linkedin, ShoppingCart, Star, CheckCircle2 } from "lucide-react";

const benefits = [
  { title: "Bon de commande & Suivi", desc: <span>Génération automatique PDF et traçabilité complète de chaque envoi. <Link to="/inscription" className="underline decoration-orange-500/30 hover:decoration-orange-500">Ouvrir un compte</Link></span> },
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
  { q: "Comment fonctionne le bon de commande ?", a: <span>C'est simple et automatique : dès que votre course est validée par notre système, un Bon de Commande (BC) officiel est généré. Il est instantanément accessible dans votre <Link to="/connexion" className="text-orange-600 font-medium hover:underline">espace client</Link> et envoyé par email. Ce document comprend tous les détails logistiques et fait foi de l'ordre de mission.</span> },
  { q: "La facturation est-elle compatible avec les normes 2026 ?", a: "Oui, nous sommes prêts. Toutes nos factures sont émises au format électronique structuré. Cela garantit une conformité totale avec les nouvelles obligations fiscales et facilite l'import automatique dans votre logiciel comptable." },
  { q: "Puis-je avoir une estimation rapide du prix ?", a: <span>Absolument. Notre <Link to="/guest-order" className="text-orange-600 font-medium hover:underline">simulateur en ligne</Link> vous donne un prix ferme et définitif en quelques secondes. Il prend en compte le type de véhicule (moto, voiture), la distance réelle et le niveau d'urgence. Pas de mauvaises surprises à l'arrivée.</span> },
  { q: "Quels sont les délais de prise en charge à Paris ?", a: "Pour les courses 'Urgentes', nous nous engageons sur une prise en charge en moins de 45 minutes dans Paris intra-muros. Grâce à notre flotte répartie stratégiquement, un chauffeur est toujours à proximité de vos bureaux ou entrepôts." },
  { q: "Puis-je ouvrir un compte pro sans engagement ?", a: <span>Oui, la création d'un <Link to="/inscription" className="text-orange-600 font-medium hover:underline">compte professionnel</Link> est 100% gratuite et sans aucun engagement de durée. Vous ne payez que ce que vous consommez. Pas d'abonnement mensuel caché, pas de frais de dossier.</span> },
  { q: "Les marchandises sont-elles assurées ?", a: <span>Votre sérénité est notre priorité. Chaque transport réalisé via One Connexion est couvert par notre assurance ad valorem jusqu'à 50 000€, incluse dans le prix. Vos marchandises précieuses ou sensibles sont protégées contre la perte et les dommages.</span> },
  { q: "Proposez-vous des tournées régulières ?", a: "Tout à fait. En plus des courses à la demande, nous organisons des tournées programmées (navettes inter-sites, ramassage courrier, livraisons e-commerce). Contactez notre service commercial pour mettre en place un plan de transport sur-mesure." },
];

export default function Landing() {
  return (
    <div className="bg-slate-50 text-slate-700 font-sans selection:bg-orange-500/30 selection:text-orange-900">
      {/* Header */}
      <PublicHeader />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-900 px-4 py-16 md:py-32 text-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80"
            alt="Livraison professionnelle : remise de colis et documents"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-5xl">

          <h1 className="mb-8 font-serif text-5xl font-medium tracking-tight text-white md:text-7xl">
            Envoyez vos colis & marchandises <br className="hidden md:block" />
            dans <span className="italic text-orange-400">tout Paris</span> et l’Île‑de‑France
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-100">
            Messagerie B2B et coursier express à Paris & Île‑de‑France : envois rapides, plis urgents,
            colis sensibles et tournées régulières avec facturation claire.
            <br className="hidden md:block" /> Idéal pour dentistes, opticiens, juridique, santé, événementiel et automobile.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/inscription" className="group relative flex items-center gap-3 rounded-full bg-orange-500 px-8 py-4 text-white shadow-xl transition-all hover:bg-orange-600 hover:scale-105">
              <span className="text-base font-bold">Créer un compte pro</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <ArrowUpRight size={16} />
              </div>
            </Link>
            <Link to="/guest-order" className="group relative flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-white backdrop-blur-sm transition-all hover:bg-white/20">
              <span className="text-base font-bold">Commander sans compte</span>
              <ShoppingCart size={18} className="text-orange-300" />
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-100">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20">
              <Package className="text-orange-400" size={18} />
              <span>Commandes 24/7</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20">
              <CreditCard className="text-orange-400" size={18} />
              <span>Facturation Mensuelle</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20">
              <MessageSquare className="text-orange-400" size={18} />
              <span>Suivi des étapes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="bg-white py-16 md:py-32 relative border-t border-slate-100">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]"></div>
        <div className="mx-auto max-w-6xl px-4 md:px-8 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Pourquoi choisir One Connexion ?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Des solutions de transport sur-mesure pour les professionnels exigeants. Fiabilité, transparence et réactivité pour accompagner de bout en bout votre activité.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <div key={i} className="group relative rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:bg-slate-50 transition-all hover:-translate-y-2 hover:border-orange-500/30">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-110">
                  {i === 0 && <FileText size={26} />}
                  {i === 1 && <CreditCard size={26} />}
                  {i === 2 && <MessageSquare size={26} />}
                  {i === 3 && <Package size={26} />}
                </div>
                <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900">{b.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/guest-order" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-transform hover:scale-105 hover:bg-orange-500">
              Estimer votre première course &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Expertises */}
      <section id="expertises" className="bg-slate-50 py-16 md:py-32 relative border-t border-slate-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full point-events-none"></div>
        <div className="mx-auto max-w-6xl px-4 md:px-8 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Nos Expertises Sectorielles</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Des solutions logistiques chirurgicales pensées pour les contraintes de chaque métier d'exigence.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {expertises.map((e, i) => (
              <div key={i} className="group flex flex-col items-center rounded-3xl bg-white p-10 text-center shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:-translate-y-2 hover:bg-white hover:border-orange-500/20">
                <div className="mb-8 rounded-full bg-orange-50 p-5 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                  <e.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900">{e.title}</h3>
                <p className="mb-10 text-[15px] leading-relaxed text-slate-600">
                  {e.desc}
                </p>
                <Link to={e.link} className="mt-auto px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-orange-600 hover:text-white hover:bg-orange-500 rounded-full border border-orange-500/30 transition-all">
                  Découvrir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-white py-16 md:py-32 border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Un workflow maîtrisé de A à Z
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              4 étapes structurées pour une logistique infaillible. Le contrôle direct à chaque instant.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Dispatch Actif 24/7
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="group relative flex flex-col rounded-3xl bg-slate-50 p-8 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all hover:-translate-y-2 hover:bg-white hover:border-slate-200 hover:shadow-xl">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-lg font-black text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-sm">
                    {s.num}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Étape</span>
                </div>

                <h3 className="mb-4 text-xl font-bold tracking-tight text-slate-900">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* Testimonials */}
      <section className="bg-slate-50 py-16 md:py-32 relative overflow-hidden border-t border-slate-200">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-100 blur-[150px] rounded-full point-events-none"></div>
        <div className="mx-auto max-w-6xl px-4 md:px-8 relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              L'excellence validée par le terrain
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Ce que les professionnels du dernier kilomètre et nos clients historiques disent de nous.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="flex flex-col rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-sm p-10 shadow-xl shadow-slate-200/50 transition-all hover:border-slate-300 hover:bg-white hover:-translate-y-2">
                <div className="mb-8 flex gap-1.5 text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="mb-10 flex-1 text-lg leading-relaxed text-slate-700 font-medium">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-black text-white shadow-lg ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 tracking-wide">{t.name}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-orange-500" /> Client Certifié
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-16 md:py-32 border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Questions fréquentes</h2>
            <p className="mt-6 text-lg text-slate-600">Tout ce que vous devez savoir pour démarrer ou optimiser vos processus logistiques.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-3xl bg-slate-50 p-2 shadow-sm border border-slate-200 [&_summary::-webkit-details-marker]:hidden transition-all hover:border-slate-300">
                <summary className="flex cursor-pointer items-center justify-between rounded-2xl px-8 py-6 font-bold tracking-tight text-slate-900 transition-colors hover:bg-slate-100">
                  <span className="text-lg pr-4">{f.q}</span>
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-white border border-slate-200 text-slate-400 transition-all group-open:rotate-45 group-open:bg-orange-500 group-open:border-orange-500 group-open:text-white group-hover:bg-orange-50 group-hover:text-orange-500 group-open:group-hover:text-white">
                    <Plus size={20} />
                  </div>
                </summary>
                <div className="px-8 pb-8 pt-2 text-[15px] font-medium leading-relaxed text-slate-600">
                  {f.a}
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





