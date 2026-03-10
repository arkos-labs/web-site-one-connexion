import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm ${isScrolled ? 'py-3' : 'py-5'}`}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link to="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white text-sm font-black shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              OC
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">One Connexion</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors">Paris & IDF • B2B</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center justify-center gap-10 text-sm font-bold uppercase tracking-wider md:flex text-slate-600">
          <a href="/#features" className="hover:text-orange-500 transition-colors">Avantages</a>
          <a href="/#expertises" className="hover:text-orange-500 transition-colors">Secteurs</a>
          <a href="/#workflow" className="hover:text-orange-500 transition-colors">Solution Logistique</a>
          <Link to="/commande-sans-compte" className="hover:text-orange-500 transition-colors">Commander</Link>
          <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/connexion" className="text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-orange-500 transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription" className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-orange-500 hover:shadow-orange-500/20">
            Créer un compte
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl p-6 shadow-2xl md:hidden">
          <nav className="flex flex-col gap-6 text-sm font-bold uppercase tracking-wider text-slate-600">
            <a href="/#features" className="hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Avantages</a>
            <a href="/#expertises" className="hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Secteurs</a>
            <a href="/#workflow" className="hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Solution Logistique</a>
            <Link to="/guest-order" className="hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Commander</Link>
            <Link to="/contact" className="hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>

            <hr className="my-2 border-slate-100" />

            <div className="flex flex-col gap-3">
              <Link to="/connexion" className="flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                SE CONNECTER
              </Link>
              <Link to="/inscription" className="flex w-full items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-orange-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                CRÉER UN COMPTE
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}



