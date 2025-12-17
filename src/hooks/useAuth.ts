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

                // 1. Check Admin
                const { data: adminData } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .eq('status', 'active')
                    .maybeSingle();

                if (adminData) {
                    if (mounted) {
                        console.log('✅ useAuth: ADMIN DÉTECTÉ');
                        setUser({
                            id: authUser.id,
                            email: authUser.email || '',
                            role: adminData.role as UserRole,
                            profile: adminData as Admin,
                        });
                    }
                } else {
                    // 2. Check Client
                    const { data: clientData } = await supabase
                        .from('clients')
                        .select('*')
                        .eq('id', authUser.id)
                        .maybeSingle();

                    if (clientData) {
                        if (mounted) {
                            console.log('✅ useAuth: CLIENT DÉTECTÉ');
                            setUser({
                                id: authUser.id,
                                email: authUser.email || '',
                                role: 'client',
                                profile: clientData as Client,
                            });
                        }
                    } else {
                        // 3. Check Driver
                        const { data: driverData } = await supabase
                            .from('drivers')
                            .select('*')
                            .eq('user_id', authUser.id)
                            .maybeSingle();

                        if (driverData) {
                            if (mounted) {
                                console.log('✅ useAuth: DRIVER DÉTECTÉ');
                                setUser({
                                    id: authUser.id,
                                    email: authUser.email || '',
                                    role: 'driver',
                                    profile: driverData as Driver,
                                });
                            }
                        } else {
                            // 4. Default User (No profile found)
                            console.log('ℹ️ useAuth: User authenticated but no profile found. Role set to "user".');
                            if (mounted) {
                                setUser({
                                    id: authUser.id,
                                    email: authUser.email || '',
                                    role: 'user',
                                    profile: null,
                                });
                            }
                        }
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
