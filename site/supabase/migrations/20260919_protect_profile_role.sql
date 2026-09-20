-- Empêche un utilisateur (client ou chauffeur) de changer son propre rôle
-- ou de se créer un profil admin. Seul un admin peut modifier un rôle.
create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Appels internes (trigger d'inscription, service_role) : pas d'utilisateur connecté
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' and new.role = 'admin' then
    raise exception 'Création d''un profil admin interdite';
  end if;
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before insert or update on public.profiles
for each row execute function public.protect_profile_role();
