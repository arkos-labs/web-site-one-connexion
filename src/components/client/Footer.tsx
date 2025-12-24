import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 text-gray-800 pt-20 pb-10 border-t border-gray-200 font-sans">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Logo variant="default" size="md" />
                        <p className="text-gray-500 text-sm leading-relaxed font-light">
                            Votre partenaire d'excellence pour la course urgente.
                            Une logistique sur-mesure disponible 24/7 en Île-de-France.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <SocialLink href="#" icon={<Facebook size={18} />} />
                            <SocialLink href="#" icon={<Twitter size={18} />} />
                            <SocialLink href="#" icon={<Instagram size={18} />} />
                            <SocialLink href="#" icon={<Linkedin size={18} />} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-[#0B1525]">
                            Navigation
                        </h3>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="Accueil" />
                            <FooterLink to="/expertises" label="Nos Expertises" />
                            <FooterLink to="/tarifs" label="Tarifs & Délais" />
                            <FooterLink to="/contact" label="Contact" />
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-[#0B1525]">
                            Informations Légales
                        </h3>
                        <ul className="space-y-3">
                            <FooterLink to="/mentions-legales" label="Mentions Légales" />
                            <FooterLink to="/cgv" label="Conditions Générales (CGV)" />
                            <FooterLink to="/cookies" label="Politique Cookies" />
                            <FooterLink to="/politique-confidentialite" label="Confidentialité" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-serif font-bold mb-6 text-[#0B1525]">
                            Nous Contacter
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-gray-600 group">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-all">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-light mt-1.5">
                                    123 Avenue des Champs-Élysées,<br />
                                    75008 Paris, France
                                </span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-600 group">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-all">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <a href="tel:+33123456789" className="text-sm font-light hover:text-[#D4AF37] transition-colors mt-0.5">
                                    +33 1 23 45 67 89
                                </a>
                            </li>
                            <li className="flex items-center gap-4 text-gray-600 group">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-all">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <a href="mailto:contact@oneconnexion.fr" className="text-sm font-light hover:text-[#D4AF37] transition-colors mt-0.5">
                                    contact@oneconnexion.fr
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs text-center md:text-left font-light">
                        © {currentYear} One Connexion Express. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-500 font-light">
                        <Link to="/mentions-legales" className="hover:text-[#D4AF37] transition-colors">Mentions légales</Link>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <Link to="/cgv" className="hover:text-[#D4AF37] transition-colors">CGV</Link>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, label }: { to: string; label: string }) => (
    <li>
        <Link to={to} className="text-gray-500 hover:text-[#0B1525] hover:translate-x-1 transition-all duration-300 flex items-center gap-3 text-sm font-light group">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#D4AF37] transition-colors" />
            {label}
        </Link>
    </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#0B1525] hover:text-white hover:border-[#0B1525] transition-all duration-300 shadow-sm"
    >
        {icon}
    </a>
);

export default Footer;
