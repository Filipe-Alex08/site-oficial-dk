create table if not exists public.registration_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  attempt_count integer not null check (attempt_count >= 0),
  blocked_until timestamptz
);

alter table public.registration_rate_limits enable row level security;
revoke all on public.registration_rate_limits from anon, authenticated;
grant all privileges on public.registration_rate_limits to service_role;
create index if not exists registration_rate_limits_window_idx
  on public.registration_rate_limits (window_started_at);

create or replace function public.consume_registration_invite(requested_invite_id uuid, new_user_id uuid)
returns table (invite_id uuid, invited_by uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.invites%rowtype;
begin
  select * into invite_row
  from public.invites
  where id = requested_invite_id
  for update;

  if not found
    or not invite_row.active
    or invite_row.expires_at <= now()
    or invite_row.current_uses >= invite_row.max_uses then
    return;
  end if;

  update public.invites
  set current_uses = current_uses + 1,
      active = current_uses + 1 < max_uses,
      used_by = new_user_id,
      used_at = now()
  where id = requested_invite_id;

  return query select invite_row.id, invite_row.created_by;
end;
$$;

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

  delete from public.registration_rate_limits
  where window_started_at < current_time - interval '1 day';

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

create or replace function public.release_registration_invite(requested_invite_id uuid, failed_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.invites
  set current_uses = current_uses - 1,
      active = expires_at > now() and current_uses - 1 < max_uses,
      used_by = null,
      used_at = null
  where id = requested_invite_id
    and used_by = failed_user_id
    and current_uses > 0;
$$;

revoke all on function public.consume_registration_invite(uuid, uuid) from public, anon, authenticated;
revoke all on function public.check_registration_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.release_registration_invite(uuid, uuid) from public, anon, authenticated;
grant execute on function public.consume_registration_invite(uuid, uuid) to service_role;
grant execute on function public.check_registration_rate_limit(text, integer, integer) to service_role;
grant execute on function public.release_registration_invite(uuid, uuid) to service_role;

grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
