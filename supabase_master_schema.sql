-- ============================================================================
-- SCHÉMA MAÎTRE SUPABASE - One Connexion
-- ============================================================================
-- Ce schéma unifié gère les 3 rôles : admin, client, driver
-- Compatible avec l'App Mobile (Chauffeurs) et le Site Web (Clients/Admin)
-- ============================================================================

-- 1. Nettoyage (Attention, ceci efface les données publiques pour reconstruire propre)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Table PROFILES (Table pivot unique)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'client', 'driver')) DEFAULT 'client',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table DRIVERS (Données spécifiques chauffeurs)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  latitude FLOAT,
  longitude FLOAT,
  vehicle_type TEXT,
  is_validated BOOLEAN DEFAULT FALSE,
  documents_status TEXT DEFAULT 'pending'
);

-- 4. Trigger Automatique (La clé du système)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'phone'
  );
  
  -- Si c'est un chauffeur, on initialise son entrée dans drivers
  IF (new.raw_user_meta_data->>'role' = 'driver') THEN
    INSERT INTO public.drivers (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Sécurité (RLS simplifiée pour débugger, à durcir plus tard)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Drivers viewable by everyone" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers can update own status" ON public.drivers FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
SELECT 'Schéma maître créé avec succès !' as status;
