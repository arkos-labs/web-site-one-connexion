-- Totaux du jour calculés en base : le tableau Telegram ne relit plus toutes les
-- lignes de site_visits à chaque page vue (volume constant quel que soit le trafic).
create or replace function public.site_visit_stats(p_date date)
returns table (visites integer, pages integer)
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int, coalesce(sum(pages), 0)::int from public.site_visits where visit_date = p_date;
$$;

revoke execute on function public.site_visit_stats(date) from public, anon, authenticated;
