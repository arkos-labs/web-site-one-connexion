-- Le nom d'entreprise saisi à l'inscription est dans raw_user_meta_data->>'company'.
-- Sans lui (particulier), company_name reste vide au lieu de 'Entreprise'.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_raw text := lower(coalesce(new.raw_user_meta_data ->> 'role', 'client'));
  v_role user_role;
begin
  v_role := case when v_raw in ('driver','courier','chauffeur') then 'driver'::user_role else 'client'::user_role end;
  insert into public.profiles (id, role, full_name, phone)
  values (new.id, v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''))
  on conflict (id) do nothing;

  if v_role = 'client' then
    insert into public.clients (id, company_name, contact_email, contact_name, contact_phone,
      billing_address, billing_postal_code, billing_city)
    values (new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), nullif(new.raw_user_meta_data ->> 'company', ''), ''),
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      coalesce(new.raw_user_meta_data ->> 'billing_address', 'À remplir'),
      coalesce(new.raw_user_meta_data ->> 'billing_postal_code', ''),
      coalesce(new.raw_user_meta_data ->> 'billing_city', ''))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

update public.clients c
set company_name = coalesce(nullif(u.raw_user_meta_data ->> 'company', ''), '')
from auth.users u
where u.id = c.id and c.company_name = 'Entreprise';
