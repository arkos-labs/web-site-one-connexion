import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, Share2, Globe, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 text-gray-800 pt-4 pb-2 border-t border-gray-200 font-sans text-[12px]">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-4 items-start pt-2">
                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-3">
                        <Logo variant="default" size="sm" />
                        <p className="text-gray-500 text-[12px] leading-relaxed font-light max-w-xs">
                            Votre partenaire d'excellence pour la course urgente.
                            Une logistique sur-mesure disponible 24/7 en Île-de-France.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <SocialLink href="#" icon={<FacebookSVG />} />
                            <SocialLink href="#" icon={<TwitterSVG />} />
                            <SocialLink href="#" icon={<InstagramSVG />} />
                            <SocialLink href="#" icon={<LinkedinSVG />} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-bold mb-3 text-[#0B1525] uppercase tracking-wider">
                            Navigation
                        </h3>
                        <ul className="space-y-1">
                            <FooterLink to="/" label="Accueil" />
                            <FooterLink to="/expertises" label="Nos Expertises" />
                            <FooterLink to="/tarifs" label="Tarifs & Délais" />
                            <FooterLink to="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="md:col-span-3">
                        <h3 className="text-sm font-bold mb-3 text-[#0B1525] uppercase tracking-wider">
                            Informations Légales
                        </h3>
                        <ul className="space-y-1">
                            <FooterLink to="/mentions-legales" label="Mentions Légales" />
                            <FooterLink to="/cgv" label="Conditions Générales (CGV)" />
                            <FooterLink to="/cookies" label="Politique Cookies" />
                            <FooterLink to="/confidentialite" label="Confidentialité" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-3">
                        <h3 className="text-sm font-bold mb-3 text-[#0B1525] uppercase tracking-wider">
                            Nous Contacter
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-gray-600 group">
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#ed5518] group-hover:text-[#ed5518] transition-all">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[12px] font-light mt-1">
                                    123 Avenue des Champs-Élysées, 75008 Paris
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 group">
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#ed5518] group-hover:text-[#ed5518] transition-all">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <a href="tel:+33123456789" className="text-[12px] font-light hover:text-[#ed5518] transition-colors">
                                    +33 1 23 45 67 89
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 group">
                                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#ed5518] group-hover:text-[#ed5518] transition-all">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <a href="mailto:contact@oneconnexion.fr" className="text-[12px] font-light hover:text-[#ed5518] transition-colors">
                                    contact@oneconnexion.fr
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-2 flex flex-col md:flex-row justify-between items-center gap-2">
                    <p className="text-gray-500 text-xs text-center md:text-left font-light">
                        © {currentYear} One Connexion Express. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-500 font-light">
                        <Link to="/mentions-legales" className="hover:text-[#ed5518] transition-colors">Mentions légales</Link>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <Link to="/cgv" className="hover:text-[#ed5518] transition-colors">CGV</Link>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <Link to="/contact" className="hover:text-[#ed5518] transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, label }: { to: string; label: string }) => (
    <li>
        <Link to={to} className="text-gray-500 hover:text-[#0B1525] hover:translate-x-1 transition-all duration-300 flex items-center text-sm font-light group">
            {label}
        </Link>
    </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0B1525] hover:text-white hover:border-[#0B1525] transition-all duration-300 shadow-sm"
    >
        {icon}
    </a>
);

// Custom Brand Icons
const FacebookSVG = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterSVG = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.2-17.4 11.4 0 0 3.5.4 6-1.4-2.4-.1-4.4-1.7-5.1-4 0 0 .8.1 1.2.1 0 0-2.3-.3-3.9-2 0 0 .7.4 1.2.4 0 0-3.6-2.1-1.3-6 0 0 2.2 2.7 5.7 2.9 0 0-.6-2.8 1.1-4.7 0 0 1.9-2.1 4.7-1 0 0 1.2-.5 1.7-1 0 0-.3 1.1-.9 1.7 0 0 1.1-.3 1.6-.6 0 0-.6 1.4-1.1 2z"></path></svg>
);
const InstagramSVG = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const LinkedinSVG = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

export default Footer;



