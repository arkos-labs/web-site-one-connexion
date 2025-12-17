import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Determine mode from URL
    const [mode, setMode] = useState<AuthMode>(
        location.pathname === "/register" ? "register" : "login"
    );

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleModeSwitch = (newMode: AuthMode) => {
        if (newMode === mode) return;
        setMode(newMode);
        // Update URL without page reload
        navigate(newMode === "login" ? "/login" : "/register", { replace: true });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginData.email,
                password: loginData.password,
            });

            if (error) throw error;

            if (!data.user) throw new Error("Aucun utilisateur trouvé");

            // Vérification du rôle dans la table profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error("Erreur récupération profil:", profileError);
            }

            const role = profileData?.role;

            if (role === 'chauffeur' || role === 'driver') {
                await supabase.auth.signOut();
                toast({
                    variant: "destructive",
                    title: "Accès refusé",
                    description: "Les chauffeurs doivent utiliser l'application mobile dédiée.",
                });
                return;
            }

            toast({
                title: "Connexion réussie",
                description: "Ravi de vous revoir !",
                className: "bg-green-50 border-green-200",
            });

            if (role === 'admin') {
                navigate("/dashboard-admin");
            } else {
                navigate("/client/dashboard");
            }

        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                variant: "destructive",
                title: "Erreur de connexion",
                description: error.message === "Invalid login credentials"
                    ? "Identifiants incorrects."
                    : error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (registerData.password !== registerData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
            });
            setIsLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 6 caractères.",
            });
            setIsLoading(false);
            return;
        }

        if (!registerData.companyName.trim()) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Le nom de l'entreprise est obligatoire.",
            });
            setIsLoading(false);
            return;
        }

        try {
            // Séparer le nom complet en prénom et nom
            const nameParts = registerData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const metaData = {
                full_name: registerData.fullName,
                first_name: firstName,
                last_name: lastName,
                role: 'client',
                company_name: registerData.companyName,
                phone: registerData.phone
            };

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: registerData.email,
                password: registerData.password,
                options: {
                    data: metaData,
                    emailRedirectTo: window.location.origin + '/client/dashboard'
                }
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error("Erreur lors de la création du compte");
            }

            toast({
                title: "Inscription réussie !",
                description: "Un email de confirmation a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.",
                className: "bg-green-50 border-green-200",
            });

            // Rediriger vers la page de connexion
            setTimeout(() => {
                handleModeSwitch("login");
            }, 2000);

        } catch (error: any) {
            console.error("Registration error:", error);
            toast({
                variant: "destructive",
                title: "Erreur d'inscription",
                description: error.message || "Une erreur est survenue lors de l'inscription.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden relative">
            {/* Left Side - Visual/Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-center items-center p-12 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary/95" />

                <div className="relative z-10 max-w-md space-y-8 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center justify-center space-x-3 mb-8"
                    >
                        <div className="w-12 h-12 bg-cta rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-primary text-2xl font-bold">OC</span>
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">
                            One Connexion <span className="text-cta">Express</span>
                        </span>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
                                {mode === "login" ? (
                                    <>Vos livraisons urgentes en <span className="text-cta">moins de 2h</span></>
                                ) : (
                                    <>Rejoignez <span className="text-cta">One Connexion Express</span></>
                                )}
                            </h1>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                {mode === "login"
                                    ? "Connectez-vous pour gérer vos courses, suivre vos chauffeurs en temps réel et accéder à vos factures."
                                    : "Créez votre compte professionnel et bénéficiez d'un service de coursier express premium."}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4 pt-8 text-left">
                        {(mode === "login"
                            ? ["Service disponible 24/7 en Île-de-France", "Suivi GPS en temps réel", "Facturation centralisée"]
                            : ["Inscription gratuite et rapide", "Gestion simplifiée de vos courses", "Facturation automatisée", "Support client dédié"]
                        ).map((feature, index) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cta/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-cta" />
                                </div>
                                <span className="text-base font-medium text-gray-200">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 bg-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-6 my-8"
                >
                    {/* Auth Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="relative bg-gray-100 rounded-full p-1 shadow-md border border-gray-200">
                            <div className="flex items-center gap-1 relative">
                                <motion.div
                                    className="absolute top-1 h-[calc(100%-8px)] bg-cta rounded-full shadow-lg"
                                    initial={false}
                                    animate={{
                                        left: mode === "login" ? "4px" : "50%",
                                        width: mode === "login" ? "calc(50% - 6px)" : "calc(50% - 6px)",
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 35,
                                    }}
                                />

                                <motion.button
                                    onClick={() => handleModeSwitch("login")}
                                    className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap min-w-[140px] ${mode === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    animate={{ scale: mode === "login" ? 1.05 : 1 }}
                                    transition={{ scale: { duration: 0.3 } }}
                                >
                                    Connexion
                                </motion.button>

                                <motion.button
                                    onClick={() => handleModeSwitch("register")}
                                    className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap min-w-[160px] ${mode === "register" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    animate={{ scale: mode === "register" ? 1.05 : 1 }}
                                    transition={{ scale: { duration: 0.3 } }}
                                >
                                    Créer un compte
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div
                        className="flex items-center cursor-pointer group w-fit"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="w-5 h-5 text-primary group-hover:text-cta transition-colors" />
                        <span className="ml-2 text-primary group-hover:text-cta font-medium text-sm transition-colors">Retour</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center lg:text-left mb-6">
                                <h2 className="text-3xl font-bold text-primary">
                                    {mode === "login" ? "Connexion" : "Inscription"}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {mode === "login"
                                        ? "Bienvenue sur votre espace client One Connexion Express."
                                        : "Créez votre compte professionnel One Connexion Express."}
                                </p>
                            </div>

                            {mode === "login" ? (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email" className="text-sm font-medium text-primary">Email professionnel</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="nom@entreprise.com"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                            className="h-12 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="login-password" className="text-sm font-medium text-primary">Mot de passe</Label>
                                            <Link
                                                to="/forgot-password"
                                                className="text-sm font-medium text-primary hover:text-cta transition-colors underline decoration-border hover:decoration-cta"
                                            >
                                                Mot de passe oublié ?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="login-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                required
                                                className="h-12 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg pr-10 transition-all duration-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-cta hover:bg-cta/90 text-cta-foreground font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                Se connecter
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-medium text-primary">Nom complet</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="Jean Dupont"
                                            value={registerData.fullName}
                                            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                            required
                                            className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-sm font-medium text-primary">Nom de l'entreprise</Label>
                                        <Input
                                            id="companyName"
                                            type="text"
                                            placeholder="Mon Entreprise SARL"
                                            value={registerData.companyName}
                                            onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                                            required
                                            className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-email" className="text-sm font-medium text-primary">Email professionnel</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="nom@entreprise.com"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            required
                                            className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium text-primary">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+33 6 12 34 56 78"
                                            value={registerData.phone}
                                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                            required
                                            className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-password" className="text-sm font-medium text-primary">Mot de passe</Label>
                                        <div className="relative">
                                            <Input
                                                id="register-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                required
                                                className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg pr-10 transition-all duration-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-primary">Confirmer le mot de passe</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={registerData.confirmPassword}
                                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                            required
                                            className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-cta hover:bg-cta/90 text-cta-foreground font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                Créer mon compte
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
