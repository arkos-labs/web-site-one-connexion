import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";
import { Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const passwordSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation avec Zod
        const result = passwordSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        setLoading(true);
        try {
            const { error: supabaseError } = await supabase.auth.updateUser({
                password: password
            });

            if (supabaseError) throw supabaseError;

            setSuccess(true);
            toast.success("Mot de passe réinitialisé !", {
                description: "Vous allez être redirigé vers la page de connexion"
            });

            // Redirection après 2 secondes
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            console.error("Error resetting password:", error);
            setError(error.message || "Une erreur est survenue. Veuillez réessayer.");
            toast.error("Erreur", {
                description: "Impossible de réinitialiser le mot de passe"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-0">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Réinitialiser votre mot de passe
                        </CardTitle>
                        <CardDescription>
                            {success
                                ? "Votre mot de passe a été modifié avec succès"
                                : "Choisissez un nouveau mot de passe sécurisé"
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!success ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="password">Nouveau mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 8 caractères
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Réinitialisation...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Réinitialiser le mot de passe
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4 text-center py-4">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Mot de passe modifié !</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vous allez être redirigé vers la page de connexion...
                                    </p>
                                </div>

                                <Alert>
                                    <AlertDescription className="text-sm">
                                        <strong>✅ Succès</strong>
                                        <br />
                                        Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Help text */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Besoin d'aide ? Contactez-nous à{" "}
                    <a href="mailto:support@oneconnexion.fr" className="text-primary hover:underline">
                        support@oneconnexion.fr
                    </a>
                </p>
            </div>
        </div>
    );
}
