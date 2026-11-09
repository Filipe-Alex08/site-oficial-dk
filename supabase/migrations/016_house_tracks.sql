-- Casa por trilha: Cavalaria e Arquearia têm casas diferentes, então cada
-- integrante passa a ter uma casa em cada trilha.
--
-- Depende da 015 (graduação por trilha): usa as colunas graduation_cavalaria,
-- graduation_arquearia e a função graduation_track_of. Aplique depois dela.
--
-- CONVERSÃO: a casa atual vai para a trilha em que o integrante tem graduação
-- (ou, sem graduação, para a trilha que a ordem de graduação cita). Quando não
-- dá para saber a trilha, ou quando o integrante está nas duas, a mesma casa é
-- copiada para as duas. A casa é preenchida pelo próprio integrante e não dá
-- acesso a nada, então basta ele corrigir o que estiver errado.
--
-- COMPATIBILIDADE: a coluna antiga `house` continua existindo e é mantida por
-- um gatilho, para o build antigo do site continuar funcionando. Nada daqui
-- apaga colunas ou funções que o build antigo usa.

-- ---------------------------------------------------------------------------
-- 1. Colunas novas e conversão da casa atual (roda uma única vez)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'house_cavalaria'
  ) then
    return;
  end if;

  alter table public.profiles
    add column house_cavalaria text,
    add column house_arquearia text;

  update public.profiles as profile
  set house_cavalaria = case when derived.track in ('cavalaria', 'ambas', 'nenhuma') then profile.house end,
      house_arquearia = case when derived.track in ('arquearia', 'ambas', 'nenhuma') then profile.house end
  from (
    select id,
      case
        when graduation_cavalaria <> 'sem_graduacao' and graduation_arquearia <> 'sem_graduacao' then 'ambas'
        when graduation_cavalaria <> 'sem_graduacao' then 'cavalaria'
        when graduation_arquearia <> 'sem_graduacao' then 'arquearia'
        else coalesce(public.graduation_track_of(graduation_order), 'nenhuma')
      end as track
    from public.profiles
    where house is not null
  ) as derived
  where profile.id = derived.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Gatilho: mantém as casas por trilha e a coluna antiga coerentes
-- ---------------------------------------------------------------------------
create or replace function public.sync_profile_houses()
returns trigger
language plpgsql
as $$
declare
  old_house text := null;
  old_cavalaria text := null;
  old_arquearia text := null;
begin
  if tg_op = 'UPDATE' then
    old_house := old.house;
    old_cavalaria := old.house_cavalaria;
    old_arquearia := old.house_arquearia;
  end if;

  if new.house_cavalaria is distinct from old_cavalaria or new.house_arquearia is distinct from old_arquearia then
    -- Escrita nova (por trilha): a coluna antiga acompanha.
    new.house := coalesce(new.house_cavalaria, new.house_arquearia);
  elsif new.house is distinct from old_house then
    -- Escrita antiga (casa única): vale para as duas trilhas.
    new.house_cavalaria := new.house;
    new.house_arquearia := new.house;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_houses on public.profiles;
create trigger profiles_sync_houses
before insert or update on public.profiles
for each row execute function public.sync_profile_houses();

-- ---------------------------------------------------------------------------
-- 3. Edição do próprio perfil: casa por trilha + pedido de patente/graduação
-- ---------------------------------------------------------------------------
create or replace function public.update_own_member_profile_with_access_request(
  requested_full_name text,
  requested_nickname text,
  requested_birth_date date,
  requested_house_cavalaria text,
  requested_house_arquearia text,
  requested_shirt_number integer,
  requested_primary_build text,
  requested_secondary_build text,
  requested_rank public.dk_rank,
  requested_graduation_cavalaria public.graduation_level,
  requested_graduation_arquearia public.graduation_level
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  clean_house_cavalaria text := nullif(btrim(coalesce(requested_house_cavalaria, '')), '');
  clean_house_arquearia text := nullif(btrim(coalesce(requested_house_arquearia, '')), '');
begin
  if auth.uid() is null or not public.is_approved_member() then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;
  if requested_rank is null or requested_graduation_cavalaria is null or requested_graduation_arquearia is null then
    raise exception 'access_details_invalid' using errcode = '22023';
  end if;
  if length(coalesce(clean_house_cavalaria, '')) > 80 or length(coalesce(clean_house_arquearia, '')) > 80 then
    raise exception 'profile_field_too_long' using errcode = '22023';
  end if;

  select * into current_profile from public.profiles where id = auth.uid() for update;

  -- Reaproveita a validação e o cálculo do signo da função existente. Ela grava
  -- a casa antiga e o gatilho a copia para as duas trilhas; logo em seguida as
  -- casas de cada trilha são gravadas com os valores certos.
  perform public.update_own_member_profile(
    requested_full_name, requested_nickname, requested_birth_date,
    coalesce(clean_house_cavalaria, clean_house_arquearia),
    requested_shirt_number, requested_primary_build, requested_secondary_build
  );
  update public.profiles
  set house_cavalaria = clean_house_cavalaria, house_arquearia = clean_house_arquearia
  where id = auth.uid();

  -- Toda mudança de patente ou graduação espera aprovação explícita; a
  -- autoaprovação é bloqueada na API.
  if requested_rank = current_profile.rank
    and requested_graduation_cavalaria = current_profile.graduation_cavalaria
    and requested_graduation_arquearia = current_profile.graduation_arquearia then
    update public.profiles set access_request_id = null,
      requested_rank = null, requested_graduation_cavalaria = null, requested_graduation_arquearia = null
    where id = auth.uid();
  elsif current_profile.access_request_id is null
    or requested_rank is distinct from current_profile.requested_rank
    or requested_graduation_cavalaria is distinct from current_profile.requested_graduation_cavalaria
    or requested_graduation_arquearia is distinct from current_profile.requested_graduation_arquearia then
    update public.profiles set access_request_id = gen_random_uuid(),
      requested_rank = $9, requested_graduation_cavalaria = $10, requested_graduation_arquearia = $11
    where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.update_own_member_profile_with_access_request(text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level) from public, anon;
grant execute on function public.update_own_member_profile_with_access_request(text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level) to authenticated;
