-- Evolução do módulo de avaliações:
-- 1. seleção manual ou sorteio individual por filtro;
-- 2. opção de 40 questões;
-- 3. conjunto de questões imutável e exclusivo para cada indicação.

do $$ begin
  create type public.assessment_selection_mode as enum ('manual', 'sorteio_individual');
exception when duplicate_object then null;
end $$;

alter table public.assessments
  add column if not exists selection_mode public.assessment_selection_mode not null default 'manual';

alter table public.assessments
  drop constraint if exists assessments_question_count_check;

alter table public.assessments
  add constraint assessments_question_count_check
  check (question_count in (10, 20, 30, 40, 50, 100));

create table if not exists public.assessment_assignment_items (
  assignment_id uuid not null references public.assessment_assignments(id) on delete cascade,
  item_id uuid not null references public.assessment_items(id) on delete cascade,
  sort_order integer not null check (sort_order > 0),
  created_at timestamptz not null default now(),
  primary key (assignment_id, item_id),
  unique (assignment_id, sort_order)
);

create index if not exists assessment_assignment_items_assignment_idx
  on public.assessment_assignment_items (assignment_id, sort_order);

-- As avaliações anteriores eram manuais e utilizavam todas as questões da
-- avaliação. O preenchimento abaixo mantém as tentativas já existentes intactas.
insert into public.assessment_assignment_items (assignment_id, item_id, sort_order)
select assignment.id, item.id, item.sort_order
from public.assessment_assignments assignment
join public.assessments assessment on assessment.id = assignment.assessment_id
join public.assessment_items item on item.assessment_id = assignment.assessment_id
where assessment.selection_mode = 'manual'
  and not exists (
    select 1
    from public.assessment_assignment_items existing
    where existing.assignment_id = assignment.id
  )
on conflict (assignment_id, item_id) do nothing;

alter table public.assessment_assignment_items enable row level security;
revoke all on table public.assessment_assignment_items from anon, authenticated;
grant all privileges on table public.assessment_assignment_items to service_role;

-- Além de bloquear respostas após a entrega, confirma que a questão sorteada
-- pertence especificamente à indicação. Assim, conhecer o ID de outra questão
-- da mesma avaliação não permite respondê-la.
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

  select item.question_type into current_question_type
  from public.assessment_assignment_items assigned_item
  join public.assessment_items item on item.id = assigned_item.item_id
  where assigned_item.assignment_id = new.assignment_id
    and item.id = new.item_id
    and item.assessment_id = current_assessment_id;
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

revoke all on function public.enforce_assessment_answer_state() from public, anon, authenticated;
