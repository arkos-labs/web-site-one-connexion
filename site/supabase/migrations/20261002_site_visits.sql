-- Compteur de visites du site public (affiché dans le tableau de bord Telegram).
-- Aucun cookie : le visiteur est identifié par un hash (IP + navigateur + jour + sel)
-- calculé côté serveur, qui change chaque jour. Seule la route /api/visit (clé service) écrit.
create table if not exists public.site_visits (
  visit_date date not null,
  visitor_hash text not null,
  pages integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (visit_date, visitor_hash)
);

alter table public.site_visits enable row level security;
revoke all on public.site_visits from anon, authenticated;

-- Enregistre une page vue ; renvoie true si c'est le premier passage du visiteur aujourd'hui.
create or replace function public.track_site_visit(p_date date, p_hash text)
returns boolean
language sql
security definer
set search_path = public
as $$
  insert into public.site_visits as v (visit_date, visitor_hash)
  values (p_date, p_hash)
  on conflict (visit_date, visitor_hash)
  do update set pages = v.pages + 1, last_seen_at = now()
  returning (xmax = 0);
$$;

revoke execute on function public.track_site_visit(date, text) from public, anon, authenticated;
