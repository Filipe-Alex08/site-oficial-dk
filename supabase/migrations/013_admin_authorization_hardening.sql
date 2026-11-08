-- Admin authorization hardening.
-- 1) An admin role only counts while the profile is approved.
-- 2) Administrators no longer apply rank/graduation changes directly.
-- 3) Registration rate-limit rows are pruned on a shorter window.
-- 4) Administrative audit trail for role and invite changes.

create or replace function public.has_admin_role(required_role public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_admin_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = auth.uid()
      and p.status = 'aprovado'
      and (r.role = required_role or r.role = 'principal')
  );
$$;

revoke all on function public.has_admin_role(public.admin_role) from public;
grant execute on function public.has_admin_role(public.admin_role) to anon, authenticated;

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
    or length(coalesce(clean_order, '')) > 120
    or clean_order ~ '[[:cntrl:]]' then
    raise exception 'access_details_invalid' using errcode = '22023';
  end if;

  select * into current_profile from public.profiles where id = auth.uid() for update;
  perform public.update_own_member_profile(
    requested_full_name, requested_nickname, requested_birth_date, requested_house,
    requested_shirt_number, requested_primary_build, requested_secondary_build
  );

  -- Every rank/graduation change now waits for an explicit approval, including
  -- changes requested by administrators. Self-approval is blocked in the API.
  if requested_rank = current_profile.rank
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

create or replace function public.check_registration_rate_limit(
  requested_key_hash text,
  max_attempts integer default 5,
  window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.registration_rate_limits%rowtype;
  current_time timestamptz := now();
begin
  if requested_key_hash is null or length(requested_key_hash) <> 64 then
    return false;
  end if;

  -- The window is 15 minutes; one hour is already stale.
  delete from public.registration_rate_limits
  where window_started_at < current_time - interval '1 hour';

  insert into public.registration_rate_limits (key_hash, window_started_at, attempt_count)
  values (requested_key_hash, current_time, 1)
  on conflict (key_hash) do nothing;

  select * into current_row
  from public.registration_rate_limits
  where key_hash = requested_key_hash
  for update;

  if current_row.blocked_until is not null and current_row.blocked_until > current_time then
    return false;
  end if;

  if current_row.window_started_at + make_interval(secs => window_seconds) <= current_time then
    update public.registration_rate_limits
    set window_started_at = current_time, attempt_count = 1, blocked_until = null
    where key_hash = requested_key_hash;
    return true;
  end if;

  if current_row.attempt_count >= max_attempts then
    update public.registration_rate_limits
    set blocked_until = current_time + make_interval(secs => window_seconds)
    where key_hash = requested_key_hash;
    return false;
  end if;

  update public.registration_rate_limits
  set attempt_count = attempt_count + 1
  where key_hash = requested_key_hash;
  return true;
end;
$$;

revoke all on function public.check_registration_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_registration_rate_limit(text, integer, integer) to service_role;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_log_occurred_at_idx on public.admin_audit_log (occurred_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_table, target_id);

alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;
grant all privileges on public.admin_audit_log to service_role;
grant usage, select on sequence public.admin_audit_log_id_seq to service_role;

create or replace function public.log_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target text;
  payload jsonb;
begin
  if TG_OP = 'DELETE' then
    target := to_jsonb(OLD)->>'id';
  else
    target := to_jsonb(NEW)->>'id';
  end if;
  if target is null then
    if TG_OP = 'DELETE' then
      target := to_jsonb(OLD)->>'user_id';
    else
      target := to_jsonb(NEW)->>'user_id';
    end if;
  end if;

  payload := jsonb_build_object(
    'before', case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) end,
    'after', case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) end
  );

  insert into public.admin_audit_log (actor_id, action, target_table, target_id, details)
  values (auth.uid(), TG_OP, TG_TABLE_NAME, target, payload);

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

revoke all on function public.log_admin_audit() from public;
grant execute on function public.log_admin_audit() to authenticated, service_role;

drop trigger if exists audit_user_admin_roles on public.user_admin_roles;
create trigger audit_user_admin_roles
after insert or update or delete on public.user_admin_roles
for each row execute function public.log_admin_audit();

drop trigger if exists audit_invites on public.invites;
create trigger audit_invites
after insert or update or delete on public.invites
for each row execute function public.log_admin_audit();