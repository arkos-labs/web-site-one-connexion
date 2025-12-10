// Types pour les administrateurs
export interface Admin {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'super_admin' | 'dispatcher';
    status: 'active' | 'suspended' | 'deleted';
    last_login?: string;
}

export type AdminRole = 'admin' | 'super_admin' | 'dispatcher';
export type AdminStatus = 'active' | 'suspended' | 'deleted';

export interface AdminProfile extends Admin {
    // Propriétés supplémentaires si nécessaire
}
