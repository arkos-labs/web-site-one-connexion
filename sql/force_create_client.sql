-- -----------------------------------------------------------------------------
-- FORCE CLIENT CREATION SCRIPT
-- -----------------------------------------------------------------------------

-- 1. Ensure all users have a profile
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT id, email, 'Utilisateur', 'Nouveau', 'client'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Upgrade all existing 'user' roles to 'client' (so they can access the dashboard)
UPDATE public.profiles
SET role = 'client'
WHERE role = 'user';

-- 3. Create a CLIENT entry for every profile with role 'client' that doesn't have one
INSERT INTO public.clients (user_id, email, company_name, status, phone, address)
SELECT 
    p.id, 
    p.email, 
    'Ma Société', 
    'active',
    p.phone,
    'Adresse à compléter'
FROM public.profiles p
WHERE p.role = 'client' 
AND p.id NOT IN (SELECT user_id FROM public.clients);

-- 4. Verify permissions again just in case
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
