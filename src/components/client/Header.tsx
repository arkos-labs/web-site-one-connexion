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
        // 1. Check if Admin (Email check for now, or metadata)
        // Remplacez par votre logique d'admin réelle si différente
        const isAdmin = currentUser.email === "admin@oneconnexion.com" || currentUser.user_metadata?.role === 'admin';

        if (isAdmin) {
            setUserRole("admin");
            setUserName("Administrateur");
            return;
        }

        // 2. If not admin, assume Client and fetch profile
        setUserRole("client");

        // Try to get name from metadata first (faster)
        const metadataName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.company_name;
        if (metadataName) {
            setUserName(metadataName);
        }

        // Then fetch from DB to be sure/get updated info
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('company_name, first_name, last_name')
                .eq('user_id', currentUser.id)
                .single();

            if (data) {
                const displayName = data.company_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
                if (displayName) setUserName(displayName);
            } else if (!metadataName) {
                // Fallback if no profile and no metadata
                setUserName(currentUser.email?.split('@')[0] || "Client");
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);
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
        if (!name) return "U";
        if (name === "Administrateur") return "A";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const navLinks = [
        { name: "Accueil", path: "/" },
        { name: "Tarifs", path: "/tarifs" },
        { name: "Expertises", path: "/expertises" },
        { name: "Comment ça marche", path: "/fonctionnement" },
        { name: "Avis clients", path: "/avis" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-50 py-4 shadow-md bg-gradient-to-r from-primary via-primary to-primary/95"
            >
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Logo variant="light" size="md" />

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
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
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${userRole === 'admin' ? "bg-red-500" : "bg-cta"
                                            } text-white`}>
                                            {getInitials(userName)}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs opacity-80">Bonjour,</span>
                                            <span className="text-sm font-semibold max-w-[150px] truncate">{userName || "Compte"}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-strong border border-border overflow-hidden animate-in slide-in-from-top-2">
                                            <div className={`p-4 ${userRole === 'admin' ? "bg-gradient-to-r from-red-600 to-red-800" : "bg-gradient-hero"} text-white`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                                        {getInitials(userName)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-semibold truncate">{userName || "Compte"}</p>
                                                        <p className="text-xs opacity-90 truncate">{user?.email}</p>
                                                        {userRole === 'admin' && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                Administrateur
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                {userRole === 'admin' ? (
                                                    // Menu Admin
                                                    <>
                                                        <Link
                                                            to="/dashboard-admin"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-primary"
                                                        >
                                                            <ShieldCheck className="w-4 h-4 text-red-600" />
                                                            <span className="font-medium">Dashboard Admin</span>
                                                        </Link>
                                                        <Link
                                                            to="/dashboard-admin/commandes"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-primary"
                                                        >
                                                            <Package className="w-4 h-4 text-red-600" />
                                                            <span className="font-medium">Gérer les commandes</span>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    // Menu Client
                                                    <>
                                                        <Link
                                                            to="/client/dashboard"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-light transition-colors text-primary"
                                                        >
                                                            <LayoutDashboard className="w-4 h-4 text-accent-main" />
                                                            <span className="font-medium">Mon tableau de bord</span>
                                                        </Link>
                                                        <Link
                                                            to="/client/orders"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-light transition-colors text-primary"
                                                        >
                                                            <Package className="w-4 h-4 text-accent-main" />
                                                            <span className="font-medium">Mes commandes</span>
                                                        </Link>
                                                        <Link
                                                            to="/client/settings"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-light transition-colors text-primary"
                                                        >
                                                            <Settings className="w-4 h-4 text-accent-main" />
                                                            <span className="font-medium">Paramètres</span>
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border-t border-border p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive w-full"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="font-medium">Se déconnecter</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button
                                            variant="ghost"
                                            className="font-medium text-white hover:text-cta hover:bg-white/10"
                                        >
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Se connecter
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="bg-cta hover:bg-cta/90 text-white font-bold shadow-md hover:shadow-lg transition-all">
                                            <User className="w-4 h-4 mr-2" />
                                            Créer un compte
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? "bg-primary/5 text-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-2" />

                        {user ? (
                            <>
                                <div className={`px-4 py-2 ${userRole === 'admin' ? "bg-red-600" : "bg-gradient-hero"} rounded-lg text-white`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                            {getInitials(userName)}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-semibold">{userName || "Compte"}</span>
                                            <span className="block text-xs opacity-90">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {userRole === 'admin' ? (
                                    <>
                                        <Link to="/dashboard-admin" className="w-full">
                                            <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                                Dashboard Admin
                                            </Button>
                                        </Link>
                                        <Link to="/dashboard-admin/commandes" className="w-full">
                                            <Button variant="outline" className="w-full justify-start border-red-200 text-red-600">
                                                <Package className="w-4 h-4 mr-2" />
                                                Gérer les commandes
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/client/dashboard" className="w-full">
                                            <Button className="w-full justify-start bg-primary text-white">
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Mon tableau de bord
                                            </Button>
                                        </Link>
                                        <Link to="/client/orders" className="w-full">
                                            <Button variant="outline" className="w-full justify-start border-primary/20 text-primary">
                                                <Package className="w-4 h-4 mr-2" />
                                                Mes commandes
                                            </Button>
                                        </Link>
                                        <Link to="/client/settings" className="w-full">
                                            <Button variant="outline" className="w-full justify-start border-primary/20 text-primary">
                                                <Settings className="w-4 h-4 mr-2" />
                                                Paramètres
                                            </Button>
                                        </Link>
                                    </>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Se déconnecter
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="w-full">
                                    <Button variant="outline" className="w-full justify-start border-primary/20 text-primary">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Se connecter
                                    </Button>
                                </Link>
                                <Link to="/register" className="w-full">
                                    <Button className="w-full justify-start bg-cta hover:bg-cta/90 text-white font-bold">
                                        <User className="w-4 h-4 mr-2" />
                                        Créer un compte
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>
            {/* Spacer to account for fixed header height */}
            <div className="h-[72px]" aria-hidden="true" />
        </>
    );
};

export default Header;
