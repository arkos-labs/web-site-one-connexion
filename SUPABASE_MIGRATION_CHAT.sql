-- MODIFICATION OBLIGATOIRE : Rendre client_id NULLABLE pour les conversations chauffeurs
ALTER TABLE threads ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE messages ALTER COLUMN client_id DROP NOT NULL;

-- 1. Ajouter la colonne driver_id à la table threads (si pas déjà fait)
ALTER TABLE threads 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 2. Ajouter la colonne driver_id à la table messages (si pas déjà fait)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 3. Mettre à jour la contrainte sender_type messages
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_sender_type_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_sender_type_check 
CHECK (sender_type IN ('client', 'admin', 'driver'));

-- 4. Ajouter le type 'driver_support' à la table threads
ALTER TABLE threads 
DROP CONSTRAINT IF EXISTS threads_type_check;

ALTER TABLE threads 
ADD CONSTRAINT threads_type_check 
CHECK (type IN ('general', 'plainte', 'contact', 'driver_support'));

-- 5. Politique RLS (Sécurité) - Nettoyage et Refonte
DROP POLICY IF EXISTS "Drivers can view their own threads" ON threads;
CREATE POLICY "Drivers can view their own threads" 
ON threads 
FOR SELECT 
TO authenticated 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert their own threads" ON threads;
CREATE POLICY "Drivers can insert their own threads" 
ON threads 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can update their own threads" ON threads;
CREATE POLICY "Drivers can update their own threads" 
ON threads 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can view their own messages" ON messages;
CREATE POLICY "Drivers can view their own messages" 
ON messages 
FOR SELECT 
TO authenticated 
USING (auth.uid() = driver_id OR EXISTS (
    SELECT 1 FROM threads WHERE threads.id = messages.thread_id AND threads.driver_id = auth.uid()
));

DROP POLICY IF EXISTS "Drivers can insert messages" ON messages;
CREATE POLICY "Drivers can insert messages" 
ON messages 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = driver_id);

-- 6. Correction RLS pour driver_locations (Pour stopper les erreurs 403)
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can insert their own locations" ON driver_locations;
CREATE POLICY "Drivers can insert their own locations"
ON driver_locations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can update their own locations" ON driver_locations;
CREATE POLICY "Drivers can update their own locations"
ON driver_locations
FOR UPDATE
TO authenticated
USING (auth.uid() = driver_id);

-- 7. TRIGGER AUTO-ALERTE
CREATE OR REPLACE FUNCTION public.handle_new_driver_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un message chauffeur ET qu'il n'y a pas encore de message admin dans ce thread
  IF NEW.sender_type = 'driver' THEN
    IF NOT EXISTS (
        SELECT 1 FROM messages 
        WHERE thread_id = NEW.thread_id 
        AND sender_type = 'admin'
    ) THEN
        -- Insérer le message auto
        INSERT INTO messages (thread_id, sender_type, content, is_read, driver_id)
        VALUES (
            NEW.thread_id, 
            'admin', 
            'Bonjour, nous avons bien reçu votre message. Un opérateur va vous répondre rapidement.',
            false,
            NEW.driver_id
        );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_driver_message ON messages;
CREATE TRIGGER on_new_driver_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_driver_message();
