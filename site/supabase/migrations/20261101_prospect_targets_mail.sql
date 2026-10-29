-- Prospection automatique : site, adresse générique, mail préparé le dimanche, envoi le lundi.
alter table public.prospect_targets
  add column if not exists website text,
  add column if not exists email text,
  add column if not exists pitch text,
  add column if not exists mail_subject text,
  add column if not exists mail_body text,
  add column if not exists mail_status text not null default 'aucun'
    check (mail_status in ('aucun', 'brouillon', 'envoye', 'pas_d_email')),
  add column if not exists sent_at timestamptz;

create index if not exists prospect_targets_mail_idx on public.prospect_targets (mail_status);
