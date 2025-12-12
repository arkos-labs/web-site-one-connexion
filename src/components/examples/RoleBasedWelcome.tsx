import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Users, Truck } from 'lucide-react';

/**
 * Exemple de composant qui affiche des informations différentes
 * selon le rôle de l'utilisateur (admin ou client)
 */
export const RoleBasedWelcome = () => {
    const { user, isLoading, role } = useAuth();
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'dispatcher';
    const isClient = role === 'client';

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Non connecté</CardTitle>
                    <CardDescription>Veuillez vous connecter pour accéder au système</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Déterminer l'icône selon le rôle
    const getRoleIcon = () => {
        if (role === 'super_admin') return <Shield className="h-6 w-6 text-purple-500" />;
        if (role === 'admin') return <Shield className="h-6 w-6 text-blue-500" />;
        if (role === 'dispatcher') return <Truck className="h-6 w-6 text-orange-500" />;
        if (role === 'client') return <User className="h-6 w-6 text-green-500" />;
        return <Users className="h-6 w-6 text-gray-500" />;
    };

    // Déterminer le badge selon le rôle
    const getRoleBadge = () => {
        const badgeVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            super_admin: 'destructive',
            admin: 'default',
            dispatcher: 'secondary',
            client: 'outline',
        };

        const badgeLabels: Record<string, string> = {
            super_admin: 'Super Admin',
            admin: 'Administrateur',
            dispatcher: 'Dispatcher',
            client: 'Client',
        };

        return (
            <Badge variant={badgeVariants[role || 'client']}>
                {badgeLabels[role || 'client']}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {getRoleIcon()}
                        <div>
                            <CardTitle>
                                Bienvenue, {user.profile?.first_name || user.email}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {user.email}
                            </CardDescription>
                        </div>
                    </div>
                    {getRoleBadge()}
                </div>
            </CardHeader>
            <CardContent>
                {isAdmin && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            🎯 Vous avez accès à toutes les fonctionnalités d'administration
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>✅ Gestion des clients</li>
                            <li>✅ Gestion des commandes</li>
                            <li>✅ Gestion des chauffeurs</li>
                            <li>✅ Statistiques complètes</li>
                            <li>✅ Messagerie</li>
                        </ul>
                    </div>
                )}

                {isClient && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            📦 Espace client - Gérez vos commandes et factures
                        </p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>✅ Créer des commandes</li>
                            <li>✅ Suivre vos livraisons</li>
                            <li>✅ Consulter vos factures</li>
                            <li>✅ Contacter le support</li>
                        </ul>
                    </div>
                )}

                {!role && (
                    <div className="space-y-2">
                        <p className="text-sm text-destructive">
                            ⚠️ Aucun profil trouvé pour cet utilisateur
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Veuillez contacter un administrateur
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
