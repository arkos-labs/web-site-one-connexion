import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur transition-all">
      <div className="flex w-full items-center justify-between px-8 py-6 text-slate-900">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-500 text-white text-lg font-bold shadow-xl shadow-orange-500/25">OC</div>
          <div>
            <div className="text-lg font-semibold text-slate-900">One Connexion</div>
            <div className="text-sm text-slate-500">Paris & Île‑de‑France • B2B</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center justify-center gap-8 text-base font-medium text-slate-500 md:flex">
          <a href="/#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</a>
          <a href="/#expertises" className="hover:text-slate-900 transition-colors">Secteurs</a>
          <a href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/connexion" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Se connecter</Link>
          <Link to="/inscription" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">Créer un compte</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-slate-100 bg-white p-6 shadow-xl md:hidden">
          <nav className="flex flex-col gap-6 text-base font-medium text-slate-500">
            <a href="/#features" className="hover:text-slate-900 transition-colors" onClick={() => setIsMenuOpen(false)}>Fonctionnalités</a>
            <a href="/#expertises" className="hover:text-slate-900 transition-colors" onClick={() => setIsMenuOpen(false)}>Secteurs</a>
            <a href="/#faq" className="hover:text-slate-900 transition-colors" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <Link to="/contact" className="hover:text-slate-900 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>

            <hr className="my-2 border-slate-100" />

            <div className="flex flex-col gap-3">
              <Link to="/connexion" className="flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Se connecter
              </Link>
              <Link to="/inscription" className="flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Créer un compte
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

