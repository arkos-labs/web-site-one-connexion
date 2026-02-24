import PublicHeader from "../components/PublicHeader.jsx";
import PublicFooter from "../components/PublicFooter.jsx";
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-slate-50 pt-32 pb-16 md:pt-48 md:pb-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Réponse en moins de 15 minutes
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl mb-6">
            Parlons de votre <span className="text-orange-500">logistique</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
            Vous avez un besoin urgent ou vous souhaitez mettre en place des tournées régulières ?
            Notre équipe B2B est à votre disposition pour optimiser vos flux de transport.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-16 lg:grid-cols-2">

            {/* Left Column: Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Informations de contact</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-orange-500 shadow-sm border border-slate-100">
                      <Phone size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Téléphone</div>
                      <div className="text-xl font-bold text-slate-900">01 89 20 12 45</div>
                      <div className="text-sm text-slate-500 mt-1">Ligne directe professionnels (7j/7)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-orange-500 shadow-sm border border-slate-100">
                      <Mail size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Email</div>
                      <div className="text-xl font-bold text-slate-900">contact@oneconnexion.com</div>
                      <div className="text-sm text-slate-500 mt-1">Réponse prioritaire aux entreprises</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-orange-500 shadow-sm border border-slate-100">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Siège social</div>
                      <div className="text-xl font-bold text-slate-900">Paris & Île-de-France</div>
                      <div className="text-sm text-slate-500 mt-1">Intervention sur toute la région capitale</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Pourquoi nous appeler ?</h3>
                <ul className="space-y-4">
                  {[
                    "Demande de devis immédiat",
                    "Mise en place de navettes inter-sites",
                    "Flux de santé (opticiens, dentistes)",
                    "Ouverture de compte pro (Net 30)"
                  ].map((item, id) => (
                    <li key={id} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 size={18} className="text-orange-500" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-8 flex items-center justify-center gap-2 rounded-full bg-orange-500 py-4 text-sm font-bold text-white transition-all hover:bg-orange-600">
                  Devenir client partenaire <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Envoyez-nous un message</h2>
                <p className="text-slate-500">Remplissez ce formulaire pour toute demande de cotation.</p>
              </div>

              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nom Complet</label>
                    <input type="text" placeholder="Jean Dupont" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Entreprise</label>
                    <input type="text" placeholder="Clinique / Cabinet / SARL" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Pro</label>
                    <input type="email" placeholder="nom@entreprise.fr" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Téléphone</label>
                    <input type="tel" placeholder="06..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Type de besoin</label>
                  <select className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all">
                    <option>Course Express Ponctuelle</option>
                    <option>Mise en place de tournées régulières</option>
                    <option>Partenariat long terme</option>
                    <option>Autre demande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Votre message</label>
                  <textarea rows={4} placeholder="Détaillez votre besoin (volume, urgence, spécificités)..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all resize-none" />
                </div>

                <button type="button" className="w-full rounded-full bg-slate-900 py-5 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-orange-500 hover:shadow-orange-500/20 active:scale-95">
                  Envoyer ma demande
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}


