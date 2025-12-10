import { useEffect, useState } from 'react';
import { supabase, Client } from '@/lib/supabase';

export const useProfile = () => {
    const [profile, setProfile] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.log('Error fetching profile:', error);
                } else {
                    setProfile(data as Client);
                }
            } catch (error) {
                console.error('Error in useProfile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return { profile, loading };
};
