-- Type d'envoi choisi par le client à la commande (n'influe pas sur le prix) :
-- documents, pli confidentiel, médical / laboratoire, colis / marchandise, autre.
alter table public.orders add column if not exists nature text;
alter table public.orders drop constraint if exists orders_nature_check;
alter table public.orders add constraint orders_nature_check
  check (nature is null or nature in ('documents', 'confidentiel', 'medical', 'colis', 'autre'));

-- « Autre » : le client précise ce qu'il envoie.
alter table public.orders add column if not exists nature_detail text;
alter table public.orders drop constraint if exists orders_nature_detail_check;
alter table public.orders add constraint orders_nature_detail_check
  check (nature_detail is null or char_length(nature_detail) <= 200);
