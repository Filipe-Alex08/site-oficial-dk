-- Inscrições, sorteio e resultados mudam como uma unidade. A API grava
-- o estado inteiro comparando a revisão, para impedir escritas concorrentes
-- de substituírem inscrições ou resultados de outra pessoa.
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  title text generated always as (state #>> '{settings,title}') stored not null,
  format text generated always as (state #>> '{settings,format}') stored not null
    check (format in ('mata_mata', 'ligas')),
  status text generated always as (state ->> 'status') stored not null
    check (status in ('rascunho', 'inscricoes', 'em_andamento', 'concluido')),
  revision integer not null default 0 check (revision >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;
revoke all on public.tournaments from public, anon, authenticated;
grant select, insert, update on public.tournaments to service_role;
