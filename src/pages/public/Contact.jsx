import React from "react";
import PublicHeader from "../../components/PublicHeader.jsx";
import PublicFooter from "../../components/PublicFooter.jsx";
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-cream font-body selection:bg-[#ed5518] selection:text-white">
      <PublicHeader />

      <section className="pt-32 pb-24 md:pt-48 md:pb-40">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">

          {/* Section Header - Centered */}
          <div className="max-w-4xl mx-auto mb-24 flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-8 bg-[#ed5518]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed5518]">
                Contact B2B Prioritaire
              </span>
              <div className="h-px w-8 bg-[#ed5518]"></div>
            </div>
            <h1 className="text-4xl md:text-7xl font-display leading-tight">
              parlons de votre <br />
              <span className="italic text-[#ed5518]">prochaine mission</span>.
            </h1>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-16">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/40 mb-10">lignes directes</h2>
                <div className="space-y-10">
                  <div className="group">
                    <div className="text-[9px] uppercase tracking-widest text-[#ed5518] font-bold mb-2">Conciergerie Paris</div>
                    <div className="flex items-center justify-between border-b border-noir/10 pb-5 group-hover:border-[#ed5518] transition-colors">
                      <a href="tel:0189201245" className="text-2xl md:text-3xl font-display italic hover:text-[#ed5518] transition-colors">01 89 20 12 45</a>
                      <Phone size={20} className="text-noir/20 group-hover:text-[#ed5518] transition-colors" />
                    </div>
                  </div>

                  <div className="group">
                    <div className="text-[9px] uppercase tracking-widest text-[#ed5518] font-bold mb-2">Support Prioritaire</div>
                    <div className="flex items-center justify-between border-b border-noir/10 pb-5 group-hover:border-[#ed5518] transition-colors">
                      <a href="mailto:contact@oneconnexion.com" className="text-xl md:text-2xl font-display italic hover:text-[#ed5518] transition-colors break-all">contact@oneconnexion.com</a>
                      <Mail size={20} className="text-noir/20 group-hover:text-[#ed5518] transition-colors" />
                    </div>
                  </div>

                  <div className="group">
                    <div className="text-[9px] uppercase tracking-widest text-[#ed5518] font-bold mb-2">Siège Social</div>
                    <div className="flex items-center justify-between border-b border-noir/10 pb-5 group-hover:border-[#ed5518] transition-colors">
                      <p className="text-xl md:text-2xl font-display italic">Paris IXe Arrondissement</p>
                      <MapPin size={20} className="text-noir/20 group-hover:text-[#ed5518] transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Features Card */}
              <div className="bg-noir p-10 text-white rounded-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#ed5518]"></div>
                <h3 className="text-2xl font-display italic mb-6">Pourquoi nous choisir ?</h3>
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <Zap size={18} className="text-[#ed5518] shrink-0 mt-1" />
                    <p className="text-white/70 text-xs leading-relaxed"><span className="text-white font-bold tracking-wide">Réactivité chirurgicale.</span> Fin des attentes interminables.</p>
                  </div>
                  <div className="flex gap-4">
                    <ShieldCheck size={18} className="text-[#ed5518] shrink-0 mt-1" />
                    <p className="text-white/70 text-xs leading-relaxed"><span className="text-white font-bold tracking-wide">Sécurité absolue.</span> Protocoles confidentiels.</p>
                  </div>
                  <div className="flex gap-4">
                    <Globe size={18} className="text-[#ed5518] shrink-0 mt-1" />
                    <p className="text-white/70 text-xs leading-relaxed"><span className="text-white font-bold tracking-wide">Image de marque.</span> Excellence comportementale.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="lg:col-span-7 bg-white p-8 md:p-14 rounded-xl shadow-xl shadow-noir/5 border border-noir/5">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-display mb-3 italic">Un projet à l'étude ?</h2>
                <p className="text-noir/60 font-light text-base">Nos experts vous répondent sous 15 minutes.</p>
              </div>

              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <input type="text" id="name" placeholder=" " className="peer w-full bg-transparent border-b border-noir/10 py-2.5 text-lg focus:outline-none focus:border-[#ed5518] transition-all" />
                    <label htmlFor="name" className="absolute left-0 top-2.5 text-noir/40 uppercase tracking-[0.2em] text-[9px] font-bold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-4 peer-focus:text-[#ed5518] peer-focus:text-[9px]">Nom complet</label>
                  </div>
                  <div className="relative group">
                    <input type="text" id="company" placeholder=" " className="peer w-full bg-transparent border-b border-noir/10 py-2.5 text-lg focus:outline-none focus:border-[#ed5518] transition-all" />
                    <label htmlFor="company" className="absolute left-0 top-2.5 text-noir/40 uppercase tracking-[0.2em] text-[9px] font-bold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-4 peer-focus:text-[#ed5518] peer-focus:text-[9px]">Entreprise</label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <input type="email" id="email" placeholder=" " className="peer w-full bg-transparent border-b border-noir/10 py-2.5 text-lg focus:outline-none focus:border-[#ed5518] transition-all" />
                    <label htmlFor="email" className="absolute left-0 top-2.5 text-noir/40 uppercase tracking-[0.2em] text-[9px] font-bold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-4 peer-focus:text-[#ed5518] peer-focus:text-[9px]">Email professionnel</label>
                  </div>
                  <div className="relative group">
                    <input type="tel" id="phone" placeholder=" " className="peer w-full bg-transparent border-b border-noir/10 py-2.5 text-lg focus:outline-none focus:border-[#ed5518] transition-all" />
                    <label htmlFor="phone" className="absolute left-0 top-2.5 text-noir/40 uppercase tracking-[0.2em] text-[9px] font-bold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-4 peer-focus:text-[#ed5518] peer-focus:text-[9px]">Téléphone</label>
                  </div>
                </div>

                <div className="relative group">
                  <textarea id="message" rows={3} placeholder=" " className="peer w-full bg-transparent border-b border-noir/10 py-2.5 text-lg focus:outline-none focus:border-[#ed5518] transition-all resize-none" />
                  <label htmlFor="message" className="absolute left-0 top-2.5 text-noir/40 uppercase tracking-[0.2em] text-[9px] font-bold transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-4 peer-focus:text-[#ed5518] peer-focus:text-[9px]">Votre message</label>
                </div>

                <button type="submit" className="w-full bg-noir text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-[#ed5518] transition-all flex items-center justify-center gap-3 group">
                  Envoyer la requête <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
