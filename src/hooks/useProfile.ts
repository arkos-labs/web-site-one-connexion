import { useEffect, useState } from 'react';
import { supabase, Client } from '@/lib/supabase';

export const useProfile = () => {
    const [profile, setProfile] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    const createProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            console.log('🔄 Création manuelle du profil...');

            const { data: rpcData, error: rpcError } = await supabase.rpc('create_missing_client_profile', {
                p_email: user.email || '',
                p_first_name: user.user_metadata?.first_name || 'Nouveau',
                p_last_name: user.user_metadata?.last_name || 'Client',
                p_company_name: user.user_metadata?.company_name || 'Mon Entreprise',
                p_phone: user.user_metadata?.phone || ''
            });

            if (rpcError) {
                console.error('❌ Erreur RPC création client:', rpcError);
                return null;
            } else {
                console.log('✅ Profil client créé via RPC !', rpcData);

                // Re-fetch immédiat
                const { data: newData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (newData) {
                    setProfile(newData as Client);
                    return newData;
                }
            }
        } catch (error) {
            console.error("Erreur createProfile:", error);
        }
        return null;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                // 1. Tenter de récupérer le profil
                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data) {
                    setProfile(data as Client);
                } else {
                    // 2. Si pas de profil, tentative automatique
                    console.warn('⚠️ Profil client introuvable. Tentative de création via RPC...');
                    await createProfile();
                }
            } catch (error) {
                console.error('Error in useProfile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return { profile, loading, createProfile };
};
