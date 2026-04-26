import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      // Le header devient opaque seulement après avoir défilé toute la section Hero
      setIsScrolled(window.scrollY > window.innerHeight * 0.9);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${(isScrolled || !isHomePage)
      ? 'bg-noir py-3 shadow-2xl'
      : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
      } text-white`}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 lg:px-20 h-16">
        <div className="flex items-center shrink-0">
          {/* Logo set to light variant for the dark header feel */}
          <Logo size="md" variant="light" className="h-8 md:h-10 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em]">
          <a href="/#features" className="hover:text-[#ed5518] transition-colors">Notre Vision</a>
          <a href="/#expertises" className="hover:text-[#ed5518] transition-colors">Secteurs</a>
          <a href="/#workflow" className="hover:text-[#ed5518] transition-colors">Logistique</a>
          <a href="/#faq" className="hover:text-[#ed5518] transition-colors">FAQ</a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/connexion" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-[#ed5518] transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription" className="btn-premium py-3 px-8 text-xs uppercase tracking-[0.2em]">
            Créer un compte
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-0 z-[60] w-full h-screen bg-noir p-12 lg:hidden flex flex-col justify-center animate-in fade-in zoom-in">
          <button className="absolute top-8 right-8 text-white" onClick={() => setIsMenuOpen(false)}>
            <X size={32} />
          </button>

          <nav className="flex flex-col gap-8 text-4xl font-display italic text-white mb-12">
            <a href="/#features" onClick={() => setIsMenuOpen(false)}>Notre Vision</a>
            <a href="/#expertises" onClick={() => setIsMenuOpen(false)}>Secteurs</a>
            <a href="/#workflow" onClick={() => setIsMenuOpen(false)}>Logistique</a>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          </nav>

          <div className="flex flex-col gap-4 text-center">
            <Link to="/inscription" onClick={() => setIsMenuOpen(false)} className="btn-premium">Ouvrir un compte</Link>
            <Link to="/connexion" onClick={() => setIsMenuOpen(false)} className="font-bold tracking-widest uppercase text-sm py-4 border border-white/10 rounded-full hover:bg-white hover:text-noir transition-all">Connexion</Link>
          </div>
        </div>
      )}
    </header>
  );
}



