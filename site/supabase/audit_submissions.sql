-- Table des audits de traçabilité terminés (/audit-tracabilite).
-- À exécuter une fois dans l'éditeur SQL de Supabase.
create table if not exists public.audit_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  volume text not null,
  answers jsonb not null,
  scores jsonb not null,
  global_score integer not null check (global_score between 0 and 100)
);

-- Accès uniquement via la clé service role (côté serveur) : pas de lecture publique.
alter table public.audit_submissions enable row level security;
