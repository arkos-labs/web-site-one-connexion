import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export default function PublicFooter() {
  return (
    <footer className="bg-[#0a0c14] text-white w-full mt-auto">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-14">

        {/* Main row: logo + 3 columns aligned */}
        <div className="grid gap-12 md:grid-cols-[220px_repeat(3,minmax(0,1fr))] items-start">

          {/* Logo block (left) */}
          <div>
            <Link to="/" className="block leading-none m-0 p-0">
              <img
                src="/logos/one-connexion-light.png"
                alt="One Connexion"
                className="w-[160px] h-auto block m-0 p-0"
              />
            </Link>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium mt-4 max-w-[180px]">
              Messagerie B2B express Paris &amp; IDF. Disponible 24/7.
            </p>
            <Link
              to="/commande-rapide"
              className="inline-block mt-3 text-[10px] font-black text-[#ed5518] uppercase tracking-widest hover:underline"
            >
              Commander sans compte →
            </Link>
          </div>

          {/* Société */}
          <div className="mt-14">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Société</h3>
              <div className="space-y-2.5 text-[12px] text-slate-400">
                <Link to="/about" className="block hover:text-white transition-colors">À propos</Link>
                <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
                <Link to="/mentions-legales" className="block hover:text-white transition-colors">Mentions légales</Link>
                <Link to="/confidentialite" className="block hover:text-white transition-colors">Confidentialité</Link>
              </div>
            </div>

          {/* Services */}
          <div className="mt-14">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Services</h3>
              <div className="space-y-2.5 text-[12px] text-slate-400">
                <Link to="/coursier-b2b-paris" className="block hover:text-white transition-colors">Coursier B2B Paris</Link>
                <Link to="/coursier-ile-de-france" className="block hover:text-white transition-colors">Coursier Île-de-France</Link>
                <Link to="/messagerie-express-ile-de-france" className="block hover:text-white transition-colors">Messagerie express IDF</Link>
                <Link to="/navette-reguliere-ile-de-france" className="block hover:text-white transition-colors">Navettes régulières</Link>
              </div>
            </div>

          {/* Secteurs */}
          <div className="mt-14">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Secteurs</h3>
            <div className="space-y-2.5 text-[12px] text-slate-400">
              <Link to="/coursier-opticien-paris" className="block hover:text-white transition-colors">Opticiens</Link>
              <Link to="/coursier-dentiste-paris" className="block hover:text-white transition-colors">Dentistes</Link>
              <Link to="/coursier-juridique-paris" className="block hover:text-white transition-colors">Juridique</Link>
              <Link to="/coursier-evenementiel-paris" className="block hover:text-white transition-colors">Événementiel</Link>
              <Link to="/coursier-automobile-paris" className="block hover:text-white transition-colors">Automobile</Link>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          <span>© 2026 One Connexion. Tous droits réservés.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
