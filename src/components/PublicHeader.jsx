import { Link } from "react-router-dom";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur transition-all">
      <div className="flex w-full items-center px-8 py-6 text-slate-900">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-white text-lg font-bold shadow-xl shadow-orange-500/25">OC</div>
          <div>
            <div className="text-lg font-semibold text-slate-900">One Connexion</div>
            <div className="text-sm text-slate-500">Paris & Île‑de‑France • B2B</div>
          </div>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-base text-slate-500 md:flex font-medium">
          <a href="/#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</a>
          <a href="/#expertises" className="hover:text-slate-900 transition-colors">Secteurs</a>
          <a href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        </nav>
        <div className="ml-auto flex gap-3">
          <Link to="/login" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Se connecter</Link>
          <Link to="/register" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">Créer un compte</Link>
        </div>
      </div>
    </header>
  );
}
