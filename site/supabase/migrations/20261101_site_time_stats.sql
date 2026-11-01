-- Temps passé par page, agrégé par jour : aucun identifiant de visiteur n'est enregistré.
-- Chaque ligne = une page, un jour : nombre de passages mesurés et secondes cumulées.
-- Écriture : seule la route /api/time (clé service) appelle record_site_time.
-- Lecture : administrateurs uniquement (tableau de bord Trafic).
create table if not exists public.site_time_daily (
  event_date date not null,
  path text not null,
  visits integer not null default 0,
  seconds integer not null default 0,
  primary key (event_date, path)
);

alter table public.site_time_daily enable row level security;
revoke all on public.site_time_daily from anon, authenticated;
grant select on public.site_time_daily to authenticated;

drop policy if exists site_time_admin_read on public.site_time_daily;
create policy site_time_admin_read on public.site_time_daily for select to authenticated
  using (public.is_admin());

-- Ajoute un passage et son temps visible à la ligne du jour et de la page.
create or replace function public.record_site_time(p_date date, p_path text, p_seconds integer)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.site_time_daily as t (event_date, path, visits, seconds)
  values (p_date, p_path, 1, p_seconds)
  on conflict (event_date, path)
  do update set visits = t.visits + 1, seconds = t.seconds + excluded.seconds;
$$;

revoke execute on function public.record_site_time(date, text, integer) from public, anon, authenticated;
