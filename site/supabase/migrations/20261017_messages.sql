-- Messagerie admin <-> chauffeurs
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  content text not null,
  is_admin_message boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_sender_idx on public.messages (sender_id, created_at);
create index if not exists messages_recipient_idx on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

drop policy if exists messages_admin_all on public.messages;
create policy messages_admin_all on public.messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Un chauffeur lit les messages qu'il a envoyés ou reçus, et écrit uniquement en son nom
drop policy if exists messages_user_select on public.messages;
create policy messages_user_select on public.messages
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists messages_user_insert on public.messages;
create policy messages_user_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and is_admin_message = false);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Permet à un chauffeur de retrouver l'id de l'admin sans lire la table profiles (RLS)
create or replace function public.get_support_admin_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where role = 'admin' order by created_at limit 1;
$$;
revoke all on function public.get_support_admin_id() from public, anon;
grant execute on function public.get_support_admin_id() to authenticated;
