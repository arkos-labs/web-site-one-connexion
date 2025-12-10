import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary text-primary-foreground pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Logo variant="light" size="md" />
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Votre partenaire de confiance pour la livraison express en Île-de-France.
                            Rapidité, fiabilité et suivi en temps réel pour tous vos besoins logistiques.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink href="#" icon={<Facebook size={18} />} />
                            <SocialLink href="#" icon={<Twitter size={18} />} />
                            <SocialLink href="#" icon={<Instagram size={18} />} />
                            <SocialLink href="#" icon={<Linkedin size={18} />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-cta rounded-full"></span>
                            Informations
                        </h3>
                        <ul className="space-y-3">
                            <FooterLink to="/mentions-legales" label="Mentions Légales" />
                            <FooterLink to="/cgv" label="CGV" />
                            <FooterLink to="/cookies" label="Politique de Cookies" />
                            <FooterLink to="/politique-confidentialite" label="Politique de Confidentialité" />
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-cta rounded-full"></span>
                            Contactez-nous
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-300">
                                <MapPin className="w-5 h-5 text-cta flex-shrink-0 mt-1" />
                                <span className="text-sm">
                                    123 Avenue des Champs-Élysées,<br />
                                    75008 Paris, France
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <Phone className="w-5 h-5 text-cta flex-shrink-0" />
                                <a href="tel:+33123456789" className="text-sm hover:text-cta transition-colors">
                                    +33 1 23 45 67 89
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <Mail className="w-5 h-5 text-cta flex-shrink-0" />
                                <a href="mailto:contact@oneconnexion.fr" className="text-sm hover:text-cta transition-colors">
                                    contact@oneconnexion.fr
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        © {currentYear} One Connexion Express. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap justify-center">
                        <Link to="/mentions-legales" className="hover:text-cta transition-colors">Mentions légales</Link>
                        <Link to="/cgv" className="hover:text-cta transition-colors">CGV</Link>
                        <Link to="/cookies" className="hover:text-cta transition-colors">Cookies</Link>
                        <Link to="/politique-confidentialite" className="hover:text-cta transition-colors">Confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, label }: { to: string; label: string }) => (
    <li>
        <Link to={to} className="text-gray-300 hover:text-cta hover:translate-x-1 transition-all duration-300 flex items-center gap-2 text-sm group">
            <ArrowRight className="w-3 h-3 text-cta opacity-0 group-hover:opacity-100 transition-opacity" />
            {label}
        </Link>
    </li>
);

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cta hover:text-primary transition-all duration-300"
    >
        {icon}
    </a>
);

export default Footer;
