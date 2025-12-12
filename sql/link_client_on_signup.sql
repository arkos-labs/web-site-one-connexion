-- -----------------------------------------------------------------------------
-- LINK CLIENT ON SIGNUP (HISTORY RECOVERY)
-- -----------------------------------------------------------------------------

-- This script updates the 'handle_new_user' trigger function.
-- Logic: When a new user signs up, check if a Client entry already exists with the same email.
-- If yes, link the new User to that Client entry. This preserves history (orders, invoices).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_client_id UUID;
BEGIN
  -- 1. Create Profile (Standard)
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );

  -- 2. Check for existing Client with same email (created by Admin)
  -- We use LIMIT 1 just in case, though email should ideally be unique
  SELECT id INTO existing_client_id 
  FROM public.clients 
  WHERE email = new.email 
  LIMIT 1;

  -- 3. If found, link them!
  IF existing_client_id IS NOT NULL THEN
    -- Link the existing client to this new user
    UPDATE public.clients 
    SET 
        user_id = new.id, 
        status = 'active', -- Activate account if it was pending
        updated_at = NOW()
    WHERE id = existing_client_id;

    -- Upgrade profile role to 'client' so they can access the dashboard immediately
    UPDATE public.profiles
    SET role = 'client'
    WHERE id = new.id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to be sure
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
