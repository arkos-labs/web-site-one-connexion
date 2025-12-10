import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Admin } from '@/types/admin';

export const useAdmin = () => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .single();

                if (error) {
                    console.log('User is not an admin:', error);
                    setIsAdmin(false);
                } else {
                    setAdmin(data as Admin);
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error in useAdmin:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, []);

    return { admin, loading, isAdmin };
};
