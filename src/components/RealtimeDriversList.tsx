import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DriverRow {
    id: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    status?: string;
    is_online?: boolean; // Au cas où la colonne existe comme demandé explicitement
    [key: string]: any;
}

const RealtimeDriversList = () => {
    const [drivers, setDrivers] = useState<DriverRow[]>([]);

    useEffect(() => {
        // 1. Chargement initial
        const fetchDrivers = async () => {
            const { data, error } = await supabase
                .from('drivers')
                .select('*');

            if (error) {
                console.error('Erreur lors du chargement initial des chauffeurs:', error);
            } else if (data) {
                setDrivers(data);
            }
        };

        fetchDrivers();

        // 2. Abonnement Realtime aux UPDATES uniquement
        const channel = supabase
            .channel('drivers-status-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'drivers'
                },
                (payload) => {
                    console.log('Changement de statut détecté:', payload);
                    // Mise à jour immédiate de l'état local
                    setDrivers((currentDrivers) =>
                        currentDrivers.map((driver) =>
                            driver.id === payload.new.id ? { ...driver, ...payload.new } : driver
                        )
                    );
                }
            )
            .subscribe();

        // Nettoyage à la destruction du composant
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Fonction helper pour déterminer si le chauffeur est en ligne
    const isDriverOnline = (driver: DriverRow) => {
        // On gère les deux cas possibles (colonne status ou is_online)
        if (driver.is_online === true) return true;
        return ['online', 'available'].includes(driver.status || '');
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">État des Chauffeurs</h3>
                <p className="text-xs text-gray-500">Mise à jour en temps réel</p>
            </div>

            <ul className="divide-y divide-gray-200 bg-white">
                {drivers.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">Aucun chauffeur trouvé</li>
                ) : (
                    drivers.map((driver) => {
                        const online = isDriverOnline(driver);

                        return (
                            <li key={driver.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {driver.first_name || 'Chauffeur'} {driver.last_name || ''}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">
                                        ID: {driver.id.slice(0, 8)}...
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${online ? 'text-green-600' : 'text-red-500'}`}>
                                        {online ? 'EN LIGNE' : 'HORS LIGNE'}
                                    </span>
                                    <span className={`relative flex h-3 w-3`}>
                                        {online && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${online ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </span>
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export default RealtimeDriversList;
