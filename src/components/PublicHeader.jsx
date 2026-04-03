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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      (isScrolled || !isHomePage)
        ? 'bg-[#0a0c14]/95 backdrop-blur-md border-b border-white/10 shadow-xl py-0.5' 
        : 'bg-transparent border-b border-transparent py-2'
    } text-white`}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 h-12 md:h-16">
        <div className="flex items-center shrink-0 -ml-2 md:-ml-4">
          <Logo size="md" variant="light" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-10 text-sm font-bold uppercase tracking-wider md:flex text-white/80">
          <a href="/#features" className="hover:text-[#ed5518] transition-colors">Avantages</a>
          <a href="/#expertises" className="hover:text-[#ed5518] transition-colors">Secteurs</a>
          <a href="/#workflow" className="hover:text-[#ed5518] transition-colors">Solution Logistique</a>
          <Link to="/contact" className="hover:text-[#ed5518] transition-colors font-black">Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/connexion" className="text-sm font-bold uppercase tracking-wider text-white/90 hover:text-[#ed5518] transition-colors">
            Se connecter
          </Link>
          <Link to="/inscription" className="rounded-full bg-[#ed5518] px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#c24514] hover:shadow-orange-500/30">
            Créer un compte
          </Link>
        </div>

        {/* Mobile Menu Button / 3 traits */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ed5518] text-white shadow-xl transition-all active:scale-90 md:hidden border border-white/20"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={28} strokeWidth={3.5} /> : <Menu size={28} strokeWidth={3.5} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-12 z-50 w-full overflow-y-auto bg-[#0a0c14]/98 backdrop-blur-2xl p-8 md:hidden">
          <nav className="flex flex-col gap-8 text-lg font-black uppercase tracking-widest text-white/80">
            <a href="/#features" className="hover:text-[#ed5518] transition-colors border-b border-white/5 pb-2" onClick={() => setIsMenuOpen(false)}>Avantages</a>
            <a href="/#expertises" className="hover:text-[#ed5518] transition-colors border-b border-white/5 pb-2" onClick={() => setIsMenuOpen(false)}>Secteurs</a>
            <a href="/#workflow" className="hover:text-[#ed5518] transition-colors border-b border-white/5 pb-2" onClick={() => setIsMenuOpen(false)}>Solution Logistique</a>
            <Link to="/contact" className="hover:text-[#ed5518] transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>

            <hr className="my-2 border-white/10" />

            <div className="flex flex-col gap-3">
              <Link to="/connexion" className="flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
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



