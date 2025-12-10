import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ClientRouteProps {
    children: React.ReactNode;
}

export const ClientRoute = ({ children }: ClientRouteProps) => {
    const { user, loading, isClient } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Pas connecté, rediriger vers la page de connexion
                navigate('/login');
            } else if (!isClient) {
                // Connecté mais pas client
                if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'dispatcher') {
                    navigate('/dashboard-admin');
                } else {
                    // Ni client ni admin (profil manquant ou en cours de création)
                    console.warn("Profil utilisateur introuvable ou incomplet");
                    // On pourrait rediriger vers une page "Compléter mon profil" ou rester ici avec un message
                    // Pour éviter la boucle, on ne redirige PAS vers l'admin
                }
            } else {
                // Client authentifié
                setChecking(false);
            }
        }
    }, [user, loading, isClient, navigate]);

    if (loading || checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
