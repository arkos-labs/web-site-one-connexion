-- Heure d'envoi choisie pour un mail de prospection préparé.
-- Les brouillons existants sans heure reçoivent le prochain lundi 9 h (heure de Paris), comme avant.
alter table public.prospect_targets
  add column if not exists send_at timestamptz;

update public.prospect_targets
set send_at = ((date_trunc('week', now() at time zone 'Europe/Paris') + interval '7 days' + interval '9 hours') at time zone 'Europe/Paris')
where mail_status = 'brouillon' and send_at is null;

create index if not exists prospect_targets_send_at_idx on public.prospect_targets (send_at) where mail_status = 'brouillon';
