-- Messages du formulaire /contact.
-- RLS activée sans policy : aucun accès via la clé anon. Seule la route
-- serveur /api/contact (clé service) écrit ; les admins lisent via le dashboard Supabase.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  company text check (char_length(company) <= 160),
  message text not null check (char_length(message) between 1 and 5000),
  handled boolean not null default false
);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
