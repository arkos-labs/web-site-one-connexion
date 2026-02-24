import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { CheckCircle2, ShieldCheck, Zap, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900 border-b border-slate-100">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80"
            alt="L'équipe One Connexion"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900 to-slate-900" />
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-7xl mb-8 leading-tight">
            Redéfinir le <span className="text-orange-500 italic">Dernier Kilomètre</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-slate-300 leading-relaxed font-light">
            One Connexion n'est pas qu'une société de livraison. Nous sommes le partenaire technologique et logistique
            qui sécurise la croissance des entreprises parisiennes à travers un service de messagerie ultra-fiable.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-600">
                Notre Mission
              </div>
              <h2 className="text-3xl font-black text-slate-900 md:text-5xl leading-tight">
                L'exigence B2B au cœur de nos processus.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Fondée sur le constat que la logistique urbaine est souvent le maillon faible de la chaîne de valeur,
                One Connexion a été créée pour apporter la rigueur du secteur médical et juridique à l'ensemble du tissu économique parisien.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="text-3xl font-black text-orange-500">15 min</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Réponse Devis</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-500">24/7</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Service Dispatch</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-orange-500/5 rounded-3xl blur-2xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80"
                className="relative rounded-3xl shadow-2xl border border-slate-100 grayscale hover:grayscale-0 transition-all duration-700"
                alt="Logistique Professionnelle"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 md:text-5xl">Nos Valeurs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Fiabilité Absolue",
                desc: "Parce que vos colis sont cruciaux pour votre activité, nous traitons chaque mission avec un soin chirurgical."
              },
              {
                icon: Zap,
                title: "Réactivité Record",
                desc: "Dans une économie en flux tendus, nous faisons de la vitesse notre standard de service."
              },
              {
                icon: Users,
                title: "Proximité Humaine",
                desc: "Une équipe dédiée à Paris pour vous accompagner, loin des centres d'appels délocalisés."
              }
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-orange-500/30 transition-all group">
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 md:text-5xl mb-8">Votre logistique mérite l'excellence.</h2>
          <p className="text-xl text-slate-600 mb-12 italic">
            "Nous ne nous contentons pas de transporter des objets, nous livrons votre promesse à vos clients."
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-slate-900 px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-orange-500 transition-all active:scale-95">
              Devenir Partenaire B2B
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}



