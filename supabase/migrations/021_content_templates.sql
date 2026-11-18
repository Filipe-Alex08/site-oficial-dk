-- Templates reutilizaveis para publicacoes de midia e atividades do calendario.
-- Uma tabela para os dois tipos (kind = 'post' | 'activity'); os campos do
-- formulario ficam em data (jsonb). Os templates sao compartilhados entre quem
-- tem o papel: ADM de Midias (post) e ADM de Atividades (activity); o ADM
-- Principal passa nos dois via has_admin_role().
-- Template de atividade nao guarda data: so horario de inicio e duracao.

create table if not exists public.content_templates (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post', 'activity')),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 20000),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_templates_kind_name_key
  on public.content_templates (kind, lower(btrim(name)));

drop trigger if exists content_templates_updated_at on public.content_templates;
create trigger content_templates_updated_at
before update on public.content_templates
for each row execute function public.set_updated_at();

alter table public.content_templates enable row level security;

revoke all on public.content_templates from anon, authenticated;
grant select, insert, update, delete on public.content_templates to authenticated;
grant all privileges on public.content_templates to service_role;

drop policy if exists "templates: leitura" on public.content_templates;
drop policy if exists "templates: criacao" on public.content_templates;
drop policy if exists "templates: edicao" on public.content_templates;
drop policy if exists "templates: exclusao" on public.content_templates;
drop policy if exists "templates leitura" on public.content_templates;
drop policy if exists "templates criacao" on public.content_templates;
drop policy if exists "templates edicao" on public.content_templates;
drop policy if exists "templates exclusao" on public.content_templates;

create policy "templates leitura" on public.content_templates
  for select to authenticated
  using (
    (kind = 'post' and public.has_admin_role('midias'))
    or (kind = 'activity' and public.has_admin_role('atividades'))
  );

create policy "templates criacao" on public.content_templates
  for insert to authenticated
  with check (
    (kind = 'post' and public.has_admin_role('midias'))
    or (kind = 'activity' and public.has_admin_role('atividades'))
  );

create policy "templates edicao" on public.content_templates
  for update to authenticated
  using (
    (kind = 'post' and public.has_admin_role('midias'))
    or (kind = 'activity' and public.has_admin_role('atividades'))
  )
  with check (
    (kind = 'post' and public.has_admin_role('midias'))
    or (kind = 'activity' and public.has_admin_role('atividades'))
  );

create policy "templates exclusao" on public.content_templates
  for delete to authenticated
  using (
    (kind = 'post' and public.has_admin_role('midias'))
    or (kind = 'activity' and public.has_admin_role('atividades'))
  );
