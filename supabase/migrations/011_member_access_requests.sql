-- Self-reported access details stay separate from the effective permissions.
alter table public.profiles
  add column access_request_id uuid,
  add column requested_rank public.dk_rank,
  add column requested_graduation_level public.graduation_level,
  add column requested_graduation_order text;

create or replace function public.update_own_member_profile_with_access_request(
  requested_full_name text,
  requested_nickname text,
  requested_birth_date date,
  requested_house text,
  requested_shirt_number integer,
  requested_primary_build text,
  requested_secondary_build text,
  requested_rank public.dk_rank,
  requested_graduation_level public.graduation_level,
  requested_graduation_order text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  clean_order text := nullif(btrim(coalesce(requested_graduation_order, '')), '');
begin
  if auth.uid() is null or not public.is_approved_member() then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;
  if requested_rank is null or requested_graduation_level is null
    or length(coalesce(clean_order, '')) > 120 then
    raise exception 'access_details_invalid' using errcode = '22023';
  end if;

  select * into current_profile from public.profiles where id = auth.uid() for update;
  perform public.update_own_member_profile(
    requested_full_name, requested_nickname, requested_birth_date, requested_house,
    requested_shirt_number, requested_primary_build, requested_secondary_build
  );

  if exists (select 1 from public.user_admin_roles where user_id = auth.uid()) then
    update public.profiles set rank = $8, graduation_level = $9, graduation_order = clean_order,
      access_request_id = null, requested_rank = null,
      requested_graduation_level = null, requested_graduation_order = null
    where id = auth.uid();
  elsif requested_rank = current_profile.rank
    and requested_graduation_level = current_profile.graduation_level
    and clean_order is not distinct from current_profile.graduation_order then
    update public.profiles set access_request_id = null,
      requested_rank = null, requested_graduation_level = null, requested_graduation_order = null
    where id = auth.uid();
  elsif current_profile.access_request_id is null
    or requested_rank is distinct from current_profile.requested_rank
    or requested_graduation_level is distinct from current_profile.requested_graduation_level
    or clean_order is distinct from current_profile.requested_graduation_order then
    update public.profiles set access_request_id = gen_random_uuid(),
      requested_rank = $8, requested_graduation_level = $9, requested_graduation_order = clean_order
    where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.update_own_member_profile_with_access_request(text, text, date, text, integer, text, text, public.dk_rank, public.graduation_level, text) from public, anon;
grant execute on function public.update_own_member_profile_with_access_request(text, text, date, text, integer, text, text, public.dk_rank, public.graduation_level, text) to authenticated;
