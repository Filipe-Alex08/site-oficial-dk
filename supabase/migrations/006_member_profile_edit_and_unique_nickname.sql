-- Keep existing profiles while giving duplicate aliases a deterministic suffix.
do $$
declare
  duplicate record;
  base_nickname text;
  candidate text;
  suffix integer;
begin
  for duplicate in
    select id, nickname
    from (
      select id, nickname,
        row_number() over (partition by lower(btrim(nickname)) order by created_at, id) as duplicate_number
      from public.profiles
    ) ranked
    where duplicate_number > 1
    order by lower(btrim(nickname)), duplicate_number
  loop
    base_nickname := btrim(duplicate.nickname);
    candidate := base_nickname;
    suffix := 2;

    while exists (
      select 1 from public.profiles
      where id <> duplicate.id and lower(btrim(nickname)) = lower(candidate)
    ) loop
      candidate := left(base_nickname, 60 - length(' (' || suffix || ')')) || ' (' || suffix || ')';
      suffix := suffix + 1;
    end loop;

    update public.profiles set nickname = candidate where id = duplicate.id;
  end loop;
end;
$$;

create unique index profiles_nickname_unique_idx
  on public.profiles (lower(btrim(nickname)));

create or replace function public.update_own_member_profile(
  requested_full_name text,
  requested_nickname text,
  requested_birth_date date,
  requested_house text,
  requested_shirt_number integer,
  requested_primary_build text,
  requested_secondary_build text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.member_status;
  clean_full_name text := btrim(coalesce(requested_full_name, ''));
  clean_nickname text := btrim(coalesce(requested_nickname, ''));
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select status into current_status from public.profiles where id = auth.uid();
  if current_status is distinct from 'aprovado'::public.member_status then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;

  if length(clean_nickname) < 2 or length(clean_nickname) > 60 then
    raise exception 'nickname_length_invalid' using errcode = '22023';
  end if;

  if length(clean_full_name) < 2 or length(clean_full_name) > 120 then
    raise exception 'full_name_length_invalid' using errcode = '22023';
  end if;

  if requested_birth_date > current_date then
    raise exception 'birth_date_invalid' using errcode = '22023';
  end if;

  if requested_shirt_number is not null and requested_shirt_number < 0 then
    raise exception 'shirt_number_invalid' using errcode = '22023';
  end if;

  if length(coalesce(requested_house, '')) > 80
    or length(coalesce(requested_primary_build, '')) > 120
    or length(coalesce(requested_secondary_build, '')) > 120 then
    raise exception 'profile_field_too_long' using errcode = '22023';
  end if;

  update public.profiles
  set full_name = clean_full_name,
      nickname = clean_nickname,
      birth_date = requested_birth_date,
      zodiac_sign = case
        when requested_birth_date is null then null
        when (extract(month from requested_birth_date) = 12 and extract(day from requested_birth_date) >= 22)
          or (extract(month from requested_birth_date) = 1 and extract(day from requested_birth_date) <= 19) then 'Capricórnio'
        when (extract(month from requested_birth_date) = 1 and extract(day from requested_birth_date) >= 20)
          or (extract(month from requested_birth_date) = 2 and extract(day from requested_birth_date) <= 18) then 'Aquário'
        when (extract(month from requested_birth_date) = 2 and extract(day from requested_birth_date) >= 19)
          or (extract(month from requested_birth_date) = 3 and extract(day from requested_birth_date) <= 20) then 'Peixes'
        when (extract(month from requested_birth_date) = 3 and extract(day from requested_birth_date) >= 21)
          or (extract(month from requested_birth_date) = 4 and extract(day from requested_birth_date) <= 19) then 'Áries'
        when (extract(month from requested_birth_date) = 4 and extract(day from requested_birth_date) >= 20)
          or (extract(month from requested_birth_date) = 5 and extract(day from requested_birth_date) <= 20) then 'Touro'
        when (extract(month from requested_birth_date) = 5 and extract(day from requested_birth_date) >= 21)
          or (extract(month from requested_birth_date) = 6 and extract(day from requested_birth_date) <= 20) then 'Gêmeos'
        when (extract(month from requested_birth_date) = 6 and extract(day from requested_birth_date) >= 21)
          or (extract(month from requested_birth_date) = 7 and extract(day from requested_birth_date) <= 22) then 'Câncer'
        when (extract(month from requested_birth_date) = 7 and extract(day from requested_birth_date) >= 23)
          or (extract(month from requested_birth_date) = 8 and extract(day from requested_birth_date) <= 22) then 'Leão'
        when (extract(month from requested_birth_date) = 8 and extract(day from requested_birth_date) >= 23)
          or (extract(month from requested_birth_date) = 9 and extract(day from requested_birth_date) <= 22) then 'Virgem'
        when (extract(month from requested_birth_date) = 9 and extract(day from requested_birth_date) >= 23)
          or (extract(month from requested_birth_date) = 10 and extract(day from requested_birth_date) <= 22) then 'Libra'
        when (extract(month from requested_birth_date) = 10 and extract(day from requested_birth_date) >= 23)
          or (extract(month from requested_birth_date) = 11 and extract(day from requested_birth_date) <= 21) then 'Escorpião'
        else 'Sagitário'
      end,
      house = nullif(btrim(coalesce(requested_house, '')), ''),
      shirt_number = requested_shirt_number,
      primary_build = nullif(btrim(coalesce(requested_primary_build, '')), ''),
      secondary_build = nullif(btrim(coalesce(requested_secondary_build, '')), '')
  where id = auth.uid();
end;
$$;

revoke all on function public.update_own_member_profile(text, text, date, text, integer, text, text) from public, anon;
grant execute on function public.update_own_member_profile(text, text, date, text, integer, text, text) to authenticated;
