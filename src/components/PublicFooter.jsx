import { Link } from "react-router-dom";
import { ArrowUpRight, Target } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-[#0a0c14] text-white pt-16 pb-8 w-full mt-auto">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-12 md:items-start text-left">
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Custom Logo (matching the image) */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-[#ed5518] p-3 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                <Target size={32} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none group-hover:text-[#ed5518] transition-colors">One</span>
                <span className="text-2xl font-black tracking-tight leading-none group-hover:text-[#ed5518] transition-colors">Connexion</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed5518] mt-1">Transport B2B</span>
              </div>
            </Link>

            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ed5518] animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Service disponible 24/7</span>
            </div>

            <p className="text-[14px] leading-relaxed text-slate-400 max-w-xs font-medium">
              Notre mission est de simplifier la logistique B2B pour les entreprises, en offrant une solution rapide, fiable et 100% digitalisée.
            </p>
            
            <Link to="/contact" className="w-fit flex items-center justify-between gap-6 rounded-xl bg-[#ed5518] pl-6 pr-4 py-4 text-sm font-black text-white hover:bg-[#ed5518]/90 shadow-xl shadow-orange-700/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Contactez-nous
              <div className="bg-white/20 rounded-lg p-1.5">
                <ArrowUpRight size={18} />
              </div>
            </Link>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-[#ed5518] font-black mb-8 opacity-90">Société</h3>
            <div className="space-y-4 text-[14px] font-bold text-slate-400">
              <Link to="/about" className="block hover:text-white transition-colors">À propos</Link>
              <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
              <Link to="/mentions-legales" className="block hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="block hover:text-white transition-colors">Confidentialité</Link>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-[#ed5518] font-black mb-8 opacity-90">Services</h3>
            <div className="space-y-4 text-[14px] font-bold text-slate-400">
              <Link to="/coursier-b2b-paris" className="block hover:text-white transition-colors">Coursier B2B Paris</Link>
              <Link to="/coursier-ile-de-france" className="block hover:text-white transition-colors">Coursier Île-de-France</Link>
              <Link to="/messagerie-express-ile-de-france" className="block hover:text-white transition-colors">Messagerie express IDF</Link>
              <Link to="/navette-reguliere-ile-de-france" className="block hover:text-white transition-colors">Navettes régulières</Link>
              <Link to="/commande-sans-compte" className="block text-[#ed5518] hover:translate-x-1 transition-transform">Commander sans compte →</Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[11px] uppercase tracking-[0.3em] text-[#ed5518] font-black mb-8 opacity-90">Secteurs</h3>
            <div className="space-y-4 text-[14px] font-bold text-slate-400">
              <Link to="/coursier-opticien-paris" className="block hover:text-white transition-colors">Opticiens</Link>
              <Link to="/coursier-dentiste-paris" className="block hover:text-white transition-colors">Dentistes</Link>
              <Link to="/coursier-juridique-paris" className="block hover:text-white transition-colors">Juridique</Link>
              <Link to="/coursier-evenementiel-paris" className="block hover:text-white transition-colors">Événementiel</Link>
              <Link to="/coursier-automobile-paris" className="block hover:text-white transition-colors">Automobile</Link>
            </div>
          </div>
        </div>

        <div className="mt-20 mb-8 h-px w-full bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] md:flex-row pb-4">
          <span>© 2026 One Connexion. Tous droits réservés.</span>
          <div className="flex items-center gap-10">
            <a href="#" className="hover:text-white transition-colors">FACEBOOK</a>
            <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
            <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-white transition-colors">TWITTER</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



