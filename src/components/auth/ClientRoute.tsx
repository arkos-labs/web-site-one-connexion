import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ClientRouteProps {
    children: React.ReactNode;
}

export const ClientRoute = ({ children }: ClientRouteProps) => {
    const { user, isLoading, role } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    const isClient = role === 'client';

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Pas connecté, rediriger vers la page de connexion
                navigate('/login');
            } else if (!isClient) {
                // Connecté mais pas client
                if (role === 'admin' || role === 'super_admin' || role === 'dispatcher') {
                    navigate('/dashboard-admin');
                } else {
                    // Ni client ni admin (profil manquant ou en cours de création)
                    console.warn("Profil utilisateur introuvable ou incomplet");
                    setChecking(false); // Arrêter le chargement pour afficher quelque chose (ou rediriger)
                    // Optionnel : Rediriger vers login pour forcer un refresh ou afficher une erreur
                    // navigate('/login'); 
                }
            } else {
                // Client authentifié
                setChecking(false);
            }
        }
    }, [user, isLoading, isClient, role, navigate]);

    if (isLoading || checking) {
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
