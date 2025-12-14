-- Ce script confirme manuellement tous les utilisateurs en attente de confirmation.
-- Utile pour le développement local ou pour les comptes chauffeurs (@driver.local) qui ne peuvent pas recevoir d'emails.

UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- Vérification
SELECT email, email_confirmed_at FROM auth.users;
