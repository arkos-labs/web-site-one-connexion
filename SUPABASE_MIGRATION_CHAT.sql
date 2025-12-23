-- AJOUT DU SUPPORT CHAT CHAUFFEURS

-- 1. Ajouter la colonne driver_id à la table threads
ALTER TABLE threads 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 2. Ajouter la colonne driver_id à la table messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id);

-- 3. Mettre à jour la contrainte sender_type messages (si elle existe)
-- Note: Si c'est un type ENUM, il faut l'altérer. Si c'est un check text, il faut le changer.
-- On suppose ici que c'est du text simple ou on rajoute une contrainte.
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

-- 5. Politique RLS (Sécurité)
-- Permettre aux chauffeurs de voir leurs propres threads
CREATE POLICY "Drivers can view their own threads" 
ON threads 
FOR SELECT 
TO authenticated 
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own threads" 
ON threads 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own threads" 
ON threads 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = driver_id);

-- Permettre aux chauffeurs de voir et insérer leurs messages
CREATE POLICY "Drivers can view their own messages" 
ON messages 
FOR SELECT 
TO authenticated 
USING (auth.uid() = driver_id OR EXISTS (
    SELECT 1 FROM threads WHERE threads.id = messages.thread_id AND threads.driver_id = auth.uid()
));

CREATE POLICY "Drivers can insert messages" 
ON messages 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = driver_id);
