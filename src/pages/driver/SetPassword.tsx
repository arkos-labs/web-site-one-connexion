import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetDriverPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur vient d'un lien d'invitation valide
        const checkInvitationLink = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user?.email) {
                    setEmail(session.user.email);
                    setIsValidating(false);
                } else {
                    // Pas de session valide
                    toast.error('Lien d\'invitation invalide ou expiré');
                    setTimeout(() => navigate('/connexion'), 2000);
                }
            } catch (error) {
                console.error('Erreur lors de la validation:', error);
                toast.error('Erreur lors de la validation du lien');
                setTimeout(() => navigate('/connexion'), 2000);
            }
        };

        checkInvitationLink();
    }, [navigate]);

    const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (pwd.length < 8) {
            errors.push('Au moins 8 caractères');
        }
        if (!/[A-Z]/.test(pwd)) {
            errors.push('Au moins une majuscule');
        }
        if (!/[a-z]/.test(pwd)) {
            errors.push('Au moins une minuscule');
        }
        if (!/[0-9]/.test(pwd)) {
            errors.push('Au moins un chiffre');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        const validation = validatePassword(password);
        if (!validation.valid) {
            toast.error('Mot de passe trop faible', {
                description: validation.errors.join(', ')
            });
            return;
        }

        setIsLoading(true);

        try {
            // Mettre à jour le mot de passe
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            // Mettre à jour le statut d'invitation dans la table drivers
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.user_metadata?.driver_id) {
                await supabase
                    .from('drivers')
                    .update({
                        invitation_status: 'accepted',
                        account_activated_at: new Date().toISOString()
                    })
                    .eq('id', user.user_metadata.driver_id);
            }

            toast.success('Mot de passe défini avec succès !', {
                description: 'Vous allez être redirigé vers la page de connexion'
            });

            // Déconnecter l'utilisateur pour qu'il se connecte avec son nouveau mot de passe
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/connexion');
            }, 2000);

        } catch (error: any) {
            console.error('Erreur lors de la définition du mot de passe:', error);
            toast.error(error.message || 'Erreur lors de la définition du mot de passe');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(password);

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Validation de votre invitation...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Définir votre mot de passe
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Bienvenue ! Créez un mot de passe sécurisé pour votre compte chauffeur
                    </p>
                    {email && (
                        <p className="text-xs text-muted-foreground mt-2 bg-blue-50 p-2 rounded">
                            {email}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mot de passe */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Indicateurs de force du mot de passe */}
                        {password && (
                            <div className="space-y-1 mt-2">
                                {[
                                    { test: password.length >= 8, label: 'Au moins 8 caractères' },
                                    { test: /[A-Z]/.test(password), label: 'Une majuscule' },
                                    { test: /[a-z]/.test(password), label: 'Une minuscule' },
                                    { test: /[0-9]/.test(password), label: 'Un chiffre' }
                                ].map((rule, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                        {rule.test ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-gray-300" />
                                        )}
                                        <span className={rule.test ? 'text-green-700' : 'text-gray-500'}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Les mots de passe ne correspondent pas
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !passwordValidation.valid || password !== confirmPassword}
                    >
                        {isLoading ? 'Activation en cours...' : 'Activer mon compte'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        En activant votre compte, vous acceptez nos conditions d'utilisation
                    </p>
                </div>
            </Card>
        </div>
    );
}


