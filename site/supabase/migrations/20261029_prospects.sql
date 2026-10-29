-- Prospection commerciale : entreprises cibles, listées chaque semaine par le cron /api/cron/prospects.
-- Une entreprise (SIRET) n'apparaît qu'une fois : on sait ainsi qui a déjà été démarché.
-- Lecture et modification réservées à l'admin (les écritures du cron passent par la clé de service).

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  siret text not null unique,
  siren text,
  name text not null,
  city text,
  postcode text,
  department text,
  sector text not null,
  naf text,
  need text,
  status text not null default 'a_contacter'
    check (status in ('a_contacter', 'contacte', 'interesse', 'pas_interesse', 'client')),
  notes text,
  batch_week date not null,
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prospects_status_idx on public.prospects (status);
create index if not exists prospects_batch_idx on public.prospects (batch_week desc);

alter table public.prospects enable row level security;

drop policy if exists "admin gère les prospects" on public.prospects;
create policy "admin gère les prospects" on public.prospects
  for all using (public.is_admin()) with check (public.is_admin());
