-- Avaliações e simulados internos do DK.
-- As questões e os gabaritos nunca são expostos diretamente ao navegador.

do $$ begin
  create type public.assessment_question_type as enum ('objetiva', 'aberta');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_scope_type as enum ('patente', 'graduacao');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_track as enum ('geral', 'cavalaria', 'arquearia');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_difficulty as enum ('basica', 'intermediaria', 'avancada');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_status as enum ('rascunho', 'publicado', 'arquivado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.assessment_assignment_status as enum (
    'convidado',
    'em_andamento',
    'aguardando_correcao',
    'corrigido',
    'cancelado',
    'expirado'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.assessment_manager_permissions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint assessment_manager_permission_dates check (
    (active and revoked_at is null) or (not active and revoked_at is not null)
  )
);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  prompt text not null check (char_length(btrim(prompt)) between 10 and 5000),
  question_type public.assessment_question_type not null,
  options jsonb not null default '[]'::jsonb,
  correct_option smallint,
  expected_answer text,
  explanation text check (explanation is null or char_length(explanation) <= 5000),
  manual_title text not null check (char_length(btrim(manual_title)) between 2 and 200),
  source_chapter text check (source_chapter is null or char_length(source_chapter) <= 160),
  source_page text check (source_page is null or char_length(source_page) <= 40),
  scope_type public.assessment_scope_type not null,
  rank_scopes public.dk_rank[] not null default '{}'::public.dk_rank[],
  graduation_scopes public.graduation_level[] not null default '{}'::public.graduation_level[],
  track public.assessment_track not null default 'geral',
  difficulty public.assessment_difficulty not null default 'basica',
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_question_format check (
    (
      question_type = 'objetiva'
      and jsonb_typeof(options) = 'array'
      and jsonb_array_length(options) = 5
      and correct_option between 0 and 4
      and expected_answer is null
    )
    or
    (
      question_type = 'aberta'
      and options = '[]'::jsonb
      and correct_option is null
      and char_length(btrim(coalesce(expected_answer, ''))) between 2 and 5000
    )
  ),
  constraint assessment_question_scope check (
    (
      scope_type = 'patente'
      and cardinality(rank_scopes) > 0
      and cardinality(graduation_scopes) = 0
    )
    or
    (
      scope_type = 'graduacao'
      and cardinality(graduation_scopes) > 0
      and cardinality(rank_scopes) = 0
      and not ('sem_graduacao'::public.graduation_level = any(graduation_scopes))
    )
  )
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 3 and 180),
  description text check (description is null or char_length(description) <= 2000),
  target_type public.assessment_scope_type not null,
  target_rank public.dk_rank,
  target_graduation public.graduation_level,
  content_type public.assessment_scope_type not null,
  content_rank_scopes public.dk_rank[] not null default '{}'::public.dk_rank[],
  content_graduation_scopes public.graduation_level[] not null default '{}'::public.graduation_level[],
  track public.assessment_track not null default 'geral',
  question_count integer not null check (question_count in (10, 20, 30, 50, 100)),
  passing_score numeric(5,2) not null default 70 check (passing_score between 0 and 100),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 5 and 360),
  status public.assessment_status not null default 'rascunho',
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_target check (
    (target_type = 'patente' and target_rank is not null and target_graduation is null)
    or
    (
      target_type = 'graduacao'
      and target_rank is null
      and target_graduation is not null
      and target_graduation <> 'sem_graduacao'
    )
  ),
  constraint assessment_content_scope check (
    (
      content_type = 'patente'
      and cardinality(content_rank_scopes) > 0
      and cardinality(content_graduation_scopes) = 0
    )
    or
    (
      content_type = 'graduacao'
      and cardinality(content_graduation_scopes) > 0
      and cardinality(content_rank_scopes) = 0
      and not ('sem_graduacao'::public.graduation_level = any(content_graduation_scopes))
    )
  )
);

-- O item guarda uma fotografia da questão. Uma edição posterior no banco de
-- questões não altera uma avaliação que já foi publicada.
create table if not exists public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  source_question_id uuid references public.assessment_questions(id) on delete set null,
  sort_order integer not null check (sort_order > 0),
  prompt text not null,
  question_type public.assessment_question_type not null,
  options jsonb not null default '[]'::jsonb,
  correct_option smallint,
  expected_answer text,
  explanation text,
  source_manual_title text not null,
  source_chapter text,
  source_page text,
  created_at timestamptz not null default now(),
  unique (assessment_id, sort_order),
  constraint assessment_item_format check (
    (
      question_type = 'objetiva'
      and jsonb_typeof(options) = 'array'
      and jsonb_array_length(options) = 5
      and correct_option between 0 and 4
      and expected_answer is null
    )
    or
    (
      question_type = 'aberta'
      and options = '[]'::jsonb
      and correct_option is null
      and char_length(btrim(coalesce(expected_answer, ''))) >= 2
    )
  )
);

create table if not exists public.assessment_assignments (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  member_id uuid not null references public.profiles(id) on delete restrict,
  indication_number integer not null check (indication_number > 0),
  access_token uuid not null default gen_random_uuid() unique,
  status public.assessment_assignment_status not null default 'convidado',
  assigned_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  graded_at timestamptz,
  score_percent numeric(5,2) check (score_percent is null or score_percent between 0 and 100),
  correct_count integer check (correct_count is null or correct_count >= 0),
  incorrect_count integer check (incorrect_count is null or incorrect_count >= 0),
  pending_open_count integer not null default 0 check (pending_open_count >= 0),
  passed boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, member_id, indication_number)
);

create table if not exists public.assessment_answers (
  assignment_id uuid not null references public.assessment_assignments(id) on delete cascade,
  item_id uuid not null references public.assessment_items(id) on delete cascade,
  selected_option smallint check (selected_option is null or selected_option between 0 and 4),
  open_answer text check (open_answer is null or char_length(open_answer) <= 10000),
  is_correct boolean,
  reviewer_feedback text check (reviewer_feedback is null or char_length(reviewer_feedback) <= 3000),
  answered_at timestamptz not null default now(),
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, item_id)
);

create table if not exists public.assessment_audit_log (
  id bigint generated always as identity primary key,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  subject_user_id uuid references public.profiles(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  assignment_id uuid references public.assessment_assignments(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Garante que uma resposta pertença à avaliação indicada e fecha a pequena
-- janela de concorrência entre o último salvamento e a entrega da tentativa.
create or replace function public.enforce_assessment_answer_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.assessment_assignment_status;
  current_submitted_at timestamptz;
  current_assessment_id uuid;
  current_question_type public.assessment_question_type;
begin
  select status, submitted_at, assessment_id
    into current_status, current_submitted_at, current_assessment_id
    from public.assessment_assignments
    where id = new.assignment_id;
  if not found then raise exception 'assessment_assignment_not_found'; end if;

  select question_type into current_question_type
  from public.assessment_items
  where id = new.item_id and assessment_id = current_assessment_id;
  if not found then raise exception 'assessment_item_mismatch'; end if;

  if current_status = 'em_andamento' and current_submitted_at is null then
    return new;
  end if;

  if current_status = 'em_andamento' and current_submitted_at is not null then
    if new.is_correct is not null then return new; end if;
    if current_question_type = 'aberta'
      and tg_op = 'UPDATE'
      and old.open_answer is not distinct from new.open_answer
      and old.selected_option is not distinct from new.selected_option then
      return new;
    end if;
  end if;

  if current_status = 'aguardando_correcao'
    and current_question_type = 'aberta'
    and tg_op = 'UPDATE'
    and new.graded_by is not null
    and old.open_answer is not distinct from new.open_answer
    and old.selected_option is not distinct from new.selected_option then
    return new;
  end if;

  raise exception 'assessment_attempt_locked' using errcode = '42501';
end;
$$;

create or replace function public.assign_assessment_indication_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.assessment_id::text || ':' || new.member_id::text, 0));
  select coalesce(max(indication_number), 0) + 1
    into new.indication_number
    from public.assessment_assignments
    where assessment_id = new.assessment_id and member_id = new.member_id;
  return new;
end;
$$;

create index if not exists assessment_questions_active_idx
  on public.assessment_questions (active, scope_type, track, difficulty);
create index if not exists assessment_items_assessment_idx
  on public.assessment_items (assessment_id, sort_order);
create index if not exists assessment_assignments_member_idx
  on public.assessment_assignments (member_id, created_at desc);
create index if not exists assessment_assignments_status_idx
  on public.assessment_assignments (status, expires_at);
create index if not exists assessment_answers_review_idx
  on public.assessment_answers (is_correct, graded_at) where is_correct is null;
create index if not exists assessment_audit_created_idx
  on public.assessment_audit_log (created_at desc);

drop trigger if exists assessment_questions_updated_at on public.assessment_questions;
create trigger assessment_questions_updated_at before update on public.assessment_questions
for each row execute function public.set_updated_at();

drop trigger if exists assessments_updated_at on public.assessments;
create trigger assessments_updated_at before update on public.assessments
for each row execute function public.set_updated_at();

drop trigger if exists assessment_assignments_updated_at on public.assessment_assignments;
create trigger assessment_assignments_updated_at before update on public.assessment_assignments
for each row execute function public.set_updated_at();

drop trigger if exists assessment_assignments_number on public.assessment_assignments;
create trigger assessment_assignments_number before insert on public.assessment_assignments
for each row execute function public.assign_assessment_indication_number();

drop trigger if exists assessment_answers_updated_at on public.assessment_answers;
create trigger assessment_answers_updated_at before update on public.assessment_answers
for each row execute function public.set_updated_at();

drop trigger if exists assessment_answers_state_guard on public.assessment_answers;
create trigger assessment_answers_state_guard before insert or update on public.assessment_answers
for each row execute function public.enforce_assessment_answer_state();

create or replace function public.can_manage_assessments()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.status = 'aprovado'
      and (
        profile.rank in ('general_brigada', 'general_divisao', 'general_exercito')
        or (
          profile.rank in ('major', 'tenente_coronel', 'coronel')
          and exists (
            select 1
            from public.assessment_manager_permissions permission
            where permission.user_id = profile.id and permission.active
          )
        )
      )
  );
$$;

create or replace function public.can_delegate_assessment_managers()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'aprovado'
      and rank in ('general_brigada', 'general_divisao', 'general_exercito')
  );
$$;

alter table public.assessment_manager_permissions enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_assignments enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_audit_log enable row level security;

-- Toda operação do módulo passa pelas rotas protegidas do servidor. Isso evita
-- que o gabarito seja descoberto consultando o Supabase pelo navegador.
revoke all on table public.assessment_manager_permissions from anon, authenticated;
revoke all on table public.assessment_questions from anon, authenticated;
revoke all on table public.assessments from anon, authenticated;
revoke all on table public.assessment_items from anon, authenticated;
revoke all on table public.assessment_assignments from anon, authenticated;
revoke all on table public.assessment_answers from anon, authenticated;
revoke all on table public.assessment_audit_log from anon, authenticated;

grant all privileges on table public.assessment_manager_permissions to service_role;
grant all privileges on table public.assessment_questions to service_role;
grant all privileges on table public.assessments to service_role;
grant all privileges on table public.assessment_items to service_role;
grant all privileges on table public.assessment_assignments to service_role;
grant all privileges on table public.assessment_answers to service_role;
grant all privileges on table public.assessment_audit_log to service_role;
grant usage, select on sequence public.assessment_audit_log_id_seq to service_role;

revoke all on function public.enforce_assessment_answer_state() from public, anon, authenticated;
revoke all on function public.assign_assessment_indication_number() from public, anon, authenticated;

revoke all on function public.can_manage_assessments() from public, anon;
revoke all on function public.can_delegate_assessment_managers() from public, anon;
grant execute on function public.can_manage_assessments() to authenticated, service_role;
grant execute on function public.can_delegate_assessment_managers() to authenticated, service_role;
