-- Enforce strict role separation via Trigger on auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role text;
  v_first_name text;
  v_last_name text;
  v_phone text;
  v_vehicle_type text;
  v_full_name text;
BEGIN
  -- Extract metadata
  v_role := new.raw_user_meta_data->>'role';
  v_first_name := new.raw_user_meta_data->>'first_name';
  v_last_name := new.raw_user_meta_data->>'last_name';
  v_full_name := new.raw_user_meta_data->>'full_name'; -- Sent by Client Web
  v_phone := new.raw_user_meta_data->>'phone';
  v_vehicle_type := new.raw_user_meta_data->>'vehicle_type';

  -- 1. Create Profile (Source of Truth for Role)
  -- If no role specified, default to 'client' (safe fallback for web)
  IF v_role IS NULL THEN
      v_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, role, email)
  VALUES (
      new.id, 
      COALESCE(v_first_name, split_part(v_full_name, ' ', 1)), 
      COALESCE(v_last_name, substring(v_full_name from position(' ' in v_full_name)+1)), 
      v_role,
      new.email
  )
  ON CONFLICT (id) DO UPDATE SET role = v_role;

  -- 2. Handle Specific Tables
  
  -- DRIVER
  IF v_role = 'driver' THEN
      INSERT INTO public.drivers (
          id, 
          user_id, 
          email, 
          phone, 
          first_name, 
          last_name, 
          vehicle_type, 
          status,
          is_active
      )
      VALUES (
          new.id, 
          new.id, 
          new.email, 
          v_phone, 
          v_first_name, 
          v_last_name, 
          v_vehicle_type, 
          'offline',
          true
      )
      ON CONFLICT (id) DO NOTHING;
  
  -- CLIENT
  ELSIF v_role = 'client' THEN
      -- We do NOT insert into public.clients here automatically 
      -- because the Web App handles it manually with specific logic (internal code, etc).
      -- If we did, we'd need to replicate that logic perfectly or use a stored procedure.
      -- For now, letting the Web App do it is fine, AS LONG AS 'profiles' is set to 'client'.
      -- This ensures they are recognized as 'client' by the system.
      NULL;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger if needed (it persists but good to ensure)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
