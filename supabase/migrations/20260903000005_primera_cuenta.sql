-- Arranque del club: la primera cuenta que se crea es la propietaria.
--
-- Sin esto no habría forma de nombrar a la primera administradora sin dejar
-- una función de bootstrap con privilegios viviendo en producción. La regla
-- solo aplica cuando todavía no hay ningún perfil, así que se "gasta" sola.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  club_vacio boolean;
begin
  select not exists (select 1 from public.profiles) into club_vacio;

  insert into public.profiles (id, first_name, last_name, email, phone, role, is_owner)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    case when club_vacio then 'admin' else 'member' end,
    club_vacio
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
