import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const emailSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide")
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation avec Zod
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      // Supabase envoie un email UNIQUEMENT si l'adresse existe
      // Mais on affiche toujours un message de succès (bonne pratique de sécurité)
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`
      });

      // On ignore l'erreur "User not found" pour ne pas révéler si l'email existe
      if (supabaseError && !supabaseError.message.includes('User not found')) {
        throw supabaseError;
      }

      setSent(true);
      toast.success("Demande envoyée !", {
        description: "Vérifiez votre boîte de réception"
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
      toast.error("Erreur", {
        description: "Impossible d'envoyer la demande"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Back to login link */}
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Mot de passe oublié ?
            </CardTitle>
            <CardDescription>
              {sent
                ? "Email envoyé avec succès"
                : "Entrez votre email pour recevoir un lien de réinitialisation"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
                </p>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Demande envoyée !</h3>
                  <p className="text-sm text-muted-foreground">
                    Si un compte existe avec l'adresse :
                  </p>
                  <p className="font-medium text-primary">{email}</p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un email avec un lien de réinitialisation.
                  </p>
                </div>

                <Alert>
                  <AlertDescription className="text-sm text-left">
                    <strong>📧 Vérifiez votre boîte de réception</strong>
                    <br />
                    Le lien est valide pendant 1 heure. Si vous ne recevez pas l'email, vérifiez vos spams.
                    <br /><br />
                    <strong>❓ Pas de compte ?</strong>
                    <br />
                    Si vous n'avez pas encore de compte, cliquez sur "Retour à la connexion" puis "Créer un compte".
                  </AlertDescription>
                </Alert>

                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                  >
                    Renvoyer un email
                  </Button>

                  <Link to="/connexion" className="block">
                    <Button variant="ghost" className="w-full">
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
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

