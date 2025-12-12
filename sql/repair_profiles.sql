-- REPARATION DES PROFILS MANQUANTS
-- Ce script synchronise auth.users avec public.profiles et public.clients
-- À EXÉCUTER DANS L'ÉDITEUR SQL SUPABASE

-- 1. Insérer les profils manquants pour tous les utilisateurs existants
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'first_name', 'Utilisateur'), 
    COALESCE(raw_user_meta_data->>'last_name', 'Inconnu'),
    'client'::public.user_role -- On force le rôle client par défaut pour récupérer l'accès
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Créer les fiches Clients pour ces profils (nécessaire pour useAuth)
INSERT INTO public.clients (user_id, email, company_name, phone, status)
SELECT 
    p.id, 
    p.email, 
    COALESCE(p.last_name || ' ' || p.first_name, 'Client Récupéré'),
    COALESCE(p.phone, ''),
    'active'
FROM public.profiles p
WHERE p.role = 'client'
AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.user_id = p.id);

-- 3. Résultat
SELECT count(*) as nouveaux_clients_crees FROM public.clients WHERE created_at > (NOW() - INTERVAL '1 minute');
