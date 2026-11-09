-- Graduação por trilha: cada integrante passa a ter um nível em Cavalaria e
-- outro em Arquearia (ex.: Cavaleiro Bronze e Arqueiro Prata).
--
-- ANTES DE APLICAR, rode este SELECT no SQL Editor. Ele lista quem tem
-- graduação mas não diz a trilha na "Ordem de graduação"; essas pessoas ficam
-- sem graduação nas duas trilhas e marcadas "a revisar" no painel do admin
-- até o ADM Principal definir:
--
--   select id, nickname, graduation_level, graduation_order
--   from public.profiles
--   where graduation_level <> 'sem_graduacao'
--     and coalesce(lower(graduation_order), '') !~ '(cavaleir|cavalaria|arqueir|arquearia)';
--
-- COMPATIBILIDADE: as colunas antigas (graduation_level, graduation_order e as
-- requested_*) continuam existindo e passam a ser derivadas das trilhas por um
-- gatilho. Assim o build antigo do site continua funcionando até o deploy novo.
-- Nada daqui apaga colunas ou funções que o build antigo usa.

-- ---------------------------------------------------------------------------
-- 1. Funções auxiliares
-- ---------------------------------------------------------------------------

-- Deduz a trilha a partir do texto livre da ordem: 'cavalaria', 'arquearia',
-- 'ambas' ou null quando o texto não diz.
create or replace function public.graduation_track_of(order_text text)
returns text
language sql
immutable
as $$
  with normalized as (
    select lower(translate(
      coalesce(order_text, ''),
      'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
      'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'
    )) as value
  ), flags as (
    select value ~ '(cavaleir|cavalaria)' as cavalry,
           value ~ '(arqueir|arquearia)' as archery
    from normalized
  )
  select case
    when cavalry and archery then 'ambas'
    when cavalry then 'cavalaria'
    when archery then 'arquearia'
  end
  from flags;
$$;

create or replace function public.max_graduation(a public.graduation_level, b public.graduation_level)
returns public.graduation_level
language sql
immutable
as $$
  select case
    when public.graduation_weight(coalesce(a, 'sem_graduacao')) >= public.graduation_weight(coalesce(b, 'sem_graduacao'))
      then coalesce(a, 'sem_graduacao')
    else coalesce(b, 'sem_graduacao')
  end;
$$;

-- Texto equivalente da ordem, mantido nas colunas antigas.
create or replace function public.graduation_order_label(cavalaria public.graduation_level, arquearia public.graduation_level)
returns text
language sql
immutable
as $$
  select case
    when coalesce(cavalaria, 'sem_graduacao') <> 'sem_graduacao'
      and coalesce(arquearia, 'sem_graduacao') <> 'sem_graduacao' then 'Cavalaria e Arquearia'
    when coalesce(cavalaria, 'sem_graduacao') <> 'sem_graduacao' then 'Cavalaria'
    when coalesce(arquearia, 'sem_graduacao') <> 'sem_graduacao' then 'Arquearia'
  end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Colunas novas e conversão dos dados atuais (roda uma única vez)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'graduation_cavalaria'
  ) then
    return;
  end if;

  alter table public.profiles
    add column graduation_cavalaria public.graduation_level not null default 'sem_graduacao',
    add column graduation_arquearia public.graduation_level not null default 'sem_graduacao',
    add column requested_graduation_cavalaria public.graduation_level,
    add column requested_graduation_arquearia public.graduation_level,
    add column graduation_review_needed boolean not null default false;

  -- Graduação efetiva: uma trilha, as duas ou revisão manual.
  update public.profiles as profile
  set graduation_cavalaria = case when derived.track in ('cavalaria', 'ambas') then profile.graduation_level else 'sem_graduacao' end,
      graduation_arquearia = case when derived.track in ('arquearia', 'ambas') then profile.graduation_level else 'sem_graduacao' end,
      graduation_review_needed = derived.track is null
  from (
    select id, public.graduation_track_of(graduation_order) as track
    from public.profiles
    where graduation_level <> 'sem_graduacao'
  ) as derived
  where profile.id = derived.id;

  -- Pedidos de alteração pendentes. Sem trilha identificável, o pedido mantém
  -- o nível atual das trilhas.
  update public.profiles as profile
  set requested_graduation_cavalaria = case when derived.track in ('cavalaria', 'ambas') then profile.requested_graduation_level else profile.graduation_cavalaria end,
      requested_graduation_arquearia = case when derived.track in ('arquearia', 'ambas') then profile.requested_graduation_level else profile.graduation_arquearia end
  from (
    select id, public.graduation_track_of(requested_graduation_order) as track
    from public.profiles
    where requested_graduation_level is not null
  ) as derived
  where profile.id = derived.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Gatilho: mantém trilhas e colunas antigas coerentes
-- ---------------------------------------------------------------------------
create or replace function public.sync_profile_graduations()
returns trigger
language plpgsql
as $$
declare
  old_cav public.graduation_level := 'sem_graduacao';
  old_arq public.graduation_level := 'sem_graduacao';
  old_level public.graduation_level := 'sem_graduacao';
  old_order text := null;
  old_req_cav public.graduation_level := null;
  old_req_arq public.graduation_level := null;
  old_req_level public.graduation_level := null;
  old_req_order text := null;
  track text;
  keep_legacy boolean := false;
begin
  if tg_op = 'UPDATE' then
    old_cav := old.graduation_cavalaria;
    old_arq := old.graduation_arquearia;
    old_level := old.graduation_level;
    old_order := old.graduation_order;
    old_req_cav := old.requested_graduation_cavalaria;
    old_req_arq := old.requested_graduation_arquearia;
    old_req_level := old.requested_graduation_level;
    old_req_order := old.requested_graduation_order;
  end if;

  -- Graduação efetiva
  if new.graduation_cavalaria is distinct from old_cav or new.graduation_arquearia is distinct from old_arq then
    -- Escrita nova (trilhas): o ADM definiu os níveis, a revisão acabou.
    new.graduation_review_needed := false;
  elsif new.graduation_level is distinct from old_level or new.graduation_order is distinct from old_order then
    -- Escrita antiga (nível + texto): converte para as trilhas.
    track := public.graduation_track_of(new.graduation_order);
    if track = 'ambas' then
      new.graduation_cavalaria := new.graduation_level;
      new.graduation_arquearia := new.graduation_level;
      new.graduation_review_needed := false;
    elsif track = 'cavalaria' then
      new.graduation_cavalaria := new.graduation_level;
      new.graduation_review_needed := false;
    elsif track = 'arquearia' then
      new.graduation_arquearia := new.graduation_level;
      new.graduation_review_needed := false;
    elsif new.graduation_level <> 'sem_graduacao' then
      new.graduation_cavalaria := 'sem_graduacao';
      new.graduation_arquearia := 'sem_graduacao';
      new.graduation_review_needed := true;
      keep_legacy := true;
    else
      new.graduation_cavalaria := 'sem_graduacao';
      new.graduation_arquearia := 'sem_graduacao';
      new.graduation_review_needed := false;
    end if;
  else
    keep_legacy := true;
  end if;

  if not keep_legacy then
    new.graduation_level := public.max_graduation(new.graduation_cavalaria, new.graduation_arquearia);
    new.graduation_order := public.graduation_order_label(new.graduation_cavalaria, new.graduation_arquearia);
  end if;

  -- Pedido de alteração
  if new.requested_graduation_cavalaria is distinct from old_req_cav or new.requested_graduation_arquearia is distinct from old_req_arq then
    if new.requested_graduation_cavalaria is null and new.requested_graduation_arquearia is null then
      new.requested_graduation_level := null;
      new.requested_graduation_order := null;
    else
      new.requested_graduation_level := public.max_graduation(new.requested_graduation_cavalaria, new.requested_graduation_arquearia);
      new.requested_graduation_order := public.graduation_order_label(new.requested_graduation_cavalaria, new.requested_graduation_arquearia);
    end if;
  elsif new.requested_graduation_level is distinct from old_req_level or new.requested_graduation_order is distinct from old_req_order then
    if new.requested_graduation_level is null then
      new.requested_graduation_cavalaria := null;
      new.requested_graduation_arquearia := null;
    else
      track := public.graduation_track_of(new.requested_graduation_order);
      new.requested_graduation_cavalaria := case when track in ('cavalaria', 'ambas') then new.requested_graduation_level else new.graduation_cavalaria end;
      new.requested_graduation_arquearia := case when track in ('arquearia', 'ambas') then new.requested_graduation_level else new.graduation_arquearia end;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_graduations on public.profiles;
create trigger profiles_sync_graduations
before insert or update on public.profiles
for each row execute function public.sync_profile_graduations();

-- ---------------------------------------------------------------------------
-- 4. Documentos: a regra de graduação compara o nível da trilha pedida
-- ---------------------------------------------------------------------------
create or replace function public.can_access_document(required_logic text, required_rules jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  member_rank public.dk_rank;
  member_cavalaria public.graduation_level;
  member_arquearia public.graduation_level;
  rule jsonb;
  rule_matches boolean;
  current_and_group boolean := false;
  completed_or_groups boolean := false;
  first_rule boolean := true;
  connector text;
begin
  select rank, graduation_cavalaria, graduation_arquearia
    into member_rank, member_cavalaria, member_arquearia
    from public.profiles
    where id = auth.uid() and status = 'aprovado';

  if not found then return false; end if;
  if jsonb_array_length(coalesce(required_rules, '[]'::jsonb)) = 0 then return true; end if;

  for rule in select value from jsonb_array_elements(required_rules)
  loop
    rule_matches := case rule->>'kind'
      when 'rank' then public.rank_weight(member_rank) >= public.rank_weight((rule->>'minimum_rank')::public.dk_rank)
      when 'graduation' then
        public.graduation_weight(case when rule->>'track' = 'cavalaria' then member_cavalaria else member_arquearia end)
          >= public.graduation_weight((rule->>'minimum_graduation')::public.graduation_level)
      else false
    end;

    if first_rule then
      current_and_group := rule_matches;
      first_rule := false;
    else
      connector := coalesce(rule->>'join', required_logic, 'or');
      if connector = 'and' then
        current_and_group := current_and_group and rule_matches;
      else
        completed_or_groups := completed_or_groups or current_and_group;
        current_and_group := rule_matches;
      end if;
    end if;
  end loop;

  return completed_or_groups or current_and_group;
end;
$$;

revoke all on function public.can_access_document(text, jsonb) from public;
grant execute on function public.can_access_document(text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Pedido de alteração do próprio perfil, agora por trilha
-- ---------------------------------------------------------------------------
create or replace function public.update_own_member_profile_with_access_request(
  requested_full_name text,
  requested_nickname text,
  requested_birth_date date,
  requested_house text,
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
begin
  if auth.uid() is null or not public.is_approved_member() then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;
  if requested_rank is null or requested_graduation_cavalaria is null or requested_graduation_arquearia is null then
    raise exception 'access_details_invalid' using errcode = '22023';
  end if;

  select * into current_profile from public.profiles where id = auth.uid() for update;
  perform public.update_own_member_profile(
    requested_full_name, requested_nickname, requested_birth_date, requested_house,
    requested_shirt_number, requested_primary_build, requested_secondary_build
  );

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
      requested_rank = $8, requested_graduation_cavalaria = $9, requested_graduation_arquearia = $10
    where id = auth.uid();
  end if;
end;
$$;

revoke all on function public.update_own_member_profile_with_access_request(text, text, date, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level) from public, anon;
grant execute on function public.update_own_member_profile_with_access_request(text, text, date, text, integer, text, text, public.dk_rank, public.graduation_level, public.graduation_level) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Lista de presença: devolve a graduação das duas trilhas
-- ---------------------------------------------------------------------------
drop function if exists public.get_activity_attendance(uuid);

create function public.get_activity_attendance(requested_activity_id uuid)
returns table (
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  graduation_cavalaria public.graduation_level,
  graduation_arquearia public.graduation_level,
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
    attendance.user_id,
    profiles.nickname,
    profiles.rank,
    profiles.graduation_cavalaria,
    profiles.graduation_arquearia,
    attendance.response,
    attendance.guest_count,
    attendance.note,
    attendance.updated_at
  from public.activity_attendance as attendance
  join public.profiles on profiles.id = attendance.user_id
  where attendance.activity_id = requested_activity_id
    and profiles.status = 'aprovado'
    and public.is_approved_member()
  order by attendance.updated_at;
$$;

revoke all on function public.get_activity_attendance(uuid) from public;
grant execute on function public.get_activity_attendance(uuid) to authenticated;
