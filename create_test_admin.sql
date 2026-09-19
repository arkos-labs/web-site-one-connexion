-- Utiliser un compte existant et le mettre admin
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('cherkinicolas38@gmail.com', 'testadmin@one-connexion.dev')
  LIMIT 1
);

-- Vérifier
SELECT id, email, role FROM (
  SELECT p.id, (SELECT email FROM auth.users WHERE id = p.id) as email, p.role
  FROM profiles p
  WHERE p.role = 'admin'
) as admins;
