import { useEffect, useState } from 'react';
import { supabase, Client } from '@/lib/supabase';
import { Admin } from '@/types/admin';
import { Driver } from '@/types/drivers';

export type UserRole = 'client' | 'admin' | 'super_admin' | 'dispatcher' | 'driver' | 'user' | null;

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    profile: Client | Admin | Driver | null;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setUser(null);
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const fetchUserProfile = async () => {
            try {
                // Safety Timeout: Force loading false after 4 seconds max to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    if (mounted) {
                        console.warn('⚠️ useAuth: Timeout de sécurité - Force release');
                        setLoading(false);
                    }
                }, 4000);

                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    clearTimeout(timeoutId);
                    return;
                }

                console.log('🔐 useAuth: Utilisateur connecté:', authUser.email);

                // 1. Fetch Profile from 'profiles' (Central Identity)
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .maybeSingle();

                console.log('👤 useAuth: Profil récupéré:', profileData);

                if (profileData) {
                    const role = profileData.role as UserRole;
                    console.log(`✅ useAuth: Rôle détecté: ${role}`);

                    // ADMIN
                    if (role === 'admin') {
                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: 'admin',
                            profile: profileData as Admin, // Cast temporaire, le profil admin est basique pour l'instant
                        });
                    }
                    // DRIVER
                    else if (role === 'driver') {
                        const { data: driverData } = await supabase
                            .from('drivers')
                            .select('*')
                            .eq('user_id', authUser.id)
                            .maybeSingle();

                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: 'driver',
                            profile: (driverData || profileData) as Driver,
                        });
                    }
                    // CLIENT / DEFAULT
                    else {
                        // Pour les clients, on check la table clients pour les infos business (company_name, etc.)
                        const { data: clientData } = await supabase
                            .from('clients')
                            .select('*')
                            .eq('id', authUser.id)
                            .maybeSingle();

                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: 'client',
                            profile: (clientData || profileData) as Client,
                        });
                    }
                } else {
                    console.log('ℹ️ useAuth: User authenticated but no profile found in "profiles". Checking tables fallback...');

                    // Fallback: Check 'clients' table directly (legacy or specialized)
                    const { data: clientData } = await supabase
                        .from('clients')
                        .select('*')
                        .eq('id', authUser.id)
                        .maybeSingle();

                    if (clientData) {
                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: 'client',
                            profile: clientData as Client,
                        });
                    } else {
                        // Fallback User
                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: 'user',
                            profile: null,
                        });
                    }
                }

                clearTimeout(timeoutId);

            } catch (error) {
                console.error('❌ Error in useAuth:', error);
                // Even on error, we might want to keep the user as "user" if authUser was found, 
                // but simpler to just let the finally block handle loading state.
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Initial fetch
        fetchUserProfile();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            } else if (session?.user) {
                // Re-fetch profile on sign in or other changes
                fetchUserProfile();
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return {
        user,
        profile: user?.profile || null,
        role: user?.role || null,
        isLoading: loading,
        signOut
    };
};
