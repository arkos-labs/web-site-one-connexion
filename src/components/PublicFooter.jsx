import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-white px-4 pb-10 pt-12">
      <div className="rounded-[2.5rem] bg-[#0b0f16] px-8 py-12 text-white shadow-2xl md:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white font-bold text-xl">OC</div>
              <span className="text-xl font-bold tracking-tight">One Connexion</span>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Notre mission est de simplifier la logistique B2B pour les entreprises, en offrant une solution rapide, fiable et 100% digitalisée.
            </p>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            Contactez‑nous ↗
          </Link>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Société</div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <Link to="/about" className="block hover:text-white">À propos</Link>
              <Link to="/contact" className="block hover:text-white">Contact</Link>
              <Link to="/confidentialite" className="block hover:text-white">Confidentialité</Link>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Services</div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <Link to="/coursier-b2b-paris" className="block hover:text-white">Coursier B2B Paris</Link>
              <Link to="/coursier-ile-de-france" className="block hover:text-white">Coursier Île‑de‑France</Link>
              <Link to="/messagerie-express-ile-de-france" className="block hover:text-white">Messagerie express IDF</Link>
              <Link to="/navette-reguliere-ile-de-france" className="block hover:text-white">Navettes régulières</Link>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Secteurs</div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <Link to="/coursier-opticien-paris" className="block hover:text-white">Opticiens</Link>
              <Link to="/coursier-dentiste-paris" className="block hover:text-white">Dentistes</Link>
              <Link to="/coursier-juridique-paris" className="block hover:text-white">Juridique</Link>
              <Link to="/coursier-evenementiel-paris" className="block hover:text-white">Événementiel</Link>
              <Link to="/coursier-automobile-paris" className="block hover:text-white">Automobile</Link>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Newsletter</div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-2">
              <input className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none" placeholder="Email" />
              <button className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold">S’abonner</button>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-white/10" />

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

