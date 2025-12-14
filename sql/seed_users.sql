-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert 3 test users into auth.users
-- Note: Supabase Auth manages this table, use with caution in production

-- 1. ADMIN
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    'c64cd4c2-3950-4b3a-a376-4f2734624a8a',
    '00000000-0000-0000-0000-000000000000',
    'cherkinicolas@gmail.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin", "full_name": "Nicolas Cherki"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- 2. CLIENT
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'client@test.com',
    crypt('client123', gen_salt('bf')),
    now(),
    '{"role": "client", "full_name": "Jean Client"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- 3. CHAUFFEUR
-- Email format: CHAUFF01@driver.local (matches frontend logic)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'CHAUFF01@driver.local', -- Format standardisé pour les chauffeurs
    crypt('chauff123', gen_salt('bf')),
    now(),
    '{"role": "chauffeur", "full_name": "Marc Chauffeur"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- The trigger 'on_auth_user_created' will automatically create profiles for these users
