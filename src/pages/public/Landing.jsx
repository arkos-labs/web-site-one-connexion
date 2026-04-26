import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader.jsx";
import PublicFooter from "../../components/PublicFooter.jsx";
import Hero3D from "../../components/home/Hero3D.jsx";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

const trustLogos = [
  "Maison R", "Atelier 9", "Studio V", "L'Artisan Paris", "Galerie 75"
];

const processes = [
  {
    id: "01",
    title: "Expression du besoin",
    desc: "Plis, colis ou tournées régulières. Votre demande est enregistrée en 30 secondes."
  },
  {
    id: "02",
    title: "Assignation d'élite",
    desc: "Un chauffeur qualifié, formé aux standards du luxe, prend en charge votre mission."
  },
  {
    id: "03",
    title: "Validation sécurisée",
    desc: "Preuve de livraison interactive et rapport détaillé disponible à l'instant même."
  },
];

const stats = [
  { value: "45min", label: "Temps moyen d'enlèvement" },
  { value: "99.8%", label: "Taux de réussite opérationnelle" },
  { value: "24/7", label: "Disponibilité du dispatch" },
  { value: "0", label: "Engagement de volume" },
];

const faqs = [
  { q: "Comment fonctionne la facturation ?", a: "Nous regroupons toutes vos interventions mensuelles dans une facture unique, claire et structurée au format Factur-X, simplifiant ainsi votre gestion administrative." },
  { q: "Quelles zones couvrez-vous ?", a: "Nous opérons principalement sur Paris et toute l'Île-de-France, avec des solutions de transport nationales disponibles sur demande spécifique." },
  { q: "Vos chauffeurs sont-ils formés ?", a: "Oui, chaque opérateur subit une formation rigoureuse sur les protocoles de sécurité, la courtoisie et les spécificités des secteurs sensibles (luxe, médical, juridique)." },
  { q: "Quelle est la valeur d'assurance ?", a: "Chaque transport est couvert par notre assurance ad valorem incluse, protégeant vos marchandises jusqu'à 50 000€ par expédition." },
];

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="bg-cream text-noir min-h-screen selection:bg-[#ed5518] selection:text-white">
      <PublicHeader />

      {/* Hero */}
      <Hero3D />

      {/* Trust Bar */}
      <section className="bg-cream py-12 border-b border-noir/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-xl md:text-2xl font-display italic tracking-widest">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Vision */}
      <section id="features" className="section-padding bg-cream">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-5xl md:text-7xl mb-12">
                l'exigence <br />
                <span className="italic text-[#ed5518]">comme standard</span>.
              </h2>
            </div>
            <div className="lg:pt-4">
              <p className="text-xl md:text-2xl text-noir/70 leading-relaxed mb-8 font-light">
                One Connexion n'est pas un simple service de coursier. Nous sommes le prolongement de votre promesse client. Pour les marques où chaque détail compte, notre logistique devient un véritable levier de différenciation.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-[#ed5518]" />
                  <span className="font-bold uppercase tracking-widest text-xs">Assurance Ad Valorem incluse</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-[#ed5518]" />
                  <span className="font-bold uppercase tracking-widest text-xs">Flotte multi-véhicules éco-responsable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process: Trois gestes */}
      <section id="workflow" className="section-padding bg-noir text-white overflow-hidden">
        <div className="container mx-auto">
          <div className="mb-24 flex flex-col md:flex-row items-baseline justify-between gap-6">
            <h2 className="text-5xl md:text-7xl text-white">
              trois gestes, <br />
              <span className="italic text-[#ed5518]">zéro friction</span>.
            </h2>
            <Link to="/inscription" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest mb-4">
              Démarrer l'expérience <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-24 relative">
            {processes.map((p) => (
              <div key={p.id} className="relative group border-t border-white/10 pt-10">
                <div className="text-sm font-bold text-[#ed5518] mb-4 tracking-widest uppercase">
                  Étape {p.id}
                </div>
                <h3 className="text-3xl mb-6 text-white font-display italic">{p.title}</h3>
                <p className="text-white leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertises / Secteurs - Lightened for better feel */}
      <section id="expertises" className="bg-cream py-20 md:py-40">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-24 md:mb-32 text-center md:text-left">
            <h2 className="text-5xl md:text-8xl text-noir leading-tight">
              un partenaire <br />
              <span className="italic text-[#ed5518]">qui pense</span> <br />
              comme votre marque.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-noir/5">
            {[
              { title: "Luxe & Fashion", desc: "Mannequins, shooting, portants suspendus. Le soin absolu pour vos collections." },
              { title: "Juridique & Finance", desc: "Discrétion totale et protocoles de remise sécurisés pour vos documents critiques." },
              { title: "Médical & Tech", desc: "Urgence vitale ou composants sensibles. Le transport maîtrisé sous contrainte." },
              { title: "Event & Showroom", desc: "Installation éphémère ou réassort express. Soyez prêt au moment M." },
            ].map((item, idx) => (
              <div key={idx} className="bg-cream p-12 lg:p-20 group hover:bg-[#ed5518]/5 transition-colors flex flex-col justify-between min-h-[400px]">
                <div>
                  <h3 className="text-4xl text-noir mb-8 font-display italic">{item.title}</h3>
                  <p className="text-noir/80 text-lg leading-relaxed font-light">{item.desc}</p>
                </div>
                <div className="mt-12 flex justify-end">
                  <Link to="/contact" className="w-12 h-12 rounded-full border border-noir/10 flex items-center justify-center text-noir group-hover:bg-[#ed5518] group-hover:border-[#ed5518] group-hover:text-white transition-all">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Excellence */}
      <section className="section-padding bg-noir text-white">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl mb-6 text-white leading-tight">la performance, <br className="md:hidden" /> <span className="italic text-[#ed5518]">mesurée</span>.</h2>
            <p className="text-white uppercase tracking-[0.3em] text-[10px] font-bold">L'excellence opérationnelle au service de votre image</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-white/10 pt-20">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl md:text-7xl font-display italic text-[#ed5518] mb-4">{s.value}</div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding bg-cream">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-baseline gap-12 mb-20">
            <h2 className="text-5xl md:text-7xl">on vous <br /> <span className="italic text-[#ed5518]">répond</span>.</h2>
            <p className="text-noir/80 text-lg font-light">Tout ce qu'il faut savoir pour démarrer une collaboration fluide.</p>
          </div>

          <div className="space-y-1">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-noir/10 py-8">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-2xl font-display">{f.q}</span>
                  <div className="flex-shrink-0 ml-4 transition-transform duration-300 group-hover:scale-110">
                    {activeFaq === i ? <Minus size={24} /> : <Plus size={24} />}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === i ? 'max-h-96 mt-6' : 'max-h-0'}`}>
                  <p className="text-noir/80 text-lg leading-relaxed max-w-2xl font-light">
                    {f.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Lightened for better feel */}
      <section className="bg-cream py-32 md:py-48 text-center relative overflow-hidden border-t border-noir/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ed5518]/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-6xl md:text-9xl text-noir mb-12 font-display">
            faisons <br /> <span className="italic text-[#ed5518]">connaissance</span>.
          </h2>
          <p className="text-noir/80 text-xl md:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            Établissons ensemble le standard d'excellence de vos prochaines livraisons. Nos experts sont à votre disposition pour concevoir une solution sur-mesure.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-10">
            <Link to="/inscription" className="btn-premium px-12 py-5 text-lg shadow-xl shadow-orange-500/20">
              Ouvrir un compte
            </Link>
            <Link to="/contact" className="text-noir font-bold tracking-widest uppercase text-sm border-b border-noir/80 hover:border-[#ed5518] transition-colors pb-1">
              Parlons logistique
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}






