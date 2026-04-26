import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";

export default function PublicFooter() {
  return (
    <footer className="bg-noir text-white w-full mt-auto py-20 border-t border-white/5 font-body">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid gap-16 lg:grid-cols-2 mb-20">
          <div>
            <Logo size="md" variant="light" className="mb-8" />
            <p className="text-white text-xl font-display italic max-w-sm mb-12">
              "Redéfinir le dernier kilomètre avec l'élégance et la rigueur des plus grandes maisons."
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ed5518] mb-6">Exploration</h3>
              <nav className="flex flex-col gap-4 text-sm font-bold text-white">
                <a href="/#features" className="hover:text-[#ed5518] transition-colors">Notre Vision</a>
                <a href="/#expertises" className="hover:text-[#ed5518] transition-colors">Secteurs</a>
                <a href="/#workflow" className="hover:text-[#ed5518] transition-colors">Logistique</a>
                <Link to="/contact" className="hover:text-[#ed5518] transition-colors">Contact</Link>
              </nav>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ed5518] mb-6">Juridique</h3>
              <nav className="flex flex-col gap-4 text-sm font-bold text-white">
                <Link to="/mentions-legales" className="hover:text-[#ed5518] transition-colors">Mentions légales</Link>
                <Link to="/confidentialite" className="hover:text-[#ed5518] transition-colors">Confidentialité</Link>
                <Link to="/cgv" className="hover:text-[#ed5518] transition-colors">CGV</Link>
              </nav>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ed5518] mb-6">Présence</h3>
              <p className="text-sm text-white leading-relaxed italic font-display font-medium">
                Paris, IXe Arrondissement<br />
                Île-de-France, France
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
          <span>© 2026 One Connexion — Excellence Logistique</span>
          <div className="flex gap-8">
            <a href="https://fr.linkedin.com/company/one-connexion" target="_blank" rel="noopener noreferrer" className="hover:text-[#ed5518] transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
            </a>
            <a href="https://www.instagram.com/oneconnexion" target="_blank" rel="noopener noreferrer" className="hover:text-[#ed5518] transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg> Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
