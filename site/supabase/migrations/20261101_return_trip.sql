-- Retour à l'expéditeur : la commande indique si le coursier repart vers le point de départ (40 % du prix aller).
-- À exécuter sur Supabase avant la mise en ligne : sans cette colonne, l'insertion de commande échoue.
alter table public.orders add column if not exists return_trip boolean not null default false;
