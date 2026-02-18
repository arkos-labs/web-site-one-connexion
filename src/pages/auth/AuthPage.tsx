import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ArrowLeft, Building2, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();


    // Determine mode from URL
    const [mode, setMode] = useState<AuthMode>(
        location.pathname === "/inscription" ? "register" : "login"
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
        navigate(newMode === "login" ? "/connexion" : "/inscription", { replace: true });
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
                await supabase.auth.signOut();
                toast.error("Accès refusé", {
                    description: "Les chauffeurs doivent utiliser l'application mobile dédiée.",
                });
                return;
            }

            toast.success("Connexion réussie", {
                description: "Ravi de vous revoir !",
            });

            if (role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/client/tableau-de-bord");
            }

        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("Erreur de connexion", {
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
            toast.error("Erreur", {
                description: "Les mots de passe ne correspondent pas.",
            });
            setIsLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            toast.error("Erreur", {
                description: "Le mot de passe doit contenir au moins 6 caractères.",
            });
            setIsLoading(false);
            return;
        }

        if (!registerData.companyName.trim()) {
            toast.error("Erreur", {
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
                    emailRedirectTo: window.location.origin + '/client/tableau-de-bord'
                }
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error("Erreur lors de la création du compte");
            }

            toast.success("Inscription réussie !", {
                description: "Un email de confirmation a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.",
            });

            // Rediriger vers la page de connexion
            setTimeout(() => {
                handleModeSwitch("login");
            }, 2000);

        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error("Erreur d'inscription", {
                description: error.message || "Une erreur est survenue lors de l'inscription.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden relative font-sans">
            {/* Left Side - Visual/Branding - Premium Dark */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative bg-[#0B1525] flex-col justify-center items-center p-12 overflow-hidden"
            >
                {/* Abstract decorative elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-900 opacity-20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-md space-y-10 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-white/5 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                            <span className="text-[#D4AF37] text-4xl font-serif font-bold">OC</span>
                        </div>
                        <span className="text-4xl font-serif font-bold text-white tracking-wide">
                            One Connexion
                        </span>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-light text-white leading-tight">
                                {mode === "login" ? (
                                    <>L'excellence de la livraison <br /> <span className="text-[#D4AF37] font-serif italic">Premium</span></>
                                ) : (
                                    <>Rejoignez le réseau <br /> <span className="text-[#D4AF37] font-serif italic">Elite</span></>
                                )}
                            </h2>
                            <p className="text-gray-400 font-light text-lg">
                                {mode === "login"
                                    ? "Accédez à votre espace sécurisé et gérez vos courses urgentes en quelques clics."
                                    : "Créez votre compte professionnel pour bénéficier de nos services exclusifs."}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="grid grid-cols-1 gap-5 pt-8 text-left pl-8 border-l border-[#D4AF37]/20">
                        {(mode === "login"
                            ? ["Disponible 24/7 en Île-de-France", "Suivi GPS temps réel", "Facturation mensuelle détaillée"]
                            : ["Inscription sans engagement", "Validation immédiate", "Support client privilégié"]
                        ).map((feature, index) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-center space-x-4 group"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                                </div>
                                <span className="text-base font-light text-gray-300 group-hover:text-white transition-colors">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    {/* Back Button */}
                    <div
                        className="absolute top-8 left-8 lg:left-12 flex items-center cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
                        onClick={() => navigate("/")}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-2 group-hover:bg-[#0B1525] transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-gray-600 font-medium text-sm">Retour à l'accueil</span>
                    </div>

                    <div className="text-center space-y-2 pt-10 lg:pt-0">
                        <h2 className="text-3xl font-serif font-bold text-[#0B1525]">
                            {mode === "login" ? "Connexion" : "Inscription"}
                        </h2>
                        <p className="text-gray-500 font-light">
                            {mode === "login" ? "Bienvenue sur votre espace client." : "Remplissez le formulaire pour commencer."}
                        </p>
                    </div>

                    {/* Auth Toggle - Premium Style */}
                    <div className="flex justify-center">
                        <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-full relative">
                            <motion.div
                                className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm border border-gray-100"
                                initial={false}
                                animate={{
                                    left: mode === "login" ? "4px" : "50%",
                                    width: "calc(50% - 6px)",
                                    x: mode === "login" ? 0 : 2
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => handleModeSwitch("login")}
                                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px] ${mode === "login" ? "text-[#0B1525]" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => handleModeSwitch("register")}
                                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px] ${mode === "register" ? "text-[#0B1525]" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                Inscription
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white"
                        >
                            {mode === "login" ? (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email" className="text-gray-700 font-medium">Email professionnel</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="exemple@societe.com"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                required
                                                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="login-password" className="text-gray-700 font-medium">Mot de passe</Label>
                                            <Link
                                                to="/mot-de-passe-oublie"
                                                className="text-xs font-medium text-[#D4AF37] hover:text-[#B08D1F] transition-colors"
                                            >
                                                Mot de passe oublié ?
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="login-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                required
                                                className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl pr-10 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Me connecter <ArrowRight className="w-5 h-5" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-gray-700 font-medium">Nom de l'entreprise</Label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="companyName"
                                                type="text"
                                                placeholder="Votre société"
                                                value={registerData.companyName}
                                                onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                                                required
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-gray-700 font-medium">Nom complet</Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Prénom Nom"
                                                value={registerData.fullName}
                                                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                                required
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="register-email" className="text-gray-700 font-medium">Email</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                                <Input
                                                    id="register-email"
                                                    type="email"
                                                    placeholder="Email pro"
                                                    value={registerData.email}
                                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                    required
                                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-700 font-medium">Téléphone</Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="06..."
                                                    value={registerData.phone}
                                                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                    required
                                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="register-password" className="text-gray-700 font-medium">Mot de passe</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="register-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                required
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl pr-10 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmation</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={registerData.confirmPassword}
                                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                                required
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Créer mon compte <ArrowRight className="w-5 h-5" />
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

