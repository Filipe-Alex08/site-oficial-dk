-- Avisos públicos, espelho opcional no Google Agenda e presença efetivamente
-- validada. O Supabase continua sendo a fonte oficial das atividades.

alter table public.activities
  add column notice_level text,
  add column notice_message text,
  add column notice_published_at timestamptz,
  add column notice_expires_at timestamptz,
  add constraint activities_notice_level_check
    check (notice_level is null or notice_level in ('informativo', 'atencao', 'urgente')),
  add constraint activities_notice_message_length_check
    check (notice_message is null or char_length(notice_message) <= 500),
  add constraint activities_notice_complete_check
    check (
      (notice_message is null and notice_level is null and notice_published_at is null and notice_expires_at is null)
      or
      (notice_message is not null and notice_level is not null and notice_published_at is not null and notice_expires_at is not null)
    ),
  add constraint activities_notice_expiration_check
    check (notice_expires_at is null or notice_published_at is null or notice_expires_at > notice_published_at);

create index activities_active_notices_idx
  on public.activities (notice_expires_at)
  where notice_message is not null;

-- Toda alteração passa pela API administrativa, que audita a ação e atualiza
-- o espelho do Google. A consulta pública e autenticada continua liberada.
revoke insert, update, delete on table public.activities from authenticated;

-- Dados técnicos da integração não ficam na tabela pública de atividades.
create table public.activity_calendar_sync (
  activity_id uuid primary key references public.activities(id) on delete cascade,
  google_event_id text unique,
  google_event_html_link text,
  sync_status text not null default 'pending'
    check (sync_status in ('disabled', 'pending', 'synced', 'error')),
  sync_error text check (sync_error is null or char_length(sync_error) <= 500),
  last_attempted_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger activity_calendar_sync_updated_at
before update on public.activity_calendar_sync
for each row execute function public.set_updated_at();

alter table public.activity_calendar_sync enable row level security;
revoke all on table public.activity_calendar_sync from anon, authenticated;
grant all on table public.activity_calendar_sync to service_role;

-- A intenção (Vou/Não vou) continua em activity_attendance. Esta tabela
-- registra separadamente o comparecimento real, inclusive para quem não havia
-- respondido antes da atividade.
create table public.activity_presence_validations (
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actual_status text not null
    check (actual_status in ('presente', 'ausente', 'justificado')),
  guest_count integer not null default 0 check (guest_count between 0 and 30),
  note text check (note is null or char_length(note) <= 180),
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (activity_id, user_id)
);

create trigger activity_presence_validations_updated_at
before update on public.activity_presence_validations
for each row execute function public.set_updated_at();

create index activity_presence_validations_activity_idx
  on public.activity_presence_validations (activity_id, actual_status);

create index activity_presence_validations_user_idx
  on public.activity_presence_validations (user_id, validated_at desc);

alter table public.activity_presence_validations enable row level security;
revoke all on table public.activity_presence_validations from anon, authenticated;
grant all on table public.activity_presence_validations to service_role;

-- A correção da intenção e a validação do comparecimento são gravadas na
-- mesma transação. A função usa os privilégios do chamador e é exclusiva da
-- chave de serviço utilizada pela API administrativa protegida.
create function public.admin_save_activity_record(
  requested_member_id uuid,
  requested_activity_id uuid,
  planned_response public.attendance_response,
  planned_guest_count integer,
  planned_note text,
  presence_status text,
  presence_guest_count integer,
  presence_note text,
  validator_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if planned_response is null then
    delete from public.activity_attendance
    where activity_id = requested_activity_id and user_id = requested_member_id;
  else
    insert into public.activity_attendance (activity_id, user_id, response, guest_count, note)
    values (
      requested_activity_id,
      requested_member_id,
      planned_response,
      case when planned_response = 'vai' then planned_guest_count else 0 end,
      nullif(btrim(planned_note), '')
    )
    on conflict (activity_id, user_id) do update set
      response = excluded.response,
      guest_count = excluded.guest_count,
      note = excluded.note;
  end if;

  if presence_status is null then
    delete from public.activity_presence_validations
    where activity_id = requested_activity_id and user_id = requested_member_id;
  else
    insert into public.activity_presence_validations (
      activity_id, user_id, actual_status, guest_count, note, validated_by, validated_at
    ) values (
      requested_activity_id,
      requested_member_id,
      presence_status,
      presence_guest_count,
      nullif(btrim(presence_note), ''),
      validator_id,
      now()
    )
    on conflict (activity_id, user_id) do update set
      actual_status = excluded.actual_status,
      guest_count = excluded.guest_count,
      note = excluded.note,
      validated_by = excluded.validated_by,
      validated_at = excluded.validated_at;
  end if;
end;
$$;

revoke all on function public.admin_save_activity_record(uuid, uuid, public.attendance_response, integer, text, text, integer, text, uuid) from public, anon, authenticated;
grant execute on function public.admin_save_activity_record(uuid, uuid, public.attendance_response, integer, text, text, integer, text, uuid) to service_role;
