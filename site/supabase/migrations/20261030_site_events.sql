-- Parcours des visiteurs : une ligne par événement (page vue, étape du formulaire de commande,
-- erreur de validation, envoi, redirection Stripe). Aucune donnée personnelle : pas de nom,
-- e-mail ni adresse. Le visiteur est identifié par le même hash journalier que site_visits
-- (sans cookie). Seule la route /api/event (clé service) écrit.
create table if not exists public.site_events (
  id bigserial primary key,
  event_date date not null,
  visitor_hash text not null,
  event text not null,
  step smallint,
  path text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists site_events_date_idx on public.site_events (event_date, visitor_hash);

alter table public.site_events enable row level security;
revoke all on public.site_events from anon, authenticated;

-- Entonnoir : pour chaque événement, nombre de visiteurs distincts et d'occurrences.
-- Lecture réservée au tableau de bord (SQL éditeur / service role).
create or replace view public.site_funnel_daily as
select
  event_date,
  event,
  step,
  count(distinct visitor_hash) as visiteurs,
  count(*) as occurrences
from public.site_events
group by event_date, event, step
order by event_date desc, event, step;

revoke all on public.site_funnel_daily from anon, authenticated;
