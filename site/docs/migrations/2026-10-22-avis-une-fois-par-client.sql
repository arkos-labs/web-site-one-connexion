-- 2026-10-22 — Demande d'avis Google : un seul e-mail par client, pour toujours (et non plus un par course).
-- Le client est reconnu par son e-mail (en minuscules) et, s'il a un compte, par son identifiant.
create table if not exists public.review_requests (
  email text primary key,
  user_id uuid,
  order_id uuid references public.orders(id) on delete set null,
  sent_at timestamptz not null default now()
);
create index if not exists review_requests_user_id_idx on public.review_requests(user_id);
alter table public.review_requests enable row level security;

-- Clients déjà sollicités : même e-mail que celui de l'envoi (commande, sinon fiche client, sinon compte).
insert into public.review_requests (email, user_id, order_id, sent_at)
select distinct on (email) email, user_id, id, review_requested_at
from (
  select o.id, o.user_id, o.review_requested_at,
         lower(trim(coalesce(nullif(o.contact_email, ''), nullif(c.contact_email, ''), u.email))) as email
  from public.orders o
  left join public.clients c on c.id = o.user_id
  left join auth.users u on u.id = o.user_id
  where o.review_requested_at is not null
) x
where email is not null and email <> ''
order by email, review_requested_at
on conflict (email) do nothing;
