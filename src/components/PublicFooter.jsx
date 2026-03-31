import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-white pt-4 pb-2 w-full mt-auto text-[12px]">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-start pt-2">
          {/* Brand & Mission Column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <Logo variant="light" size="sm" />
            <p className="text-[12px] leading-relaxed text-slate-400 max-w-sm">
              Notre mission est de simplifier la logistique B2B pour les entreprises, en offrant une solution rapide, fiable et 100% digitalisée.
            </p>
            <Link to="/contact" className="w-fit inline-flex items-center gap-2 rounded-full bg-[#ed5518] px-4 py-1.5 text-[11px] font-black text-white hover:bg-[#ed5518]-hover shadow-lg shadow-primary/20 transition-all">
              Contactez‑nous ↗
            </Link>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-[#ed5518] font-bold">Société</div>
            <div className="mt-3 space-y-1.5 text-slate-300">
              <Link to="/about" className="block hover:text-white">À propos</Link>
              <Link to="/contact" className="block hover:text-white">Contact</Link>
              <Link to="/mentions-legales" className="block hover:text-white">Mentions légales</Link>
              <Link to="/confidentialite" className="block hover:text-white">Confidentialité</Link>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-[#ed5518] font-bold">Services</div>
            <div className="mt-3 space-y-1.5 text-slate-300">
              <Link to="/coursier-b2b-paris" className="block hover:text-white">Coursier B2B Paris</Link>
              <Link to="/coursier-ile-de-france" className="block hover:text-white">Coursier Île‑de‑France</Link>
              <Link to="/messagerie-express-ile-de-france" className="block hover:text-white">Messagerie express IDF</Link>
              <Link to="/navette-reguliere-ile-de-france" className="block hover:text-white">Navettes régulières</Link>
              <Link to="/commande-sans-compte" className="block hover:text-[#ed5518] font-bold mt-1">Commander sans compte</Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-widest text-[#ed5518] font-bold">Secteurs</div>
            <div className="mt-3 space-y-1.5 text-slate-300">
              <Link to="/coursier-opticien-paris" className="block hover:text-white">Opticiens</Link>
              <Link to="/coursier-dentiste-paris" className="block hover:text-white">Dentistes</Link>
              <Link to="/coursier-juridique-paris" className="block hover:text-white">Juridique</Link>
              <Link to="/coursier-evenementiel-paris" className="block hover:text-white">Événementiel</Link>
              <Link to="/coursier-automobile-paris" className="block hover:text-white">Automobile</Link>
            </div>
          </div>
        </div>

        <div className="my-2 h-px w-full bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 md:flex-row">
          <span>© 2026 One Connexion. Tous droits réservés.</span>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">Facebook</a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white">LinkedIn</a>
            <a href="#" aria-label="Instagram" className="hover:text-white">Instagram</a>
            <a href="#" aria-label="Twitter" className="hover:text-white">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



