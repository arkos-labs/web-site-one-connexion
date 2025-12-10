import { useEffect, useState } from 'react';
import { supabase, Client } from '@/lib/supabase';
import { Admin } from '@/types/admin';

export type UserRole = 'client' | 'admin' | 'super_admin' | 'dispatcher' | null;

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    profile: Client | Admin | null;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    console.log('🔐 useAuth: Aucun utilisateur connecté');
                    setUser(null);
                    setLoading(false);
                    return;
                }

                console.log('🔐 useAuth: Utilisateur connecté:', authUser.email, 'ID:', authUser.id);

                // Vérifier d'abord si c'est un admin
                console.log('🔍 useAuth: Vérification dans table admins...');
                const { data: adminData, error: adminError } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .eq('status', 'active')
                    .single();

                console.log('🔍 useAuth: Résultat admins:', { adminData, adminError });

                if (!adminError && adminData) {
                    console.log('✅ useAuth: ADMIN DÉTECTÉ - Rôle:', adminData.role);
                    setUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        role: adminData.role as UserRole,
                        profile: adminData as Admin,
                    });
                    setLoading(false);
                    return;
                }

                // Sinon, vérifier si c'est un client
                console.log('🔍 useAuth: Vérification dans table clients...');
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .single();

                console.log('🔍 useAuth: Résultat clients:', { clientData, clientError });

                if (!clientError && clientData) {
                    console.log('✅ useAuth: CLIENT DÉTECTÉ');
                    setUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        role: 'client',
                        profile: clientData as Client,
                    });
                } else {
                    // Utilisateur authentifié mais sans profil
                    console.log('⚠️ useAuth: Aucun profil trouvé (ni admin ni client)');
                    setUser({
                        id: authUser.id,
                        email: authUser.email || '',
                        role: null,
                        profile: null,
                    });
                }
            } catch (error) {
                console.error('❌ Error in useAuth:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchUserProfile();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const isAdmin = user?.role && ['admin', 'super_admin', 'dispatcher'].includes(user.role);
    const isClient = user?.role === 'client';

    return {
        user,
        loading,
        isAdmin: !!isAdmin,
        isClient: !!isClient,
        role: user?.role || null,
    };
};
