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
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm ${isScrolled ? 'py-0.5' : 'py-1'}`}>
      <div className="container mx-auto flex items-center px-6 md:px-12 h-12 md:h-14">
        <div className="flex items-center shrink-0 -ml-2 md:-ml-4">
          <Link to="/" className="group flex items-center">
            <img 
              src="/logos/ONECONNEXION-02.png" 
              alt="One Connexion Logo" 
              className="w-28 sm:w-32 md:w-40 lg:w-48 h-auto group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-10 text-sm font-bold uppercase tracking-wider md:flex text-slate-600">
          <a href="/#features" className="hover:text-[#ed5518] transition-colors">Avantages</a>
          <a href="/#expertises" className="hover:text-[#ed5518] transition-colors">Secteurs</a>
          <a href="/#workflow" className="hover:text-[#ed5518] transition-colors">Solution Logistique</a>
          <Link to="/contact" className="hover:text-[#ed5518] transition-colors">Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/connexion" className="text-sm font-bold uppercase tracking-wider text-slate-600 hover:text-[#ed5518] transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription" className="rounded-full bg-[#ed5518] px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-primary/10 transition-all hover:bg-[#c24514] hover:shadow-primary/20">
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
            <a href="/#features" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Avantages</a>
            <a href="/#expertises" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Secteurs</a>
            <a href="/#workflow" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Solution Logistique</a>
            <Link to="/commande-sans-compte" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Commander</Link>
            <Link to="/contact" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>

            <hr className="my-2 border-slate-100" />

            <div className="flex flex-col gap-3">
              <Link to="/connexion" className="flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                SE CONNECTER
              </Link>
              <Link to="/inscription" className="flex w-full items-center justify-center rounded-full bg-[#ed5518] px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-[#c24514] transition-colors" onClick={() => setIsMenuOpen(false)}>
                CRÉER UN COMPTE
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}



