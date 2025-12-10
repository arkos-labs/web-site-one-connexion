import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, loading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Pas connecté, rediriger vers la page de connexion
                navigate('/auth');
            } else if (!isAdmin) {
                // Connecté mais pas admin, rediriger vers le dashboard client
                navigate('/client/dashboard');
            } else {
                // Admin authentifié
                setChecking(false);
            }
        }
    }, [user, loading, isAdmin, navigate]);

    if (loading || checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
