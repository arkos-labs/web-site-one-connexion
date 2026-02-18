import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogIn, LogOut, LayoutDashboard, Settings, Package, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import NavLink from "./NavLink";
import { supabase } from "@/lib/supabase";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"client" | "admin" | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check auth state
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await determineUserRoleAndName(session.user);
            } else {
                setUser(null);
                setUserName(null);
                setUserRole(null);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                await determineUserRoleAndName(session.user);
            } else {
                setUser(null);
                setUserName(null);
                setUserRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const determineUserRoleAndName = async (currentUser: any) => {
        const isAdmin = currentUser.email === "admin@oneconnexion.com" || currentUser.user_metadata?.role === 'admin';
        if (isAdmin) {
            setUserRole("admin");
            setUserName("Administrateur");
            return;
        }
        setUserRole("client");
        const metadataName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.company_name;
        if (metadataName) {
            setUserName(metadataName);
        }
        try {
            const { data } = await supabase
                .from('clients')
                .select('company_name, first_name, last_name')
                .eq('id', currentUser.id)
                .single();

            if (data) {
                const displayName = data.company_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
                if (displayName) setUserName(displayName);
            } else if (!metadataName) {
                setUserName(currentUser.email?.split('@')[0] || "Client");
            }
        } catch (error) {
            console.error("Erreur profil:", error);
            if (!metadataName) setUserName("Client");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
        setUser(null);
        setUserName(null);
        setUserRole(null);
        setIsUserMenuOpen(false);
    };

    const getInitials = (name: string | null) => {
        if (!name || !name.trim()) return "U";
        if (name === "Administrateur") return "A";
        const parts = name.trim().split(" ");
        if (parts.length >= 2 && parts[0] && parts[1]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Navigation allégée
    const navLinks = [
        { name: "Expertises", path: "/expertises" },
        { name: "Tarifs", path: "/tarifs" },
        { name: "Comment ça marche", path: "/fonctionnement" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 py-0 shadow-sm bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Logo variant="default" size="sm" />

                        {/* Desktop Navigation (Visible uniquement sur Grand Écran LG) */}
                        <nav className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    label={link.name}
                                    isScrolled={false}
                                />
                            ))}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-4">
                            {user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${userRole === 'admin' ? "bg-red-500" : "bg-cta"} text-white shadow-sm`}>
                                            {getInitials(userName)}
                                        </div>
                                        {/* Version Compacte : Pas de nom, juste le chevron */}
                                        <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className={`p-4 ${userRole === 'admin' ? "bg-red-600" : "bg-primary"} text-white`}>
                                                <p className="font-semibold truncate text-sm">{userName || "Compte"}</p>
                                                <p className="text-xs opacity-80 truncate">{user?.email}</p>
                                            </div>

                                            <div className="p-1.5">
                                                {userRole === 'admin' ? (
                                                    <>
                                                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">
                                                            <ShieldCheck className="w-4 h-4 text-red-600" /> Dashboard Admin
                                                        </Link>
                                                        <Link to="/admin/commandes" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">
                                                            <Package className="w-4 h-4 text-red-600" /> Gérer les commandes
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link to="/client/tableau-de-bord" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">
                                                            <LayoutDashboard className="w-4 h-4 text-primary" /> Tableau de bord
                                                        </Link>
                                                        <Link to="/client/commandes" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">
                                                            <Package className="w-4 h-4 text-primary" /> Mes commandes
                                                        </Link>
                                                        <Link to="/client/parametres" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">
                                                            <Settings className="w-4 h-4 text-primary" /> Paramètres
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                            <div className="border-t border-gray-100 p-1.5">
                                                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600">
                                                    <LogOut className="w-4 h-4" /> Se déconnecter
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/connexion">
                                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary hover:bg-gray-100 font-medium h-8 px-3 text-xs">
                                            Connexion
                                        </Button>
                                    </Link>
                                    <Link to="/inscription">
                                        <Button size="sm" className="bg-cta hover:bg-cta/90 text-white font-bold shadow-md h-8 px-3 text-xs">
                                            Compte Pro
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button (Visible en dessous de LG) */}
                        <button className="lg:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-[44px] left-0 right-0 bg-white shadow-xl border-t border-gray-100 p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                        {navLinks.map((link) => (
                            <Link key={link.path} to={link.path} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path ? "bg-primary/5 text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-2" />
                        {user ? (
                            <>
                                <div className="px-4 py-2 flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                                        {getInitials(userName)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <span className="block text-sm font-semibold truncate">{userName}</span>
                                        <span className="block text-xs text-gray-500 truncate">{user?.email}</span>
                                    </div>
                                </div>
                                <Link to={userRole === 'admin' ? "/admin" : "/client/tableau-de-bord"}>
                                    <Button className="w-full justify-start mb-2" variant="outline">
                                        <LayoutDashboard className="w-4 h-4 mr-2" /> Accéder au Dashboard
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/connexion" className="w-full"><Button variant="outline" className="w-full justify-center">Se connecter</Button></Link>
                                <Link to="/inscription" className="w-full"><Button className="w-full justify-center bg-cta hover:bg-cta/90">Créer un compte</Button></Link>
                            </div>
                        )}
                    </div>
                )}
            </header>
            <div className="h-[50px]" aria-hidden="true" />
        </>
    );
};
export default Header;

