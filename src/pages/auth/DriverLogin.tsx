import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DriverLogin = () => {
    const [formData, setFormData] = useState({
        driverId: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Convertir l'identifiant en email
            const email = `${formData.driverId}@driver.local`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: formData.password,
            });

            if (error) throw error;

            if (!data.user) throw new Error("Aucun utilisateur trouvé");

            toast.success("Connexion réussie", {
                description: "Bienvenue !",
            });

            // Vérifier le profil pour s'assurer que c'est bien un chauffeur
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error("Erreur récupération profil:", profileError);
            }

            const role = profileData?.role;

            if (role === 'driver') {
                // Redirection vers le dashboard chauffeur
                navigate("/chauffeur/tableau-de-bord");
            } else {
                // Si ce n'est pas un chauffeur, déconnecter
                await supabase.auth.signOut();
                throw new Error("Accès réservé aux chauffeurs uniquement");
            }

        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("Erreur de connexion", {
                description: error.message === "Invalid login credentials"
                    ? "Identifiant ou mot de passe incorrect."
                    : error.message,
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
                            One Connexion <span className="text-cta">Driver</span>
                        </span>
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
                            Bienvenue sur votre <span className="text-cta">espace chauffeur</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            Connectez-vous pour gérer vos courses et suivre vos gains en temps réel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-8 text-left">
                        {[
                            "Acceptez des courses en temps réel",
                            "Suivez vos gains quotidiens",
                            "Gérez votre disponibilité"
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cta/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-cta" />
                                </div>
                                <span className="text-base font-medium text-gray-200">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-primary">Connexion Chauffeur</h2>
                        <p className="text-muted-foreground mt-2">
                            Connectez-vous avec votre identifiant chauffeur.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="driverId" className="text-sm font-medium text-primary">
                                Identifiant chauffeur
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="driverId"
                                    type="text"
                                    placeholder="test chauffeur"
                                    value={formData.driverId}
                                    onChange={handleChange}
                                    required
                                    className="h-12 pl-10 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-primary">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="h-12 pl-10 pr-10 bg-secondary/30 border-input focus:border-cta focus:ring-cta/20 rounded-lg transition-all duration-300"
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

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-muted-foreground">
                            Pas encore de compte ?{" "}
                            <button
                                onClick={() => navigate("/inscription")}
                                className="font-bold text-primary hover:text-cta transition-colors"
                            >
                                Créer un compte chauffeur
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DriverLogin;

