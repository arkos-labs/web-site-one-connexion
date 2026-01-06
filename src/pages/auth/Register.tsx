import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AuthToggle from "@/components/client/AuthToggle";
import { supabase } from "@/lib/supabase";
import { generateInternalCode } from "@/utils/clientCode";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Erreur", {
                description: "Les mots de passe ne correspondent pas.",
            });
            setIsLoading(false);
            return;
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: 'client',
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                const internalCode = generateInternalCode();

                // Vérifier si des commandes invitées existent avant de créer le profil (car le trigger va les modifier)
                let pendingOrdersCount = 0;
                try {
                    const { checkPendingGuestOrders } = await import('@/services/guestOrderService');
                    pendingOrdersCount = await checkPendingGuestOrders(formData.email);
                } catch (e) {
                    console.error("Erreur vérification commandes invitées", e);
                }

                const { error: profileError } = await supabase
                    .from('clients')
                    .insert([
                        {
                            id: authData.user.id,
                            email: formData.email,
                            company_name: formData.fullName,
                            internal_code: internalCode,
                            phone: formData.phone,
                        }
                    ]);

                if (profileError) throw profileError;

                let description = "Votre compte a été créé avec succès.";
                if (pendingOrdersCount > 0) {
                    description += ` ${pendingOrdersCount} commande(s) précédente(s) ont été automatiquement rattachées à votre compte.`;
                }

                toast.success("Compte créé", {
                    description: description,
                });
                navigate("/client/dashboard");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Une erreur est survenue.";
            toast.error("Erreur", {
                description: message,
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
                {/* Background Effects */}
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
                        <span className="text-3xl font-bold text-white tracking-tight">One Connexion <span className="text-cta">Express</span></span>
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
                            Rejoignez <span className="text-cta">One Connexion Express</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Créez votre compte professionnel et bénéficiez d'un service de coursier express premium.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-8 text-left">
                        {[
                            "Inscription gratuite et rapide",
                            "Gestion simplifiée de vos courses",
                            "Facturation automatisée",
                            "Support client dédié"
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
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

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 bg-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-5 my-8"
                >
                    {/* Auth Toggle */}
                    <AuthToggle activeMode="register" />

                    {/* Back Button */}
                    <div
                        className="flex items-center cursor-pointer group w-fit"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft className="w-5 h-5 text-primary group-hover:text-cta transition-colors" />
                        <span className="ml-2 text-primary group-hover:text-cta font-medium text-sm transition-colors">Retour</span>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-primary">Inscription</h2>
                        <p className="text-muted-foreground mt-2">
                            Créez votre compte professionnel One Connexion Express.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium text-primary">Nom complet</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Jean Dupont"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-primary">Email professionnel</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="h-11 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-primary">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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
                                value={formData.confirmPassword}
                                onChange={handleChange}
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

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{" "}
                            <Link
                                to="/login"
                                className="font-bold text-primary hover:text-cta transition-colors"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
