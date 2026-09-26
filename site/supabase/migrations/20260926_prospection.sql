-- Prospection B2B : entreprises trouvées via l'API "recherche d'entreprises" (data.gouv.fr)
-- et suivi de la séquence d'emails de démarchage à froid.
-- RLS activée sans policy : accès uniquement via les routes serveur (clé service).
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  siret text not null unique,
  company_name text not null,
  naf_code text,
  city text,
  postal_code text,
  website text,
  contact_email text,
  email_lookup_attempted boolean not null default false,
  sequence_status text not null default 'pending'
    check (sequence_status in ('pending', 'no_email', 'in_progress', 'completed', 'unsubscribed', 'bounced')),
  step1_sent_at timestamptz,
  step2_sent_at timestamptz,
  step3_sent_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid()
);

create index if not exists prospects_sequence_status_idx on public.prospects (sequence_status);
create index if not exists prospects_unsubscribe_token_idx on public.prospects (unsubscribe_token);

alter table public.prospects enable row level security;
revoke all on public.prospects from anon, authenticated;
