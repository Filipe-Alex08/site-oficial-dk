-- Aba de logs do painel administrativo.
-- 1) app_logs: eventos do site e saida do servidor, mantidos por 7 dias.
-- 2) log_viewer_permissions: permissao "Ver logs" (o ADM Principal sempre pode).
-- 3) can_view_logs(): checagem usada pelo painel e pela API.
-- 4) log_feed: visao unica (app_logs + auditorias), sempre limitada a 7 dias.
-- 5) pg_cron apaga de vez os registros de app_logs com mais de 7 dias.
-- As tabelas de auditoria existentes NAO sao apagadas; so a leitura e limitada.

create table if not exists public.app_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  level text not null default 'info' check (level in ('info', 'aviso', 'erro')),
  source text not null default 'evento' check (source in ('evento', 'servidor')),
  category text not null default 'geral' check (char_length(category) <= 60),
  action text check (action is null or char_length(action) <= 120),
  message text not null default '' check (char_length(message) <= 4000),
  actor_id uuid references public.profiles(id) on delete set null,
  ip text check (ip is null or char_length(ip) <= 64),
  path text check (path is null or char_length(path) <= 500),
  details jsonb not null default '{}'::jsonb
);

create index if not exists app_logs_created_at_idx on public.app_logs (created_at desc);
create index if not exists app_logs_level_idx on public.app_logs (level, created_at desc);
create index if not exists app_logs_category_idx on public.app_logs (category, created_at desc);
create index if not exists assessment_audit_log_created_at_idx on public.assessment_audit_log (created_at desc);

alter table public.app_logs enable row level security;
revoke all on public.app_logs from anon, authenticated;
grant all privileges on public.app_logs to service_role;
grant usage, select on sequence public.app_logs_id_seq to service_role;

create table if not exists public.log_viewer_permissions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now()
);

alter table public.log_viewer_permissions enable row level security;
revoke all on public.log_viewer_permissions from anon, authenticated;
grant all privileges on public.log_viewer_permissions to service_role;

drop trigger if exists audit_log_viewer_permissions on public.log_viewer_permissions;
create trigger audit_log_viewer_permissions
after insert or update or delete on public.log_viewer_permissions
for each row execute function public.log_admin_audit();

create or replace function public.can_view_logs()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.status = 'aprovado'
    )
    and (
      public.has_admin_role('principal')
      or exists (
        select 1 from public.log_viewer_permissions l where l.user_id = auth.uid()
      )
    );
$$;

revoke all on function public.can_view_logs() from public, anon;
grant execute on function public.can_view_logs() to authenticated, service_role;

create or replace view public.log_feed
with (security_invoker = true)
as
  select
    'app:' || l.id::text as uid,
    l.created_at as occurred_at,
    l.level,
    l.source,
    l.category,
    l.action,
    l.message,
    l.actor_id,
    l.ip,
    l.path,
    l.details
  from public.app_logs l
  where l.created_at >= now() - interval '7 days'
  union all
  select
    'adm:' || a.id::text,
    a.occurred_at,
    'info',
    'auditoria',
    a.target_table,
    a.action,
    a.target_table || coalesce(' #' || a.target_id, ''),
    a.actor_id,
    null::text,
    null::text,
    a.details
  from public.admin_audit_log a
  where a.occurred_at >= now() - interval '7 days'
  union all
  select
    'aval:' || v.id::text,
    v.created_at,
    'info',
    'auditoria',
    'avaliacoes',
    v.action,
    v.action,
    v.actor_id,
    null::text,
    null::text,
    v.details
  from public.assessment_audit_log v
  where v.created_at >= now() - interval '7 days';

revoke all on public.log_feed from public, anon, authenticated;
grant select on public.log_feed to service_role;

create or replace function public.purge_expired_logs()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  delete from public.app_logs where created_at < now() - interval '7 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_expired_logs() from public, anon, authenticated;
grant execute on function public.purge_expired_logs() to service_role;

-- Exige pg_cron na imagem do Postgres. Se faltar, a migration falha no dry-run
-- (ROLLBACK) e nada e aplicado: melhor parar do que guardar logs sem prazo.
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'purge-app-logs-7d';
select cron.schedule('purge-app-logs-7d', '15 3 * * *', $cron$select public.purge_expired_logs()$cron$);
