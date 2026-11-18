-- Comandante por trilha: um integrante com graduação em Cavalaria e/ou Arquearia
-- pode ser comandante naquela trilha, em qualquer nível (bronze, prata ou ouro).
--
-- É uma marca separada da graduação (não um quarto nível do enum): assim a ordem
-- bronze < prata < ouro, o tema da área de membro e as regras de documento por
-- graduação continuam iguais.
--
-- REGRAS
--   * comandante exige graduação na trilha: não existe comandante "sem graduação";
--   * se a graduação da trilha volta para "sem graduação", a marca é limpa;
--   * o membro pede pelo formulário e um ADM aprova, pelo mesmo pedido de
--     patente/graduação (access_request_id). Só ADM grava a marca (RLS de profiles).
--
-- COMPATIBILIDADE: tudo é aditivo. O build antigo continua chamando a função de
-- pedido sem os parâmetros novos (valem "manter como está").

-- ---------------------------------------------------------------------------
-- 1. Colunas
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists commander_cavalaria boolean not null default false,
  add column if not exists commander_arquearia boolean not null default false,
  add column if not exists requested_commander_cavalaria boolean,
  add column if not exists requested_commander_arquearia boolean;

-- ---------------------------------------------------------------------------
-- 2. Regra no banco (vale para qualquer caminho de escrita)
-- ---------------------------------------------------------------------------
create or replace function public.validate_profile_commander()
returns trigger
language plpgsql
as $$
begin
  if new.commander_cavalaria and new.graduation_cavalaria = 'sem_graduacao' then
    -- Graduacao removida: a marca cai junto.
    if tg_op = 'UPDATE' and old.commander_cavalaria then
      new.commander_cavalaria := false;
    else
      raise exception 'commander_requires_graduation' using errcode = '22023';
    end if;
  end if;
  if new.commander_arquearia and new.graduation_arquearia = 'sem_graduacao' then
    if tg_op = 'UPDATE' and old.commander_arquearia then
      new.commander_arquearia := false;
    else
      raise exception 'commander_requires_graduation' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

-- O nome vem depois de profiles_sync_graduations na ordem alfabética, então os
-- gatilhos que calculam graduation_* a partir do formato antigo já rodaram.
drop trigger if exists profiles_validate_commander on public.profiles;
create trigger profiles_validate_commander
before insert or update on public.profiles
for each row execute function public.validate_profile_commander();

-- ---------------------------------------------------------------------------
-- 3. Pedido do próprio membro: patente, graduação e comandante por trilha
-- ---------------------------------------------------------------------------
-- A assinatura antiga (11 parametros) sai para nao ficar ambigua com a nova, que
-- tem os mesmos 11 mais dois com valor padrao. A nova tambem sai, para a migracao
-- poder ser reaplicada.
drop function if exists public.update_own_member_profile_with_access_request(
  text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level
);
drop function if exists public.update_own_member_profile_with_access_request(
  text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level, boolean, boolean
);

create function public.update_own_member_profile_with_access_request(
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
  requested_graduation_arquearia public.graduation_level,
  -- Os dois ultimos: null = manter o comando como esta.
  requested_commander_cavalaria boolean default null,
  requested_commander_arquearia boolean default null
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
  commander_cav boolean;
  commander_arq boolean;
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
  if (requested_commander_cavalaria is true and requested_graduation_cavalaria = 'sem_graduacao')
    or (requested_commander_arquearia is true and requested_graduation_arquearia = 'sem_graduacao') then
    raise exception 'commander_requires_graduation' using errcode = '22023';
  end if;

  select * into current_profile from public.profiles where id = auth.uid() for update;

  -- Valores que o pedido deixaria em vigor. Sem graduação na trilha não há comando.
  commander_cav := case when requested_graduation_cavalaria = 'sem_graduacao' then false
    else coalesce(requested_commander_cavalaria, current_profile.commander_cavalaria) end;
  commander_arq := case when requested_graduation_arquearia = 'sem_graduacao' then false
    else coalesce(requested_commander_arquearia, current_profile.commander_arquearia) end;

  perform public.update_own_member_profile(
    requested_full_name, requested_nickname, requested_birth_date,
    coalesce(clean_house_cavalaria, clean_house_arquearia),
    requested_shirt_number, requested_primary_build, requested_secondary_build
  );
  update public.profiles
  set house_cavalaria = clean_house_cavalaria, house_arquearia = clean_house_arquearia
  where id = auth.uid();

  -- Toda mudança de patente, graduação ou comando espera aprovação explícita; a
  -- autoaprovação é bloqueada na API.
  if requested_rank = current_profile.rank
    and requested_graduation_cavalaria = current_profile.graduation_cavalaria
    and requested_graduation_arquearia = current_profile.graduation_arquearia
    and commander_cav = current_profile.commander_cavalaria
    and commander_arq = current_profile.commander_arquearia then
    update public.profiles set access_request_id = null,
      requested_rank = null, requested_graduation_cavalaria = null, requested_graduation_arquearia = null,
      requested_commander_cavalaria = null, requested_commander_arquearia = null
    where id = auth.uid();
  elsif current_profile.access_request_id is null
    or requested_rank is distinct from current_profile.requested_rank
    or requested_graduation_cavalaria is distinct from current_profile.requested_graduation_cavalaria
    or requested_graduation_arquearia is distinct from current_profile.requested_graduation_arquearia
    or commander_cav is distinct from coalesce(current_profile.requested_commander_cavalaria, current_profile.commander_cavalaria)
    or commander_arq is distinct from coalesce(current_profile.requested_commander_arquearia, current_profile.commander_arquearia) then
    update public.profiles set access_request_id = gen_random_uuid(),
      requested_rank = $9, requested_graduation_cavalaria = $10, requested_graduation_arquearia = $11,
      requested_commander_cavalaria = commander_cav, requested_commander_arquearia = commander_arq
    where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.update_own_member_profile_with_access_request(text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level, boolean, boolean) from public, anon;
grant execute on function public.update_own_member_profile_with_access_request(text, text, date, text, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level, boolean, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Lista de presença: devolve a marca para o selo aparecer ao lado do nome
-- ---------------------------------------------------------------------------
drop function if exists public.get_activities_attendance(uuid[]);

create function public.get_activities_attendance(requested_activity_ids uuid[])
returns table (
  activity_id uuid,
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  graduation_cavalaria public.graduation_level,
  graduation_arquearia public.graduation_level,
  commander_cavalaria boolean,
  commander_arquearia boolean,
  response public.attendance_response,
  guest_count integer,
  note text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    attendance.activity_id,
    attendance.user_id,
    profiles.nickname,
    profiles.rank,
    profiles.graduation_cavalaria,
    profiles.graduation_arquearia,
    profiles.commander_cavalaria,
    profiles.commander_arquearia,
    attendance.response,
    attendance.guest_count,
    attendance.note,
    attendance.updated_at
  from public.activity_attendance as attendance
  join public.profiles on profiles.id = attendance.user_id
  where attendance.activity_id = any(requested_activity_ids)
    and cardinality(requested_activity_ids) <= 500
    and profiles.status = 'aprovado'
    and public.is_approved_member()
  order by attendance.updated_at;
$$;

revoke all on function public.get_activities_attendance(uuid[]) from public, anon;
grant execute on function public.get_activities_attendance(uuid[]) to authenticated;
