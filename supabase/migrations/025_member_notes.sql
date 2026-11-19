-- Anotações entre membros.
--
-- Comandantes de graduação e quem tem a patente mínima configurada (padrão:
-- subtenente) deixam anotações para qualquer membro aprovado. Só o autor e o
-- destinatário leem a anotação: nem o ADM a vê pela interface.
--
-- SELO DE COMANDANTE
--   Quando o autor é comandante de uma trilha (Cavalaria ou Arquearia) e o
--   destinatário tem graduação NA MESMA trilha (qualquer nível), a anotação
--   recebe o selo daquela trilha. O selo guarda o nível do COMANDANTE no
--   momento da escrita (é ele que define a cor: bronze, prata ou ouro) e não
--   muda com promoções posteriores. Destinatário só da outra trilha: sem selo.
--   Quem calcula o selo é o banco (gatilho), nunca o navegador.
--
-- CONFIGURAÇÃO
--   site_settings é uma tabela genérica de chave/valor. Por enquanto guarda só
--   'notes_min_rank'. Quem grava é a rota do ADM Principal (service role).
--
-- ESCRITA
--   Todas as gravações de member_notes passam pelas rotas /api/member/notes
--   (service role, depois de checar quem está pedindo). O navegador só LÊ, e as
--   regras de RLS limitam a leitura ao autor e ao destinatário.
--
-- Depende de: 001 (profiles, dk_rank, rank_weight, is_approved_member),
-- 015 (graduation_cavalaria/arquearia) e 024 (commander_cavalaria/arquearia).

-- ---------------------------------------------------------------------------
-- 1. Configurações do site
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key check (char_length(key) between 1 and 80),
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to authenticated;
grant all privileges on public.site_settings to service_role;

drop policy if exists "Membros leem as configuracoes do site" on public.site_settings;
create policy "Membros leem as configuracoes do site"
on public.site_settings for select to authenticated
using (public.is_approved_member());

insert into public.site_settings (key, value)
values ('notes_min_rank', '"subtenente"'::jsonb)
on conflict (key) do nothing;

-- Patente mínima para escrever anotações. Valor ausente ou inválido volta ao padrão.
create or replace function public.notes_min_rank()
returns public.dk_rank
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  stored text;
begin
  select s.value #>> '{}' into stored from public.site_settings s where s.key = 'notes_min_rank';
  begin
    return coalesce(stored, 'subtenente')::public.dk_rank;
  exception when others then
    return 'subtenente'::public.dk_rank;
  end;
end;
$$;

revoke all on function public.notes_min_rank() from public, anon;
grant execute on function public.notes_min_rank() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Quem pode escrever
-- ---------------------------------------------------------------------------
-- Membro aprovado que é comandante de uma trilha (com graduação nela) OU tem a
-- patente mínima configurada ou superior. Vale para quem está logado.
create or replace function public.can_write_member_notes()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.status = 'aprovado'
        and (
          (p.commander_cavalaria and p.graduation_cavalaria <> 'sem_graduacao')
          or (p.commander_arquearia and p.graduation_arquearia <> 'sem_graduacao')
          or public.rank_weight(p.rank) >= public.rank_weight(public.notes_min_rank())
        )
    );
$$;

revoke all on function public.can_write_member_notes() from public, anon;
grant execute on function public.can_write_member_notes() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Anotações
-- ---------------------------------------------------------------------------
create table if not exists public.member_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  -- Nível do comandante naquela trilha, quando a anotação leva o selo; senão nulo.
  seal_cavalaria public.graduation_level,
  seal_arquearia public.graduation_level,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  read_at timestamptz,
  constraint member_notes_not_self check (author_id <> recipient_id),
  constraint member_notes_seal_has_level check (
    (seal_cavalaria is null or seal_cavalaria <> 'sem_graduacao')
    and (seal_arquearia is null or seal_arquearia <> 'sem_graduacao')
  )
);

create index if not exists member_notes_recipient_idx on public.member_notes (recipient_id, created_at desc);
create index if not exists member_notes_author_idx on public.member_notes (author_id, created_at desc);

-- Calcula o selo na criação e trava o que não pode mudar na edição.
create or replace function public.member_notes_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author record;
  recipient record;
begin
  if tg_op = 'UPDATE' then
    new.author_id := old.author_id;
    new.recipient_id := old.recipient_id;
    new.seal_cavalaria := old.seal_cavalaria;
    new.seal_arquearia := old.seal_arquearia;
    new.created_at := old.created_at;
    -- Marcar como lida não conta como edição.
    new.updated_at := case when new.body is distinct from old.body then now() else old.updated_at end;
    return new;
  end if;

  select commander_cavalaria, commander_arquearia, graduation_cavalaria, graduation_arquearia
    into author from public.profiles where id = new.author_id;
  select graduation_cavalaria, graduation_arquearia
    into recipient from public.profiles where id = new.recipient_id;

  new.seal_cavalaria := case
    when author.commander_cavalaria
      and author.graduation_cavalaria <> 'sem_graduacao'
      and recipient.graduation_cavalaria <> 'sem_graduacao'
    then author.graduation_cavalaria else null end;
  new.seal_arquearia := case
    when author.commander_arquearia
      and author.graduation_arquearia <> 'sem_graduacao'
      and recipient.graduation_arquearia <> 'sem_graduacao'
    then author.graduation_arquearia else null end;

  new.created_at := now();
  new.updated_at := new.created_at;
  new.read_at := null;
  return new;
end;
$$;

revoke all on function public.member_notes_before_write() from public, anon, authenticated;

drop trigger if exists member_notes_before_write on public.member_notes;
create trigger member_notes_before_write
before insert or update on public.member_notes
for each row execute function public.member_notes_before_write();

-- Só autor e destinatário leem. Nenhuma escrita direta pelo navegador.
alter table public.member_notes enable row level security;
revoke all on public.member_notes from anon, authenticated;
grant select on public.member_notes to authenticated;
grant all privileges on public.member_notes to service_role;

drop policy if exists "Autor e destinatario leem a anotacao" on public.member_notes;
create policy "Autor e destinatario leem a anotacao"
on public.member_notes for select to authenticated
using (
  (author_id = auth.uid() or recipient_id = auth.uid())
  and public.is_approved_member()
);

-- Sem trilha de auditoria (log_admin_audit) de propósito: o conteúdo é privado.

-- ---------------------------------------------------------------------------
-- 4. Aviso de tempo real ("algo mudou"), só se a 023 já foi aplicada
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.dk_broadcast_change()') is null then
    raise notice 'dk_broadcast_change nao existe (migracao 023 pendente): sem aviso em tempo real para member_notes.';
    return;
  end if;
  drop trigger if exists dk_broadcast_change on public.member_notes;
  create trigger dk_broadcast_change
  after insert or update or delete on public.member_notes
  for each statement execute function public.dk_broadcast_change();
end;
$$;
