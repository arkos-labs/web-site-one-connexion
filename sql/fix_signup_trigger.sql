-- -----------------------------------------------------------------------------
-- FIX SIGNUP TRIGGER (Create Client on Signup)
-- -----------------------------------------------------------------------------

-- This script updates the 'handle_new_user' trigger to AUTOMATICALLY create a 
-- row in the 'clients' table when a new user signs up.
-- This fixes the issue where new users had a profile but no client data, 
-- preventing them from creating orders.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_client_id UUID;
  user_role TEXT;
BEGIN
  -- Determine role (default to 'client' for web signups if not specified)
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');

  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    user_role,
    new.raw_user_meta_data->>'phone'
  );

  -- 2. Check for existing Client (created by Admin previously)
  SELECT id INTO existing_client_id 
  FROM public.clients 
  WHERE email = new.email 
  LIMIT 1;

  IF existing_client_id IS NOT NULL THEN
    -- Link existing client to this new user
    UPDATE public.clients 
    SET 
        user_id = new.id, 
        status = 'active',
        updated_at = NOW()
    WHERE id = existing_client_id;
  ELSE
    -- 3. If NO existing client, create a NEW one (Standard Signup)
    IF user_role = 'client' THEN
        INSERT INTO public.clients (
            user_id,
            company_name,
            email,
            phone,
            status,
            first_name,
            last_name
        )
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'company_name', 'Mon Entreprise'),
            new.email,
            new.raw_user_meta_data->>'phone',
            'active',
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name'
        );
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to be sure
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- REPAIR EXISTING BROKEN USERS (Optional but recommended)
-- -----------------------------------------------------------------------------

-- Create client entries for any 'client' profile that doesn't have one yet
INSERT INTO public.clients (user_id, email, company_name, status, phone)
SELECT 
    p.id, 
    p.email, 
    'Mon Entreprise (Réparé)', 
    'active',
    p.phone
FROM public.profiles p
WHERE p.role = 'client' 
AND p.id NOT IN (SELECT user_id FROM public.clients);
