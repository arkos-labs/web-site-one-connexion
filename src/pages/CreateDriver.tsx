import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const CreateDriver = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        driverId: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [createdDriver, setCreatedDriver] = useState<{ id: string; email: string } | null>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCreateDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setCreatedDriver(null);

        try {
            // Validation
            if (!formData.fullName.trim() || !formData.driverId.trim() || !formData.password.trim()) {
                throw new Error("Tous les champs sont obligatoires");
            }

            if (formData.password.length < 6) {
                throw new Error("Le mot de passe doit contenir au moins 6 caractères");
            }

            // Créer l'email au format driver
            const email = `${formData.driverId}@driver.local`;

            // Séparer le nom complet
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Créer le chauffeur via Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        first_name: firstName,
                        last_name: lastName,
                        role: 'driver',
                    },
                    emailRedirectTo: undefined, // Pas de confirmation email
                }
            });

            if (authError) throw authError;

            if (!authData.user) {
                throw new Error("Erreur lors de la création du chauffeur");
            }

            // Succès
            setCreatedDriver({
                id: authData.user.id,
                email: email
            });

            toast.success("Chauffeur créé avec succès !", {
                description: `${formData.fullName} peut maintenant se connecter avec l'identifiant ${formData.driverId}`,
            });

            // Réinitialiser le formulaire
            setFormData({
                fullName: "",
                driverId: "",
                password: "",
            });

        } catch (error: any) {
            console.error("Create driver error:", error);
            toast.error("Erreur", {
                description: error.message || "Une erreur est survenue lors de la création du chauffeur.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-cta/5 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-4xl font-bold text-primary">Créer un Chauffeur</h1>
                    <p className="text-muted-foreground">
                        Ajoutez un nouveau chauffeur à la plateforme One Connexion
                    </p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-cta" />
                                Informations du chauffeur
                            </CardTitle>
                            <CardDescription>
                                Remplissez les informations pour créer un nouveau compte chauffeur
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateDriver} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-sm font-medium">
                                        Nom complet *
                                    </Label>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="driverId" className="text-sm font-medium">
                                        Identifiant chauffeur *
                                    </Label>
                                    <Input
                                        id="driverId"
                                        type="text"
                                        placeholder="chauffeur01"
                                        value={formData.driverId}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Cet identifiant sera utilisé pour la connexion (format: identifiant@driver.local)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Mot de passe *
                                    </Label>
                                    <Input
                                        id="password"
                                        type="text"
                                        placeholder="Minimum 6 caractères"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Le chauffeur pourra modifier ce mot de passe après sa première connexion
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-cta hover:bg-cta/90 text-cta-foreground font-bold"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-5 w-5" />
                                            Créer le chauffeur
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Success Card */}
                {createdDriver && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Chauffeur créé avec succès !
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium text-green-900">ID Utilisateur</p>
                                        <p className="text-green-700 font-mono text-xs">{createdDriver.id}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-900">Email</p>
                                        <p className="text-green-700">{createdDriver.email}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-green-200">
                                    <p className="text-sm text-green-800">
                                        ✅ Le chauffeur peut maintenant se connecter sur l'application
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-primary mb-3">ℹ️ Informations importantes</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-cta mt-0.5">•</span>
                                    <span>Le trigger automatique créera les entrées dans <code className="bg-white px-1 rounded">profiles</code> et <code className="bg-white px-1 rounded">drivers</code></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cta mt-0.5">•</span>
                                    <span>Le statut initial du chauffeur sera <code className="bg-white px-1 rounded">offline</code></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cta mt-0.5">•</span>
                                    <span>Le chauffeur devra être validé (<code className="bg-white px-1 rounded">is_validated = true</code>) pour accepter des courses</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateDriver;
